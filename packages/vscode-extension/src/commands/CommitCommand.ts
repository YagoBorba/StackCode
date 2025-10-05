import * as vscode from "vscode";
import {
  runCommitWorkflow,
  runIssuesWorkflow,
  type CommitWorkflowStep,
  type GitHubIssue,
} from "@stackcode/core";
import { t } from "@stackcode/i18n";
import { BaseCommand } from "./BaseCommand";
import { GitHubAuthService } from "../services/GitHubAuthService";
import { GitMonitor } from "../monitors/GitMonitor";
import { ProgressManager } from "../services/ProgressManager";
import { AuthFlowManager } from "../services/AuthFlowManager";

interface CommitTypeQuickPickItem extends vscode.QuickPickItem {
  value: string;
}

/**
 * Handles Conventional Commit workflow in VS Code.
 * Prompts for commit details, links GitHub issues, and integrates progress feedback.
 * 
 * Requires GitHub authentication to link issues.
 */
export class CommitCommand extends BaseCommand {
  private readonly authService: GitHubAuthService;
  private readonly gitMonitor: GitMonitor;
  private readonly progressManager: ProgressManager;
  private readonly authFlowManager: AuthFlowManager;
  private outputChannel?: vscode.OutputChannel;

  constructor(
    authService: GitHubAuthService,
    gitMonitor: GitMonitor,
    progressManager: ProgressManager,
    context: vscode.ExtensionContext,
  ) {
    super();
    this.authService = authService;
    this.gitMonitor = gitMonitor;
    this.progressManager = progressManager;
    this.authFlowManager = new AuthFlowManager(authService, context);
  }

  public async execute(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        await this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      // Ensure authenticated for commit workflow
      const authResult = await this.authFlowManager.ensureAuthenticated(
        "To create commits with issue linking, StackCode needs GitHub access.\n\n" +
          "This allows:\n" +
          "• 📝 Link commits to GitHub issues\n" +
          "• ✅ Auto-close issues with keywords\n" +
          "• 📊 Track commit activity",
      );

      if (!authResult.authenticated) {
        // User can still commit without auth, but won't have issue linking
        const continueWithoutAuth = await vscode.window.showWarningMessage(
          "⚠️ Continue without GitHub?\n\n" +
            "You can still create commits, but issue linking won't be available.",
          { modal: true },
          "Continue",
          "Cancel",
        );

        if (continueWithoutAuth !== "Continue") {
          return;
        }
      }

      const commitType = await this.selectCommitType();
      if (!commitType) {
        return;
      }

      const scope = await vscode.window.showInputBox({
        prompt: this.translate("commit.prompt.scope", "Scope (optional)"),
        placeHolder: this.translate("commit.prompt.scope", "Scope (optional)"),
      });

      const shortDescription = await this.promptRequiredText(
        this.translate(
          "commit.prompt.short_description",
          "Write a short, imperative description of the change",
        ),
        this.translate(
          "commit.prompt.short_description",
          "Write a short, imperative description of the change",
        ),
      );
      if (!shortDescription) {
        return;
      }

      const longDescription = await vscode.window.showInputBox({
        prompt: this.translate(
          "commit.prompt.long_description",
          "Provide a longer description (optional)",
        ),
        placeHolder: this.translate(
          "commit.prompt.long_description",
          "Provide a longer description (optional)",
        ),
        value: "",
      });

      const breakingChanges = await vscode.window.showInputBox({
        prompt: this.translate(
          "commit.prompt.breaking_changes",
          "Describe BREAKING CHANGES (optional)",
        ),
        placeHolder: this.translate(
          "commit.prompt.breaking_changes",
          "Describe BREAKING CHANGES (optional)",
        ),
      });

      const issueReferences = await this.resolveIssueReferences();

      this.progressManager.startWorkflow("commit");

      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: this.translate(
            "commit.command_description",
            "Prepare a conventional commit",
          ),
          cancellable: false,
        },
        async (progress) => {
          this.progressManager.setVSCodeProgressReporter(progress);
          return runCommitWorkflow(
            {
              cwd: workspaceFolder.uri.fsPath,
              type: commitType,
              scope: scope || undefined,
              shortDescription,
              longDescription: longDescription || undefined,
              breakingChanges: breakingChanges || undefined,
              affectedIssues: issueReferences || undefined,
            },
            {
              onProgress: (
                workflowProgress: import("@stackcode/core").CommitWorkflowProgress,
              ) => {
                this.reportCommitProgress(workflowProgress.step, progress);
                this.progressManager.reportProgress(
                  "commit",
                  workflowProgress.step,
                  workflowProgress.message,
                );
              },
            },
          );
        },
      );

      this.progressManager.clearVSCodeProgressReporter();

      if (result.status === "committed") {
        this.progressManager.completeWorkflow(
          "commit",
          "Commit created successfully",
        );
        this.appendCommitMessage(result.message ?? shortDescription);
        await this.showSuccess(t("commit.success"));
        return;
      }

      this.progressManager.failWorkflow(
        "commit",
        result.error || "Commit workflow cancelled",
      );

      if (result.reason === "no-staged-changes") {
        await this.showWarning(t("commit.error_no_changes_staged"));
        return;
      }

      const errorMessage =
        result.error ??
        this.translate("common.error_generic", "An error occurred.");
      await this.showError(errorMessage);
    } catch (error) {
      await this.showError(
        `${this.translate("common.error_generic", "An error occurred.")} ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Displays commit message output for user reference.
   * @param message - The final commit message created by the workflow.
   */
  private appendCommitMessage(message: string): void {
    const channel = this.ensureOutputChannel();
    channel.appendLine("―".repeat(60));
    channel.appendLine(
      `${new Date().toISOString()} - ${this.translate(
        "commit.output_channel_title",
        "Commit message",
      )}`,
    );
    channel.appendLine(message);
    channel.show(true);
  }

  /**
   * Prompts the user to select the Conventional Commit type.
   */
  private async selectCommitType(): Promise<string | undefined> {
    const items: CommitTypeQuickPickItem[] = [
      { label: this.translate("commit.types.feat", "feat"), value: "feat" },
      { label: this.translate("commit.types.fix", "fix"), value: "fix" },
      { label: this.translate("commit.types.docs", "docs"), value: "docs" },
      {
        label: this.translate("commit.types.style", "style"),
        value: "style",
      },
      {
        label: this.translate("commit.types.refactor", "refactor"),
        value: "refactor",
      },
      { label: this.translate("commit.types.perf", "perf"), value: "perf" },
      { label: this.translate("commit.types.test", "test"), value: "test" },
      {
        label: this.translate("commit.types.chore", "chore"),
        value: "chore",
      },
      {
        label: this.translate("commit.types.revert", "revert"),
        value: "revert",
      },
    ];

    const selection = await vscode.window.showQuickPick(items, {
      placeHolder: this.translate(
        "commit.prompt.select_type",
        "Select the type of change",
      ),
    });

    return selection?.value;
  }

  /**
   * Prompts the user for required text input, handling validation.
   * @param prompt - Prompt message to display.
   * @param placeHolder - Placeholder text for the input box.
   */
  private async promptRequiredText(
    prompt: string,
    placeHolder: string,
  ): Promise<string | undefined> {
    return vscode.window.showInputBox({
      prompt,
      placeHolder,
      validateInput: (value) =>
        value && value.trim().length > 0
          ? undefined
          : this.translate("common.error_generic", "This field is required."),
    });
  }

  /**
   * Resolves GitHub issues references, asking the user if they wish to link issues.
   * Now uses runIssuesWorkflow from @stackcode/core for centralized logic.
   */
  private async resolveIssueReferences(): Promise<string | undefined> {
    try {
      if (!this.authService.isAuthenticated) {
        return this.promptManualIssueReference();
      }

      const repository = await this.gitMonitor.getCurrentGitHubRepository();
      if (!repository) {
        return this.promptManualIssueReference();
      }

      const client = await this.authService.getAuthenticatedClient();

      const result = await runIssuesWorkflow({
        client,
        repository: {
          owner: repository.owner,
          repo: repository.repo,
          fullName: repository.fullName,
        },
        enableCache: true,
      });

      if (result.status === "error" || !result.issues.length) {
        return this.promptManualIssueReference();
      }

      const selections = await vscode.window.showQuickPick(
        result.issues.map((issue) => this.mapIssueToQuickPick(issue)),
        {
          canPickMany: true,
          placeHolder: this.translate(
            "commit.prompt.affected_issues",
            "Select issues to reference",
          ),
        },
      );

      if (!selections || selections.length === 0) {
        return this.promptManualIssueReference();
      }

      return selections
        .map((item) =>
          this.translate(
            "commit.issues.reference_entry",
            "closes #{issueNumber}",
            {
              issueNumber: item.issue.number,
            },
          ),
        )
        .join(", ");
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      await this.showWarning(
        `${this.translate(
          "github.issues.error_fetching",
          "Failed to fetch issues:",
        )} ${reason}`,
      );
      return this.promptManualIssueReference();
    }
  }

  /**
   * Prompts the user for manual issue references when GitHub integration is unavailable.
   */
  private async promptManualIssueReference(): Promise<string | undefined> {
    const manualValue = await vscode.window.showInputBox({
      prompt: this.translate(
        "commit.prompt.affected_issues",
        "Does this change affect any open issues?",
      ),
      placeHolder: this.translate(
        "commit.placeholder.issue_reference",
        "closes #123",
      ),
    });
    return manualValue?.trim() ? manualValue.trim() : undefined;
  }

  /**
   * Maps a GitHub issue to a VS Code quick pick item.
   */
  private mapIssueToQuickPick(issue: GitHubIssue): {
    label: string;
    description: string;
    issue: GitHubIssue;
  } {
    return {
      label: `#${issue.number} ${issue.title}`,
      description: issue.user?.login ?? "",
      issue,
    };
  }

  /**
   * Updates progress reporting messages according to the workflow step.
   */
  private reportCommitProgress(
    step: CommitWorkflowStep,
    progress: vscode.Progress<{ message?: string }>,
  ): void {
    const messages: Partial<Record<CommitWorkflowStep, string>> = {
      checkingStaged: this.translate(
        "commit.progress.checking_staged",
        "Checking staged changes...",
      ),
      buildingMessage: this.translate(
        "commit.progress.building_message",
        "Building commit message...",
      ),
      committing: this.translate(
        "commit.progress.committing",
        "Running git commit...",
      ),
      completed: this.translate(
        "commit.progress.completed",
        "Commit completed successfully.",
      ),
    };

    const message = messages[step];
    if (message) {
      progress.report({ message });
      this.ensureOutputChannel().appendLine(message);
    }
  }

  /**
   * Lazily creates and returns the output channel used for commit logs.
   */
  private ensureOutputChannel(): vscode.OutputChannel {
    if (!this.outputChannel) {
      this.outputChannel =
        vscode.window.createOutputChannel("StackCode Commit");
    }
    return this.outputChannel;
  }

  /**
   * Safely translates a key using i18n with a fallback string.
   */
  private translate(
    key: string,
    fallback: string,
    variables?: Record<string, string | number>,
  ): string {
    try {
      return variables ? t(key, variables) : t(key);
    } catch {
      if (!variables) return fallback;
      return Object.entries(variables).reduce(
        (acc, [varKey, value]) => acc.replace(`{${varKey}}`, String(value)),
        fallback,
      );
    }
  }
}
