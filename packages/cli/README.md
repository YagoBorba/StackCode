# @stackcode/cli

This package is the user-facing entry point and the user interface (UI) layer for the StackCode toolkit. It is responsible for parsing user commands, gathering input through interactive prompts, and orchestrating calls to the `@stackcode/core` engine to execute the requested logic.

## Key Responsibilities

- **Command Parsing:** Uses the **Yargs** library to define, parse, and validate all user-facing commands, arguments, and options.
- **Interactive Experience:** Leverages the **Inquirer** library to create intuitive, interactive wizards and prompts that guide the user through complex workflows like `init` and `commit`.
- **User Feedback:** Provides clear, colorful, and helpful feedback to the user in the terminal, using the **Chalk** library.
- **Orchestration:** Acts as the "cockpit" of the application, calling the powerful, well-tested functions exported by the `@stackcode/core` package to do the actual work.

## Command Structure

The command-line interface is designed to be modular and easy to extend.

- **`src/index.ts`**: The main entry point that initializes the i18n system and registers all available commands with Yargs.
- **`src/commands/`**: This directory contains the implementation for each top-level command. Each file exports a `get<CommandName>Command` function that returns a Yargs `CommandModule`.
  - `init.ts`: Handles the project scaffolding wizard.
  - `generate.ts`: Handles the generation of individual files like `.gitignore`.
  - `commit.ts`: Provides the interactive conventional commit wizard.
  - `git.ts`: Orchestrates the Gitflow subcommands.
  - `release.ts`: Manages the automated release process.
  - `config.ts`: Manages global and local configuration.
  - `validate.ts`: Validates commit messages, typically used by Husky.
- **`src/commands/git_sub/`**: Contains the logic for subcommands of the `git` command (e.g., `start.ts`, `finish.ts`).

## How to Add a New Command

Adding a new command to StackCode is straightforward:

1.  Create a new file for your command in the `src/commands/` directory (e.g., `new-command.ts`).
2.  Inside the new file, create and export a function `getNewCommandCommand` that returns a `CommandModule` object. This object should define the `command`, `describe`, `builder` (for arguments), and `handler` (the command's logic).
3.  Implement the command's logic within the `handler`. For any complex operations, add the core logic to the `@stackcode/core` package and call it from your handler.
4.  Open `src/index.ts` and import your new command function.
5.  Register your new command in the Yargs chain by adding `.command(getNewCommandCommand())`.
6.  Build the project with `npm run build` and test your new command.

## Relationship with `@stackcode/core`

The `cli` package is intentionally "thin." It contains very little business logic. Its primary role is to manage the user interface and then call functions from `@stackcode/core` to perform the actual work. This clean separation of concerns is a core architectural principle of this project, making the entire system easier to maintain, test, and extend.