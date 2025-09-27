# Supported Technology Stacks

StackCode supports multiple technology stacks, each designed with best practices and optimal project structures. This document provides an overview of all **currently implemented** stacks based on the available templates in the core package.

## 🔍 Dependency Validation

StackCode automatically validates that all required tools for your chosen stack are installed before proceeding with project creation. This ensures a smooth setup experience and prevents common installation errors.

### How It Works

1. **Automatic Detection**: When you run `stc init`, StackCode checks if the required tools are available in your system PATH
2. **Clear Feedback**: If tools are missing, you'll see exactly which ones need to be installed
3. **Installation Guidance**: Direct links to official installation pages for missing tools
4. **Flexible Continuation**: Option to proceed with project creation even if some tools are missing

### Stack Dependencies

| Stack                    | Required Tools    | Validation   |
| ------------------------ | ----------------- | ------------ |
| **React + TypeScript**   | `npm`             | ✅ Automatic |
| **Vue.js + TypeScript**  | `npm`             | ✅ Automatic |
| **Node.js + Express**    | `npm`             | ✅ Automatic |
| **Node.js + TypeScript** | `npm`             | ✅ Automatic |
| **Go + Gin**             | `go`              | ✅ Automatic |
| **PHP + Laravel**        | `composer`, `php` | ✅ Automatic |
| **Java + Spring Boot**   | `mvn`, `java`     | ✅ Automatic |
| **Python + FastAPI**     | `pip`, `python`   | ✅ Automatic |

> **💡 Tip**: If you see dependency warnings, you can still create the project structure. You'll just need to install the dependencies manually afterward.

## 📋 Currently Available Stacks

### Frontend Stacks

#### React + TypeScript

**Template Location:** `packages/core/src/templates/react/`

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + PostCSS
- **Testing**: Vitest
- **Features**: Modern JSX Transform, ESLint configuration, component structure

**Generated Structure:**

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

**Template Location:** `packages/core/src/templates/vue/`

- **Framework**: Vue 3 with Composition API and TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + PostCSS
- **Testing**: Vitest
- **Features**: SFC (Single File Components), modern Vue patterns

**Generated Structure:**

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

### Backend Stacks

#### Node.js + JavaScript

**Template Location:** `packages/core/src/templates/node-js/`

- **Runtime**: Node.js with ES6+
- **Testing**: Jest
- **Linting**: ESLint
- **Features**: Express.js structure, environment variables, testing setup

**Generated Structure:**

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

**Template Location:** `packages/core/src/templates/node-ts/`

- **Runtime**: Node.js with TypeScript
- **Testing**: Vitest
- **Features**: Type-safe development, modern TypeScript configuration

**Generated Structure:**

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

#### Python + Modern Setup

**Template Location:** `packages/core/src/templates/python/`

- **Package Management**: pip with pyproject.toml
- **Features**: Modern Python project structure, dependency management

**Generated Structure:**

```
├── src/
│   └── main.py
└── pyproject.toml
```

#### Java + Maven

**Template Location:** `packages/core/src/templates/java/`

- **Build Tool**: Maven
- **Features**: Standard Java project structure, Maven configuration

**Generated Structure:**

```
├── src/
│   └── main/
│       └── java/
└── pom.xml
```

#### Go + Modules

**Template Location:** `packages/core/src/templates/go/`

- **Package Management**: Go modules
- **Features**: Simple Go project with module support

**Generated Structure:**

```
├── main.go
└── go.mod
```

#### PHP + Laravel

**Template Location:** `packages/core/src/templates/php/`

- **Framework**: Laravel-style structure
- **Package Management**: Composer
- **Features**: MVC structure, environment variables

**Generated Structure:**

```
├── app/
├── bootstrap/
├── resources/
├── routes/
├── composer.json
└── .env.example
```

- **Package Management**: pip with pyproject.toml
- **Features**: Modern Python async API development

**Generated Structure:**

```
├── src/
│   └── main.py
└── pyproject.toml
```

#### Java + Spring

- **Framework**: Spring Boot
- **Build Tool**: Maven
- **Features**: Enterprise Java development structure

**Generated Structure:**

```
├── src/main/java/com/example/app/
│   ├── Application.java
│   └── controller/
│       └── MainController.java
└── pom.xml
```

#### Go + Gin

- **Framework**: Gin web framework
- **Package Management**: Go modules
- **Features**: High-performance Go web development

**Generated Structure:**

```
├── main.go
└── go.mod
```

#### PHP + Laravel

- **Framework**: Laravel
- **Package Management**: Composer
- **Features**: Modern PHP development with MVC structure

**Generated Structure:**

```
├── app/Http/Controllers/
├── bootstrap/
├── resources/views/
├── routes/
└── composer.json
```

## 📁 Additional .gitignore Support

Beyond the main project templates, StackCode provides comprehensive `.gitignore` support for:

**Template Location:** `packages/core/src/templates/gitignore/`

### Mobile Development

- **Android** (`android.tpl`) - Android Studio, Gradle, APK files
- **Flutter** (`flutter.tpl`) - Dart, Flutter build files, platform-specific files
- **React Native** (`react_native.tpl`) - Metro bundler, platform builds
- **Swift** (`swift.tpl`) - Xcode, iOS development files

### Frontend Frameworks

- **Angular** (`angular.tpl`) - Angular CLI, build artifacts
- **Svelte** (`svelte.tpl`) - SvelteKit, build outputs

### Backend & Languages

- **Go** (`go.tpl`) - Go binaries, vendor directories
- **Java** (`java.tpl`) - Maven, Gradle, IDE files
- **Node.js** (`node-js.tpl`, `node-ts.tpl`) - npm, yarn, build outputs
- **PHP** (`php.tpl`) - Composer, Laravel artifacts
- **Python** (`python.tpl`) - pip, virtual environments, **pycache**
- **JavaScript** (`javascript.tpl`) - General JS project files

### Development Tools

- **IDEs** (`ides.tpl`) - VS Code, IntelliJ, Eclipse configurations

### Usage

When creating projects, StackCode automatically selects the appropriate `.gitignore` template based on your chosen stack, and can combine multiple templates when using features like Docker or specific IDEs.

## 🔧 Stack Features

### Automatic Configuration

Each stack template includes:

- ✅ **Package configuration** (`package.json`, `pyproject.toml`, `pom.xml`, `composer.json`, `go.mod`)
- ✅ **TypeScript configuration** (where applicable - React, Vue, Node-TS)
- ✅ **Build tool setup** (Vite for frontend, Maven for Java)
- ✅ **Linting and formatting** (ESLint for Node.js projects)
- ✅ **Testing framework** (Jest for Node.js, Vitest for TypeScript projects)
- ✅ **Environment variables** (`.env.example` for Node.js and PHP)
- ✅ **Best practice folder structure** with organized source directories

### Smart Package Management

StackCode automatically uses the appropriate package manager based on the project type:

- **npm** for Node.js-based stacks (React, Vue, Node.js, Node-TS)
- **pip** for Python projects (with pyproject.toml)
- **maven** for Java projects
- **go mod** for Go projects
- **composer** for PHP projects

### Intelligent .gitignore Generation

Every project gets a customized `.gitignore` file that combines:

- **Stack-specific rules** (based on chosen technology)
- **IDE-specific rules** (common development environments)
- **Additional tool rules** (Docker, package managers, build artifacts)

### Template System Features

- **Variable replacement**: Templates use `{{projectName}}`, `{{description}}`, `{{authorName}}`
- **Modular composition**: Combines base templates with additional features
- **Consistent structure**: All templates follow established patterns for their respective ecosystems

### Optional Features

When initializing projects, you can enable additional features:

- **Docker Support**: Adds Dockerfile and docker-compose configurations
- **Husky Integration**: Sets up Git hooks for commit validation
- **Conventional Commits**: Enforces commit message standards

### Git Integration

Every generated project includes:

- ✅ **Intelligent .gitignore** files (stack + tools + IDE specific)
- ✅ **Git repository initialization**
- ✅ **Conventional commit setup** (when Husky feature is selected)

## 🚀 Usage

To create a project with any stack:

```bash
stc init
```

Then select your preferred technology stack from the interactive menu.

## 🛠️ Contributing New Stacks

Interested in adding support for a new technology stack? Check out our comprehensive guide in [CONTRIBUTING.md](../CONTRIBUTING.md#adding-new-technology-stacks).

The process involves:

1. Creating template files
2. Updating type definitions
3. Adding CLI options
4. Configuring package management
5. Testing thoroughly

---

_For more information about StackCode, visit our [main documentation](../README.md)._
