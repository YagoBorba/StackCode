# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) that document the important architectural decisions made during the development of StackCode.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## Format

Each ADR follows this structure:
- **Title**: What is the architectural decision?
- **Status**: What is the status? (Proposed, Accepted, Deprecated, Superseded)
- **Context**: What is the issue that we're seeing that is motivating this decision or change?
- **Decision**: What is the change that we're proposing or have agreed to implement?
- **Consequences**: What becomes easier or more difficult to do and any risks introduced by this change?

## Index

- [ADR-001: Monorepo Structure](./001-monorepo-structure.md)
- [ADR-002: TypeScript and ES Modules](./002-typescript-esm.md)
- [ADR-003: Command Line Interface Design](./003-cli-design.md)
- [ADR-004: Internationalization Strategy](./004-i18n-strategy.md)

## Template

```markdown
# ADR-XXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Describe the context and problem statement]

## Decision
[Describe the response to these forces]

## Consequences
[Describe the resulting context after applying the decision]
```
