import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";

export class ValidateCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError("No workspace folder found");
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Validating project structure",
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({ increment: 0, message: "Running validation..." });

          // Use StackCode CLI for validation
          const command = `npx @stackcode/cli validate`;

          progress.report({
            increment: 50,
            message: "Checking project structure...",
          });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({ increment: 100, message: "Validation completed!" });
        },
      );

      this.showSuccess(
        "Project validation completed! Check terminal for results.",
      );
    } catch (error) {
      this.showError(`Failed to validate project: ${error}`);
    }
  }
}
