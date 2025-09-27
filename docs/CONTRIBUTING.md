# Contributing Guide

Thank you for considering contributing to StackCode! This guide provides all the information you need to contribute effectively to the project.

## 📋 Quick Navigation

- **[Architecture Overview](#architecture-overview)** - Understand the project structure
- **[Development Setup](#development-setup)** - Get your environment ready
- **[Contributing Types](#how-to-contribute)** - Different ways to contribute
- **[Code Standards](#coding-standards)** - Follow our guidelines
- **[Internationalization](#internationalization)** - Help with translations

## 🏗️ Architecture Overview

Before contributing, familiarize yourself with the project architecture:

- **[📐 Architecture Guide](ARCHITECTURE.md)** - Complete overview of the monorepo structure, design principles, and component interactions
- **[🏛️ ADRs](adr/)** - Architectural decision records explaining key design choices
- **[🛠️ Technology Stacks](STACKS.md)** - Supported frameworks and project templates

Understanding the architecture will help you:

- Choose the right package for your changes
- Follow established patterns and conventions
- Understand cross-package dependencies
- Write better tests and documentation

## 🚀 Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/StackCode.git
   cd StackCode
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

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

**Important**: When adding new stacks, ensure you update the dependency validation system by:

- Adding stack dependencies to `getStackDependencies()` in `packages/core/src/utils.ts`
- Adding installation instructions to i18n files (`packages/i18n/src/locales/`)
- Testing the validation flow with and without required tools installed

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

## 🌐 Internationalization

We welcome contributions to support more languages:

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
