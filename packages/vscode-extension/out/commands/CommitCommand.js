"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitCommand = void 0;
const BaseCommand_1 = require("./BaseCommand");
const i18n_1 = require("@stackcode/i18n");
class CommitCommand extends BaseCommand_1.BaseCommand {
    async execute() {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
                return;
            }
            // Use StackCode CLI for commit
            const command = `npx @stackcode/cli commit`;
            await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
            this.showSuccess((0, i18n_1.t)("vscode.commit.commit_dialog_opened"));
        }
        catch (error) {
            this.showError((0, i18n_1.t)("vscode.commit.failed_open_commit_dialog", { error: String(error) }));
        }
    }
}
exports.CommitCommand = CommitCommand;
//# sourceMappingURL=CommitCommand.js.map