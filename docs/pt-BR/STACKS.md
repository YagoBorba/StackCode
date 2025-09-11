# Stacks de Tecnologia Suportados

O StackCode suporta múltiplos stacks de tecnologia, cada um projetado com as melhores práticas e estruturas de projeto otimizadas. Este documento fornece uma visão geral de todos os stacks **atualmente implementados** baseados nos templates disponíveis no pacote principal.

## 🔍 Validação de Dependências

O StackCode valida automaticamente se todas as ferramentas necessárias para o stack escolhido estão instaladas antes de prosseguir com a criação do projeto. Isso garante uma experiência de configuração tranquila e previne erros comuns de instalação.

### Como Funciona

1. **Detecção Automática**: Quando você executa `stc init`, o StackCode verifica se as ferramentas necessárias estão disponíveis no PATH do seu sistema
2. **Feedback Claro**: Se faltarem ferramentas, você verá exatamente quais precisam ser instaladas
3. **Orientação de Instalação**: Links diretos para páginas oficiais de instalação das ferramentas em falta
4. **Continuação Flexível**: Opção de prosseguir com a criação do projeto mesmo se algumas ferramentas estiverem ausentes

### Dependências dos Stacks

| Stack                    | Ferramentas Necessárias | Validação     |
| ------------------------ | ----------------------- | ------------- |
| **React + TypeScript**   | `npm`                   | ✅ Automática |
| **Vue.js + TypeScript**  | `npm`                   | ✅ Automática |
| **Node.js + Express**    | `npm`                   | ✅ Automática |
| **Node.js + TypeScript** | `npm`                   | ✅ Automática |
| **Go + Gin**             | `go`                    | ✅ Automática |
| **PHP + Laravel**        | `composer`, `php`       | ✅ Automática |
| **Java + Spring Boot**   | `mvn`, `java`           | ✅ Automática |
| **Python + FastAPI**     | `pip`, `python`         | ✅ Automática |

> **💡 Dica**: Se você vir avisos de dependência, ainda pode criar a estrutura do projeto. Você só precisará instalar as dependências manualmente depois.

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
- **Recursos**: Estrutura Express.js, variáveis de ambiente, configuração de testes

**Estrutura Gerada:**

```
├── src/
│   ├── app.js
│   ├── index.js
│   └── routes/
├── tests/
├── package.json
├── .env.example
└── jest.config.js
```

#### Node.js + TypeScript

**Localização do Template:** `packages/core/src/templates/node-ts/`

- **Runtime**: Node.js com TypeScript
- **Framework**: Express.js
- **Testes**: Jest com ts-jest
- **Recursos**: Configuração TypeScript completa, estrutura Express tipada

**Estrutura Gerada:**

```
├── src/
│   ├── app.ts
│   ├── index.ts
│   └── routes/
├── tests/
├── package.json
├── tsconfig.json
└── jest.config.js
```

#### Python + FastAPI

**Localização do Template:** `packages/core/src/templates/python/`

- **Framework**: FastAPI
- **Gerenciamento de Dependências**: pip + requirements.txt
- **Recursos**: Estrutura FastAPI, documentação automática, endpoints de exemplo

#### Java + Spring Boot

**Localização do Template:** `packages/core/src/templates/java/`

- **Framework**: Spring Boot
- **Build Tool**: Maven
- **Recursos**: Estrutura Spring Boot, configuração Maven, controller de exemplo

#### Go + Gin

**Localização do Template:** `packages/core/src/templates/go/`

- **Framework**: Gin
- **Gerenciamento de Dependências**: Go modules
- **Recursos**: Estrutura Gin, roteamento, middleware básico

#### PHP + Laravel

**Localização do Template:** `packages/core/src/templates/php/`

- **Framework**: Laravel
- **Gerenciamento de Dependências**: Composer
- **Recursos**: Estrutura Laravel, configuração básica, rotas de exemplo

## 📁 Suporte Adicional para .gitignore

Além dos templates de projeto principais, o StackCode fornece suporte abrangente ao `.gitignore` para:

**Localização do Template:** `packages/core/src/templates/gitignore/`

### Desenvolvimento Mobile

- **Android** (`android.tpl`) - Android Studio, Gradle, arquivos APK
- **Flutter** (`flutter.tpl`) - Dart, arquivos de build Flutter, arquivos específicos da plataforma

### Frameworks Frontend

- **React** (`react.tpl`) - Build artifacts, dependências
- **Vue.js** (`vue.tpl`) - Dist/, node_modules, arquivos de cache
- **Angular** (`angular.tpl`) - Dist/, .angular, e2e
- **Svelte** (`svelte.tpl`) - Public/build, .svelte-kit

### Frameworks Backend

- **Node.js** (`node.tpl`) - node_modules, logs, variáveis de ambiente
- **Python** (`python.tpl`) - __pycache__, .env, .venv
- **Java** (`java.tpl`) - .class, target/, .jar
- **Go** (`go.tpl`) - Binários Go, arquivos vendor
- **PHP** (`php.tpl`) - vendor/, .env, cache

### IDEs e Editores

- **VS Code** (`vscode.tpl`) - .vscode/ (configurações específicas do usuário)
- **IntelliJ** (`intellij.tpl`) - .idea/, .iml
- **Eclipse** (`eclipse.tpl`) - .project, .classpath

### Ferramentas e Serviços

- **Docker** (`docker.tpl`) - Arquivos temporários Docker
- **Database** (`database.tpl`) - Dumps SQL, arquivos SQLite

Ao criar projetos, o StackCode seleciona automaticamente o template `.gitignore` apropriado baseado no stack escolhido, e pode combinar múltiplos templates ao usar recursos como Docker ou IDEs específicas.

## 🔧 Recursos dos Stacks

### Recursos Comuns

Todos os stacks incluem:

- **Estrutura de projeto consistente** com separação clara de responsabilidades
- **Configuração de desenvolvimento** com linting e formatação
- **Configuração de testes** com framework apropriado
- **Documentação básica** incluindo README.md
- **Configuração Git** com .gitignore otimizado

### Validação de Dependências

O StackCode verifica automaticamente a disponibilidade de:

- **npm** para stacks baseados em Node.js (React, Vue, Node.js, Node-TS)
- **go** para projetos Go
- **composer** e **php** para projetos PHP
- **mvn** e **java** para projetos Java
- **pip** e **python** para projetos Python

### Sistema de Templates

- **Substituição de variáveis**: Templates usam `{{projectName}}`, `{{description}}`, `{{authorName}}`
- **Condicional**: Arquivos opcionais baseados em configurações escolhidas
- **Extensível**: Fácil adição de novos templates e stacks

## 🚀 Adicionando Novos Stacks

Para contribuidores interessados em adicionar suporte a novos stacks:

1. **Crie template do projeto** em `packages/core/src/templates/`
2. **Adicione validação de dependências** em `packages/core/src/utils.ts`
3. **Atualize arquivos de localização** em `packages/i18n/src/locales/`
4. **Adicione testes** para o novo stack
5. **Atualize documentação** incluindo este arquivo

Veja o [Guia de Contribuição](../CONTRIBUTING.md) para instruções detalhadas sobre como adicionar novos stacks de tecnologia.

---

_Para informações mais detalhadas sobre arquitetura e desenvolvimento, consulte o [Guia de Arquitetura](ARCHITECTURE.md)._
