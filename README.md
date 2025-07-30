<a name="readme-top"></a>

<div align="center">

<h1 align="center">StackCode</h1>

<br>

# Welcome to the StackCode repository

---

**Ever felt the tedious grind of setting up new projects, enforcing conventions, and managing releases?** <br/>
We believe developers should focus on creating, not on repetitive boilerplate and configuration. That's why we built **StackCode**: the developer's automated Ops Assistant. <br/>
With intelligent scaffolding, guided commits, a simplified Gitflow, and automated releases, your workflow is about to get a major upgrade. <br/>
**Your only frustration will be not having this from the start.** 😉

[![CI Status][ci-shield]][ci-link]
[![NPM Version][npm-shield]][npm-link]
[![MIT License][license-shield]][license-link]

</br>

</div>

## ❤️ About the Project

> [!IMPORTANT]
> StackCode was born from a simple idea: **professional DevOps practices shouldn't be complicated.** If you agree, star this repository to give us a boost! ⭐️

StackCode is a powerful, opinionated CLI designed to bring consistency, quality, and automation to your development lifecycle. From the first line of code to the final release tag, StackCode is there to handle the tedious tasks, letting you focus on what truly matters: building great software.

Our goal is to make best practices the easiest path.

## ✨ What Can StackCode Do?

StackCode is a suite of tools designed to work together seamlessly:

* 🚀 **Effortless Project Scaffolding (`init`):**
  Generate a complete, production-ready project structure in seconds. Starts with a professional Node.js + TypeScript stack, with more to come.

* 📝 **Intelligent File Generation (`generate`):**
  Need a `.gitignore`? Don't just get one—get a perfect one. Our composable template engine combines rules for your stack, IDE, and tools (like Docker) into a single, organized file.

* 💬 **Guided Conventional Commits (`commit`):**
  Never write a non-compliant commit message again. Our interactive wizard guides you through the Conventional Commits specification, ensuring a clean and readable Git history.

* 🔗 **Simplified Gitflow (`git`):**
  Forget memorizing branch names. Use `stc git start` and `stc git finish` to manage feature branches with ease. Our interactive menu makes the process foolproof.

* 🔖 **Automated Versioning & Releases (`release`):**
  This is where the magic happens. The `release` command analyzes your commits, automatically determines the next semantic version (`patch`, `minor`, `major`), updates all `package.json` files, generates a `CHANGELOG.md`, and creates the corresponding commit and Git tag.

* ✅ **Guaranteed Commit Quality (`validate`):**
  Integrates seamlessly with Husky git hooks. The `stc validate` command ensures that no non-conventional commit ever makes it into your repository.

* ⚙️ **Flexible Configuration (`config`):**
  Manage global preferences (like language) and project-specific settings (like enabling commit validation) with a simple, interactive command.

## 🛠️ Under the Hood (Main Technologies)

* **[TypeScript](https://www.typescriptlang.org/)**: For a robust, type-safe, and maintainable codebase.
* **[Node.js](https://nodejs.org/)**: The runtime environment for our powerful backend logic.
* **[Yargs](https://yargs.js.org/)**: For building a clean, professional, and extensible command-line interface.
* **[Inquirer](https://github.com/SBoudrias/Inquirer.js/)**: To create the intuitive and interactive prompts that guide the user.
* **[Vitest](https://vitest.dev/)**: For a fast, modern, and reliable testing suite that guarantees our core logic is solid.
* **[GitHub Actions](https://github.com/features/actions)**: For our CI pipeline that automatically builds and tests every Pull Request.

## 🚀 Getting Started

There are two primary ways to use StackCode, depending on your needs.

### Global Installation (For Convenience)

This is the recommended approach for everyday use, especially for commands like `stc init`.

1.  Install the CLI globally using npm:
    ```bash
    npm install -g @stackcode/cli  # Replace with your actual package name on npm
    ```
2.  You can now run `stc` from any directory on your system!
    ```bash
    stc init
    ```

### Local Installation (For Teams)

This is the best approach for ensuring everyone on a project uses the exact same version of the tool, which is critical for features like `stc commit` and `stc release`.

1.  Install the CLI as a dev dependency in your project:
    ```bash
    npm install --save-dev @stackcode/cli # Replace with your package name
    ```
2.  Run commands using `npx`:
    ```bash
    npx stc commit
    ```

## 🤝 Want to Contribute?

Awesome! StackCode is an open-source project, and we welcome contributions.

To get started, please read our **[Contribution Guide](CONTRIBUTING.md)**. It has everything you need to know about our workflow, code standards, and how to submit your pull requests.

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

<div align="right">
    <a href="#readme-top">Back to Top</a>
</div>

[ci-shield]: https://github.com/YagoBorba/StackCode/actions/workflows/ci.yml/badge.svg
[ci-link]: https://github.com/YagoBorba/StackCode/actions/workflows/ci.yml
[npm-shield]: https://img.shields.io/npm/v/@stackcode/cli?style=flat-square&logo=npm&labelColor=black&color=CB3837
[npm-link]: https://www.npmjs.com/package/@stackcode/cli
[license-shield]: https://img.shields.io/github/license/YagoBorba/StackCode?style=flat-square&logo=github&labelColor=black&color=508CF9
[license-link]: https://github.com/YagoBorba/StackCode/blob/develop/LICENSE