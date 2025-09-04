# ADR-002: TypeScript e Módulos ES

## Status
Aceito

## Contexto
O StackCode é uma ferramenta para desenvolvedores que precisa:
- Fornecer type safety para lógica de negócio complexa
- Suportar recursos modernos do JavaScript
- Ser compatível com ambientes Node.js e browser
- Manter alta qualidade de código e experiência do desenvolvedor
- Suportar tree-shaking para tamanhos ótimos de bundle

Precisávamos escolher:
- Linguagem de programação (JavaScript vs TypeScript)
- Sistema de módulos (CommonJS vs ES Modules)
- Ferramentas de build e estratégia de compilação

## Decisão
Utilizaremos TypeScript com ES Modules (ESM) como nossa stack principal de desenvolvimento:

### TypeScript
- Todo código fonte será escrito em TypeScript
- Configuração strict do TypeScript com verificação abrangente de tipos
- Definições de tipos compartilhadas entre pacotes
- Gerar arquivos de declaração para pacotes publicados

### ES Modules (ESM)
- Usar ES Modules como sistema de módulos primário
- Configurar `"type": "module"` em todos os arquivos package.json
- Usar sintaxe `import/export` em todo o código base
- Garantir compatibilidade com ferramentas modernas de bundling

## Fundamentos

### Benefícios do TypeScript
1. **Type Safety**: Prevenção de erros em tempo de compilação
2. **IntelliSense**: Melhor experiência de desenvolvimento com autocomplete
3. **Refatoração**: Refatoração segura com suporte de IDE
4. **Documentação**: Tipos servem como documentação viva
5. **Qualidade**: Força padrões de código consistentes

### Benefícios dos ES Modules
1. **Padrão Moderno**: Padrão JavaScript oficial
2. **Tree Shaking**: Eliminação de código morto
3. **Lazy Loading**: Carregamento dinâmico de módulos
4. **Interoperabilidade**: Melhor compatibilidade com ferramentas modernas
5. **Performance**: Otimizações de bundlers modernos

## Implementação

### Configuração TypeScript
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### Estrutura de Pacotes
```
packages/
├── cli/
│   ├── package.json          # "type": "module"
│   ├── tsconfig.json         # Extends base config
│   └── src/
│       └── *.ts              # TypeScript source files
├── core/
│   ├── package.json          # "type": "module"
│   ├── tsconfig.json         # Extends base config
│   └── src/
│       └── *.ts              # TypeScript source files
```

### Estratégia de Build
- **Desenvolvimento**: Compilação TypeScript para ESM
- **Distribuição**: Arquivos .js + .d.ts para npm
- **Bundling**: ESBuild para extensão VS Code
- **Testing**: Jest com transformações TypeScript

## Consequências

### Positivas
- **Type Safety**: Redução significativa de bugs relacionados a tipos
- **DX Melhorada**: Melhor experiência de desenvolvimento com IntelliSense
- **Futuro-prova**: Alinhamento com padrões modernos do JavaScript
- **Performance**: Benefícios de tree-shaking e otimizações modernas
- **Manutenibilidade**: Código mais fácil de refatorar e manter

### Negativas
- **Curva de Aprendizado**: Equipe precisa conhecer TypeScript
- **Tempo de Build**: Compilação adicional no processo de build
- **Complexidade**: Configuração mais complexa comparada a JS puro
- **Compatibilidade**: Possíveis problemas com bibliotecas CommonJS legadas

### Neutras
- **Tamanho de Bundle**: Impacto mínimo no bundle final
- **Runtime**: Zero overhead em runtime (apenas em build time)

## Mitigações

### Para Compatibilidade CommonJS
```typescript
// Para bibliotecas que ainda usam CommonJS
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const legacyLib = require('legacy-commonjs-lib');
```

### Para Desenvolvimentos
```typescript
// Usar caminhos relativos explícitos
import { helper } from './utils/helper.js';  // .js extension required

// Configurar path mapping no tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@stackcode/core": ["../core/src/index.ts"]
    }
  }
}
```

### Para Testes
```javascript
// Jest configuration for ESM + TypeScript
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
```

## Alternativas Consideradas

### 1. JavaScript Puro com CommonJS
- **Prós**: Simplicidade, sem build step
- **Contras**: Ausência de type safety, experiência de desenvolvimento inferior
- **Decisão**: Rejeitado pela falta de type safety

### 2. TypeScript com CommonJS
- **Prós**: Type safety, compatibilidade ampla
- **Contras**: Não suporta tree-shaking, padrão legado
- **Decisão**: Rejeitado por não ser futuro-prova

### 3. JavaScript com JSDoc Types
- **Prós**: Type checking sem compilação
- **Contras**: Tipos verbosos, limitações de expressividade
- **Decisão**: Rejeitado pela experiência inferior de desenvolvimento

## Impacto nos Pacotes

### @stackcode/cli
- Comandos Yargs tipados
- Validação de argumentos com tipos
- Auto-complete melhorado em IDEs

### @stackcode/core
- APIs fortemente tipadas
- Tipos compartilhados entre pacotes
- Validação de schemas com tipos

### @stackcode/i18n
- Tipos para chaves de tradução
- Type safety para interpolação
- Inferência automática de tipos de locale

### stackcode-vscode
- VS Code API totalmente tipada
- Webview messaging tipado
- Configurações tipadas

## Cronograma de Implementação

### Fase 1: Configuração Base (Concluída)
- [x] Configurar tsconfig.json base
- [x] Configurar ESM em todos os packages
- [x] Migrar build scripts

### Fase 2: Migração Core (Concluída)
- [x] Migrar @stackcode/core para TypeScript
- [x] Definir tipos centrais
- [x] Atualizar testes

### Fase 3: Migração CLI (Concluída)
- [x] Migrar @stackcode/cli para TypeScript
- [x] Tipar comandos Yargs
- [x] Atualizar testes CLI

### Fase 4: Extensão VS Code (Concluída)
- [x] Migrar extensão para TypeScript
- [x] Configurar bundling ESBuild
- [x] Testes de integração

## Monitoramento

### Métricas de Qualidade
- **Type Coverage**: >95% do código com tipos explícitos
- **Build Success**: 100% de builds bem-sucedidos
- **Test Coverage**: Manter >80% de cobertura com testes tipados

### Indicadores de Sucesso
- Redução de bugs relacionados a tipos em produção
- Melhoria na velocidade de desenvolvimento
- Feedback positivo da equipe sobre experiência de desenvolvimento
- Facilidade de onboarding de novos desenvolvedores

---

*Este ADR será revisado a cada 6 meses ou quando surgirem problemas significativos com a abordagem atual.*
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
- **__dirname Replacement**: Use `import.meta.url` for file path resolution
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
