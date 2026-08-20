---
name: sync-fork
description: >
  Sync fork with upstream, push branches to fork, rebase on upstream main.
  Use when user wants to sync, push to fork, update fork, pull upstream,
  rebase on main, keep fork up to date, back up branch, push branch,
  fetch upstream, sync main, update main from upstream, fork sync
---

# Sync Fork Skill

Safely synchronize the local fork with upstream, push feature branches to origin, and optionally rebase onto the latest upstream main.

## When to Use

- User wants to push their current branch to their fork (origin)
- User wants to sync their fork's main branch with upstream/main
- User wants to rebase a feature branch onto the latest upstream main
- User says "sync", "push to fork", "update from upstream", "rebase on main", or similar

## Critical Constraints

- **NEVER force-push without explicit user confirmation.** Always ask before any `--force` or `--force-with-lease` operation.
- **NEVER run destructive operations on uncommitted changes.** Warn the user and stop if the working tree is dirty for operations that require a clean tree.
- **NEVER delete branches.** This skill only syncs and pushes.
- **NEVER modify files.** This skill runs only git and gh commands.
- **NEVER switch branches without telling the user.** If a branch checkout is needed, explain why and confirm.

## Deriving Remote Owner/Repo

Do NOT hardcode owner/repo values. Derive them from the remotes:

```bash
ORIGIN_REPO=$(git remote get-url origin | sed -E 's|.*github.com[:/]||;s|\.git$||')
UPSTREAM_REPO=$(git remote get-url upstream | sed -E 's|.*github.com[:/]||;s|\.git$||')
```

Use `$ORIGIN_REPO` and `$UPSTREAM_REPO` in all `gh` commands.

### Step 1 — Assess current state

Run these commands and report the results to the user:

```bash
git status
```

```bash
git branch --show-current
```

```bash
git remote -v
```

Check the output:

- If `upstream` remote is missing, stop and tell the user to add it:
  > No `upstream` remote found. Add it with:
  > `git remote add upstream https://github.com/konflux-ci/konflux-ui.git`
- If `origin` remote is missing, stop and report the error.
- Note whether the working tree is clean or has uncommitted changes.
- Note the current branch name.

Report a summary to the user:
- Current branch: `<branch>`
- Working tree: clean / has uncommitted changes (list changed files)
- Remotes: origin = `<url>`, upstream = `<url>`

### Step 2 — Push current branch to origin

**Skip this step if the current branch is `main`.** Main is synced in Step 3, not pushed directly.

If there are uncommitted changes, warn the user:
> You have uncommitted changes. These will NOT be included in the push.
> Do you want to proceed with pushing the already-committed state, or stop to commit first?

Wait for user response. If they want to stop, stop.

Push the current branch to origin:

```bash
git push -u origin HEAD
```

If the push fails because the remote branch has diverged (non-fast-forward), inform the user:
> The remote branch `origin/<branch>` has diverged from your local branch.
> Would you like to force-push with `--force-with-lease` to update it? This will overwrite the remote branch.

**Only run force-push after explicit user confirmation:**

```bash
git push --force-with-lease origin HEAD
```

Report the result: branch pushed, URL of the branch on GitHub.

### Step 3 — Sync fork's main with upstream

#### 3a. Fetch upstream

```bash
git fetch upstream main
```

#### 3b. Check if sync is needed

```bash
git rev-list --count main..upstream/main
```

If the count is `0`, report that the fork's main is already up to date and skip to Step 4.

If the count is greater than `0`, report how many commits behind:
> Your fork's main is `<N>` commits behind upstream/main.

#### 3c. Sync fork on GitHub

```bash
gh repo sync $ORIGIN_REPO --source $UPSTREAM_REPO --branch main
```

If this fails because the branches have diverged, inform the user:
> Your fork's main has diverged from upstream/main. This can happen if commits were pushed directly to your fork's main branch.
> Would you like to force-sync? This will **overwrite** your fork's main on GitHub to match upstream/main. Any commits unique to your fork's main will be lost.

**Only run force-sync after explicit user confirmation:**

```bash
gh repo sync $ORIGIN_REPO --source $UPSTREAM_REPO --branch main --force
```

#### 3d. Update local main

If the current branch is NOT `main`:

```bash
git fetch origin main:main
```

This updates the local `main` ref to match `origin/main` without switching branches.

If the current branch IS `main`:

```bash
git pull origin main --ff-only
```

If `--ff-only` fails (local main has diverged), warn the user:
> Your local main branch has diverged from origin/main. Would you like to reset it to match origin/main?

**Only after explicit confirmation:**

```bash
git reset --hard origin/main
```

Report: "Local main is now up to date with upstream/main."

### Step 4 — Rebase feature branch onto updated main (optional)

**Skip this step if the current branch is `main`.**

Ask the user:
> Your feature branch `<branch>` can be rebased onto the updated main. This will replay your commits on top of the latest upstream changes.
> Would you like to rebase now?

If the user declines, skip to Step 5.

If the user accepts:

**4a. Check for uncommitted changes**

If there are uncommitted changes, stop:
> Cannot rebase with uncommitted changes. Please commit or stash your changes first.

**4b. Rebase**

```bash
git rebase main
```

If the rebase encounters conflicts:
> Rebase encountered merge conflicts. The rebase has been paused.
>
> Conflicting files: (show output of `git diff --name-only --diff-filter=U`)
>
> You have two options:
> 1. Resolve the conflicts manually, then run `git rebase --continue`
> 2. Abort the rebase with `git rebase --abort` to return to the previous state
>
> Would you like me to abort the rebase?

If the user wants to abort:

```bash
git rebase --abort
```

If the rebase succeeds, inform the user and ask about force-pushing:
> Rebase complete. Your branch `<branch>` is now based on the latest main.
> The remote branch on origin needs to be updated. This requires a force-push.
> Would you like to force-push to origin?

**Only after explicit confirmation:**

```bash
git push --force-with-lease origin HEAD
```

### Step 5 — Summary

Report a final summary:

```
Sync Complete

- Branch: <current branch>
- Pushed to origin: Yes / No / Skipped (main)
- Fork main synced: Yes / No (already up to date)
- Commits pulled from upstream: <N>
- Feature branch rebased: Yes / No / Skipped / Aborted
- Force-pushed after rebase: Yes / No / Skipped
```

## Error Handling

| Condition | Action |
| --- | --- |
| No `upstream` remote configured | Stop. Tell user to run `git remote add upstream <url>` |
| No `origin` remote configured | Stop. Report error — should not happen in a fork clone |
| Uncommitted changes (push step) | Warn user, let them choose to proceed or stop |
| Uncommitted changes (rebase step) | Stop. Tell user to commit or stash first |
| Push rejected (non-fast-forward) | Ask user before force-pushing with `--force-with-lease` |
| `gh repo sync` fails (diverged) | Ask user before running with `--force` flag |
| `gh` CLI not installed | Stop. Tell user to install: `brew install gh` |
| `gh` not authenticated | Stop. Tell user to run `! gh auth login` |
| Rebase conflicts | Show conflicting files. Offer to abort. Do NOT resolve automatically |
| Network errors | Report the error. Suggest checking VPN/internet connection |
| Branch already up to date | Skip that step, report "already up to date" |

## Anti-patterns

1. **Do not force-push without asking** — every force operation requires explicit user confirmation before execution.
2. **Do not sync if there are uncommitted changes without warning** — always report dirty working tree state before any operation that could lose work.
3. **Do not delete branches** — this skill never deletes any branch, local or remote.
4. **Do not modify files** — this skill runs only git, gh, and read-only commands.
5. **Do not auto-resolve merge conflicts** — always stop and let the user decide how to handle conflicts.
6. **Do not switch branches silently** — use `git fetch origin main:main` to update main without switching; if a checkout is truly needed, explain and confirm.
7. **Do not skip the assessment step** — always run Step 1 first so the user sees the full state before any changes.
8. **Do not hardcode remote URLs** — derive owner/repo from `git remote get-url` output.
