import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";
import * as path from "path";

export class InitCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      // Prompt for project details
      const projectName = await vscode.window.showInputBox({
        prompt: "Enter project name",
        placeHolder: "my-awesome-project",
        validateInput: (value: string) => {
          if (!value) {
            return "Project name is required";
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return "Project name can only contain letters, numbers, hyphens and underscores";
          }
          return null;
        },
      });

      if (!projectName) {
        return;
      }

      const description = await vscode.window.showInputBox({
        prompt: "Enter project description",
        placeHolder: "A brief description of your project",
      });

      const authorName = await vscode.window.showInputBox({
        prompt: "Enter author name",
        placeHolder: "Your Name",
        value: await this.getGitUserName(),
      });

      const stack = await vscode.window.showQuickPick(
        [
          { label: "node-ts", description: "Node.js with TypeScript" },
          { label: "react", description: "React application" },
          { label: "vue", description: "Vue.js application" },
          { label: "angular", description: "Angular application" },
          { label: "python", description: "Python project" },
          { label: "java", description: "Java project" },
          { label: "go", description: "Go project" },
          { label: "php", description: "PHP project" },
        ],
        {
          placeHolder: "Select project stack",
        },
      );

      if (!stack) {
        return;
      }

      // Get workspace folder or ask for project location
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      let projectPath: string;

      if (workspaceFolder) {
        projectPath = path.join(workspaceFolder.uri.fsPath, projectName);
      } else {
        const folderUris = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          openLabel: "Select Project Location",
        });

        if (!folderUris || folderUris.length === 0) {
          return;
        }

        projectPath = path.join(folderUris[0].fsPath, projectName);
      }

      // Check if directory exists
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(projectPath));
        const overwrite = await this.confirmAction(
          `Directory ${projectName} already exists. Do you want to overwrite it?`,
          "Overwrite",
        );
        if (!overwrite) {
          return;
        }
      } catch {
        // Directory doesn't exist, which is fine
      }

      // Show progress
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Initializing project ${projectName}`,
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: "Setting up project structure...",
          });

          // Use StackCode CLI for initialization
          const command = `npx @stackcode/cli init --name="${projectName}" --description="${description}" --author="${authorName}" --stack="${stack.label}" --path="${projectPath}"`;

          progress.report({
            increment: 50,
            message: "Running StackCode CLI...",
          });

          await this.runTerminalCommand(command);

          progress.report({
            increment: 100,
            message: "Project initialized successfully!",
          });
        },
      );

      // Ask if user wants to open the new project
      const openProject = await vscode.window.showInformationMessage(
        `Project ${projectName} has been created successfully! Would you like to open it?`,
        "Open Project",
        "Later",
      );

      if (openProject === "Open Project") {
        const uri = vscode.Uri.file(projectPath);
        await vscode.commands.executeCommand("vscode.openFolder", uri, true);
      }
    } catch (error) {
      this.showError(`Failed to initialize project: ${error}`);
    }
  }

  private async getGitUserName(): Promise<string> {
    try {
      // Try to get git user name from workspace
      const terminal = vscode.window.createTerminal({ name: "temp" });
      terminal.sendText("git config user.name");
      terminal.dispose();
      return "";
    } catch {
      return "";
    }
  }
}
