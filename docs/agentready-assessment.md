# Agentready Assessment — konflux-ui

**Date:** 2026-05-21
**Tool:** agentready v2.40.0
**Score:** 62.6/100 (Silver)
**Assessed:** 25/33 attributes (8 skipped as not applicable)

## Score Breakdown

### Passing (10 attributes)

| Attribute | Score | Tier |
|-----------|-------|------|
| Test Execution & Coverage | 100 | T1 |
| CLAUDE.md Configuration Files | 100 | T1 |
| README Structure | 100 | T1 |
| Dependency Pinning | 100 | T1 |
| Conventional Commit Messages | 100 | T2 |
| Separation of Concerns | 94 | T2 |
| Concise Documentation | 84 | T2 |
| Container/Virtualization Setup | 70 | T4 |
| Pattern References | 60 | T2 |
| Progressive Disclosure | 40 | T4 |

### Failing (15 attributes)

| Attribute | Score | Tier | Issue |
|-----------|-------|------|-------|
| Single-File Verification | 0 | T1 | No single-file lint/type-check commands documented |
| Dependency Security | 0 | T1 | No Dependabot/Renovate/SAST configured |
| Repomix Config | 0 | T3 | Not configured |
| Architecture Decision Records | 0 | T3 | No ADR directory |
| Code Smell Elimination | 0 | T4 | ESLint exists but agentready didn't detect it |
| Deterministic Enforcement | 10 | T2 | Husky found but incomplete config |
| Design Intent Documentation | 30 | T3 | Minimal design docs |
| Type Annotations | 50 | T1 | `strict: true` not set in tsconfig.json |
| Standard Project Layouts | 50 | T1 | No top-level `tests/` directory (tests are colocated in `__tests__/`) |
| Issue & PR Templates | 50 | T4 | PR template exists, no issue templates |
| One-Command Setup | 60 | T2 | `setup.sh` exists but README doesn't surface it clearly |
| File Size Limits | 61 | T2 | 12 files >1000 lines |
| .gitignore Completeness | 64 | T2 | Missing 4 recommended patterns |
| OpenAPI Specs | 70 | T3 | Vendored Tekton specs are v2.0, not v3.x |
| CI Quality Gates | 88 | T1 | No type-check gate detected in CI |

## Priority Improvement Actions

### Quick wins (high impact, low effort)

1. **Document single-file verification commands in AGENTS.md** (+5 pts)
   - Add `npx eslint path/to/file.ts` and `npx tsc --noEmit` to AGENTS.md
   - Already available, just needs documenting

2. **Add missing .gitignore patterns** (+~2 pts)
   - Add: `*.tsbuildinfo`, `*.swp`, `*.swo`, `.npm/`

3. **Surface `setup.sh` more prominently in README** (+~2 pts)
   - Already exists as one-command setup, just needs better visibility

### Medium effort

4. **Add issue templates** (+~3 pts)
   - Create `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`

5. **Add type-check step to PR CI** (+~1 pt)
   - Add `yarn type-checks` as a separate CI step in pr-check.yaml

### Larger scope (coordinate with repo owners)

6. **Enable Dependabot or Renovate** (+5 pts)
7. **Enable TypeScript strict mode** (+8 pts, but may require significant refactoring)
8. **Create ADR directory** with at least one decision record (+~3 pts)

## Notes

- The "Code Smell Elimination" score of 0 appears to be a false negative — the repo has ESLint, Stylelint, and Prettier all configured. The tool may not have detected them.
- The "Standard Layout" failure is because tests use colocated `__tests__/` dirs rather than a top-level `tests/` directory. This is a React convention, not a deficiency.
- The "Cyclomatic Complexity" check errored due to output size (21.9 MB exceeded the 10 MB limit).
- Full report saved to `.agentready/report-20260521-174254.md`.

## AGENTS.md Effectiveness Test

**Date:** 2026-05-27
**Task:** "Write a unit test for the CommitLabel component at `src/components/Commits/commit-label/CommitLabel.tsx`"

Two agent runs were compared — one with AGENTS.md loaded, one without.

### With AGENTS.md

| Convention | Followed? |
|---|---|
| Absolute imports (`~/`) | Yes — used `~/components/Commits/...` |
| Test attribute `data-test` (not `data-testid`) | Yes — correctly identified `data-test` |
| No snapshot tests | Yes — explicitly declined, citing AGENTS.md |
| File path `__tests__/CommitLabel.spec.tsx` | Yes |
| Run command `yarn test -- path` | Yes |

### Without AGENTS.md

| Convention | Followed? |
|---|---|
| Absolute imports (`~/`) | No — used relative `../CommitLabel` |
| Test attribute `data-test` (not `data-testid`) | Partially — guessed correctly but stated uncertainty |
| No snapshot tests | Yes — declined based on general best practices |
| File path `__tests__/CommitLabel.spec.tsx` | Yes |
| Run command `yarn test -- path` | Not mentioned |

### Key Differences

1. **Import paths:** With AGENTS.md, the agent used absolute `~/` imports as required. Without, it defaulted to relative imports — which would fail lint.
2. **Test attributes:** With AGENTS.md, the agent confidently used `data-test`. Without, it guessed based on project name conventions.
3. **Snapshot testing:** Both avoided snapshots, but only the AGENTS.md-aware agent cited a project rule rather than general preference.
4. **Test runner command:** Only the AGENTS.md-aware agent included the exact `yarn test` command.

### Conclusion

AGENTS.md provides measurable improvement in convention adherence. Without it, agents fall back to generic React conventions that conflict with project-specific rules (relative imports, uncertain test attributes). The file pays for itself on the first task by preventing lint failures and review churn.
