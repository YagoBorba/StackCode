import * as vscode from "vscode";
import {
  runReleaseWorkflow,
  type ReleaseWorkflowHooks,
  type ReleaseWorkflowProgress,
  type ReleaseWorkflowResult,
  type ReleaseWorkflowStep,
  type ReleaseWorkflowGitHubInfo,
  type PackageBumpInfo,
  getCommandOutput,
} from "@stackcode/core";
import { t } from "@stackcode/i18n";
import { BaseCommand } from "./BaseCommand";
import { GitHubAuthService } from "../services/GitHubAuthService";

/**
 * ReleaseCommand executes the monorepo release workflow directly within VS Code.
 * It mirrors the CLI behaviour, including strategy detection, independent release plans,
 * and optional GitHub release creation when authentication is available.
 */
export class ReleaseCommand extends BaseCommand {
  private readonly authService: GitHubAuthService;
  private outputChannel?: vscode.OutputChannel;

  constructor(authService: GitHubAuthService) {
    super();
    this.authService = authService;
  }

  /**
   * Runs the release workflow, confirming strategy-specific prompts and handling outcomes.
   */
  public async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        await this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      const shouldProceed = await this.confirmAction(
        t("vscode.release.are_you_sure_create_release"),
        t("vscode.release.create_release"),
        t("common.cancel"),
      );
      if (!shouldProceed) {
        return;
      }

      const cwd = workspaceFolder.uri.fsPath;
      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.release.creating_release"),
          cancellable: false,
        },
        async (progress) => {
          const hooks = this.buildReleaseHooks(progress, cwd);
          return runReleaseWorkflow({ cwd }, hooks);
        },
      );

      await this.handleReleaseResult(result, cwd);
    } catch (error) {
      await this.showError(
        `${t("common.error_generic")} ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Builds workflow hooks translating progress events into VS Code feedback.
   */
  private buildReleaseHooks(
    progress: vscode.Progress<{ message?: string }>,
    cwd: string,
  ): ReleaseWorkflowHooks {
    return {
      onProgress: (workflowProgress) =>
        this.reportReleaseProgress(workflowProgress, progress),
      confirmLockedRelease: ({ currentVersion, newVersion }) =>
        this.confirmAction(
          t("release.prompt_confirm_release", {
            currentVersion,
            newVersion,
          }),
          t("common.continue"),
          t("common.cancel"),
        ),
      displayIndependentPlan: (plan) => this.displayIndependentPlan(plan, cwd),
      confirmIndependentRelease: () =>
        this.confirmAction(
          t("release.independent_prompt_confirm"),
          t("common.continue"),
          t("common.cancel"),
        ),
    };
  }

  /**
   * Handles the final result returned by the release workflow.
   */
  private async handleReleaseResult(
    result: ReleaseWorkflowResult,
    cwd: string,
  ): Promise<void> {
    if (result.status === "cancelled") {
      await this.handleCancelledRelease(result);
      return;
    }

    const channel = this.ensureOutputChannel();
    channel.appendLine(t("release.workflow_completed"));

    if (result.strategy === "locked") {
      await this.showSuccess(t("release.success_ready_to_commit"));
      await this.showInfo(t("release.next_steps_commit"));
    } else if (result.strategy === "independent") {
      await this.showSuccess(t("release.independent_success"));
      await this.showInfo(t("release.next_steps_push"));
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
  private async handleCancelledRelease(
    result: ReleaseWorkflowResult,
  ): Promise<void> {
    switch (result.reason) {
      case "invalid-structure":
        await this.showError(t("release.error_structure"));
        break;
      case "no-changes":
        await this.showSuccess(t("release.independent_mode_no_changes"));
        break;
      case "no-bumps":
        await this.showWarning(t("release.independent_mode_no_bumps"));
        break;
      case "cancelled-by-user":
        await this.showWarning(t("common.operation_cancelled"));
        break;
      default:
        await this.showError(
          result.error ?? t("common.error_generic"),
        );
    }
  }

  /**
   * Reports release workflow progress to the notification UI and output channel.
   */
  private reportReleaseProgress(
    progress: ReleaseWorkflowProgress,
    notification: vscode.Progress<{ message?: string }>,
  ): void {
    const messages: Partial<Record<ReleaseWorkflowStep, string>> = {
      detectingStrategy: t("release.step_detecting_strategy"),
      lockedRecommendedBump: t("release.step_calculating_bump"),
      lockedUpdatingVersions: t("release.step_updating_versions"),
      lockedGeneratingChangelog: t("release.step_generating_changelog"),
      independentFindingChanges: t("release.independent_mode_start"),
      independentDeterminingBumps: t("release.step_determining_bumps"),
      independentPreparingPlan: t("release.independent_mode_preparing_plan"),
      independentUpdatingPackages: t("release.step_updating_version"),
      independentCommitting: t("release.step_committing_and_tagging"),
      completed: t("release.step_completed"),
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
  private async displayIndependentPlan(
    plan: PackageBumpInfo[],
    cwd: string,
  ): Promise<void> {
    const channel = this.ensureOutputChannel();
    channel.show(true);
    channel.appendLine("―".repeat(60));
    channel.appendLine(t("release.independent_mode_packages_to_update"));
    plan.forEach((pkg) => {
      channel.appendLine(
        t("release.independent_plan_entry", {
          package: pkg.pkg.name,
          currentVersion: pkg.pkg.version ?? "?",
          newVersion: pkg.newVersion,
          bumpType: pkg.bumpType,
        }),
      );
    });
    channel.appendLine("");
    channel.appendLine(`cwd: ${cwd}`);
  }

  /**
   * Prompts the user to create a GitHub release using the authenticated session.
   */
  private async promptForGitHubRelease(params: {
    tagName: string;
    releaseNotes: string;
    cwd: string;
    githubInfo?: ReleaseWorkflowGitHubInfo;
  }): Promise<void> {
    const choice = await vscode.window.showInformationMessage(
      t("release.prompt_create_github_release"),
      t("common.yes"),
      t("common.no"),
    );

    if (choice !== t("common.yes")) {
      return;
    }

    try {
      await this.ensureAuthenticated();
      const client = this.authService.getAuthenticatedClient();
      const { owner, repo } = await this.resolveRepositoryInfo(
        params.cwd,
        params.githubInfo,
      );

      await client.repos.createRelease({
        owner,
        repo,
        tag_name: params.tagName,
        name: `Release ${params.tagName}`,
        body: params.releaseNotes,
        prerelease: false,
      });

      await this.showSuccess(t("release.success_github_release_created"));
    } catch (error) {
      await this.showError(
        `${t("common.error_generic")} ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Ensures the user is authenticated with GitHub, prompting login when required.
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.authService.isAuthenticated) {
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: t("github.auth.login"),
        cancellable: false,
      },
      async () => {
        await this.authService.login();
      },
    );
  }

  /**
   * Resolves repository owner and name from workflow data or git remotes.
   */
  private async resolveRepositoryInfo(
    cwd: string,
    info?: ReleaseWorkflowGitHubInfo,
  ): Promise<{ owner: string; repo: string }> {
    if (info?.owner && info?.repo) {
      return { owner: info.owner, repo: info.repo };
    }

    const remoteUrl = await getCommandOutput("git", ["remote", "get-url", "origin"], {
      cwd,
    });
    const match = remoteUrl.match(/github\.com[/:]([\w-]+)\/([\w-.]+)/);
    if (!match) {
      throw new Error(t("git.error_parsing_remote"));
    }

    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }

  /**
   * Lazily creates the release output channel.
   */
  private ensureOutputChannel(): vscode.OutputChannel {
    if (!this.outputChannel) {
      this.outputChannel = vscode.window.createOutputChannel("StackCode Release");
    }
    return this.outputChannel;
  }
}
