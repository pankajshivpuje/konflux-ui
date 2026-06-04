---
name: run-tests
description: >
  Use when running unit tests, fixing test failures, adding new tests,
  checking test coverage, or understanding the test setup for konflux-ui.
---

# Run Tests

## Quick Reference

| Task | Command |
|------|---------|
| All unit tests | `yarn test` |
| Single file | `yarn test -- src/components/Foo/Foo.spec.tsx` |
| Coverage report | `yarn coverage` |
| Watch mode | `yarn test -- --watch` |
| CI mode | `yarn test --maxWorkers=2 --coverage --silent --ci` |

CI runs tests on Node 20 and 22.

## Unit Test Conventions

- Test files are colocated: `Component.tsx` → `Component.spec.tsx` (same directory)
- Test ID attribute is `data-test` (not `data-testid`)
- No snapshot tests
- Use `userEvent.setup()` + `userEvent` (not `fireEvent`)
- Use semantic queries: `getByRole`, `getByLabelText`, `getByText` — not `getByTestId`
- Rendering utilities come from `~/unit-test-utils/`
- K8s mocks use `createK8sWatchResourceMock`
- Cover success, error, and loading states

## Adding a New Test

1. Create `ComponentName.spec.tsx` next to the component
2. Import render utilities from `~/unit-test-utils/`
3. Mock K8s hooks with `createK8sWatchResourceMock` from test utils
4. Test user interactions with `userEvent.setup()` then `await user.click()`
5. Assert with `screen.getByRole()` / `screen.getByText()`

Read `docs/guidelines/unit-testing.md` for full patterns including mock setup, custom renderers, and React Query testing.

## E2E Tests

E2E tests live in `e2e-tests/` (separate workspace):

```bash
cd e2e-tests && yarn install
yarn cypress open    # interactive
yarn cypress run     # headless
```

E2E tests run in CI via the `pr-check.yaml` workflow against a deployed preview.

## Common Mistakes

- Using `fireEvent` instead of `userEvent` — always use `userEvent.setup()` first
- Using `data-testid` instead of `data-test` — this repo uses `data-test`
- Importing from `@testing-library/react` directly — use `~/unit-test-utils/` wrappers
- Missing async `await` on `userEvent` calls — all user events are async
