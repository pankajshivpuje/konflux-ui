---
name: run-tests
description: Use when running, debugging, or writing unit tests or e2e tests. Triggers when user mentions testing, coverage, test failures, or asks to verify a change works.
---

# Running Tests in konflux-ui

## Unit Tests (Jest + React Testing Library)

```bash
yarn test                             # Run all unit tests
yarn test -- --testPathPattern=<path> # Run tests matching a file/folder
yarn test -- --watch                  # Watch mode
yarn coverage                        # Full coverage report (single-threaded)
```

Tests live in `__tests__/` directories alongside the code they test. Files use `.spec.ts` or `.spec.tsx` extensions.

### Writing Tests

Use rendering utilities from `~/unit-test-utils/`:

- `renderWithQueryClientAndRouter` — components needing React Query + Router
- `namespaceRenderer` — components needing namespace context
- `formikRenderer` — form components

Use mock factories for K8s resources:

- `createK8sWatchResourceMock` — mock Kubernetes API calls
- `createUseApplicationMock` — mock application hooks
- `mockAccessReviewUtil` — mock RBAC permission checks
- `createUseParamsMock` — mock route parameters

### Coverage

Target is **>= 80%**. PRs that significantly reduce coverage will be flagged by Codecov.

## E2E Tests (Playwright)

E2E tests are in `e2e-tests/` with their own `package.json`:

```bash
cd e2e-tests && yarn install          # Install e2e dependencies (first time)
```

E2E tests run in CI against a deployed Konflux instance. They are not typically run locally unless debugging a specific flow.

## Debugging Failures

1. Check the test output for the failing assertion
2. Use `screen.debug()` in tests to inspect rendered DOM
3. For async issues, use `waitFor` or `waitForLoadingToFinish` from `~/unit-test-utils/test-helpers`
4. For K8s resource mocks, verify `mockWatchResource.mockReturnValue` matches the expected shape
