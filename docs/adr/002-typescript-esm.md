# ADR-002: TypeScript and ES Modules

## Status

Accepted

## Context

StackCode is a developer tool that needs to:

- Provide type safety for complex business logic
- Support modern JavaScript features
- Be compatible with Node.js and browser environments
- Maintain high code quality and developer experience
- Support tree-shaking for optimal bundle sizes

We needed to choose:

- Programming language (JavaScript vs TypeScript)
- Module system (CommonJS vs ES Modules)
- Build tooling and compilation strategy

## Decision

We will use TypeScript with ES Modules (ESM) as our primary development stack:

### TypeScript

- All source code will be written in TypeScript
- Strict TypeScript configuration with comprehensive type checking
- Shared type definitions across packages
- Generate declaration files for published packages

### ES Modules (ESM)

- Use ES Modules as the primary module system
- Configure `"type": "module"` in all package.json files
- Use `.js` extensions in import statements (TypeScript requirement for ESM)
- Support Node.js native ESM loading

### Build Strategy

- Compile TypeScript to JavaScript with ESM output
- Use TypeScript project references for monorepo builds
- Generate source maps for debugging
- Copy non-TypeScript assets (templates, locales) during build

## Consequences

### Positive

- **Type Safety**: Comprehensive compile-time type checking reduces runtime errors
- **Modern JavaScript**: Access to latest language features and improvements
- **Better IDE Support**: Enhanced autocomplete, refactoring, and navigation
- **Tree Shaking**: ESM enables better dead code elimination
- **Future Compatibility**: ESM is the standard going forward
- **Performance**: Native ESM loading in Node.js improves startup time

### Negative

- **Build Complexity**: Requires compilation step and build tooling
- **Learning Curve**: Team members need TypeScript knowledge
- **Bundle Size**: TypeScript runtime helpers may increase bundle size
- **ESM Migration**: Some dependencies may still use CommonJS

### Technical Considerations

- **Import Extensions**: Must use `.js` extensions in TypeScript imports for ESM compatibility
- **Dynamic Imports**: Use `import()` for conditional module loading
- **\_\_dirname Replacement**: Use `import.meta.url` for file path resolution
- **Package Exports**: Define clear entry points in package.json exports field

### Tooling Requirements

- **TypeScript Compiler**: For compilation and type checking
- **ESLint with TypeScript**: For code quality and consistency
- **Prettier**: For code formatting
- **Vitest/Jest**: Testing frameworks with TypeScript support

### Migration Strategy

- Convert all existing JavaScript to TypeScript gradually
- Update import statements to use explicit `.js` extensions
- Configure build tools to handle TypeScript compilation
- Update CI/CD pipeline to include TypeScript compilation step

## Alternatives Considered

### JavaScript with JSDoc

- **Pros**: No compilation step, simpler tooling
- **Cons**: Less robust type checking, worse IDE support

### CommonJS Modules

- **Pros**: Better ecosystem compatibility, simpler Node.js integration
- **Cons**: No tree shaking, legacy module system, worse performance

### Mixed Module System

- **Pros**: Gradual migration, better compatibility
- **Cons**: Complexity, confusion, maintenance overhead
