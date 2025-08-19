import { BaseCommand } from "./BaseCommand";
import { t } from "@stackcode/i18n";

export class CommitCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      // Use StackCode CLI for commit
      const command = `npx @stackcode/cli commit`;

      await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

      this.showSuccess(t("vscode.commit.commit_dialog_opened"));
    } catch (error) {
      this.showError(t("vscode.commit.failed_open_commit_dialog", { error: String(error) }));
    }
  }
}
