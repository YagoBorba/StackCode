"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitCommand = void 0;
const BaseCommand_1 = require("./BaseCommand");
class CommitCommand extends BaseCommand_1.BaseCommand {
  async execute() {
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
exports.CommitCommand = CommitCommand;
//# sourceMappingURL=CommitCommand.js.map
