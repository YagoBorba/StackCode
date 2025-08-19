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
exports.ValidateCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
const i18n_1 = require("@stackcode/i18n");
class ValidateCommand extends BaseCommand_1.BaseCommand {
    async execute() {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
                return;
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: (0, i18n_1.t)("vscode.validate.validating_project_structure"),
                cancellable: false,
            }, async (progress) => {
                progress.report({
                    increment: 0,
                    message: (0, i18n_1.t)("vscode.validate.running_validation"),
                });
                // Use StackCode CLI for validation
                const command = `npx @stackcode/cli validate`;
                progress.report({
                    increment: 50,
                    message: (0, i18n_1.t)("vscode.validate.checking_project_structure"),
                });
                await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
                progress.report({
                    increment: 100,
                    message: (0, i18n_1.t)("vscode.validate.validation_completed"),
                });
            });
            this.showSuccess((0, i18n_1.t)("vscode.validate.project_validation_completed"));
        }
        catch (error) {
            this.showError((0, i18n_1.t)("vscode.validate.failed_validate_project", { error: String(error) }));
        }
    }
}
exports.ValidateCommand = ValidateCommand;
//# sourceMappingURL=ValidateCommand.js.map