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
exports.GitCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
const i18n_1 = require("@stackcode/i18n");
class GitCommand extends BaseCommand_1.BaseCommand {
    async execute() {
        const action = await vscode.window.showQuickPick([
            { label: "start", description: (0, i18n_1.t)("vscode.git.start_description") },
            { label: "finish", description: (0, i18n_1.t)("vscode.git.finish_description") },
        ], {
            placeHolder: (0, i18n_1.t)("vscode.git.select_git_action"),
        });
        if (!action) {
            return;
        }
        if (action.label === "start") {
            await this.startBranch();
        }
        else if (action.label === "finish") {
            await this.finishBranch();
        }
    }
    async startBranch() {
        try {
            const branchName = await vscode.window.showInputBox({
                prompt: (0, i18n_1.t)("vscode.git.enter_branch_name"),
                placeHolder: (0, i18n_1.t)("vscode.git.new_feature"),
                validateInput: (value) => {
                    if (!value) {
                        return (0, i18n_1.t)("vscode.git.branch_name_required");
                    }
                    if (!/^[a-zA-Z0-9/_-]+$/.test(value)) {
                        return (0, i18n_1.t)("vscode.git.branch_name_invalid");
                    }
                    return null;
                },
            });
            if (!branchName) {
                return;
            }
            const branchType = await vscode.window.showQuickPick([
                {
                    label: "feature",
                    description: (0, i18n_1.t)("vscode.git.feature_description"),
                },
                { label: "bugfix", description: (0, i18n_1.t)("vscode.git.bugfix_description") },
                { label: "hotfix", description: (0, i18n_1.t)("vscode.git.hotfix_description") },
                { label: "chore", description: (0, i18n_1.t)("vscode.git.chore_description") },
            ], {
                placeHolder: (0, i18n_1.t)("vscode.git.select_branch_type"),
            });
            if (!branchType) {
                return;
            }
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
                return;
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: (0, i18n_1.t)("vscode.git.creating_branch", {
                    branchName: `${branchType.label}/${branchName}`,
                }),
                cancellable: false,
            }, async (progress) => {
                progress.report({
                    increment: 0,
                    message: (0, i18n_1.t)("vscode.git.switching_to_develop"),
                });
                const command = `npx @stackcode/cli git start ${branchName} --type=${branchType.label}`;
                progress.report({
                    increment: 50,
                    message: (0, i18n_1.t)("vscode.git.creating_new_branch"),
                });
                await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
                progress.report({
                    increment: 100,
                    message: (0, i18n_1.t)("vscode.git.branch_created_successfully"),
                });
            });
            this.showSuccess((0, i18n_1.t)("vscode.git.new_branch_created", {
                branchName: `${branchType.label}/${branchName}`,
            }));
        }
        catch (error) {
            this.showError((0, i18n_1.t)("vscode.git.failed_create_branch", { error: String(error) }));
        }
    }
    async finishBranch() {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
                return;
            }
            const gitExtension = vscode.extensions.getExtension("vscode.git");
            let currentBranch = "current branch";
            if (gitExtension && gitExtension.isActive) {
                try {
                    const git = gitExtension.exports;
                    const api = git.getAPI(1);
                    const repo = api.repositories[0];
                    if (repo && repo.state.HEAD) {
                        currentBranch = repo.state.HEAD.name || "current branch";
                    }
                }
                catch {
                    // Fallback to generic message
                }
            }
            const confirm = await this.confirmAction((0, i18n_1.t)("vscode.git.are_you_sure_finish_branch", { currentBranch }), (0, i18n_1.t)("vscode.git.finish_branch"));
            if (!confirm) {
                return;
            }
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: (0, i18n_1.t)("vscode.git.finishing_branch", {
                    branchName: currentBranch,
                }),
                cancellable: false,
            }, async (progress) => {
                progress.report({
                    increment: 0,
                    message: (0, i18n_1.t)("vscode.git.pushing_branch"),
                });
                const command = `npx @stackcode/cli git finish`;
                progress.report({
                    increment: 50,
                    message: (0, i18n_1.t)("vscode.git.opening_pr"),
                });
                await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
                progress.report({
                    increment: 100,
                    message: (0, i18n_1.t)("vscode.git.branch_finished_successfully"),
                });
            });
            this.showSuccess((0, i18n_1.t)("vscode.git.branch_has_been_finished", { currentBranch }));
        }
        catch (error) {
            this.showError((0, i18n_1.t)("vscode.git.failed_finish_branch", { error: String(error) }));
        }
    }
}
exports.GitCommand = GitCommand;
//# sourceMappingURL=GitCommand.js.map