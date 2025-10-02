import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { t } from "@stackcode/i18n";
import { runGitStartWorkflow, runGitFinishWorkflow } from "@stackcode/core";

export class GitCommand extends BaseCommand {
  async execute(): Promise<void> {
    const action = await vscode.window.showQuickPick(
      [
        { label: "start", description: t("vscode.git.start_description") },
        { label: "finish", description: t("vscode.git.finish_description") },
      ],
      {
        placeHolder: t("vscode.git.select_git_action"),
      },
    );

    if (!action) {
      return;
    }

    if (action.label === "start") {
      await this.startBranch();
    } else if (action.label === "finish") {
      await this.finishBranch();
    }
  }

  async startBranch(): Promise<void> {
    try {
      const branchName = await vscode.window.showInputBox({
        prompt: t("vscode.git.enter_branch_name"),
        placeHolder: t("vscode.git.new_feature"),
        validateInput: (value: string) => {
          if (!value) {
            return t("vscode.git.branch_name_required");
          }
          if (!/^[a-zA-Z0-9/_-]+$/.test(value)) {
            return t("vscode.git.branch_name_invalid");
          }
          return null;
        },
      });

      if (!branchName) {
        return;
      }

      const branchType = await vscode.window.showQuickPick(
        [
          {
            label: "feature",
            description: t("vscode.git.feature_description"),
          },
          { label: "bugfix", description: t("vscode.git.bugfix_description") },
          { label: "hotfix", description: t("vscode.git.hotfix_description") },
          { label: "chore", description: t("vscode.git.chore_description") },
        ],
        {
          placeHolder: t("vscode.git.select_branch_type"),
        },
      );

      if (!branchType) {
        return;
      }

      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.git.creating_branch", {
            branchName: `${branchType.label}/${branchName}`,
          }),
          cancellable: false,
        },
        async (
          progress: vscode.Progress<{ message?: string; increment?: number }>,
        ) => {
          const result = await runGitStartWorkflow(
            {
              cwd: workspaceFolder.uri.fsPath,
              branchName,
              branchType: branchType.label,
            },
            {
              onProgress: (
                step: import("@stackcode/core").GitStartWorkflowProgress,
              ) => {
                switch (step.step) {
                  case "switchingBase":
                    progress.report({
                      increment: 10,
                      message: t("vscode.git.switching_to_develop"),
                    });
                    break;
                  case "pullingBase":
                    progress.report({
                      increment: 50,
                      message: t("vscode.git.pulling_latest_changes"),
                    });
                    break;
                  case "creatingBranch":
                    progress.report({
                      increment: 80,
                      message: t("vscode.git.creating_new_branch"),
                    });
                    break;
                  case "completed":
                    progress.report({
                      increment: 100,
                      message: t("vscode.git.branch_created_successfully"),
                    });
                    break;
                }
              },
            },
          );

          if (result.status !== "created") {
            throw new Error(result.error ?? t("vscode.common.unknown_error"));
          }
        },
      );

      this.showSuccess(
        t("vscode.git.new_branch_created", {
          branchName: `${branchType.label}/${branchName}`,
        }),
      );
    } catch (error) {
      this.showError(
        t("vscode.git.failed_create_branch", { error: String(error) }),
      );
    }
  }

  async finishBranch(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError(t("vscode.common.no_workspace_folder"));
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
        } catch (error) {
          console.warn("Git API unavailable:", error);
        }
      }

      const confirm = await this.confirmAction(
        t("vscode.git.are_you_sure_finish_branch", { currentBranch }),
        t("vscode.git.finish_branch"),
      );

      if (!confirm) {
        return;
      }
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.git.finishing_branch", {
            branchName: currentBranch,
          }),
          cancellable: false,
        },
        async (
          progress: vscode.Progress<{ message?: string; increment?: number }>,
        ) => {
          const result = await runGitFinishWorkflow(
            { cwd: workspaceFolder.uri.fsPath },
            {
              onProgress: (
                step: import("@stackcode/core").GitFinishWorkflowProgress,
              ) => {
                switch (step.step) {
                  case "pushing":
                    progress.report({
                      increment: 30,
                      message: t("vscode.git.pushing_branch"),
                    });
                    break;
                  case "computingPrUrl":
                    progress.report({
                      increment: 70,
                      message: t("vscode.git.opening_pr"),
                    });
                    break;
                  case "completed":
                    progress.report({
                      increment: 100,
                      message: t("vscode.git.branch_finished_successfully"),
                    });
                    break;
                }
              },
            },
          );

          if (result.status !== "pushed" || !result.prUrl || !result.branch) {
            const errorMessage =
              result.error === "not-on-branch"
                ? t("vscode.git.branch_name_required")
                : (result.error ?? t("vscode.common.unknown_error"));
            throw new Error(errorMessage);
          }

          await vscode.env.openExternal(vscode.Uri.parse(result.prUrl));
          currentBranch = result.branch;
        },
      );

      this.showSuccess(
        t("vscode.git.branch_has_been_finished", { currentBranch }),
      );
    } catch (error) {
      this.showError(
        t("vscode.git.failed_finish_branch", { error: String(error) }),
      );
    }
  }
}
