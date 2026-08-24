# Detection catalog

The guard (`scripts/precommit-guard.sh`) is intentionally conservative: it favors catching the classes
of mistake that are expensive to undo (anything that reaches public git history) while keeping false
positives low enough that contributors don't reflexively bypass it. This file documents what it looks
for and how to tune it.

## 1. Tool-generated artifact paths

Directories that a tool writes into the working tree and that must never be committed. Matched by path:

| Pattern | Source |
|---|---|
| `.playwright-mcp/` | Playwright MCP browser profile (the original incident) |
| `node_modules/` | npm/yarn dependencies |
| `dist/`, `build/`, `out/` | bundler output |
| `coverage/`, `.nyc_output/` | test coverage |
| `test-results/`, `playwright-report/` | Playwright/Cypress runs |
| `repomix-output.*`, `*.repomix` | repomix repository dumps |

**Fix:** `git restore --staged <path>` and add the pattern to `.gitignore`.

## 2. Browser-profile signatures

Chromium writes files with distinctive names. Even outside `.playwright-mcp/`, these indicate a browser
profile was staged. Matched by basename: `Secure Preferences`, `Login Data`, `Login Data For Account`,
`Web Data`, `Trust Tokens`, `Network Persistent State`; and by path `*/Default/Preferences`.

Note the risk profile from the original incident: most of these are hashes / OS-keychain-encrypted blobs
(low direct value), but `Cookies` and `Login Data` *can* hold live session material. Treat the whole
profile as untrusted and never commit it.

## 3. Credential / key filenames

`.env` (except `.env.example`, `.env.sample`, `.env.template`), `*.pem`, `*.key`, `*.p12`, `*.pfx`,
`*.keystore`, `*.jks`, `id_rsa`/`id_dsa`/`id_ecdsa`/`id_ed25519`, `.npmrc`, `.netrc`, `.pypirc`,
`kubeconfig`/`*.kubeconfig`.

**Fix:** unstage; if the value was real, rotate it; commit a redacted `*.example` template instead.

## 4. Secret-like content (added lines only)

High-confidence regexes scanned against added (`+`) diff lines:

- `-----BEGIN … PRIVATE KEY-----` — PEM private key
- `AKIA[0-9A-Z]{16}` — AWS access key id
- `gh[pousr]_[A-Za-z0-9]{20,}` — GitHub PAT / OAuth / server / refresh token
- `xox[baprs]-…` — Slack token
- `eyJ….….…` — JWT
- generic `secret|password|api_key|client_secret|access_token = "…"` assignments

A line with `pragma: allowlist secret` is skipped — use it for documented, reviewed false positives
(e.g. an example token in test fixtures) instead of disabling the whole guard.

## 5. Large files

Staged blobs larger than `MAX_BYTES` (default 1 MiB). Big binaries are usually accidental artifacts or
assets that belong in Git LFS or an ignore rule. Override per-commit with `MAX_BYTES=<n>`.

## 6. gitleaks (optional, recommended)

If `gitleaks` is on PATH, the guard runs `gitleaks protect --staged`. Red Hat's leaktk tooling is
gitleaks-based, so installing it locally makes pre-commit results match what CI / InfoSec scanners
report. Install: `brew install gitleaks`.

## Extending

- **New artifact dir:** add a `case` arm in section 1 of the script and a matching `.gitignore` rule.
- **New filename rule:** add to the `base`/`f` case blocks in section 1.
- **New content pattern:** add a `scan '<regex>' "<label>"` line in section 2. Prefer specific,
  high-signal regexes over broad ones — a noisy rule trains people to bypass the guard, which is worse
  than not having the rule. Test any new regex against the repo before shipping it.
