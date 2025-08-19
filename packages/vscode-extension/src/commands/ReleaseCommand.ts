import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";
import { t } from "@stackcode/i18n";

export class ReleaseCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      const confirm = await this.confirmAction(
        t("vscode.release.are_you_sure_create_release"),
        t("vscode.release.create_release"),
      );

      if (!confirm) {
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.release.creating_release"),
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({ increment: 0, message: t("vscode.release.preparing_release") });

          // Use StackCode CLI for release
          const command = `npx @stackcode/cli release`;

          progress.report({ increment: 50, message: t("vscode.release.creating_release_message") });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({ increment: 100, message: t("vscode.release.release_created") });
        },
      );

      this.showSuccess(t("vscode.release.release_process_started"));
    } catch (error) {
      this.showError(t("vscode.release.failed_create_release", { error: String(error) }));
    }
  }
}
