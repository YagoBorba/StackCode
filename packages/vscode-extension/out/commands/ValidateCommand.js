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
const core_1 = require("@stackcode/core");
class ValidateCommand extends BaseCommand_1.BaseCommand {
    async execute() {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
                return;
            }
            let resultIssues = [];
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: (0, i18n_1.t)("vscode.validate.validating_project_structure"),
                cancellable: false,
            }, async (progress) => {
                progress.report({
                    increment: 0,
                    message: (0, i18n_1.t)("vscode.validate.running_validation"),
                });
                const res = await (0, core_1.runProjectValidateWorkflow)({ projectPath: workspaceFolder.uri.fsPath }, {
                    onProgress: (p) => {
                        if (p.step === "checkingFiles") {
                            progress.report({
                                increment: 50,
                                message: (0, i18n_1.t)("vscode.validate.checking_project_structure"),
                            });
                        }
                    },
                });
                resultIssues = res.issues;
                progress.report({
                    increment: 100,
                    message: (0, i18n_1.t)("vscode.validate.validation_completed"),
                });
            });
            if (!resultIssues.length) {
                await this.showSuccess((0, i18n_1.t)("vscode.validate.project_validation_completed"));
                return;
            }
            const summary = resultIssues
                .map((i) => `• ${(0, i18n_1.t)(i.messageKey)}`)
                .join("\n");
            await this.showWarning((0, i18n_1.t)("vscode.validate.issues_summary", {
                count: String(resultIssues.length),
            }) +
                "\n" +
                summary);
            const missingFiles = [];
            const hasMissingReadme = resultIssues.some((i) => i.id === "missing-readme");
            const hasMissingGitignore = resultIssues.some((i) => i.id === "missing-gitignore");
            if (hasMissingReadme)
                missingFiles.push("README.md");
            if (hasMissingGitignore)
                missingFiles.push(".gitignore");
            if (missingFiles.length > 0) {
                const action = await vscode.window.showInformationMessage((0, i18n_1.t)("vscode.common.project_missing_files", {
                    missingFiles: missingFiles.join(", "),
                }), (0, i18n_1.t)("vscode.common.generate_files"), (0, i18n_1.t)("vscode.common.not_now"));
                if (action === (0, i18n_1.t)("vscode.common.generate_files")) {
                    if (hasMissingReadme) {
                        await vscode.commands.executeCommand("stackcode.generate.readme");
                    }
                    if (hasMissingGitignore) {
                        await vscode.commands.executeCommand("stackcode.generate.gitignore");
                    }
                }
            }
        }
        catch (error) {
            this.showError((0, i18n_1.t)("vscode.validate.failed_validate_project", { error: String(error) }));
        }
    }
    async validateCommitMessage() {
        try {
            const message = await vscode.window.showInputBox({
                prompt: (0, i18n_1.t)("vscode.validate.enter_commit_message"),
                placeHolder: "feat: add new feature",
                validateInput: (value) => !value ? (0, i18n_1.t)("ui.short_description_required") : null,
            });
            if (!message)
                return;
            const { isValid } = await Promise.resolve().then(() => __importStar(require("@stackcode/core"))).then((m) => m.runValidateWorkflow({ message }));
            if (isValid) {
                await this.showSuccess((0, i18n_1.t)("validate.success"));
            }
            else {
                await this.showWarning((0, i18n_1.t)("validate.error_invalid"));
            }
        }
        catch (error) {
            this.showError((0, i18n_1.t)("vscode.validate.failed_validate_project", { error: String(error) }));
        }
    }
}
exports.ValidateCommand = ValidateCommand;
//# sourceMappingURL=ValidateCommand.js.map