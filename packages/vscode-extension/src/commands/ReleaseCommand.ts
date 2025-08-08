import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";

export class ReleaseCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError("No workspace folder found");
        return;
      }

      const confirm = await this.confirmAction(
        "Are you sure you want to create a new release? This will tag the current commit and publish the release.",
        "Create Release",
      );

      if (!confirm) {
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Creating release",
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({ increment: 0, message: "Preparing release..." });

          // Use StackCode CLI for release
          const command = `npx @stackcode/cli release`;

          progress.report({ increment: 50, message: "Creating release..." });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({ increment: 100, message: "Release created!" });
        },
      );

      this.showSuccess("Release process started! Check terminal for progress.");
    } catch (error) {
      this.showError(`Failed to create release: ${error}`);
    }
  }
}
