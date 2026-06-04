# 2. Colocate Test Files with Source Code

Date: 2026-06-02

## Status

Accepted

## Context

The project needs a convention for where to place test files. Two common approaches exist:
1. A separate `tests/` directory mirroring the `src/` structure
2. Colocated test files (`*.spec.tsx`) alongside the source files they test

React ecosystem conventions and tooling (Jest, Vite) favor colocated tests. Colocated tests make it easier to find the test for a given component, keep import paths short, and ensure tests move with their source files during refactoring.

## Decision

We will colocate unit test files next to the source files they test, using the `*.spec.ts` / `*.spec.tsx` naming convention. For example, `src/components/Button/Button.tsx` has its test at `src/components/Button/Button.spec.tsx`.

End-to-end tests live in a dedicated `e2e-tests/` directory since they test cross-cutting user flows rather than individual modules.

## Consequences

- Tests are discoverable directly next to the code they test
- Refactoring tools move tests with their source automatically
- No need to maintain a parallel directory structure
- Jest is configured to find `*.spec.ts(x)` files anywhere in `src/`
