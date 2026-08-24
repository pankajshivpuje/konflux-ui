#!/usr/bin/env bash
# precommit-guard.sh — block commits that include secrets or tool-generated artifacts.
#
# Origin: the konflux-ui .playwright-mcp browser-profile leak (2026-08). A blanket `git add`
# swept a Chromium profile (cookies DB, Login Data, History, Preferences) into a public commit.
# This guard inspects the STAGED index and refuses commits that reintroduce that class of mistake.
#
# Usage:   bash .claude/skills/precommit-secret-guard/scripts/precommit-guard.sh
# Wire it into .husky/pre-commit for automatic enforcement on every commit.
#
# Escape hatch (use only for genuine false positives, with justification):
#   SKIP_SECRET_GUARD=1 git commit ...
# Tunables:
#   MAX_BYTES=<n>   max staged blob size in bytes (default 1048576 = 1 MiB)
#
# Portable to bash 3.2 (macOS /bin/bash): no associative arrays, mapfile, or `grep -P`.
set -euo pipefail

MAX_BYTES=${MAX_BYTES:-1048576}

if [ -t 1 ]; then RED=$'\033[31m'; YEL=$'\033[33m'; GRN=$'\033[32m'; BLD=$'\033[1m'; RST=$'\033[0m'
else RED=''; YEL=''; GRN=''; BLD=''; RST=''; fi

findings=0
fail() { printf '  %s✗%s %s\n' "$RED" "$RST" "$1"; findings=$((findings + 1)); }

if [ "${SKIP_SECRET_GUARD:-}" = "1" ]; then
  printf '%sprecommit-guard: SKIPPED via SKIP_SECRET_GUARD=1%s\n' "$YEL" "$RST"
  exit 0
fi

# Only added/copied/modified/renamed files (deletions can't leak new content).
staged=$(git diff --cached --name-only --diff-filter=ACMR)
if [ -z "$staged" ]; then
  exit 0
fi

printf '%sprecommit-guard: scanning staged changes…%s\n' "$BLD" "$RST"

# ---------------------------------------------------------------------------
# 1) Per-file checks: artifact paths, browser-profile files, key/cred files, size
# ---------------------------------------------------------------------------
while IFS= read -r f; do
  [ -n "$f" ] || continue
  base=${f##*/}

  # Tool-generated artifact directories — never belong in history.
  case "$f" in
    .playwright-mcp/* | */.playwright-mcp/*)          fail "browser-profile artifact (gitignore .playwright-mcp/): $f" ;;
    node_modules/* | */node_modules/*)                fail "dependency dir (gitignore node_modules/): $f" ;;
    dist/* | build/* | out/*)                         fail "build output (gitignore it): $f" ;;
    coverage/* | .nyc_output/*)                       fail "coverage artifact (gitignore it): $f" ;;
    test-results/* | playwright-report/*)             fail "test artifact (gitignore it): $f" ;;
    repomix-output.* | *.repomix)                     fail "repomix dump (gitignore it): $f" ;;
  esac

  # Distinctive Chromium browser-profile filenames — the exact leak class.
  case "$base" in
    "Secure Preferences" | "Login Data" | "Login Data For Account" | "Web Data" | "Trust Tokens" | "Network Persistent State")
      fail "Chromium browser-profile file: $f" ;;
  esac
  case "$f" in
    */Default/Preferences | Default/Preferences)      fail "Chromium browser-profile file: $f" ;;
  esac

  # Credential / key / cert filenames.
  case "$base" in
    .env.example | .env.sample | .env.template) : ;;               # redacted templates are fine
    .env | .env.*)                              fail "env file may hold secrets (commit a *.example instead): $f" ;;
  esac
  case "$base" in
    *.pem | *.key | *.p12 | *.pfx | *.keystore | *.jks) fail "key/cert file: $f" ;;
    id_rsa | id_dsa | id_ecdsa | id_ed25519)            fail "private SSH key: $f" ;;
    .npmrc | .netrc | .pypirc)                          fail "credential config file: $f" ;;
    kubeconfig | *.kubeconfig)                          fail "kubeconfig (may embed tokens): $f" ;;
  esac

  # Oversized staged blob — usually an accidental artifact/asset.
  size=$(git cat-file -s ":$f" 2>/dev/null || echo 0)
  if [ "$size" -gt "$MAX_BYTES" ]; then
    fail "large file ${size} bytes > ${MAX_BYTES} (use Git LFS or ignore): $f"
  fi
done <<EOF
$staged
EOF

# ---------------------------------------------------------------------------
# 2) Content scan of ADDED lines for secret-like strings.
#    A line containing "pragma: allowlist secret" is skipped (documented false positives).
# ---------------------------------------------------------------------------
added=$(git diff --cached --diff-filter=ACMR -U0 -- . \
        | grep -E '^\+' | grep -Ev '^\+\+\+' \
        | grep -v 'pragma: allowlist secret' || true)

if [ -n "$added" ]; then
  scan() { # <regex> <label>
    # `-e` is required so patterns beginning with '-' (e.g. PEM headers) aren't read as flags.
    if printf '%s\n' "$added" | grep -Eiq -e "$1"; then
      fail "possible secret in added content: $2"
    fi
  }
  scan '-----BEGIN ([A-Z]+ )?PRIVATE KEY-----'        "PEM private key block"
  scan 'AKIA[0-9A-Z]{16}'                             "AWS access key id"
  scan 'gh[pousr]_[A-Za-z0-9]{20,}'                   "GitHub token"
  scan 'xox[baprs]-[A-Za-z0-9-]{10,}'                 "Slack token"
  scan 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}' "JWT"
  scan '(secret|password|passwd|api[_-]?key|client[_-]?secret|access[_-]?token)["'"'"' ]*[:=]["'"'"' ]*[A-Za-z0-9/+_.=-]{8,}' "hardcoded credential assignment"
fi

# ---------------------------------------------------------------------------
# 3) gitleaks (if installed) — matches this repo's upstream leaktk/gitleaks tooling.
# ---------------------------------------------------------------------------
if command -v gitleaks >/dev/null 2>&1; then
  if ! gitleaks protect --staged --redact --no-banner >/tmp/gitleaks-precommit.log 2>&1; then
    fail "gitleaks flagged staged content (see /tmp/gitleaks-precommit.log)"
  fi
fi

# ---------------------------------------------------------------------------
# Verdict
# ---------------------------------------------------------------------------
if [ "$findings" -gt 0 ]; then
  printf '\n%sprecommit-guard: %d issue(s) found — commit blocked.%s\n' "$RED" "$findings" "$RST"
  printf 'Fix the cause (unstage + gitignore artifacts, remove/rotate secrets), then re-run.\n'
  printf 'Genuine false positive? add "pragma: allowlist secret" on the line, or (last resort,\n'
  printf 'with justification) commit once via: %sSKIP_SECRET_GUARD=1 git commit …%s\n' "$BLD" "$RST"
  exit 1
fi

printf '%sprecommit-guard: clean ✓%s\n' "$GRN" "$RST"
exit 0
