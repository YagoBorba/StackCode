import { BaseCommand } from "./BaseCommand";

export class CommitCommand extends BaseCommand {
  async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError("No workspace folder found");
        return;
      }

      // Use StackCode CLI for commit
      const command = `npx @stackcode/cli commit`;

      await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

      this.showSuccess("Commit dialog opened in terminal!");
    } catch (error) {
      this.showError(`Failed to open commit dialog: ${error}`);
    }
  }
}
