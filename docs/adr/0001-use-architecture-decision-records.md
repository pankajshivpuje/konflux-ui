# 1. Use Architecture Decision Records

Date: 2026-06-02

## Status

Accepted

## Context

As the Konflux UI codebase grows in complexity, architectural decisions are made in conversations, pull requests, and Slack threads that are difficult to discover later. New contributors and AI agents need to understand why certain patterns were chosen to make consistent decisions.

## Decision

We will use Architecture Decision Records (ADRs) as described by Michael Nygard to document significant architectural decisions. ADRs will be stored in `docs/adr/` and numbered sequentially (`0001-*.md`, `0002-*.md`, etc.).

Each ADR will include:
- **Status**: Proposed, Accepted, Deprecated, or Superseded
- **Context**: The forces at play and the problem being addressed
- **Decision**: What we decided to do
- **Consequences**: The resulting context after applying the decision

## Consequences

- Architectural decisions are documented with their rationale and context
- Future contributors (human and AI) can understand why patterns exist
- ADRs are lightweight, version-controlled, and discoverable
- Decisions can be revisited by creating new ADRs that supersede old ones
