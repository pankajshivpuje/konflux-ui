---
name: local-dev-setup
description: >
  Use when setting up the development environment, starting the dev server,
  configuring local Konflux, or troubleshooting the dev setup for konflux-ui.
---

# Local Dev Setup

## Quick Start

```bash
git clone https://github.com/konflux-ci/konflux-ui.git && cd konflux-ui
make setup
```

`make setup` runs `setup.sh` which checks Node.js >= 20, enables Corepack, installs deps, and starts the dev server.

## Prerequisites

- Node.js >= 20
- Corepack enabled (`corepack enable`)
- Yarn Berry 4.x is managed automatically via `packageManager` in `package.json`

## DevContainer

A pre-configured DevContainer is available with all dependencies. See `.devcontainer/README.md`.

## Makefile Targets

| Target | Command | What it does |
|--------|---------|-------------|
| `make setup` | `./setup.sh` | Full setup + start dev server |
| `make dev` | `yarn start` | Start dev server only |
| `make test` | `yarn test` | Run unit tests |
| `make lint` | `yarn lint && yarn lint:restricted-imports` | Run all linters |
| `make type-check` | `yarn type-checks` | TypeScript checking |

## Connecting to Local Konflux

By default the dev server proxies API calls to the stage cluster. To use a local Konflux deployment:

1. Deploy Konflux locally per https://konflux-ci.dev/konflux-ci/docs/installation/install-local/
2. Update `.env`:
   ```
   AUTH_URL=https://127.0.0.1:9443/
   REGISTRATION_URL=https://127.0.0.1:9443/
   PROXY_URL=https://127.0.0.1:9443/
   PROXY_WEBSOCKET_URL=wss://127.0.0.1:9443
   ```
3. Update `webpack.dev.config.js` proxy context to include `/idp/` and set `autoRewrite: true`

## Common Issues

- **"corepack enable" fails**: Try `sudo corepack enable` or ensure Node >= 20
- **Yarn version mismatch**: Corepack manages the Yarn version — don't install Yarn globally
- **Port already in use**: Dev server defaults to port 9443. Kill existing processes or change the port in webpack config
