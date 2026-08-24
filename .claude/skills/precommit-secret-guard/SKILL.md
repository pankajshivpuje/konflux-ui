---
name: precommit-secret-guard
description: >-
  Scan staged changes for secrets and tool-generated artifacts BEFORE creating any git commit.
  Use this skill whenever you are about to run `git commit`, when the user asks to commit/stage/push
  changes, when you've just run `git add`, or any time you're finalizing work to be committed —
  even if the user doesn't explicitly mention secrets. This exists because a Playwright MCP browser
  profile (`.playwright-mcp/`) once got swept into a public commit via a blanket `git add`; the guard
  catches browser profiles, credential files, keys, large binaries, and secret-like content before
  they ever enter history. Always run the guard before committing; treat a blocked commit as a real
  finding to fix, not an obstacle to bypass.
---

# Pre-commit Secret & Artifact Guard

## Why this exists

Committing a secret is expensive to undo. Once a file lands in git history and is pushed, removing it
requires rewriting history (`git filter-repo`), force-pushing every branch, asking the host to purge
cached views, and rotating anything exposed. In this repo it already happened once: the Playwright MCP
server writes a full Chromium profile into `.playwright-mcp/` in the working tree, it wasn't ignored,
and a broad `git add -A` swept ~181 profile files (cookies DB, Login Data, History, Preferences) into a
feature commit that reached the public fork.

The cheapest place to stop this is **before the commit is created**. That's what this skill does.

## The rule

Before you run `git commit` — every time, not just when secrets are top of mind — run the guard on the
staged set:

```bash
bash .claude/skills/precommit-secret-guard/scripts/precommit-guard.sh
```

- **Exit 0** → staged changes are clean; proceed with the commit.
- **Non-zero** → the guard printed findings. Stop. Do not commit. Resolve each finding, then re-run.

Run it *after* staging and *immediately before* committing, so it sees exactly what will be recorded.

## Resolving findings (don't just bypass)

A blocked commit means something that shouldn't be in history is staged. Fix the cause:

- **Tool/artifact directory** (e.g. `.playwright-mcp/`, `node_modules/`, `dist/`, `coverage/`,
  `test-results/`, `repomix-output.*`): unstage it and add it to `.gitignore` so it can't recur.
  ```bash
  git restore --staged <path>
  # then ensure the pattern is in .gitignore
  ```
- **Browser-profile file** (`Secure Preferences`, `Login Data`, `Cookies`, `.../Default/Preferences`):
  this is the exact class from the original incident — never commit it. Unstage and gitignore the
  profile directory.
- **Credential/key file** (`.env`, `*.pem`, `*.key`, `.npmrc`, `kubeconfig`): unstage it. If a value
  was real, assume it's compromised and rotate it. Commit a redacted `*.example` instead.
- **Secret-like content** (private key blocks, `AKIA…`, `ghp_…`, `xox…`, JWTs, `password=…`): remove
  the secret from the file, move it to an environment variable or a secret manager, and rotate it.
- **Large binary**: usually an accidental artifact or asset that belongs in Git LFS or an ignore rule.

**Override is a last resort.** `SKIP_SECRET_GUARD=1` exists for genuine false positives, and only with
explicit user authorization for that specific commit. If you find yourself reaching for it, prefer an
allowlist pragma on the specific line instead (append `pragma: allowlist secret` as a comment on the
line the scanner flagged) so the rest of the guard stays active. Never disable the guard globally.

## What the guard checks

The script (`scripts/precommit-guard.sh`) inspects only the staged set and flags:

1. **Tool-generated artifact paths** — `.playwright-mcp/`, `node_modules/`, `dist/`, `build/`,
   `coverage/`, `.nyc_output/`, `test-results/`, `playwright-report/`, `repomix-output.*`.
2. **Browser-profile signatures** — distinctive Chromium filenames (`Secure Preferences`,
   `Login Data`, `Login Data For Account`, `Web Data`, `Trust Tokens`, `.../Default/Preferences`).
3. **Credential/key filenames** — `.env` (but not `.env.example/.sample/.template`), `*.pem`, `*.key`,
   `*.p12`, `*.pfx`, `*.keystore`, `id_rsa`/`id_ed25519`/…, `.npmrc`, `.netrc`, `.pypirc`, `kubeconfig`.
4. **Secret-like content in added lines** — PEM private-key headers, AWS access keys, GitHub tokens,
   Slack tokens, JWTs, and generic `secret/password/api_key/token = "…"` assignments.
5. **Oversized files** — staged blobs above `MAX_BYTES` (default 1 MiB; override via env).
6. **gitleaks** — if `gitleaks` is installed it also runs `gitleaks protect --staged` (this repo's
   upstream security tooling, leaktk, is gitleaks-based), so local results match CI/InfoSec scans.

See `references/patterns.md` for the full detection catalog and how to extend it.

## Making it run on EVERY commit (recommended)

A skill only helps when an agent remembers to invoke it. For real "runs before every commit"
enforcement — including manual `git commit` by any contributor — wire the same script into the repo's
existing Husky hook. Because `.husky/pre-commit` is a protected path in this repo, this change must go
through a normal PR:

```bash
# append to .husky/pre-commit, after the lint-staged line:
bash .claude/skills/precommit-secret-guard/scripts/precommit-guard.sh
```

The script is safe to run from the hook: it reads only the staged index, needs no network, is fast,
and exits 0 when clean. The `SKIP_SECRET_GUARD=1` escape hatch mirrors the repo's existing
`SKIP_PROTECTED_PATH_CHECK=1` convention.
