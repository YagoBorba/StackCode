# ADR-003: Command Line Interface Design

## Status
Accepted

## Context
StackCode provides a comprehensive CLI tool that needs to:
- Support multiple complex commands with subcommands
- Provide interactive prompts for user guidance
- Handle configuration management
- Support internationalization
- Provide consistent help and error messages
- Be extensible for future commands

We needed to choose:
- CLI framework/library
- Command structure and organization
- Interactive prompt system
- Error handling strategy

## Decision
We will use Yargs as our primary CLI framework with Inquirer for interactive prompts:

### Yargs Framework
- Use Yargs for command parsing, validation, and help generation
- Implement command-based architecture with clear separation
- Support aliases and shortcuts for common commands
- Provide comprehensive help and usage information

### Command Structure
- Each command is implemented as a separate module
- Commands follow a consistent interface pattern
- Support for subcommands where appropriate (e.g., `git start`, `git finish`)
- Global options available across all commands

### Interactive Prompts
- Use Inquirer.js for complex user interactions
- Provide guided workflows for complex operations
- Validate user input at prompt level
- Support default values and smart suggestions

### Error Handling
- Consistent error message formatting
- Localized error messages through i18n system
- Graceful handling of common error scenarios
- Debug mode for troubleshooting

## Consequences

### Positive
- **Developer Experience**: Yargs provides excellent help generation and validation
- **Consistency**: Uniform command structure and behavior across all commands
- **Extensibility**: Easy to add new commands following established patterns
- **User Guidance**: Interactive prompts guide users through complex workflows
- **Validation**: Built-in argument validation and type checking
- **Documentation**: Auto-generated help text keeps documentation in sync

### Negative
- **Bundle Size**: Yargs and Inquirer add significant dependencies
- **Complexity**: Learning curve for command configuration
- **Performance**: Startup time increased due to framework initialization

### Command Architecture
```
CLI Commands:
├── init          # Project scaffolding
├── generate      # File generation
├── commit        # Conventional commits
├── git           # Git workflow management
│   ├── start     # Start feature branch
│   └── finish    # Finish feature branch
├── release       # Version management
├── validate      # Commit validation
├── config        # Configuration management
└── github        # GitHub integration
```

### Command Interface Pattern
Each command module exports a function that returns a Yargs command configuration:
```typescript
export function getCommandName(): CommandModule {
  return {
    command: 'command-name [args]',
    describe: 'Command description',
    builder: (yargs) => {
      return yargs.option('option', {
        type: 'string',
        describe: 'Option description'
      });
    },
    handler: async (argv) => {
      // Command implementation
    }
  };
}
```

### Interactive Prompt Strategy
- Use prompts for complex multi-step workflows
- Provide sensible defaults based on project context
- Validate inputs and provide immediate feedback
- Support both interactive and non-interactive modes

### Global Configuration
- Support global and project-local configuration
- Configuration stored in standard locations (`~/.stackcode`, `.stackcode.json`)
- Command-line options override configuration files
- Environment variable support for CI/CD scenarios

## Alternatives Considered

### Commander.js
- **Pros**: Lighter weight, simpler API
- **Cons**: Less feature-rich, manual help generation

### Native Node.js argument parsing
- **Pros**: No dependencies, full control
- **Cons**: Significant development effort, poor developer experience

### CLI frameworks (Oclif, Gluegun)
- **Pros**: More opinionated, additional features
- **Cons**: More complex, additional abstractions

## Implementation Guidelines

### Command Development
1. Each command should have comprehensive tests
2. All user-facing strings must support internationalization
3. Commands should validate inputs early and provide clear error messages
4. Support both interactive and programmatic usage

### Error Handling
1. Use consistent error message formats
2. Provide actionable error messages with suggestions
3. Log detailed error information in debug mode
4. Handle common scenarios gracefully (network issues, permission errors)

### Help and Documentation
1. Provide clear command descriptions and examples
2. Document all options and their effects
3. Include usage examples in help text
4. Keep help text concise but comprehensive
