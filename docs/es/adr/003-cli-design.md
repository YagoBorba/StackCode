# ADR-003: Diseño de Interfaz de Línea de Comandos

## Estado
Aceptado

## Contexto
StackCode proporciona una herramienta CLI integral que necesita:
- Soportar múltiples comandos complejos con subcomandos
- Proporcionar prompts interactivos para orientación del usuario
- Manejar gestión de configuración
- Soportar internacionalización
- Proporcionar mensajes de ayuda y error consistentes
- Ser extensible para comandos futuros

Necesitábamos elegir:
- Framework/biblioteca CLI
- Estructura y organización de comandos
- Sistema de prompts interactivos
- Estrategia de manejo de errores

## Decisión
Usaremos Yargs como nuestro framework CLI primario con Inquirer para prompts interactivos:

### Framework Yargs
- Usar Yargs para parseo de comandos, validación y generación de ayuda
- Implementar arquitectura basada en comandos con separación clara
- Soportar aliases y atajos para comandos comunes
- Proporcionar información comprensiva de ayuda y uso

### Estructura de Comandos
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
