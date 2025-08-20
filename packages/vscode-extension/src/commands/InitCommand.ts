import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";
import { t } from "@stackcode/i18n";
import * as path from "path";

export class InitCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const projectName = await vscode.window.showInputBox({
        prompt: t("vscode.init.enter_project_name"),
        placeHolder: t("vscode.init.my_awesome_project"),
        validateInput: (value: string) => {
          if (!value) {
            return t("vscode.init.project_name_required");
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
            return t("vscode.init.project_name_invalid");
          }
          return null;
        },
      });

      if (!projectName) {
        return;
      }

      const description = await vscode.window.showInputBox({
        prompt: t("vscode.init.enter_project_description"),
        placeHolder: t("vscode.init.brief_description"),
      });

      const authorName = await vscode.window.showInputBox({
        prompt: t("vscode.init.enter_author_name"),
        placeHolder: t("vscode.init.your_name"),
        value: await this.getGitUserName(),
      });

      const stack = await vscode.window.showQuickPick(
        [
          { label: "node-ts", description: t("vscode.init.stacks.node_ts") },
          { label: "react", description: t("vscode.init.stacks.react") },
          { label: "vue", description: t("vscode.init.stacks.vue") },
          { label: "angular", description: t("vscode.init.stacks.angular") },
          { label: "python", description: t("vscode.init.stacks.python") },
          { label: "java", description: t("vscode.init.stacks.java") },
          { label: "go", description: t("vscode.init.stacks.go") },
          { label: "php", description: t("vscode.init.stacks.php") },
        ],
        {
          placeHolder: t("vscode.init.select_project_stack"),
        },
      );

      if (!stack) {
        return;
      }

      const workspaceFolder = this.getCurrentWorkspaceFolder();
      let projectPath: string;

      if (workspaceFolder) {
        projectPath = path.join(workspaceFolder.uri.fsPath, projectName);
      } else {
        const folderUris = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          openLabel: t("vscode.init.select_project_location"),
        });

        if (!folderUris || folderUris.length === 0) {
          return;
        }

        projectPath = path.join(folderUris[0].fsPath, projectName);
      }

      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(projectPath));
        const overwrite = await this.confirmAction(
          t("vscode.init.directory_exists_overwrite", { projectName }),
          t("vscode.init.overwrite"),
        );
        if (!overwrite) {
          return;
        }
      } catch {
        // Directory doesn't exist, which is fine
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.init.initializing_project", { projectName }),
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: t("vscode.init.setting_up_structure"),
          });

          const command = `npx @stackcode/cli init --name="${projectName}" --description="${description}" --author="${authorName}" --stack="${stack.label}" --path="${projectPath}"`;

          progress.report({
            increment: 50,
            message: t("vscode.init.running_stackcode_cli"),
          });

          await this.runTerminalCommand(command);

          progress.report({
            increment: 100,
            message: t("vscode.init.project_initialized_successfully"),
          });
        },
      );

      const openProject = await vscode.window.showInformationMessage(
        t("vscode.init.project_created_successfully", { projectName }),
        t("vscode.init.open_project"),
        t("vscode.init.later"),
      );

      if (openProject === t("vscode.init.open_project")) {
        const uri = vscode.Uri.file(projectPath);
        await vscode.commands.executeCommand("vscode.openFolder", uri, true);
      }
    } catch (error) {
      this.showError(
        t("vscode.init.failed_initialize_project", { error: String(error) }),
      );
    }
  }

  private async getGitUserName(): Promise<string> {
    try {
      const terminal = vscode.window.createTerminal({ name: "temp" });
      terminal.sendText("git config user.name");
      terminal.dispose();
      return "";
    } catch {
      return "";
    }
  }
}
