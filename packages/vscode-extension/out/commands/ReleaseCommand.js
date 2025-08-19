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
const i18n_1 = require("@stackcode/i18n");
class ReleaseCommand extends BaseCommand_1.BaseCommand {
    async execute() {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
                return;
            }
            const confirm = await this.confirmAction((0, i18n_1.t)("vscode.release.are_you_sure_create_release"), (0, i18n_1.t)("vscode.release.create_release"));
            if (!confirm) {
                return;
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: (0, i18n_1.t)("vscode.release.creating_release"),
                cancellable: false,
            }, async (progress) => {
                progress.report({ increment: 0, message: (0, i18n_1.t)("vscode.release.preparing_release") });
                // Use StackCode CLI for release
                const command = `npx @stackcode/cli release`;
                progress.report({ increment: 50, message: (0, i18n_1.t)("vscode.release.creating_release_message") });
                await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
                progress.report({ increment: 100, message: (0, i18n_1.t)("vscode.release.release_created") });
            });
            this.showSuccess((0, i18n_1.t)("vscode.release.release_process_started"));
        }
        catch (error) {
            this.showError((0, i18n_1.t)("vscode.release.failed_create_release", { error: String(error) }));
        }
    }
}
exports.ReleaseCommand = ReleaseCommand;
//# sourceMappingURL=ReleaseCommand.js.map