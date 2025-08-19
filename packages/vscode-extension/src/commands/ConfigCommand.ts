import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { t } from "@stackcode/i18n";

export class ConfigCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      const action = await vscode.window.showQuickPick(
        [
          {
            label: t("vscode.config.open_stackcode_settings"),
            description: t("vscode.config.open_stackcode_settings_description"),
          },
          {
            label: t("vscode.config.open_project_config"),
            description: t("vscode.config.open_project_config_description"),
          },
          {
            label: t("vscode.config.create_project_config"),
            description: t("vscode.config.create_project_config_description"),
          },
        ],
        {
          placeHolder: t("vscode.config.what_would_you_like_configure"),
        },
      );

      if (!action) {
        return;
      }

      if (action.label === t("vscode.config.open_stackcode_settings")) {
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "stackcode",
        );
      } else if (action.label === t("vscode.config.open_project_config")) {
        const configPath = vscode.Uri.joinPath(
          workspaceFolder.uri,
          ".stackcoderc.json",
        );
        try {
          const document = await vscode.workspace.openTextDocument(configPath);
          await vscode.window.showTextDocument(document);
        } catch {
          this.showError(t("vscode.config.stackcoderc_not_found"));
        }
      } else if (action.label === t("vscode.config.create_project_config")) {
        // Use StackCode CLI for config creation
        const command = `npx @stackcode/cli config init`;
        await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
        this.showSuccess(t("vscode.config.project_configuration_initialized"));
      }
    } catch (error) {
      this.showError(
        t("vscode.config.failed_open_configuration", { error: String(error) }),
      );
    }
  }
}
