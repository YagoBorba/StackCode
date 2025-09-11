# Contributing to StackCode

First off, thank you for considering contributing! It's people like you that make the open-source community such an amazing place. We welcome any contribution, from fixing a typo to implementing a whole new feature.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Adding New Technology Stacks](#adding-new-technology-stacks)
- [Git Workflow and Pull Requests](#git-workflow-and-pull-requests)
- [Coding Style and Principles](#coding-style-and-principles)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing](#testing)

## Architecture Overview

Before contributing, please familiarize yourself with the project architecture:

- **[📐 Architecture Guide](docs/ARCHITECTURE.md)** - Complete overview of the monorepo structure, design principles, and component interactions
- **[🏛️ ADRs](docs/adr/)** - Architectural decision records explaining key design choices
- **[🛠️ Technology Stacks](docs/STACKS.md)** - Supported frameworks and project templates

Understanding the architecture will help you:
- Choose the right package for your changes
- Follow established patterns and conventions
- Understand cross-package dependencies
- Write better tests and documentation

## Code of Conduct

This project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please check the [Issues](https://github.com/YagoBorba/StackCode/issues) to see if it has already been reported. If not, open a new one with a clear title, description, and steps to reproduce.

### Suggesting Enhancements

Have an idea for a new feature or an improvement to an existing one? Please open an issue to discuss it first. This allows us to coordinate efforts and ensure it aligns with the project's vision.

### Your First Code Contribution

Unsure where to begin contributing to StackCode? A great place to start is by looking through issues tagged with `good-first-issue` or `help-wanted`. These are tasks that have been identified as good entry points for new contributors.

## Development Setup

To get the project running locally for development:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/YagoBorba/StackCode.git
    cd StackCode
    ```

2.  **Install dependencies:** We use `npm` workspaces. This single command will install dependencies for all packages in the monorepo.

    ```bash
    npm install
    ```

3.  **Build the project:** This command compiles all TypeScript packages.
    ```bash
    npm run build
    ```

You can now test your local changes by running the CLI from the root of the project:

```bash
node packages/cli/dist/index.js <command>
```

## Adding New Technology Stacks

StackCode currently supports multiple technology stacks (React, Vue, Node.js, Python, Java, Go, PHP). If you want to add support for a new technology stack, follow this comprehensive guide:

### 1. Understanding the Stack Generator Architecture

The stack generator system consists of several components:

- **Templates**: Located in `packages/core/src/templates/`
- **Type Definitions**: In `packages/core/src/types.ts` and `packages/cli/src/commands/ui.ts`
- **Scaffolding Logic**: In `packages/core/src/scaffold.ts`
- **CLI Integration**: In `packages/cli/src/commands/init.ts`

### 2. Step-by-Step Guide to Add a New Stack

#### Step 1: Create Template Directory Structure

Create a new directory under `packages/core/src/templates/` with your stack name (e.g., `angular`, `django`, `rails`):

```bash
mkdir packages/core/src/templates/your-stack-name
```

#### Step 2: Create Template Files

Create the necessary template files with `.tpl` extension. These files support variable replacement using `{{variableName}}` syntax:

```
packages/core/src/templates/your-stack-name/
├── package.json.tpl          # Or equivalent (requirements.txt, composer.json, etc.)
├── src/
│   ├── main.ts.tpl           # Main application file
│   ├── components/           # Component structure
│   │   └── Example.tsx.tpl
│   └── styles/
│       └── globals.css.tpl
├── tsconfig.json.tpl         # Configuration files
├── vite.config.ts.tpl        # Build tool configuration
└── index.html.tpl            # Entry point (for frontend stacks)
```

**Important**: Use these replacement variables in your templates:

- `{{projectName}}` - The project name
- `{{description}}` - Project description
- `{{authorName}}` - Author name

**Example package.json.tpl:**

```json
{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "author": "{{authorName}}",
  "scripts": {
    "dev": "your-dev-command",
    "build": "your-build-command"
  }
}
```

#### Step 3: Create .gitignore Template

Add a corresponding gitignore template in `packages/core/src/templates/gitignore/your-stack-name.tpl`:

```bash
# Example: packages/core/src/templates/gitignore/angular.tpl
node_modules/
dist/
.angular/
.env
*.log
```

#### Step 4: Update Type Definitions

Add your new stack to the type definitions:

**In `packages/core/src/scaffold.ts`:**

```typescript
export interface ProjectOptions {
  projectPath: string;
  stack:
    | "node-js"
    | "node-ts"
    | "react"
    | "vue"
    | "python"
    | "java"
    | "go"
    | "php"
    | "your-stack-name";
  features: ("docker" | "husky")[];
  replacements: Record<string, string>;
}
```

**In `packages/cli/src/commands/ui.ts`:**

```typescript
export interface InitAnswers {
  projectName: string;
  description: string;
  authorName: string;
  stack:
    | "node-js"
    | "node-ts"
    | "react"
    | "vue"
    | "python"
    | "java"
    | "go"
    | "php"
    | "your-stack-name";
  features: ("docker" | "husky")[];
  commitValidation?: boolean;
}
```

#### Step 5: Add to CLI Options

Update the stack choices in `packages/cli/src/commands/ui.ts`:

```typescript
{
  type: "list",
  name: "stack",
  message: t("init.prompt.stack"),
  choices: [
    { name: "Node.js + JavaScript", value: "node-js" },
    { name: "Node.js + TypeScript", value: "node-ts" },
    { name: "React + TypeScript", value: "react" },
    { name: "Vue.js + TypeScript", value: "vue" },
    { name: "Python + FastAPI", value: "python" },
    { name: "Java + Spring", value: "java" },
    { name: "Go + Gin", value: "go" },
    { name: "PHP + Laravel", value: "php" },
    { name: "Your Stack + Framework", value: "your-stack-name" },
  ],
}
```

#### Step 6: Update Package Manager Logic

When adding a new stack, you need to update two areas to handle dependency management:

**A. Add stack dependencies mapping in `packages/core/src/utils.ts`:**

```typescript
export function getStackDependencies(stack: string): string[] {
  const stackMap: Record<string, string[]> = {
    go: ["go"],
    php: ["composer", "php"],
    java: ["mvn", "java"],
    python: ["pip", "python"],
    "your-stack-name": ["your-tool", "another-tool"], // Add your stack here
    // Node.js stacks use npm
    "node-js": ["npm"],
    "node-ts": ["npm"],
    react: ["npm"],
    vue: ["npm"],
  };
  return stackMap[stack] || ["npm"];
}
```

**B. Update dependency installation logic in `packages/cli/src/commands/init.ts`:**

```typescript
// The validation is now handled automatically, but you still need to
// specify the installation command for your stack
if (answers.stack === "python") {
  await runCommand("pip", ["install", "-e", "."], { cwd: projectPath });
} else if (answers.stack === "java") {
  await runCommand("mvn", ["install"], { cwd: projectPath });
} else if (answers.stack === "go") {
  await runCommand("go", ["mod", "tidy"], { cwd: projectPath });
} else if (answers.stack === "php") {
  await runCommand("composer", ["install"], { cwd: projectPath });
} else if (answers.stack === "your-stack-name") {
  await runCommand("your-package-manager", ["install"], { cwd: projectPath });
} else {
  // For Node.js-based stacks (node-js, node-ts, react, vue)
  await runCommand("npm", ["install"], { cwd: projectPath });
}
```

**C. Add installation instructions in i18n files:**

Add entries to both `packages/i18n/src/locales/en.json` and `packages/i18n/src/locales/pt.json`:

```json
{
  "init": {
    "dependencies": {
      "install_your_tool": "  - Your Tool: https://example.com/install"
    }
  }
}
```

### 3. System Dependency Validation

StackCode now includes intelligent dependency validation that checks if required tools are installed before attempting to create projects. This prevents crashes and provides helpful guidance to users.

#### How It Works

1. **Pre-validation**: Before installing dependencies, StackCode checks if required tools are available in the system PATH
2. **User feedback**: If tools are missing, users see:
   - Clear warnings about missing dependencies
   - Direct download links for each missing tool
   - Option to continue without installing dependencies
3. **Graceful handling**: Even if dependencies fail to install, the project structure is still created successfully

#### Supported Stack Dependencies

| Stack | Required Tools | Validation |
|-------|---------------|------------|
| `go` | `go` | ✅ |
| `php` | `composer`, `php` | ✅ |
| `java` | `mvn`, `java` | ✅ |
| `python` | `pip`, `python` | ✅ |
| `node-js`, `node-ts`, `react`, `vue` | `npm` | ✅ |

#### Testing Dependency Validation

To test the validation system:

```bash
# Test with missing dependencies (assuming Go is not installed)
stc init
# Choose "Go + Gin" stack
# You should see warnings and installation instructions

# Test validation programmatically
node -e "
const { validateStackDependencies } = require('@stackcode/core');
validateStackDependencies('go').then(result => 
  console.log('Result:', result)
);
"
```

### 4. Best Practices for New Stacks

#### Template Structure Guidelines:

- **Follow conventions**: Use the technology's standard project structure
- **Include essentials**: Configuration files, build tools, testing setup
- **Add documentation**: Include basic README template
- **Consider scalability**: Create folders for components, services, etc.
- **Modern practices**: Use latest stable versions and best practices

#### Example Folder Structures:

**Frontend Stack (SPA):**

```
src/
├── components/
├── pages/ or views/
├── services/
├── styles/
├── utils/
└── main.ts
```

**Backend Stack (API):**

```
src/
├── controllers/
├── models/
├── services/
├── middleware/
├── routes/
└── main.ts
```

**Full-Stack Framework:**

```
src/
├── components/
├── pages/
├── api/
├── styles/
└── utils/
```

### 4. Testing Your New Stack

1. **Build the project**: `npm run build`
2. **Test scaffolding**: Create a test project with your new stack
3. **Verify structure**: Check that all files are created correctly
4. **Test build**: Ensure the generated project builds/runs successfully
5. **Run tests**: Execute `npm test` to ensure no regressions

### 5. Example: Adding Angular Support

Here's a practical example of adding Angular support:

```bash
# 1. Create template directory
mkdir packages/core/src/templates/angular

# 2. Create basic structure
packages/core/src/templates/angular/
├── package.json.tpl
├── angular.json.tpl
├── tsconfig.json.tpl
├── src/
│   ├── app/
│   │   ├── app.component.ts.tpl
│   │   ├── app.component.html.tpl
│   │   └── app.module.ts.tpl
│   ├── main.ts.tpl
│   └── index.html.tpl
└── .gitignore.tpl
```

### 6. Submission Guidelines

When submitting a PR for a new stack:

1. **Test thoroughly**: Ensure the generated project works end-to-end
2. **Include examples**: Provide sample output or screenshots
3. **Update documentation**: Add your stack to relevant docs
4. **Follow naming**: Use kebab-case for stack names
5. **Add tests**: Include unit tests if complex logic is added

### 7. Internationalization

If adding UI text, ensure it's properly internationalized using the `@stackcode/i18n` package.

This system is designed to be extensible and maintainable. By following these guidelines, you'll ensure that new stacks integrate seamlessly with the existing codebase.

## Git Workflow and Pull Requests

We use the **Gitflow** workflow. All development for new features and bugfixes should happen on branches created from the `develop` branch.

1.  Create a feature branch from `develop`:

    ```bash
    git checkout -b feature/your-awesome-feature develop
    ```

    For documentation, use:

    ```bash
    git checkout -b docs/what-you-are-documenting develop
    ```

2.  Make your changes and commit them.
3.  Push your branch to GitHub.
4.  Open a Pull Request from your branch to the `develop` branch.
5.  Ensure all CI checks (build and tests) are passing.

## Coding Style and Principles

- **Clean Code:** Write code that is easy to read and understand.
- **SOLID Principles:** Follow SOLID principles for robust design.
- **Modularity:** Keep functions and modules focused on a single responsibility.
- **Documentation:** Use TSDoc-style `docstrings` (`/** ... */`) for all exported functions, classes, and types.

## Commit Message Guidelines

We use **Conventional Commits** with emojis. This helps keep our history clean and automates our release process. Please follow the format we have established in our collaboration.

**Example:**

```
feat(cli): ✨ add interactive menu to git command
fix(core): 🐛 correct relative path in test file
docs(readme): 📝 update installation instructions
```

## Testing

- Add unit tests with **Vitest** for any new logic, especially in the `@stackcode/core` package.
- Place test files in the `test/` directory, following the existing structure.
- Ensure all tests pass by running:
  ```bash
  npm test
  ```

Our CI pipeline will run these tests automatically on your PR.

Thank you again for your interest in contributing!

---

## Documentation
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Self-Hosting Guide](docs/SELF_HOSTING_GUIDE.md)
