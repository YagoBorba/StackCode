import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { t } from "@stackcode/i18n";
import { saveStackCodeConfig, type StackCodeConfig } from "@stackcode/core";

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
        await this.createProjectConfig(workspaceFolder);
      }
    } catch (error) {
      this.showError(
        t("vscode.config.failed_open_configuration", { error: String(error) }),
      );
    }
  }

  private async createProjectConfig(
    workspaceFolder: vscode.WorkspaceFolder,
  ): Promise<void> {
    try {
      const configUri = vscode.Uri.joinPath(
        workspaceFolder.uri,
        ".stackcoderc.json",
      );

      try {
        await vscode.workspace.fs.stat(configUri);
        const overwrite = await this.confirmAction(
          t("vscode.config.stackcoderc_exists_overwrite"),
          t("vscode.config.overwrite"),
          t("common.cancel"),
        );
        if (!overwrite) {
          return;
        }
      } catch (error) {
        console.warn("Failed to read existing config:", error);
      }

      const defaultConfig: StackCodeConfig = {
        stack: undefined,
        features: {
          commitValidation: false,
          husky: false,
          docker: false,
        },
      };

      await saveStackCodeConfig(workspaceFolder.uri.fsPath, defaultConfig);

      const document = await vscode.workspace.openTextDocument(configUri);
      await vscode.window.showTextDocument(document);
      await this.showSuccess(
        t("vscode.config.project_configuration_initialized"),
      );
    } catch (error) {
      await this.showError(
        t("vscode.config.failed_create_config", { error: String(error) }),
      );
    }
  }
}
