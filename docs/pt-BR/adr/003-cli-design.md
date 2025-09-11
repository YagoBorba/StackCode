# ADR-003: Design da Interface de Linha de Comando

## Status

Aceito

## Contexto

O StackCode fornece uma ferramenta CLI abrangente que precisa:

- Suportar múltiplos comandos complexos com subcomandos
- Fornecer prompts interativos para orientação do usuário
- Lidar com gerenciamento de configuração
- Suportar internacionalização
- Fornecer mensagens de ajuda e erro consistentes
- Ser extensível para comandos futuros

Precisávamos escolher:

- Framework/biblioteca CLI
- Estrutura e organização de comandos
- Sistema de prompts interativos
- Estratégia de tratamento de erros

## Decisão

Utilizaremos Yargs como nosso framework CLI primário com Inquirer para prompts interativos:

### Framework Yargs

- Usar Yargs para parsing de comandos, validação e geração de ajuda
- Implementar arquitetura baseada em comandos com separação clara
- Suportar aliases e atalhos para comandos comuns
- Fornecer informações abrangentes de ajuda e uso

### Estrutura de Comandos

```
stc <comando> [subcomando] [opções]

Comandos Principais:
├── init [template]          # Inicializar novo projeto
├── generate <tipo>          # Gerar código/arquivos
├── commit [--auto]          # Commit assistido
├── git <subcomando>         # Operações Git
├── release [tipo]           # Gerenciamento de release
├── validate [escopo]        # Validação de projeto
├── config <ação>            # Gerenciamento de configuração
└── ui                       # Interface de usuário
```

### Sistema de Prompts Interativos

- Usar Inquirer.js para prompts complexos
- Implementar fluxos condicionais baseados em respostas
- Suporte a diferentes tipos de input (text, select, checkbox, etc.)
- Validação em tempo real durante prompts

## Fundamentos

### Benefícios do Yargs

1. **Parsing Robusto**: Parsing automático de argumentos com validação
2. **Help Generation**: Geração automática de mensagens de ajuda
3. **Type Safety**: Integração excelente com TypeScript
4. **Extensibilidade**: Fácil adição de novos comandos
5. **Standards**: Segue convenções padrão de CLI

### Benefícios do Inquirer

1. **UX Rica**: Interface interativa rica para usuários
2. **Validação**: Validação integrada de inputs
3. **Flexibilidade**: Múltiplos tipos de prompts
4. **Condicionais**: Prompts condicionais baseados em respostas
5. **Customização**: Prompts customizáveis e temas

## Implementação

### Estrutura Base do CLI

```typescript
#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const cli = yargs(hideBin(process.argv))
  .scriptName("stc")
  .usage("$0 <comando> [opções]")
  .help()
  .version()
  .strict()
  .recommendCommands()
  .demandCommand(1, "Você deve especificar um comando para executar.");

// Registrar comandos
cli.commandDir("commands", {
  extensions: ["js", "ts"],
  exclude: /\.test\./,
});

cli.parse();
```

### Estrutura de Comando Individual

```typescript
import type { CommandModule } from "yargs";
import inquirer from "inquirer";

interface InitArgs {
  template?: string;
  directory?: string;
  force?: boolean;
}

const initCommand: CommandModule<{}, InitArgs> = {
  command: "init [template]",
  describe: "Inicializar um novo projeto",

  builder: (yargs) => {
    return yargs
      .positional("template", {
        describe: "Template do projeto",
        type: "string",
        choices: ["node-js", "react", "vue", "go", "python"],
      })
      .option("directory", {
        alias: "d",
        describe: "Diretório de destino",
        type: "string",
      })
      .option("force", {
        alias: "f",
        describe: "Sobrescrever arquivos existentes",
        type: "boolean",
        default: false,
      });
  },

  handler: async (argv) => {
    const { template, directory, force } = argv;

    // Se template não especificado, prompt interativo
    if (!template) {
      const answers = await inquirer.prompt([
        {
          type: "list",
          name: "template",
          message: "Qual template você gostaria de usar?",
          choices: [
            { name: "Node.js", value: "node-js" },
            { name: "React", value: "react" },
            { name: "Vue.js", value: "vue" },
            { name: "Go", value: "go" },
            { name: "Python", value: "python" },
          ],
        },
      ]);

      argv.template = answers.template;
    }

    // Executar lógica de inicialização
    await executeInit(argv);
  },
};

export default initCommand;
```

### Sistema de Configuração

```typescript
interface StackCodeConfig {
  defaultAuthor?: string;
  defaultLicense?: string;
  gitHubToken?: string;
  preferredTemplates?: string[];
  language?: "en" | "pt" | "es";
}

class ConfigManager {
  private configPath = path.join(os.homedir(), ".stackcoderc");

  async get<K extends keyof StackCodeConfig>(
    key: K,
  ): Promise<StackCodeConfig[K] | undefined> {
    const config = await this.load();
    return config[key];
  }

  async set<K extends keyof StackCodeConfig>(
    key: K,
    value: StackCodeConfig[K],
  ): Promise<void> {
    const config = await this.load();
    config[key] = value;
    await this.save(config);
  }
}
```

## Padrões de Design

### 1. Command Pattern

Cada comando é implementado como módulo independente:

```typescript
interface CommandModule {
  command: string;
  describe: string;
  builder: (yargs: Yargs) => Yargs;
  handler: (args: any) => Promise<void>;
}
```

### 2. Progressive Disclosure

- Comandos básicos são simples e diretos
- Opções avançadas disponíveis via flags
- Prompts interativos para usuários iniciantes

### 3. Error-First Design

```typescript
try {
  await executeCommand(args);
  process.exit(0);
} catch (error) {
  console.error(chalk.red("Erro:"), error.message);

  if (args.verbose) {
    console.error(error.stack);
  }

  process.exit(1);
}
```

### 4. Consistent Output

```typescript
class OutputManager {
  success(message: string) {
    console.log(chalk.green("✓"), message);
  }

  error(message: string) {
    console.error(chalk.red("✗"), message);
  }

  warning(message: string) {
    console.warn(chalk.yellow("⚠"), message);
  }

  info(message: string) {
    console.log(chalk.blue("ℹ"), message);
  }
}
```

## Consequências

### Positivas

- **Experiência Consistente**: Interface unificada em todos os comandos
- **Descobribilidade**: Sistema de ajuda abrangente e sugestões
- **Flexibilidade**: Suporte tanto para uso scriptable quanto interativo
- **Extensibilidade**: Fácil adição de novos comandos
- **Type Safety**: Argumentos e opções totalmente tipados

### Negativas

- **Dependências**: Dependência de libraries externas (Yargs, Inquirer)
- **Complexidade**: Setup inicial mais complexo
- **Bundle Size**: Tamanho ligeiramente maior do pacote
- **Learning Curve**: Desenvolvedores precisam aprender convenções

### Neutras

- **Performance**: Impacto mínimo na performance de startup
- **Manutenção**: Necessidade de manter comandos atualizados

## Padrões de Uso

### Modo Não-Interativo (Scripting)

```bash
# Para automação e scripts
stc init react --directory ./my-app --force
stc generate component Button --path src/components
stc commit --auto --type feat --scope ui
```

### Modo Interativo (Guided)

```bash
# Para usuários explorando funcionalidades
stc init          # Prompts para template, diretório, etc.
stc generate      # Lista tipos disponíveis
stc commit        # Guided commit com conventional commits
```

### Modo Híbrido

```bash
# Combinação de argumentos e prompts
stc init react    # Template especificado, prompt para outros detalhes
stc generate component  # Tipo especificado, prompt para name/path
```

## Implementação de Comandos

### Comando Init

- **Propósito**: Scaffolding de novos projetos
- **Interações**: Template selection, project details, configuration
- **Outputs**: Project structure, dependency installation, git setup

### Comando Generate

- **Propósito**: Geração de código e arquivos
- **Interações**: Type selection, naming, placement
- **Outputs**: Generated files, updated imports/exports

### Comando Commit

- **Propósito**: Commits assistidos com conventional commits
- **Interações**: Type selection, scope, description
- **Outputs**: Formatted commit message, git commit

### Comando Git

- **Propósito**: Operações Git abstraídas e simplificadas
- **Subcomandos**: setup, flow, hooks, cleanup
- **Outputs**: Git configuration, branch operations

### Comando Release

- **Propósito**: Gerenciamento automatizado de releases
- **Interações**: Version bump, changelog generation
- **Outputs**: Tagged release, updated changelog, npm publish

## Internacionalização

### Estrutura de Mensagens

```typescript
interface CLIMessages {
  commands: {
    init: {
      description: string;
      prompts: {
        template: string;
        directory: string;
      };
    };
    // ... outros comandos
  };
  errors: {
    invalidTemplate: string;
    directoryExists: string;
    // ... outros erros
  };
}
```

### Implementação i18n

```typescript
import { t } from "@stackcode/i18n";

const initCommand: CommandModule = {
  command: "init [template]",
  describe: t("commands.init.description"),

  handler: async (argv) => {
    const answers = await inquirer.prompt([
      {
        message: t("commands.init.prompts.template"),
        // ...
      },
    ]);
  },
};
```

## Testes

### Estratégia de Testes

```typescript
describe("init command", () => {
  test("should create project with template", async () => {
    const args = { template: "react", directory: "./test-project" };
    await initCommand.handler(args);

    expect(fs.existsSync("./test-project/package.json")).toBe(true);
    expect(fs.existsSync("./test-project/src/App.tsx")).toBe(true);
  });

  test("should prompt for template when not provided", async () => {
    // Mock inquirer prompts
    jest.mocked(inquirer.prompt).mockResolvedValue({ template: "vue" });

    const args = {};
    await initCommand.handler(args);

    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: "template" })]),
    );
  });
});
```

## Monitoramento e Métricas

### Usage Analytics

- Comandos mais utilizados
- Templates mais populares
- Padrões de erro comuns
- Performance de comandos

### Error Tracking

- Tipos de erro por comando
- Stack traces para debugging
- User feedback e relatórios

---

_Este ADR será revisado conforme feedback dos usuários e evolução das necessidades da CLI._

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
    command: "command-name [args]",
    describe: "Command description",
    builder: (yargs) => {
      return yargs.option("option", {
        type: "string",
        describe: "Option description",
      });
    },
    handler: async (argv) => {
      // Command implementation
    },
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
