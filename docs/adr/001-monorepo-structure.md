# ADR-001: Monorepo Structure

## Status

Accepted

## Context

StackCode consists of multiple related packages that share common functionality:

- A CLI tool for command-line usage
- A VS Code extension for IDE integration
- Core business logic that both interfaces use
- Internationalization support across all components

We needed to decide how to organize these related but distinct packages in a way that:

- Enables code sharing between packages
- Maintains clear boundaries between components
- Simplifies dependency management
- Facilitates coordinated releases
- Reduces development complexity

## Decision

We will use a monorepo structure with the following packages:

- `@stackcode/cli` - Command-line interface
- `@stackcode/core` - Shared business logic and utilities
- `@stackcode/i18n` - Internationalization support
- `stackcode-vscode` - VS Code extension

The monorepo will be managed using npm workspaces, providing:

- Shared dependency management
- Cross-package linking
- Coordinated build processes
- Unified versioning strategy

## Consequences

### Positive

- **Code Reuse**: Core business logic can be shared between CLI and VS Code extension
- **Consistent APIs**: All packages use the same underlying interfaces and types
- **Simplified Development**: Single repository checkout provides access to all components
- **Coordinated Releases**: All packages can be versioned and released together
- **Reduced Duplication**: Common utilities and types are centralized
- **Easier Testing**: Integration tests can span multiple packages

### Negative

- **Build Complexity**: Build system must handle multiple packages and their dependencies
- **Repository Size**: Single repository contains all components, potentially increasing size
- **Tool Limitations**: Some tools may not handle monorepos optimally
- **Dependency Management**: Changes in core packages affect all dependents

### Risks

- **Circular Dependencies**: Must be careful to avoid circular references between packages
- **Build Order**: Package build order becomes important
- **Version Coordination**: All packages typically need to be versioned together

### Mitigation Strategies

- Use TypeScript project references to handle build dependencies
- Implement clear package boundaries and interfaces
- Use npm workspaces for dependency management
- Establish clear guidelines for cross-package dependencies
