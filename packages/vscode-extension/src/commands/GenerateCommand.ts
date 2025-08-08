import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";
import * as path from "path";

export class GenerateCommand extends BaseCommand {
  async execute(): Promise<void> {
    const option = await vscode.window.showQuickPick(
      [
        {
          label: "README.md",
          description: "Generate a comprehensive README file",
        },
        {
          label: ".gitignore",
          description: "Generate a .gitignore file based on project type",
        },
        {
          label: "Both",
          description: "Generate both README.md and .gitignore",
        },
      ],
      {
        placeHolder: "What would you like to generate?",
      },
    );

    if (!option) {
      return;
    }

    if (option.label === "README.md") {
      await this.generateReadme();
    } else if (option.label === ".gitignore") {
      await this.generateGitignore();
    } else if (option.label === "Both") {
      await this.generateReadme();
      await this.generateGitignore();
    }
  }

  async generateReadme(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError("No workspace folder found");
        return;
      }

      const readmePath = path.join(workspaceFolder.uri.fsPath, "README.md");

      // Check if README already exists
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(readmePath));
        const overwrite = await this.confirmAction(
          "README.md already exists. Do you want to overwrite it?",
          "Overwrite",
        );
        if (!overwrite) {
          return;
        }
      } catch {
        // File doesn't exist, which is fine
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating README.md",
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: "Analyzing project structure...",
          });

          // Use StackCode CLI for generation
          const command = `npx @stackcode/cli generate readme`;

          progress.report({ increment: 50, message: "Generating content..." });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: "README.md generated successfully!",
          });
        },
      );

      this.showSuccess("README.md has been generated successfully!");

      // Ask if user wants to open the file
      const openFile = await vscode.window.showInformationMessage(
        "Would you like to open the generated README.md?",
        "Open File",
      );

      if (openFile === "Open File") {
        const document = await vscode.workspace.openTextDocument(readmePath);
        await vscode.window.showTextDocument(document);
      }
    } catch (error) {
      this.showError(`Failed to generate README.md: ${error}`);
    }
  }

  async generateGitignore(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError("No workspace folder found");
        return;
      }

      const gitignorePath = path.join(workspaceFolder.uri.fsPath, ".gitignore");

      // Check if .gitignore already exists
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(gitignorePath));
        const overwrite = await this.confirmAction(
          ".gitignore already exists. Do you want to overwrite it?",
          "Overwrite",
        );
        if (!overwrite) {
          return;
        }
      } catch {
        // File doesn't exist, which is fine
      }

      // Ask for project type
      const projectType = await vscode.window.showQuickPick(
        [
          { label: "node-ts", description: "Node.js with TypeScript" },
          { label: "react", description: "React application" },
          { label: "vue", description: "Vue.js application" },
          { label: "angular", description: "Angular application" },
          { label: "python", description: "Python project" },
          { label: "java", description: "Java project" },
          { label: "go", description: "Go project" },
          { label: "php", description: "PHP project" },
          { label: "flutter", description: "Flutter project" },
          { label: "swift", description: "Swift project" },
          { label: "android", description: "Android project" },
        ],
        {
          placeHolder: "Select project type for .gitignore",
        },
      );

      if (!projectType) {
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating .gitignore",
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: "Generating .gitignore content...",
          });

          // Use StackCode CLI for generation
          const command = `npx @stackcode/cli generate gitignore --type="${projectType.label}"`;

          progress.report({ increment: 50, message: "Creating file..." });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: ".gitignore generated successfully!",
          });
        },
      );

      this.showSuccess(".gitignore has been generated successfully!");

      // Ask if user wants to open the file
      const openFile = await vscode.window.showInformationMessage(
        "Would you like to open the generated .gitignore?",
        "Open File",
      );

      if (openFile === "Open File") {
        const document = await vscode.workspace.openTextDocument(gitignorePath);
        await vscode.window.showTextDocument(document);
      }
    } catch (error) {
      this.showError(`Failed to generate .gitignore: ${error}`);
    }
  }
}
