# Stacks de Tecnologia Suportados

O StackCode suporta múltiplos stacks de tecnologia, cada um projetado com as melhores práticas e estruturas de projeto otimizadas. Este documento fornece uma visão geral de todos os stacks **atualmente implementados** baseados nos templates disponíveis no pacote principal.

## 📋 Stacks Atualmente Disponíveis

### Stacks Frontend

#### React + TypeScript
**Localização do Template:** `packages/core/src/templates/react/`

- **Framework**: React 18 com TypeScript
- **Ferramenta de Build**: Vite
- **Estilização**: TailwindCSS + PostCSS
- **Testes**: Vitest
- **Recursos**: Modern JSX Transform, configuração ESLint, estrutura de componentes

**Estrutura Gerada:**
```
├── src/
│   ├── components/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

#### Vue.js + TypeScript
**Localização do Template:** `packages/core/src/templates/vue/`

- **Framework**: Vue 3 com Composition API e TypeScript
- **Ferramenta de Build**: Vite
- **Estilização**: TailwindCSS + PostCSS
- **Testes**: Vitest
- **Recursos**: SFC (Single File Components), padrões modernos do Vue

**Estrutura Gerada:**
```
├── src/
│   ├── components/
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

### Stacks Backend

#### Node.js + JavaScript
**Localização do Template:** `packages/core/src/templates/node-js/`

- **Runtime**: Node.js com ES6+
- **Testes**: Jest
- **Linting**: ESLint
- **Recursos**: estrutura Express.js, variáveis de ambiente, configuração de testes

**Estrutura Gerada:**
```
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── index.js
├── test/
├── package.json
├── jest.config.js
├── .eslintrc.cjs
├── .env.example
└── README.md
```

#### Node.js + TypeScript
**Localização do Template:** `packages/core/src/templates/node-ts/`

- **Runtime**: Node.js com TypeScript
- **Testes**: Vitest
- **Recursos**: desenvolvimento type-safe, configuração moderna do TypeScript

**Estrutura Gerada:**
```
├── src/
│   ├── controllers/
│   ├── utils/
│   └── index.ts
├── tests/
├── package.json
├── tsconfig.json
└── .gitignore
```

#### Python + Configuração Moderna
**Localização do Template:** `packages/core/src/templates/python/`

- **Gerenciamento de Pacotes**: pip com pyproject.toml
- **Recursos**: estrutura de projeto Python moderna, gerenciamento de dependências

**Estrutura Gerada:**
```
├── src/
│   └── main.py
└── pyproject.toml
```

#### Java + Maven
**Localização do Template:** `packages/core/src/templates/java/`

- **Ferramenta de Build**: Maven
- **Recursos**: estrutura padrão de projeto Java, configuração Maven

**Estrutura Gerada:**
```
├── src/
│   └── main/
│       └── java/
└── pom.xml
```

#### Go + Modules
**Localização do Template:** `packages/core/src/templates/go/`

- **Gerenciamento de Pacotes**: Go modules
- **Recursos**: projeto Go simples com suporte a módulos

**Estrutura Gerada:**
```
├── main.go
└── go.mod
```

#### PHP + Laravel
**Localização do Template:** `packages/core/src/templates/php/`

- **Framework**: estrutura estilo Laravel
- **Gerenciamento de Pacotes**: Composer
- **Recursos**: estrutura MVC, variáveis de ambiente

**Estrutura Gerada:**
```
├── app/
├── bootstrap/
├── resources/
├── routes/
├── composer.json
└── .env.example
```

## 🗃️ Suporte Adicional ao .gitignore

Além dos templates de projeto principais, o StackCode fornece suporte abrangente ao `.gitignore` para:

**Localização do Template:** `packages/core/src/templates/gitignore/`

### Desenvolvimento Mobile
- **Android** (`android.tpl`) - Android Studio, Gradle, arquivos APK
- **Flutter** (`flutter.tpl`) - Dart, arquivos de build Flutter, arquivos específicos da plataforma
- **React Native** (`react_native.tpl`) - Metro bundler, builds de plataforma
- **Swift** (`swift.tpl`) - Xcode, arquivos de desenvolvimento iOS

### Frameworks Frontend
- **Angular** (`angular.tpl`) - Angular CLI, artefatos de build
- **Svelte** (`svelte.tpl`) - SvelteKit, outputs de build

### Backend & Linguagens
- **Go** (`go.tpl`) - binários Go, diretórios vendor
- **Java** (`java.tpl`) - Maven, Gradle, arquivos IDE
- **Node.js** (`node-js.tpl`, `node-ts.tpl`) - npm, yarn, outputs de build
- **PHP** (`php.tpl`) - Composer, artefatos Laravel
- **Python** (`python.tpl`) - pip, ambientes virtuais, __pycache__
- **JavaScript** (`javascript.tpl`) - arquivos gerais de projeto JS

### Ferramentas de Desenvolvimento
- **IDEs** (`ides.tpl`) - configurações VS Code, IntelliJ, Eclipse

### Uso
Ao criar projetos, o StackCode seleciona automaticamente o template `.gitignore` apropriado baseado no stack escolhido, e pode combinar múltiplos templates ao usar recursos como Docker ou IDEs específicas.

## 🔧 Recursos dos Stacks

### Configuração Automática

Cada template de stack inclui:

- ✅ **Configuração de pacotes** (`package.json`, `pyproject.toml`, `pom.xml`, `composer.json`, `go.mod`)
- ✅ **Configuração TypeScript** (quando aplicável - React, Vue, Node-TS)
- ✅ **Configuração de ferramenta de build** (Vite para frontend, Maven para Java)
- ✅ **Linting e formatação** (ESLint para projetos Node.js)
- ✅ **Framework de testes** (Jest para Node.js, Vitest para projetos TypeScript)
- ✅ **Variáveis de ambiente** (`.env.example` para Node.js e PHP)
- ✅ **Estrutura de pastas das melhores práticas** com diretórios de código organizados

### Gerenciamento Inteligente de Pacotes

O StackCode usa automaticamente o gerenciador de pacotes apropriado baseado no tipo de projeto:

- **npm** para stacks baseados em Node.js (React, Vue, Node.js, Node-TS)
- **pip** para projetos Python (com pyproject.toml)
- **maven** para projetos Java
- **go mod** para projetos Go  
- **composer** para projetos PHP

### Geração Inteligente de .gitignore

Todo projeto recebe um arquivo `.gitignore` personalizado que combina:
- **Regras específicas do stack** (baseadas na tecnologia escolhida)
- **Regras específicas da IDE** (ambientes de desenvolvimento comuns)
- **Regras de ferramentas adicionais** (Docker, gerenciadores de pacotes, artefatos de build)

### Recursos do Sistema de Templates

- **Substituição de variáveis**: Templates usam `{{projectName}}`, `{{description}}`, `{{authorName}}`
- **Composição modular**: Combina templates base com recursos adicionais
- **Estrutura consistente**: Todos os templates seguem padrões estabelecidos para seus respectivos ecossistemas

### Recursos Opcionais

Ao inicializar projetos, você pode habilitar recursos adicionais:

- **Suporte Docker**: Adiciona configurações Dockerfile e docker-compose
- **Integração Husky**: Configura Git hooks para validação de commits
- **Conventional Commits**: Força padrões de mensagem de commit

### Integração Git

Todo projeto gerado inclui:

- ✅ **Arquivos .gitignore inteligentes** (específicos para stack + ferramentas + IDE)
- ✅ **Inicialização de repositório Git**
- ✅ **Configuração de commit convencional** (quando o recurso Husky é selecionado)

## 🚀 Uso

Para criar um projeto com qualquer stack:

```bash
stc init
```

Em seguida, selecione seu stack de tecnologia preferido do menu interativo.

## 🛠️ Contribuindo com Novos Stacks

Interessado em adicionar suporte para um novo stack de tecnologia? Confira nosso guia abrangente em [CONTRIBUTING.md](../CONTRIBUTING.md#adding-new-technology-stacks).

O processo envolve:

1. Criar arquivos de template
2. Atualizar definições de tipo
3. Adicionar opções CLI
4. Configurar gerenciamento de pacotes
5. Testar completamente

---

_Para mais informações sobre o StackCode, visite nossa [documentação principal](../README.md)._
