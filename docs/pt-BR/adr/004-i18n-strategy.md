# ADR-004: Estratégia de Internacionalização

## Status
Aceito

## Contexto
O StackCode é projetado para ser usado por desenvolvedores mundialmente e precisa:
- Suportar múltiplos idiomas para todo texto voltado ao usuário
- Fornecer mensagens de erro e prompts localizados
- Suportar tanto interfaces CLI quanto extensão VS Code
- Ser extensível para idiomas adicionais
- Manter performance com carregamento de locales
- Suportar troca dinâmica de idioma

Precisávamos decidir:
- Biblioteca e abordagem i18n
- Organização de arquivos de locale
- Estratégia de detecção de idioma
- Mecanismos de fallback
- Integração entre pacotes

## Decisão
Implementaremos um sistema i18n customizado com um pacote dedicado:

### Pacote @stackcode/i18n
- Lógica centralizada de internacionalização
- Arquivos de locale baseados em JSON
- Troca de locale em runtime
- Fallback automático para inglês
- Compartilhado entre todos os pacotes

### Estrutura de Locales
```
packages/i18n/src/locales/
├── en.json     # Inglês (padrão)
├── pt.json     # Português
├── es.json     # Espanhol
└── ...         # Idiomas futuros
```

### Detecção de Idioma
1. **Configuração explícita**: Configuração do usuário em `~/.stackcoderc`
2. **Variável de ambiente**: `STACKCODE_LANG` ou `LANG`
3. **Detecção do sistema**: `process.env.LANG` ou APIs do sistema
4. **Fallback**: Inglês como padrão

## Fundamentos

### Benefícios do Sistema Customizado
1. **Controle Total**: Controle completo sobre funcionalidades
2. **Performance**: Carregamento otimizado de locales
3. **Flexibilidade**: Customização específica para nossas necessidades
4. **Zero Dependencies**: Sem dependências externas pesadas
5. **Type Safety**: Integração com TypeScript para type safety

### Estrutura de Tradução
```typescript
interface LocaleMessages {
  // Comandos CLI
  commands: {
    init: {
      description: string;
      prompts: {
        template: string;
        projectName: string;
        directory: string;
      };
      success: string;
      errors: {
        invalidTemplate: string;
        directoryExists: string;
      };
    };
    generate: {
      description: string;
      types: {
        component: string;
        service: string;
        model: string;
      };
    };
    // ... outros comandos
  };

  // Mensagens gerais
  common: {
    success: string;
    error: string;
    warning: string;
    info: string;
    cancel: string;
    confirm: string;
  };

  // Específico da extensão VS Code
  extension: {
    dashboard: {
      title: string;
      welcome: string;
      recentProjects: string;
    };
    notifications: {
      projectGenerated: string;
      commitSuccess: string;
      validationFailed: string;
    };
  };

  // Templates e scaffolding
  templates: {
    [templateName: string]: {
      description: string;
      features: string[];
    };
  };
}
```

## Implementação

### API Principal do i18n
```typescript
export class I18nManager {
  private currentLocale: string = 'en';
  private messages: Map<string, LocaleMessages> = new Map();
  private fallbackLocale: string = 'en';

  constructor() {
    this.loadLocale(this.fallbackLocale);
    this.detectAndSetLocale();
  }

  // Traduzir chave com interpolação
  t(key: string, params?: Record<string, any>): string {
    const message = this.getMessage(key);
    
    if (!params) return message;
    
    return message.replace(/{{(\w+)}}/g, (match, paramName) => {
      return params[paramName] ?? match;
    });
  }

  // Trocar idioma dinamicamente
  async setLocale(locale: string): Promise<void> {
    if (!this.messages.has(locale)) {
      await this.loadLocale(locale);
    }
    this.currentLocale = locale;
  }

  // Carregar arquivos de locale
  private async loadLocale(locale: string): Promise<void> {
    try {
      const messages = await import(`./locales/${locale}.json`);
      this.messages.set(locale, messages.default);
    } catch (error) {
      console.warn(`Falha ao carregar locale ${locale}, usando fallback`);
    }
  }

  // Buscar mensagem com fallback
  private getMessage(key: string): string {
    const keys = key.split('.');
    const currentMessages = this.messages.get(this.currentLocale);
    const fallbackMessages = this.messages.get(this.fallbackLocale);

    const getValue = (obj: any, path: string[]): string | undefined => {
      return path.reduce((current, segment) => current?.[segment], obj);
    };

    return getValue(currentMessages, keys) || 
           getValue(fallbackMessages, keys) || 
           key; // Retorna a chave se nenhuma tradução for encontrada
  }

  // Detecção automática de idioma
  private detectAndSetLocale(): void {
    const configLocale = this.getConfigLocale();
    const envLocale = process.env.STACKCODE_LANG || process.env.LANG;
    const systemLocale = this.getSystemLocale();

    const locale = configLocale || 
                   this.normalizeLocale(envLocale) || 
                   this.normalizeLocale(systemLocale) || 
                   this.fallbackLocale;

    this.setLocale(locale);
  }

  private normalizeLocale(locale?: string): string | undefined {
    if (!locale) return undefined;
    
    // pt_BR -> pt, en_US -> en, etc.
    const normalized = locale.split('_')[0].toLowerCase();
    
    // Verificar se temos suporte para o idioma
    const supportedLocales = ['en', 'pt', 'es'];
    return supportedLocales.includes(normalized) ? normalized : undefined;
  }
}

// Instância singleton para uso global
export const i18n = new I18nManager();

// Helper function para uso fácil
export const t = (key: string, params?: Record<string, any>): string => {
  return i18n.t(key, params);
};
```

### Integração CLI
```typescript
import { t } from '@stackcode/i18n';

const initCommand: CommandModule = {
  command: 'init [template]',
  describe: t('commands.init.description'),
  
  builder: (yargs) => {
    return yargs
      .positional('template', {
        describe: t('commands.init.prompts.template'),
        type: 'string'
      });
  },

  handler: async (argv) => {
    try {
      await executeInit(argv);
      console.log(t('commands.init.success', { 
        projectName: argv.projectName 
      }));
    } catch (error) {
      console.error(t('commands.init.errors.general', { 
        error: error.message 
      }));
    }
  }
};
```

### Integração VS Code Extension
```typescript
import { t } from '@stackcode/i18n';

export class DashboardProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.html = this.getWebviewContent();
  }

  private getWebviewContent(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('extension.dashboard.title')}</title>
        </head>
        <body>
          <h1>${t('extension.dashboard.welcome')}</h1>
          <section>
            <h2>${t('extension.dashboard.recentProjects')}</h2>
            <!-- ... conteúdo do dashboard ... -->
          </section>
        </body>
      </html>
    `;
  }
}
```

## Arquivos de Locale

### Estrutura en.json (Inglês - Base)
```json
{
  "commands": {
    "init": {
      "description": "Initialize a new project",
      "prompts": {
        "template": "Which template would you like to use?",
        "projectName": "What is the project name?",
        "directory": "Target directory"
      },
      "success": "Project {{projectName}} created successfully!",
      "errors": {
        "invalidTemplate": "Template '{{template}}' is not supported",
        "directoryExists": "Directory '{{directory}}' already exists"
      }
    },
    "generate": {
      "description": "Generate code or files",
      "types": {
        "component": "React/Vue Component",
        "service": "Service Class",
        "model": "Data Model"
      }
    }
  },
  "common": {
    "success": "Success",
    "error": "Error",
    "warning": "Warning",
    "info": "Info",
    "cancel": "Cancel",
    "confirm": "Confirm"
  }
}
```

### Estrutura pt.json (Português)
```json
{
  "commands": {
    "init": {
      "description": "Inicializar um novo projeto",
      "prompts": {
        "template": "Qual template você gostaria de usar?",
        "projectName": "Qual é o nome do projeto?",
        "directory": "Diretório de destino"
      },
      "success": "Projeto {{projectName}} criado com sucesso!",
      "errors": {
        "invalidTemplate": "Template '{{template}}' não é suportado",
        "directoryExists": "Diretório '{{directory}}' já existe"
      }
    },
    "generate": {
      "description": "Gerar código ou arquivos",
      "types": {
        "component": "Componente React/Vue",
        "service": "Classe de Serviço",
        "model": "Modelo de Dados"
      }
    }
  },
  "common": {
    "success": "Sucesso",
    "error": "Erro",
    "warning": "Aviso",
    "info": "Informação",
    "cancel": "Cancelar",
    "confirm": "Confirmar"
  }
}
```

## Type Safety

### Tipos TypeScript para i18n
```typescript
// Geração automática de tipos a partir de en.json
type LocaleKey = 
  | 'commands.init.description'
  | 'commands.init.prompts.template'
  | 'commands.init.success'
  | 'common.success'
  | 'common.error'
  // ... todas as chaves possíveis

// Função tipada para tradução
export function t(key: LocaleKey, params?: Record<string, any>): string;

// Validação em tempo de compilação
const message = t('commands.init.description'); // ✅ Válido
const invalid = t('commands.invalid.key');      // ❌ Erro TypeScript
```

### Script de Geração de Tipos
```typescript
// scripts/generate-i18n-types.ts
import fs from 'fs';
import path from 'path';

function generateTypesFromLocale(localeObject: any, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(localeObject)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      keys.push(`'${fullKey}'`);
    } else if (typeof value === 'object') {
      keys.push(...generateTypesFromLocale(value, fullKey));
    }
  }
  
  return keys;
}

// Executar para gerar types/i18n.d.ts
const enLocale = JSON.parse(fs.readFileSync('./src/locales/en.json', 'utf8'));
const keys = generateTypesFromLocale(enLocale);

const typeDefinition = `
export type LocaleKey = ${keys.join(' | ')};

export function t(key: LocaleKey, params?: Record<string, any>): string;
`;

fs.writeFileSync('./types/i18n.d.ts', typeDefinition);
```

## Processo de Tradução

### Fluxo de Adição de Novas Strings
1. **Adicionar em en.json**: Sempre começar com versão em inglês
2. **Gerar Tipos**: Executar script de geração de tipos
3. **Implementar Uso**: Usar a nova chave no código
4. **Traduzir**: Adicionar traduções em outros locales
5. **Testar**: Verificar todas as traduções funcionam

### Guidelines de Tradução
- **Consistência**: Manter terminologia consistente
- **Contexto**: Fornecer contexto para tradutores
- **Interpolação**: Usar {{parameter}} para valores dinâmicos
- **Pluralização**: Implementar regras de plural quando necessário
- **Formatação**: Preservar formatação (negrito, itálico, etc.)

### Ferramentas de Tradução
```typescript
// Utilitário para encontrar chaves ausentes
export function findMissingTranslations(
  baseLocale: string, 
  targetLocale: string
): string[] {
  const base = loadLocale(baseLocale);
  const target = loadLocale(targetLocale);
  
  const missingKeys: string[] = [];
  
  function traverse(obj: any, target: any, path = '') {
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof obj[key] === 'object') {
        traverse(obj[key], target?.[key] || {}, currentPath);
      } else if (!target || !(key in target)) {
        missingKeys.push(currentPath);
      }
    }
  }
  
  traverse(base, target);
  return missingKeys;
}
```

## Consequências

### Positivas
- **Acessibilidade Global**: Suporte para desenvolvedores de diferentes idiomas
- **Experiência Consistente**: Tradução unificada em CLI e VS Code
- **Extensibilidade**: Fácil adição de novos idiomas
- **Type Safety**: Verificação de chaves em tempo de compilação
- **Performance**: Carregamento otimizado de locales

### Negativas
- **Manutenção**: Necessidade de manter múltiplos arquivos de tradução
- **Complexidade**: Lógica adicional para gerenciamento de idiomas
- **Sincronização**: Risco de traduções desatualizadas
- **Tamanho**: Bundle ligeiramente maior com múltiplos locales

### Neutras
- **Detecção**: Detecção automática pode não ser sempre precisa
- **Fallback**: Usuários podem ver mistura de idiomas em casos extremos

## Monitoramento

### Métricas de Uso
- Distribuição de idiomas entre usuários
- Frequência de troca de idioma
- Chaves mais utilizadas

### Qualidade das Traduções
- Feedback de usuários sobre traduções
- Relatórios de chaves ausentes
- Análise de contexto perdido em traduções

### Automatização
```typescript
// CI/CD check para translations
export function validateTranslations(): boolean {
  const locales = ['en', 'pt', 'es'];
  const baseLocale = 'en';
  
  for (const locale of locales) {
    if (locale === baseLocale) continue;
    
    const missing = findMissingTranslations(baseLocale, locale);
    if (missing.length > 0) {
      console.error(`Missing translations in ${locale}:`, missing);
      return false;
    }
  }
  
  return true;
}
```

## Roadmap de Idiomas

### Fase 1 (Atual)
- [x] Inglês (en) - Base
- [x] Português (pt) - Brasileiro
- [x] Espanhol (es) - Internacional

### Fase 2 (Futuro)
- [ ] Francês (fr)
- [ ] Alemão (de)
- [ ] Japonês (ja)
- [ ] Chinês Simplificado (zh-CN)

### Fase 3 (Expansão)
- [ ] Russo (ru)
- [ ] Italiano (it)
- [ ] Coreano (ko)
- [ ] Hindi (hi)

---

*Este ADR será atualizado conforme expandimos o suporte a idiomas e recebemos feedback da comunidade.*

### Locale Management
- JSON files for each supported language in `locales/` directory
- Hierarchical key structure for organization
- Support for interpolation and pluralization
- Template literal style for better developer experience

### Language Detection
- Environment variable (`STACKCODE_LANG`)
- System locale detection as fallback
- User configuration override
- VS Code extension uses VS Code's locale

### Supported Languages (Initial)
- English (en) - Primary/fallback language
- Portuguese (pt) - Secondary language

## Consequences

### Positive
- **Global Accessibility**: Supports international developer community
- **Consistent Localization**: Same i18n system across CLI and VS Code extension
- **Extensible**: Easy to add new languages by adding JSON files
- **Performance**: Lazy loading of locale files
- **Type Safety**: TypeScript interfaces for locale keys
- **Developer Experience**: Simple API for developers

### Negative
- **Maintenance Overhead**: All user-facing strings need translation
- **Coordination**: Changes require updates to all locale files
- **Testing Complexity**: Need to test multiple language scenarios

### Technical Implementation

#### Locale File Structure
```json
{
  "commands": {
    "init": {
      "description": "Initialize a new project",
      "prompts": {
        "projectName": "What is your project name?",
        "techStack": "Select a technology stack:"
      }
    },
    "commit": {
      "description": "Create a conventional commit",
      "validation": {
        "invalidType": "Invalid commit type: {type}"
      }
    }
  },
  "errors": {
    "fileNotFound": "File not found: {filename}",
    "networkError": "Network error occurred"
  }
}
```

#### API Design
```typescript
// Basic translation
t('commands.init.description')

// With interpolation
t('errors.fileNotFound', { filename: 'package.json' })

// Pluralization
t('files.count', { count: 5 })
```

### Language Detection Priority
1. `STACKCODE_LANG` environment variable
2. User configuration file
3. System locale (`process.env.LANG`)
4. Fallback to English

### Package Integration

#### CLI Package
- Initialize i18n before command parsing
- Use locale for help text and prompts
- Support `--lang` flag for temporary override

#### VS Code Extension
- Use VS Code's built-in locale detection
- Respect VS Code's language settings
- Provide language switching in extension settings

#### Core Package
- All user-facing error messages support i18n
- Template descriptions and comments localized
- GitHub integration messages localized

### File Organization
```
packages/i18n/
├── src/
│   ├── index.ts           # Main i18n API
│   └── locales/
│       ├── en.json        # English (primary)
│       └── pt.json        # Portuguese
```

### Future Expansion Strategy
- Additional languages in `locales/` directory
- Community contributions for translations
- Possible locale validation tools
- Right-to-left (RTL) language support consideration

## Alternatives Considered

### i18next
- **Pros**: Mature, feature-rich, ecosystem support
- **Cons**: Heavy dependency, over-engineered for our needs

### React i18n (for VS Code extension only)
- **Pros**: React ecosystem integration
- **Cons**: Doesn't solve CLI internationalization

### No internationalization
- **Pros**: Simpler development and maintenance
- **Cons**: Limits global adoption and accessibility

## Implementation Guidelines

### Translation Keys
- Use hierarchical dot notation for organization
- Descriptive key names that indicate context
- Consistent naming patterns across components
- Avoid deeply nested structures

### String Management
- All user-facing strings must use i18n system
- No hardcoded English strings in code
- Include context comments for translators
- Use interpolation for dynamic content

### Testing Strategy
- Test default (English) locale thoroughly
- Spot check key translations
- Test locale switching functionality
- Ensure fallbacks work correctly

### Contribution Guidelines
- Native speakers preferred for translations
- Translation reviews by multiple contributors
- Consistent terminology across all strings
- Regular updates when English text changes
