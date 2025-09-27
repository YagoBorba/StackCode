# Guía de Contribución

¡Gracias por considerar contribuir a StackCode! Esta guía proporciona toda la información que necesitas para contribuir efectivamente al proyecto.

## 📋 Navegación Rápida

- **[Visión General de la Arquitectura](#visión-general-de-la-arquitectura)** - Comprende la estructura del proyecto
- **[Configuración de Desarrollo](#configuración-de-desarrollo)** - Prepara tu entorno
- **[Tipos de Contribución](#cómo-contribuir)** - Diferentes formas de contribuir
- **[Estándares de Código](#estándares-de-código)** - Sigue nuestras directrices
- **[Internacionalización](#internacionalización)** - Ayuda con las traducciones

## 🏗️ Visión General de la Arquitectura

Antes de contribuir, familiarízate con la arquitectura del proyecto:

- **[📐 Guía de Arquitectura](ARCHITECTURE.md)** - Visión completa de la estructura del monorepo, principios de diseño e interacciones de componentes
- **[🏛️ ADRs](adr/)** - Registros de decisiones arquitectónicas explicando decisiones de diseño clave
- **[🛠️ Stacks Tecnológicos](STACKS.md)** - Frameworks soportados y plantillas de proyecto

Comprender la arquitectura te ayudará a:

- Elegir el paquete correcto para tus cambios
- Seguir patrones y convenciones establecidas
- Entender dependencias entre paquetes
- Escribir mejores tests y documentación

## 🚀 Configuración de Desarrollo

1. **Fork y Clonar**

   ```bash
   git clone https://github.com/tu-usuario/StackCode.git
   cd StackCode
   ```

2. **Instalar Dependencias**

   ```bash
   npm install
   ```

3. **Construir el Proyecto**

   ```bash
   npm run build
   ```

4. **Vincular CLI para Desarrollo**

   ```bash
   cd packages/cli
   npm link
   ```

5. **Ejecutar Tests**

   ```bash
   npm test
   ```

6. **Iniciar en Modo Desarrollo**
   ```bash
   npm run dev
   ```

### Requisitos del Sistema

- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior
- **Git**: v2.20.0 o superior
- **VS Code**: Recomendado para desarrollo

### Extensiones VS Code Recomendadas

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Jest Test Explorer
- GitLens

## 🤝 Cómo Contribuir

### 1. Reportar Bugs

Antes de reportar un bug:

- Verifica que no esté ya reportado en [Issues](https://github.com/YagoBorba/StackCode/issues)
- Usa la plantilla de bug report
- Proporciona información detallada sobre reproducción

**Plantilla de Bug Report:**

```markdown
## Descripción

Descripción clara del bug.

## Pasos para Reproducir

1. Ejecuta `stc init`
2. Selecciona template 'react'
3. Ve el error

## Comportamiento Esperado

Lo que esperabas que sucediera.

## Comportamiento Actual

Lo que realmente sucedió.

## Entorno

- OS: [macOS/Windows/Linux]
- Node.js: [versión]
- StackCode: [versión]
```

### 2. Sugerir Funcionalidades

Para sugerir nuevas funcionalidades:

- Revisa las [Discussions](https://github.com/YagoBorba/StackCode/discussions)
- Usa la plantilla de feature request
- Explica el caso de uso y beneficios

### 3. Contribuir con Código

#### Tipos de Contribuciones de Código

**a) Corrección de Bugs**

- Identifica el bug en el código
- Escribe un test que reproduzca el bug
- Implementa la corrección
- Verifica que todos los tests pasen

**b) Nuevas Funcionalidades**

- Discute la funcionalidad en Issues/Discussions
- Sigue los principios de arquitectura
- Incluye tests completos
- Actualiza documentación

**c) Mejoras de Performance**

- Benchmarking antes y después
- Mantén compatibilidad con API existente
- Incluye tests de rendimiento

**d) Refactorización**

- Mantén comportamiento existente
- Mejora legibilidad o estructura
- Incluye tests que verifiquen no regression

#### Flujo de Desarrollo

1. **Crear Branch**

   ```bash
   git checkout -b feature/nueva-funcionalidad
   # o
   git checkout -b fix/corregir-bug
   ```

2. **Hacer Cambios**
   - Sigue los estándares de código
   - Escribe tests
   - Actualiza documentación

3. **Commit**

   ```bash
   # Usa conventional commits
   git commit -m "feat(cli): add support for new template"
   git commit -m "fix(core): resolve template generation bug"
   ```

4. **Push y Pull Request**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

### 4. Mejorar Documentación

Tipos de mejoras de documentación:

- Corregir errores tipográficos
- Mejorar claridad de explicaciones
- Agregar ejemplos
- Traducir a otros idiomas
- Actualizar guías desactualizadas

## 📝 Estándares de Código

### Estilo de Código

Utilizamos herramientas automatizadas para mantener consistencia:

```bash
# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format
npm run format:check
```

### Convenciones

#### Nomenclatura

- **Archivos**: camelCase (`templateGenerator.ts`)
- **Directorios**: kebab-case (`git-commands/`)
- **Clases**: PascalCase (`TemplateGenerator`)
- **Funciones**: camelCase (`generateTemplate`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_TEMPLATE`)

#### Estructura de Archivos

```typescript
// Orden de imports
import { something } from "node:fs"; // Node.js built-ins
import { yargs } from "yargs"; // External dependencies
import { helper } from "@stackcode/core"; // Internal packages
import { local } from "./localFile.js"; // Local files

// Orden de exports
export type { TypeDefinition };
export { namedExport };
export default defaultExport;
```

#### Documentación de Código

````typescript
/**
 * Genera un nuevo proyecto basado en una plantilla.
 *
 * @param template - El nombre de la plantilla a usar
 * @param options - Opciones de configuración para la generación
 * @returns Promise que resuelve con el resultado de la generación
 *
 * @example
 * ```typescript
 * const result = await generateProject('react', {
 *   directory: './my-app',
 *   packageManager: 'npm'
 * });
 * ```
 */
export async function generateProject(
  template: SupportedTemplate,
  options: GenerationOptions,
): Promise<GenerationResult> {
  // Implementación...
}
````

### Testing

#### Principios de Testing

- **Cobertura**: Mantener >80% de cobertura
- **Tests Unitarios**: Para funciones individuales
- **Tests de Integración**: Para flujos completos
- **Tests E2E**: Para CLI y extensión VS Code

#### Estructura de Tests

```typescript
describe("TemplateGenerator", () => {
  describe("generateProject", () => {
    it("should create project with correct structure", async () => {
      // Arrange
      const template = "react";
      const options = { directory: "./test-project" };

      // Act
      const result = await generator.generateProject(template, options);

      // Assert
      expect(result.success).toBe(true);
      expect(fs.existsSync("./test-project/package.json")).toBe(true);
    });

    it("should handle invalid template gracefully", async () => {
      // Arrange
      const template = "invalid-template" as SupportedTemplate;

      // Act & Assert
      await expect(generator.generateProject(template, {})).rejects.toThrow(
        "Template not supported",
      );
    });
  });
});
```

#### Mocking

```typescript
// Mock external dependencies
jest.mock("node:fs", () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock internal modules
jest.mock("@stackcode/core", () => ({
  generateTemplate: jest.fn(),
}));
```

### Git y Commits

#### Conventional Commits

Seguimos la especificación [Conventional Commits](https://conventionalcommits.org/):

```bash
<tipo>[scope opcional]: <descripción>

[cuerpo opcional]

[footer(s) opcional(es)]
```

**Tipos:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, espacios en blanco, etc.
- `refactor`: Refactorización de código
- `test`: Agregar o actualizar tests
- `chore`: Tareas de mantenimiento

**Scopes:**

- `cli`: CLI package
- `core`: Core package
- `i18n`: Internationalization package
- `vscode`: VS Code extension
- `docs`: Documentation
- `build`: Build system

**Ejemplos:**

```bash
feat(cli): add support for Vue 3 template
fix(core): resolve path resolution issue on Windows
docs(contributing): update development setup instructions
test(cli): add tests for init command
refactor(core): simplify template generation logic
```

#### Mensajes de Commit

- Usa presente imperativo ("add" no "added")
- Limita la primera línea a 50 caracteres
- Referencia issues/PRs cuando aplique
- Incluye contexto en el cuerpo si es necesario

```bash
feat(cli): add interactive template selection

- Add inquirer prompts for template choice
- Support keyboard navigation and search
- Include template descriptions and features
- Maintain backward compatibility with direct template argument

Closes #42
```

## 🌍 Internacionalización

StackCode soporta múltiples idiomas y valoramos contribuciones de traducción.

### Idiomas Soportados

- **Inglés (en)** - Idioma base
- **Portugués (pt)** - Completo
- **Español (es)** - En progreso
- **Francés (fr)** - Planificado
- **Alemán (de)** - Planificado

### Agregar Traducciones

1. **Localizar Archivos de Idioma**

   ```
   packages/i18n/src/locales/
   ├── en.json (base)
   ├── pt.json
   ├── es.json
   └── [nuevo-idioma].json
   ```

2. **Crear Nuevo Archivo de Idioma**

   ```bash
   cp packages/i18n/src/locales/en.json packages/i18n/src/locales/fr.json
   ```

3. **Traducir Contenido**

   ```json
   {
     "commands": {
       "init": {
         "description": "Inicialiser un nouveau projet",
         "prompts": {
           "template": "Quel modèle souhaitez-vous utiliser ?"
         }
       }
     }
   }
   ```

4. **Actualizar Configuración**
   ```typescript
   // En packages/i18n/src/index.ts
   const supportedLocales = ["en", "pt", "es", "fr"];
   ```

### Directrices de Traducción

- **Consistencia**: Mantén terminología técnica consistente
- **Contexto**: Preserva el significado en contexto
- **Interpolación**: Mantén variables `{{variable}}` intactas
- **Longitud**: Considera limitaciones de espacio en UI
- **Cultura**: Adapta culturalmente cuando sea apropiado

### Traducir Documentación

Para traducir documentación (como este archivo):

1. **Crear Estructura de Directorios**

   ```
   docs/
   ├── README.md (inglés)
   ├── es/
   │   ├── README.md
   │   ├── CONTRIBUTING.md
   │   └── ...
   └── fr/
       ├── README.md
       └── ...
   ```

2. **Mantener Estructura**
   - Misma organización de carpetas
   - Mismos nombres de archivo
   - Misma estructura de encabezados

3. **Referencias Internas**

   ```markdown
   <!-- Mantener referencias relativas -->

   [Architecture Guide](ARCHITECTURE.md)

   <!-- Para referencias entre idiomas -->

   [English Version](../README.md)
   ```

## 🔍 Proceso de Review

### Antes del Pull Request

1. **Auto-verificación**

   ```bash
   npm run lint
   npm run test
   npm run build
   ```

2. **Actualizar Documentación**
   - README si es necesario
   - Comentarios en código
   - Tipos TypeScript

3. **Verificar Compatibilidad**
   - Breaking changes documentados
   - Backward compatibility mantenida
   - Migration guides actualizados

### Durante el Review

- **Respondes a comentarios** de manera constructiva
- **Realiza cambios solicitados** puntualmente
- **Mantén el PR actualizado** con main branch
- **Resuelve conflictos** cuando aparezcan

### Criterios de Aprobación

- [ ] All tests pass
- [ ] Code coverage maintained/improved
- [ ] Documentation updated
- [ ] No breaking changes (unless major version)
- [ ] Follows coding standards
- [ ] Has appropriate tests
- [ ] Performance impact considered

## 📊 Métricas y Calidad

### Cobertura de Tests

Mantenemos alta cobertura de tests:

```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte detallado
open coverage/lcov-report/index.html
```

**Objetivos:**

- **Global**: >80%
- **Funciones**: >85%
- **Líneas**: >80%
- **Branches**: >75%

### Performance

Monitoreamos performance de comandos CLI:

```bash
# Benchmark de comandos
npm run benchmark

# Profiling específico
node --prof packages/cli/dist/index.js init react
```

### Bundle Size

Para la extensión VS Code:

```bash
# Analizar bundle
npm run analyze:bundle

# Verificar límites
npm run size:check
```

## 🐛 Debugging

### Debugging CLI

```bash
# Modo debug
DEBUG=stackcode:* stc init

# Node.js debugger
node --inspect packages/cli/dist/index.js init

# VS Code debugging
# Usar configuración launch.json
```

### Debugging Extensión VS Code

1. **Abrir en Development Host**
   - Presiona F5 en VS Code
   - Se abre nueva ventana con extensión cargada

2. **Debug Console**

   ```typescript
   // En código de extensión
   console.log("Debug info:", data);

   // Ver en VS Code Developer Tools
   // Help > Toggle Developer Tools
   ```

3. **Breakpoints**
   - Coloca breakpoints en TypeScript
   - Debug funciona en fuente original

## 📚 Recursos Adicionales

### Documentación

- **[Arquitectura](ARCHITECTURE.md)** - Estructura y design del proyecto
- **[ADRs](adr/)** - Decisiones arquitectónicas
- **[Stacks](STACKS.md)** - Tecnologías soportadas

### Herramientas Externas

- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**
- **[Jest Documentation](https://jestjs.io/docs/getting-started)**
- **[VS Code Extension API](https://code.visualstudio.com/api)**
- **[Yargs Documentation](https://yargs.js.org/docs/)**

### Comunidad

- **[GitHub Discussions](https://github.com/YagoBorba/StackCode/discussions)** - Preguntas y discusiones
- **[Issues](https://github.com/YagoBorba/StackCode/issues)** - Bug reports y feature requests

## 🙏 Reconocimientos

¡Agradecemos a todos los contribuidores que hacen posible StackCode!

### Cómo ser Reconocido

- **Código**: Contribuciones aparecen en GitHub contributors
- **Documentación**: Credited en changelog de releases
- **Traducciones**: Reconocimiento en README de idioma
- **Issues/Discussions**: Badges y menciones especiales

### Hall of Fame

Los contribuidores destacados son reconocidos en:

- README principal del proyecto
- Releases notes
- Documentación oficial
- Redes sociales del proyecto

---

¿Tienes preguntas? No dudes en:

- Abrir una [Discussion](https://github.com/YagoBorba/StackCode/discussions)
- Crear un [Issue](https://github.com/YagoBorba/StackCode/issues)
- Revisar documentación existente

¡Esperamos tu contribución! 🚀
git clone https://github.com/your-username/StackCode.git
cd StackCode

````

2. **Install Dependencies**
```bash
npm install
````

3. **Build the Project**

   ```bash
   npm run build
   ```

4. **Test Your Setup**

   ```bash
   # Run tests
   npm test

   # Test CLI locally
   node packages/cli/dist/index.js --help
   ```

## 🤝 How to Contribute

### 🐛 Bug Reports

- Check [existing issues](https://github.com/YagoBorba/StackCode/issues) first
- Provide clear reproduction steps
- Include environment details (OS, Node.js version, etc.)
- Use the bug report template

### ✨ Feature Requests

- Open an issue to discuss the feature first
- Explain the use case and benefits
- Consider if it fits the project's scope
- Provide implementation ideas if possible

### 📝 Documentation Improvements

- Fix typos, improve clarity, add examples
- Update docs when adding new features
- Help with translations (see [Internationalization](#internationalization))

### 🛠️ Code Contributions

- Pick up issues labeled `good-first-issue` or `help-wanted`
- Follow the [development workflow](#development-workflow)
- Ensure all tests pass
- Add tests for new functionality

### 🌐 Adding New Technology Stacks

See the comprehensive guide in [main CONTRIBUTING.md](../CONTRIBUTING.md#adding-new-technology-stacks).

## 🔄 Development Workflow

1. **Create a Feature Branch**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/your-feature-name
   ```

2. **Make Your Changes**
   - Follow coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Thoroughly**

   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit Your Changes**

   ```bash
   # Use conventional commits with emojis
   git commit -m "feat(cli): ✨ add new project template"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feat/your-feature-name
   # Open PR against develop branch
   ```

## 🎨 Coding Standards

### General Principles

- **Clean Code**: Write readable, maintainable code
- **SOLID Principles**: Follow SOLID design principles
- **Single Responsibility**: Each function/class should have one purpose
- **Documentation**: Use TSDoc comments for public APIs

### TypeScript Guidelines

- Use strict TypeScript configuration
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Follow ESLint rules

### Testing Requirements

- Add unit tests for new functionality
- Maintain or improve test coverage
- Test both success and error scenarios
- Use descriptive test names

## 🌐 Internacionalización

Damos la bienvenida a contribuciones para soportar más idiomas:

### Current Structure

```
packages/i18n/src/locales/
├── en.json          # English (primary)
└── pt.json          # Portuguese
```

### Adding New Languages

1. **Create Locale File**

   ```bash
   # Example for Spanish
   cp packages/i18n/src/locales/en.json packages/i18n/src/locales/es.json
   ```

2. **Translate Strings**

   ```json
   {
     "commands": {
       "init": {
         "description": "Inicializar un nuevo proyecto"
       }
     }
   }
   ```

3. **Test the Translation**
   ```bash
   STACKCODE_LANG=es node packages/cli/dist/index.js --help
   ```

### Future Structure (Planned)

```
docs/
├── pt-BR/           # Portuguese (Brazil)
├── es/              # Spanish
├── fr/              # French
└── de/              # German
```

## 📏 Code Review Process

### For Contributors

- Keep PRs focused and small
- Write clear PR descriptions
- Respond to feedback promptly
- Update documentation as needed

### Review Criteria

- Code quality and maintainability
- Test coverage and quality
- Documentation completeness
- Adherence to project standards
- Breaking change considerations

## 🏷️ Issue Labels

- `good-first-issue` - Perfect for newcomers
- `help-wanted` - Community help needed
- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation related
- `question` - Further information needed

## 📋 Contribution Checklist

Before submitting your PR, ensure:

- [ ] Code follows project standards
- [ ] Tests are added and passing
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] PR targets the `develop` branch
- [ ] Breaking changes are documented
- [ ] Performance impact is considered

## 🆘 Getting Help

Need help contributing?

- **[GitHub Discussions](https://github.com/YagoBorba/StackCode/discussions)** - Ask questions
- **[Discord/Slack](#)** - Real-time community chat (if available)
- **[Issues](https://github.com/YagoBorba/StackCode/issues)** - Report problems

## 🙏 Recognition

All contributors are recognized in:

- [Contributors section](../README.md#contributors) in README
- Git commit history
- Release notes for significant contributions

Thank you for helping make StackCode better! 🚀

---

For more details, see:

- **[Main README](../README.md)** - Project overview
- **[Architecture Guide](ARCHITECTURE.md)** - Technical details
- **[Self-Hosting Guide](SELF_HOSTING_GUIDE.md)** - Deployment options
