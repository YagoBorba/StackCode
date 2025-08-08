"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
class ReleaseCommand extends BaseCommand_1.BaseCommand {
    async execute() {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError('No workspace folder found');
                return;
            }
            const confirm = await this.confirmAction('Are you sure you want to create a new release? This will tag the current commit and publish the release.', 'Create Release');
            if (!confirm) {
                return;
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Creating release',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: 'Preparing release...' });
                // Use StackCode CLI for release
                const command = `npx @stackcode/cli release`;
                progress.report({ increment: 50, message: 'Creating release...' });
                await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
                progress.report({ increment: 100, message: 'Release created!' });
            });
            this.showSuccess('Release process started! Check terminal for progress.');
        }
        catch (error) {
            this.showError(`Failed to create release: ${error}`);
        }
    }
}
exports.ReleaseCommand = ReleaseCommand;
//# sourceMappingURL=ReleaseCommand.js.map