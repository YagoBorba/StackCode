import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { t } from "@stackcode/i18n";
import {
  runProjectValidateWorkflow,
  type ProjectValidateIssue,
} from "@stackcode/core";

export class ValidateCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      let resultIssues: ProjectValidateIssue[] = [];

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.validate.validating_project_structure"),
          cancellable: false,
        },
        async (
          progress: vscode.Progress<{ message?: string; increment?: number }>,
        ) => {
          progress.report({
            increment: 0,
            message: t("vscode.validate.running_validation"),
          });
          const res = await runProjectValidateWorkflow(
            { projectPath: workspaceFolder.uri.fsPath },
            {
              onProgress: (p) => {
                if (p.step === "checkingFiles") {
                  progress.report({
                    increment: 50,
                    message: t("vscode.validate.checking_project_structure"),
                  });
                }
              },
            },
          );
          resultIssues = res.issues;
          progress.report({
            increment: 100,
            message: t("vscode.validate.validation_completed"),
          });
        },
      );

      if (!resultIssues.length) {
        await this.showSuccess(
          t("vscode.validate.project_validation_completed"),
        );
        return;
      }

      // Show a summary of issues
      const summary = resultIssues
        .map((i) => `• ${t(i.messageKey)}`)
        .join("\n");
      await this.showWarning(
        t("vscode.validate.issues_summary", { count: String(resultIssues.length) }) +
          "\n" +
          summary,
      );

      // Offer to generate missing files if applicable
      const missingFiles: string[] = [];
      const hasMissingReadme = resultIssues.some(
        (i) => i.id === "missing-readme",
      );
      const hasMissingGitignore = resultIssues.some(
        (i) => i.id === "missing-gitignore",
      );

      if (hasMissingReadme) missingFiles.push("README.md");
      if (hasMissingGitignore) missingFiles.push(".gitignore");

      if (missingFiles.length > 0) {
        const action = await vscode.window.showInformationMessage(
          t("vscode.common.project_missing_files", {
            missingFiles: missingFiles.join(", "),
          }),
          t("vscode.common.generate_files"),
          t("vscode.common.not_now"),
        );
        if (action === t("vscode.common.generate_files")) {
          if (hasMissingReadme) {
            await vscode.commands.executeCommand("stackcode.generate.readme");
          }
          if (hasMissingGitignore) {
            await vscode.commands.executeCommand(
              "stackcode.generate.gitignore",
            );
          }
        }
      }
    } catch (error) {
      this.showError(
        t("vscode.validate.failed_validate_project", { error: String(error) }),
      );
    }
  }

  async validateCommitMessage(): Promise<void> {
    try {
      const message = await vscode.window.showInputBox({
        prompt: t("vscode.validate.enter_commit_message"),
        placeHolder: "feat: add new feature",
        validateInput: (value: string) =>
          !value ? t("ui.short_description_required") : null,
      });

      if (!message) return;

      const { isValid } = await import("@stackcode/core").then((m) =>
        m.runValidateWorkflow({ message }),
      );

      if (isValid) {
        await this.showSuccess(t("validate.success"));
      } else {
        await this.showWarning(t("validate.error_invalid"));
      }
    } catch (error) {
      this.showError(
        t("vscode.validate.failed_validate_project", { error: String(error) }),
      );
    }
  }
}
