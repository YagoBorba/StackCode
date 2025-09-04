# Stacks de Tecnología Soportados

StackCode soporta múltiples stacks de tecnología, cada uno diseñado con las mejores prácticas y estructuras de proyecto optimizadas. Este documento proporciona una visión general de todos los stacks **actualmente implementados** basados en las plantillas disponibles en el paquete principal.

## 📋 Stacks Actualmente Disponibles

### Stacks Frontend

#### React + TypeScript
**Ubicación de la Plantilla:** `packages/core/src/templates/react/`

- **Framework**: React 18 con TypeScript
- **Herramienta de Build**: Vite
- **Estilización**: TailwindCSS + PostCSS
- **Pruebas**: Vitest
- **Características**: Modern JSX Transform, configuración ESLint, estructura de componentes

**Estructura Generada:**
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
**Ubicación de la Plantilla:** `packages/core/src/templates/vue/`

- **Framework**: Vue 3 con Composition API y TypeScript
- **Herramienta de Build**: Vite
- **Estilización**: TailwindCSS + PostCSS
- **Pruebas**: Vitest
- **Características**: SFC (Single File Components), patrones modernos de Vue

**Estructura Generada:**
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
**Ubicación de la Plantilla:** `packages/core/src/templates/node-js/`

- **Runtime**: Node.js con ES6+
- **Pruebas**: Jest
- **Linting**: ESLint
- **Características**: estructura Express.js, variables de entorno, configuración de pruebas

**Estructura Generada:**
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
**Ubicación de la Plantilla:** `packages/core/src/templates/node-ts/`

- **Runtime**: Node.js con TypeScript
- **Pruebas**: Vitest
- **Características**: desarrollo type-safe, configuración moderna de TypeScript

**Estructura Generada:**
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

#### Python + Configuración Moderna
**Ubicación de la Plantilla:** `packages/core/src/templates/python/`

- **Gestión de Paquetes**: pip con pyproject.toml
- **Características**: estructura de proyecto Python moderna, gestión de dependencias

**Estructura Generada:**
```
├── src/
│   └── main.py
└── pyproject.toml
```

#### Java + Maven
**Ubicación de la Plantilla:** `packages/core/src/templates/java/`

- **Herramienta de Build**: Maven
- **Características**: estructura estándar de proyecto Java, configuración Maven

**Estructura Generada:**
```
├── src/
│   └── main/
│       └── java/
└── pom.xml
```

#### Go + Modules
**Ubicación de la Plantilla:** `packages/core/src/templates/go/`

- **Gestión de Paquetes**: Go modules
- **Características**: proyecto Go simple con soporte de módulos

**Estructura Generada:**
```
├── main.go
└── go.mod
```

#### PHP + Laravel
**Ubicación de la Plantilla:** `packages/core/src/templates/php/`

- **Framework**: estructura estilo Laravel
- **Gestión de Paquetes**: Composer
- **Características**: estructura MVC, variables de entorno

**Estructura Generada:**
```
├── app/
├── bootstrap/
├── resources/
├── routes/
├── composer.json
└── .env.example
```

## 🗃️ Soporte Adicional de .gitignore

Además de las plantillas principales de proyecto, StackCode proporciona soporte integral de `.gitignore` para:

**Ubicación de la Plantilla:** `packages/core/src/templates/gitignore/`

### Desarrollo Móvil
- **Android** (`android.tpl`) - Android Studio, Gradle, archivos APK
- **Flutter** (`flutter.tpl`) - Dart, archivos de build Flutter, archivos específicos de plataforma
- **React Native** (`react_native.tpl`) - Metro bundler, builds de plataforma
- **Swift** (`swift.tpl`) - Xcode, archivos de desarrollo iOS

### Frameworks Frontend
- **Angular** (`angular.tpl`) - Angular CLI, artefactos de build
- **Svelte** (`svelte.tpl`) - SvelteKit, outputs de build

### Backend y Lenguajes
- **Go** (`go.tpl`) - binarios Go, directorios vendor
- **Java** (`java.tpl`) - Maven, Gradle, archivos IDE
- **Node.js** (`node-js.tpl`, `node-ts.tpl`) - npm, yarn, outputs de build
- **PHP** (`php.tpl`) - Composer, artefactos Laravel
- **Python** (`python.tpl`) - pip, entornos virtuales, __pycache__
- **JavaScript** (`javascript.tpl`) - archivos generales de proyecto JS

### Herramientas de Desarrollo
- **IDEs** (`ides.tpl`) - configuraciones VS Code, IntelliJ, Eclipse

### Uso
Al crear proyectos, StackCode selecciona automáticamente la plantilla `.gitignore` apropiada basada en el stack elegido, y puede combinar múltiples plantillas al usar características como Docker o IDEs específicos.

## 🔧 Características de los Stacks

### Configuración Automática

Cada plantilla de stack incluye:

- ✅ **Configuración de paquetes** (`package.json`, `pyproject.toml`, `pom.xml`, `composer.json`, `go.mod`)
- ✅ **Configuración TypeScript** (cuando aplica - React, Vue, Node-TS)
- ✅ **Configuración de herramienta de build** (Vite para frontend, Maven para Java)
- ✅ **Linting y formateo** (ESLint para proyectos Node.js)
- ✅ **Framework de pruebas** (Jest para Node.js, Vitest para proyectos TypeScript)
- ✅ **Variables de entorno** (`.env.example` para Node.js y PHP)
- ✅ **Estructura de carpetas de mejores prácticas** con directorios de código organizados

### Gestión Inteligente de Paquetes

StackCode usa automáticamente el gestor de paquetes apropiado basado en el tipo de proyecto:

- **npm** para stacks basados en Node.js (React, Vue, Node.js, Node-TS)
- **pip** para proyectos Python (con pyproject.toml)
- **maven** para proyectos Java
- **go mod** para proyectos Go  
- **composer** para proyectos PHP

### Generación Inteligente de .gitignore

Todo proyecto recibe un archivo `.gitignore` personalizado que combina:
- **Reglas específicas del stack** (basadas en la tecnología elegida)
- **Reglas específicas del IDE** (entornos de desarrollo comunes)
- **Reglas de herramientas adicionales** (Docker, gestores de paquetes, artefactos de build)

### Características del Sistema de Plantillas

- **Sustitución de variables**: Las plantillas usan `{{projectName}}`, `{{description}}`, `{{authorName}}`
- **Composición modular**: Combina plantillas base con características adicionales
- **Estructura consistente**: Todas las plantillas siguen patrones establecidos para sus respectivos ecosistemas

### Características Opcionales

Al inicializar proyectos, puedes habilitar características adicionales:

- **Soporte Docker**: Añade configuraciones Dockerfile y docker-compose
- **Integración Husky**: Configura Git hooks para validación de commits
- **Conventional Commits**: Fuerza estándares de mensaje de commit

### Integración Git

Todo proyecto generado incluye:

- ✅ **Archivos .gitignore inteligentes** (específicos para stack + herramientas + IDE)
- ✅ **Inicialización de repositorio Git**
- ✅ **Configuración de commit convencional** (cuando la característica Husky es seleccionada)

## 🚀 Uso

Para crear un proyecto con cualquier stack:

```bash
stc init
```

Luego selecciona tu stack de tecnología preferido del menú interactivo.

## 🛠️ Contribuyendo con Nuevos Stacks

¿Interesado en añadir soporte para un nuevo stack de tecnología? Consulta nuestra guía completa en [CONTRIBUTING.md](../CONTRIBUTING.md#adding-new-technology-stacks).

El proceso involucra:

1. Crear archivos de plantilla
2. Actualizar definiciones de tipo
3. Añadir opciones CLI
4. Configurar gestión de paquetes
5. Probar completamente

---

_Para más información sobre StackCode, visita nuestra [documentación principal](../README.md)._
