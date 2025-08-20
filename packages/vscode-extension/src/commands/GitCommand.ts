import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";
import { t } from "@stackcode/i18n";

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

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.git.creating_branch", {
            branchName: `${branchType.label}/${branchName}`,
          }),
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: t("vscode.git.switching_to_develop"),
          });

          const command = `npx @stackcode/cli git start ${branchName} --type=${branchType.label}`;

          progress.report({
            increment: 50,
            message: t("vscode.git.creating_new_branch"),
          });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: t("vscode.git.branch_created_successfully"),
          });
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
        } catch {
          // Fallback to generic message
        }
      }

      const confirm = await this.confirmAction(
        t("vscode.git.are_you_sure_finish_branch", { currentBranch }),
        t("vscode.git.finish_branch"),
      );

      if (!confirm) {
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: t("vscode.git.finishing_branch", {
            branchName: currentBranch,
          }),
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({
            increment: 0,
            message: t("vscode.git.pushing_branch"),
          });

          const command = `npx @stackcode/cli git finish`;

          progress.report({
            increment: 50,
            message: t("vscode.git.opening_pr"),
          });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: t("vscode.git.branch_finished_successfully"),
          });
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
