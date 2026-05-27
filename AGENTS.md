# AGENTS.md — konflux-ui

## Build & Test Commands

| Task | Command |
|---|---|
| Install deps | `corepack enable && yarn install` |
| Unit tests | `yarn test` |
| Single test file | `yarn test -- path/to/file.spec.tsx` |
| Lint | `yarn lint` |
| Import boundaries | `yarn lint:restricted-imports` |
| Type check | `yarn type-checks` |
| Start dev server| `yarn start` |

CI runs: `yarn lint` -> `yarn lint:restricted-imports` -> `yarn type-checks` -> `yarn test` (Node 20 + 22).

## Setup

One-command setup: ./setup.sh (checks Node.js >= 20, enables Corepack, installs dependencies, starts dev server)

## Key Conventions

- `~/` -> `src/`, `@routes/` -> `src/routes/` -- use absolute imports, never `../../../`
- PatternFly v6 CSS classes must use the `pf-v6-` prefix (e.g., `pf-v6-u-ml-sm`), never `pf-v5-`. The `pf-v5-` prefix is incompatible with PatternFly v6.
- `@patternfly/react-icons` -> use `@patternfly/react-icons/dist/esm/icons/<kebab-case-name>`
- `lodash` -> use `lodash-es/<funcName>` (jest maps `lodash-es` to `lodash` automatically)
- No `console.*` -> use `logger` from `~/monitoring/logger`
- No snapshot tests; test ID attribute is `data-test` (not `data-testid`)
- Before writing any test file, read `docs/guidelines/unit-testing.md`. Use `userEvent.setup()` for user interactions (`fireEvent` only for simple synchronous events per Pattern 7), and use shared render utilities from `~/unit-test-utils/` (e.g., `renderWithQueryClientAndRouter`) instead of custom wrappers.
- New list/table views **must** use `TableV2` from `~/shared/components/TableV2` (see `docs/guidelines/table-v2.md`). Do not inline PatternFly table primitives (`Table`, `Thead`, `Tbody`, `Tr`, `Td`) directly. If TableV2 lacks a needed capability (e.g., row selection), extend it rather than building a bespoke table.
- Prefer shared utilities over inline reimplementations -- e.g., use `textMatch` / `filterByText` from `~/utils/text-filter-utils` for case-insensitive string filtering instead of hand-rolling `.toLowerCase().includes()`.
- No manual `addEventListener`/`removeEventListener` -- use `useEventListener` from `~/shared/hooks/useEventListener` for browser event listeners. Exceptions: `ResizeObserver`/`IntersectionObserver` callbacks (use `useResizeObserver`/`useLayoutResizeObserver` for `ResizeObserver`), `useSyncExternalStore` subscriptions, and listeners on dynamically created or non-React-managed DOM nodes. See `docs/best-practices.md` for details.
- `noUnusedLocals` and `noUnusedParameters` enforced -- prefix unused params with `_`
- Never add `Co-Authored-By` to commit messages; use `Assisted-by: Claude` trailer instead

## Commits

Conventional Commits enforced by commitlint: `feat:`, `fix:`, `chore:`, etc. Husky pre-commit runs `lint-staged` (prettier + restricted-imports on TS, stylelint on SCSS).

## PR Conventions

- Read `docs/pr-review-guidelines.md` before reviewing or creating PRs.
- Fill every section of `.github/PULL_REQUEST_TEMPLATE.md` when creating a PR.

## Guidelines (docs/guidelines/)

Detailed guides for AI agents and developers:

- PR titles must follow the format `type(ticket-id): summary` where `ticket-id` is a Jira ticket (e.g., `KFLUXUI-123`, `KONFLUX-456`) or GitHub issue (e.g., `#123`). Allowed types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `build`, `perf`, `style`, `revert`. This is enforced by the `pr-title-check` CI workflow. Note: this differs from the commit message format, which does not require a ticket scope.
- Read `docs/pr-review-guidelines.md` before reviewing or creating PRs.
- Fill every section of `.github/PULL_REQUEST_TEMPLATE.md` when creating a PR.

| Document | Use When |
|---|---|
| `docs/guidelines/component-guidelines.md` | Creating new components (imports, architecture, conventions) |
| `docs/guidelines/table-component.md` | Building list views with the shared table system |
| `docs/guidelines/layout-and-pages.md` | Creating pages (list, detail, form, modal patterns) |
| `docs/guidelines/hooks-and-data-fetching.md` | Using K8s hooks, React Query, RBAC, state management |
| `docs/guidelines/patternfly-guidelines.md` | PatternFly components, layout, design tokens, SCSS |
| `docs/guidelines/unit-testing.md` | Writing unit tests (mocks, renderers, patterns) |

## Other Documentation (docs/)

| Document | Purpose |
|---|---|
| `docs/best-practices.md` | Full coding standards and conventions |
| `docs/pr-review-guidelines.md` | PR review checklist |
| `docs/feature-flags.md` | Feature flag system (flags, persistence, URL grammar, lifecycle) |
| `docs/conditions.md` | Feature flag conditions (`allOf`/`anyOf` guards, `registerCondition`) |
| `docs/analytics.md` | Segment analytics (events, config, codegen, obfuscation) |
| `docs/kubearchive.md` | KubeArchive dual-source data (cluster + archive hooks, deduplication) |
| `docs/e2e-coverage.md` | E2E coverage via Istanbul + Cypress |

## Maintenance

AGENTS.md is reviewed quarterly (next: August 2026). Update when architecture, commands, or conventions change. Run `agentready assess .` after major updates. See the [Global Engineering AGENTS.md guide](https://gitlab.com/gitlab-com/content-sites/internal-handbook/-/blob/main/content/handbook/engineering/development/global-engineering/ai-context-files.md) for best practices.
