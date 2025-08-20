import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";
import { t } from "@stackcode/i18n";

export class ValidateCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.validate.validating_project_structure"),
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: t("vscode.validate.running_validation"),
          });

          const command = `npx @stackcode/cli validate`;

          progress.report({
            increment: 50,
            message: t("vscode.validate.checking_project_structure"),
          });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: t("vscode.validate.validation_completed"),
          });
        },
      );

      this.showSuccess(t("vscode.validate.project_validation_completed"));
    } catch (error) {
      this.showError(
        t("vscode.validate.failed_validate_project", { error: String(error) }),
      );
    }
  }
}
