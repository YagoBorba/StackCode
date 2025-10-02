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
const core_1 = require("@stackcode/core");
const i18n_1 = require("@stackcode/i18n");
const BaseCommand_1 = require("./BaseCommand");
/**
 * Handles monorepo release workflow in VS Code.
 * Supports strategy detection, version management, and GitHub release creation.
 */
class ReleaseCommand extends BaseCommand_1.BaseCommand {
    constructor(authService, progressManager) {
        super();
        this.authService = authService;
        this.progressManager = progressManager;
    }
    async execute() {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                await this.showError((0, i18n_1.t)("vscode.common.no_workspace_folder"));
                return;
            }
            const shouldProceed = await this.confirmAction((0, i18n_1.t)("vscode.release.are_you_sure_create_release"), (0, i18n_1.t)("vscode.release.create_release"), (0, i18n_1.t)("common.cancel"));
            if (!shouldProceed) {
                return;
            }
            const cwd = workspaceFolder.uri.fsPath;
            this.progressManager.startWorkflow("release");
            const result = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: (0, i18n_1.t)("vscode.release.creating_release"),
                cancellable: false,
            }, async (progress) => {
                this.progressManager.setVSCodeProgressReporter(progress);
                const hooks = this.buildReleaseHooks(progress, cwd);
                return (0, core_1.runReleaseWorkflow)({ cwd }, hooks);
            });
            this.progressManager.clearVSCodeProgressReporter();
            if (result.status === "prepared") {
                this.progressManager.completeWorkflow("release", "Release prepared successfully");
            }
            else {
                this.progressManager.failWorkflow("release", result.error || "Release workflow cancelled");
            }
            await this.handleReleaseResult(result, cwd);
        }
        catch (error) {
            await this.showError(`${(0, i18n_1.t)("common.error_generic")} ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Builds workflow hooks translating progress events into VS Code feedback.
     */
    buildReleaseHooks(progress, cwd) {
        return {
            onProgress: (workflowProgress) => {
                this.reportReleaseProgress(workflowProgress, progress);
                this.progressManager.reportProgress("release", workflowProgress.step, workflowProgress.message);
            },
            confirmLockedRelease: ({ currentVersion, newVersion }) => this.confirmAction((0, i18n_1.t)("release.prompt_confirm_release", {
                currentVersion,
                newVersion,
            }), (0, i18n_1.t)("common.continue"), (0, i18n_1.t)("common.cancel")),
            displayIndependentPlan: (plan) => this.displayIndependentPlan(plan, cwd),
            confirmIndependentRelease: () => this.confirmAction((0, i18n_1.t)("release.independent_prompt_confirm"), (0, i18n_1.t)("common.continue"), (0, i18n_1.t)("common.cancel")),
        };
    }
    /**
     * Handles the final result returned by the release workflow.
     */
    async handleReleaseResult(result, cwd) {
        if (result.status === "cancelled") {
            await this.handleCancelledRelease(result);
            return;
        }
        const channel = this.ensureOutputChannel();
        channel.appendLine((0, i18n_1.t)("release.workflow_completed"));
        if (result.strategy === "locked") {
            await this.showSuccess((0, i18n_1.t)("release.success_ready_to_commit"));
            await this.showInfo((0, i18n_1.t)("release.next_steps_commit"));
        }
        else if (result.strategy === "independent") {
            await this.showSuccess((0, i18n_1.t)("release.independent_success"));
            await this.showInfo((0, i18n_1.t)("release.next_steps_push"));
        }
        if (result.releaseNotes) {
            channel.appendLine("―".repeat(60));
            channel.appendLine(result.releaseNotes);
            channel.show(true);
        }
        if (result.tagName && result.releaseNotes) {
            await this.promptForGitHubRelease({
                tagName: result.tagName,
                releaseNotes: result.releaseNotes,
                cwd,
                githubInfo: result.github,
            });
        }
    }
    /**
     * Handles workflow cancellations by surfacing the appropriate message.
     */
    async handleCancelledRelease(result) {
        switch (result.reason) {
            case "invalid-structure":
                await this.showError((0, i18n_1.t)("release.error_structure"));
                break;
            case "no-changes":
                await this.showSuccess((0, i18n_1.t)("release.independent_mode_no_changes"));
                break;
            case "no-bumps":
                await this.showWarning((0, i18n_1.t)("release.independent_mode_no_bumps"));
                break;
            case "cancelled-by-user":
                await this.showWarning((0, i18n_1.t)("common.operation_cancelled"));
                break;
            default:
                await this.showError(result.error ?? (0, i18n_1.t)("common.error_generic"));
        }
    }
    /**
     * Reports release workflow progress to the notification UI and output channel.
     */
    reportReleaseProgress(progress, notification) {
        const messages = {
            detectingStrategy: (0, i18n_1.t)("release.step_detecting_strategy"),
            lockedRecommendedBump: (0, i18n_1.t)("release.step_calculating_bump"),
            lockedUpdatingVersions: (0, i18n_1.t)("release.step_updating_versions"),
            lockedGeneratingChangelog: (0, i18n_1.t)("release.step_generating_changelog"),
            independentFindingChanges: (0, i18n_1.t)("release.independent_mode_start"),
            independentDeterminingBumps: (0, i18n_1.t)("release.step_determining_bumps"),
            independentPreparingPlan: (0, i18n_1.t)("release.independent_mode_preparing_plan"),
            independentUpdatingPackages: (0, i18n_1.t)("release.step_updating_version"),
            independentCommitting: (0, i18n_1.t)("release.step_committing_and_tagging"),
            completed: (0, i18n_1.t)("release.step_completed"),
        };
        const message = messages[progress.step];
        if (message) {
            notification.report({ message });
            this.ensureOutputChannel().appendLine(message);
        }
    }
    /**
     * Displays the independent release plan in the output channel.
     */
    async displayIndependentPlan(plan, cwd) {
        const channel = this.ensureOutputChannel();
        channel.show(true);
        channel.appendLine("―".repeat(60));
        channel.appendLine((0, i18n_1.t)("release.independent_mode_packages_to_update"));
        plan.forEach((pkg) => {
            channel.appendLine((0, i18n_1.t)("release.independent_plan_entry", {
                package: pkg.pkg.name,
                currentVersion: pkg.pkg.version ?? "?",
                newVersion: pkg.newVersion,
                bumpType: pkg.bumpType,
            }));
        });
        channel.appendLine("");
        channel.appendLine(`cwd: ${cwd}`);
    }
    /**
     * Prompts the user to create a GitHub release using the authenticated session.
     */
    async promptForGitHubRelease(params) {
        const choice = await vscode.window.showInformationMessage((0, i18n_1.t)("release.prompt_create_github_release"), (0, i18n_1.t)("common.yes"), (0, i18n_1.t)("common.no"));
        if (choice !== (0, i18n_1.t)("common.yes")) {
            return;
        }
        try {
            await this.ensureAuthenticated();
            const client = await this.authService.getAuthenticatedClient();
            const { owner, repo } = await this.resolveRepositoryInfo(params.cwd, params.githubInfo);
            await client.repos.createRelease({
                owner,
                repo,
                tag_name: params.tagName,
                name: `Release ${params.tagName}`,
                body: params.releaseNotes,
                prerelease: false,
            });
            await this.showSuccess((0, i18n_1.t)("release.success_github_release_created"));
        }
        catch (error) {
            await this.showError(`${(0, i18n_1.t)("common.error_generic")} ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Ensures the user is authenticated with GitHub, prompting login when required.
     */
    async ensureAuthenticated() {
        if (this.authService.isAuthenticated) {
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: (0, i18n_1.t)("github.auth.login"),
            cancellable: false,
        }, async () => {
            await this.authService.login();
        });
    }
    /**
     * Resolves repository owner and name from workflow data or git remotes.
     */
    async resolveRepositoryInfo(cwd, info) {
        if (info?.owner && info?.repo) {
            return { owner: info.owner, repo: info.repo };
        }
        const remoteUrl = await (0, core_1.getCommandOutput)("git", ["remote", "get-url", "origin"], {
            cwd,
        });
        const match = remoteUrl.match(/github\.com[/:]([\w-]+)\/([\w-.]+)/);
        if (!match) {
            throw new Error((0, i18n_1.t)("git.error_parsing_remote"));
        }
        return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    /**
     * Lazily creates the release output channel.
     */
    ensureOutputChannel() {
        if (!this.outputChannel) {
            this.outputChannel =
                vscode.window.createOutputChannel("StackCode Release");
        }
        return this.outputChannel;
    }
}
exports.ReleaseCommand = ReleaseCommand;
//# sourceMappingURL=ReleaseCommand.js.map