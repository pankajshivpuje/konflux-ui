# 3. Use PatternFly as the Design System

Date: 2026-06-02

## Status

Accepted

## Context

Konflux UI needs a consistent, accessible component library that aligns with Red Hat's design language. The team evaluated building custom components versus adopting an existing design system.

## Decision

We will use PatternFly (v5) as the primary design system and component library. All UI components should use PatternFly components and design tokens rather than custom implementations. PatternFly-specific conventions:

- Import icons from `@patternfly/react-icons/dist/esm/icons/<kebab-case-name>`
- Use PatternFly design tokens via SCSS variables, not hardcoded colors or spacing
- Follow PatternFly layout patterns (PageSection, Stack, Split) over raw CSS

## Consequences

- Consistent look and feel aligned with Red Hat product standards
- Accessibility (WCAG 2.1 AA) handled by PatternFly components
- Reduced custom CSS and component maintenance
- Team must stay current with PatternFly major version upgrades
- Custom styling should extend PatternFly tokens, not override them
