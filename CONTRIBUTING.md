
# Contributing to StackCode

First off, thank you for considering contributing! It's people like you that make the open-source community such an amazing place. We welcome any contribution, from fixing a typo to implementing a whole new feature.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Git Workflow and Pull Requests](#git-workflow-and-pull-requests)
- [Coding Style and Principles](#coding-style-and-principles)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing](#testing)

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
