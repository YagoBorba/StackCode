# Supported Technology Stacks

StackCode supports multiple technology stacks, each designed with best practices and optimal project structures. This document provides an overview of all supported stacks and their features.

## 📋 Available Stacks

### Frontend Stacks

#### React + TypeScript

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Testing**: Vitest
- **Features**: Modern JSX Transform, ESLint configuration, component structure

**Generated Structure:**

```
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components
│   │   └── pages/          # Page components
│   ├── styles/
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

#### Vue.js + TypeScript

- **Framework**: Vue 3 with Composition API and TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: Vue Router
- **Testing**: Vitest
- **Features**: SFC (Single File Components), modern Vue patterns

**Generated Structure:**

```
├── src/
│   ├── components/         # Reusable components
│   ├── views/              # Page views
│   ├── styles/
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Backend Stacks

#### Node.js + JavaScript

- **Runtime**: Node.js with ES6+
- **Testing**: Jest
- **Features**: Express.js structure, middleware, controllers, routes

**Generated Structure:**

```
├── src/
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── routes/             # Route definitions
│   ├── utils/              # Utility functions
│   └── index.js
├── test/
├── package.json
└── jest.config.js
```

#### Node.js + TypeScript

- **Runtime**: Node.js with TypeScript
- **Testing**: Vitest
- **Features**: Type-safe development, modern TypeScript configuration

**Generated Structure:**

```
├── src/
│   ├── controllers/        # Type-safe controllers
│   ├── utils/              # Utility functions
│   └── index.ts
├── tests/
├── package.json
└── tsconfig.json
```

#### Python + FastAPI

- **Framework**: FastAPI
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

## 🔧 Stack Features

### Automatic Configuration

Each stack includes:

- ✅ **Optimized package.json** (or equivalent) with relevant dependencies
- ✅ **TypeScript configuration** (where applicable)
- ✅ **Build tool setup** (Vite, Maven, etc.)
- ✅ **Linting and formatting** configured
- ✅ **Testing framework** integrated
- ✅ **Best practice folder structure**

### Smart Package Management

StackCode automatically uses the appropriate package manager:

- **npm** for Node.js-based stacks (React, Vue, Node.js)
- **pip** for Python projects
- **maven** for Java projects
- **go mod** for Go projects
- **composer** for PHP projects

### Docker Support

All stacks can include Docker configuration when the Docker feature is selected during project initialization.

### Git Integration

Every generated project includes:

- ✅ **Stack-specific .gitignore** files
- ✅ **Git repository initialization**
- ✅ **Conventional commit setup** (with Husky)

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
