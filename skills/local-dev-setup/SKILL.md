---
name: local-dev-setup
description: Use when setting up the development environment, configuring environment variables, connecting to Konflux clusters, or troubleshooting the dev server.
---

# Local Development Setup for konflux-ui

## One-Command Setup

```bash
./setup.sh
```

This checks Node.js >= 20, enables Corepack, installs dependencies, and starts the dev server.

## Manual Setup

```bash
corepack enable                       # Required for Yarn Berry
yarn install                          # Install project dependencies
cd e2e-tests && yarn install && cd .. # Install e2e dependencies
yarn start                            # Dev server at https://localhost:1337
```

**Never use `npm`.** This project uses Yarn Berry 4.x exclusively.

## Environment Configuration

The `.env` file controls which Konflux cluster the UI connects to.

### Stage Cluster (default)

No changes needed — `.env` ships pointing to the stage cluster.

### Local Konflux Deployment

1. Deploy Konflux locally following https://konflux-ci.dev/konflux-ci/docs/installation/install-local/
2. Update `.env`:
   ```
   AUTH_URL=https://127.0.0.1:9443/
   REGISTRATION_URL=https://127.0.0.1:9443/
   PROXY_URL=https://127.0.0.1:9443/
   PROXY_WEBSOCKET_URL=wss://127.0.0.1:9443
   ```
3. Update `webpack.dev.config.js` proxy context to include `/idp/` and set `autoRewrite: true`. See README.md for the full diff.

## DevContainer

The project includes a `.devcontainer/` configuration. VS Code will auto-detect it. See `.devcontainer/README.md` for details.

## Common Issues

- **`corepack enable` fails**: May need `sudo corepack enable` on some systems
- **Wrong Yarn version**: Delete `node_modules` and re-run `corepack enable && yarn install`
- **SSL errors on dev server**: The dev server uses self-signed HTTPS. Accept the browser warning.
- **Proxy errors**: Check `.env` values match your target cluster URL
