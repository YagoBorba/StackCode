import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { ProgressCallback } from "../types";

export class GitCommand extends BaseCommand {
  async execute(): Promise<void> {
    const action = await vscode.window.showQuickPick(
      [
        { label: "start", description: "Start a new feature branch" },
        { label: "finish", description: "Finish current branch" },
      ],
      {
        placeHolder: "Select Git action",
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
        prompt: "Enter the name for the new branch",
        placeHolder: "new-feature",
        validateInput: (value) => {
          if (!value) {
            return "Branch name is required";
          }
          if (!/^[a-zA-Z0-9/_-]+$/.test(value)) {
            return "Branch name can only contain letters, numbers, hyphens, underscores and slashes";
          }
          return null;
        },
      });

      if (!branchName) {
        return;
      }

      const branchType = await vscode.window.showQuickPick(
        [
          { label: "feature", description: "A new feature branch" },
          { label: "bugfix", description: "A bug fix branch" },
          { label: "hotfix", description: "A hotfix branch" },
          { label: "release", description: "A release branch" },
        ],
        {
          placeHolder: "Select branch type",
        },
      );

      if (!branchType) {
        return;
      }

      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError("No workspace folder found");
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Creating ${branchType.label} branch: ${branchName}`,
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({ increment: 0, message: "Creating branch..." });

          // Use StackCode CLI for git operations
          const command = `npx @stackcode/cli git start ${branchName} --type=${branchType.label}`;

          progress.report({
            increment: 50,
            message: "Switching to new branch...",
          });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: "Branch created successfully!",
          });
        },
      );

      this.showSuccess(
        `Branch ${branchType.label}/${branchName} has been created and checked out!`,
      );
    } catch (error) {
      this.showError(`Failed to create branch: ${error}`);
    }
  }

  async finishBranch(): Promise<void> {
    try {
      const workspaceFolder = this.getCurrentWorkspaceFolder();
      if (!workspaceFolder) {
        this.showError("No workspace folder found");
        return;
      }

      // Get current branch name
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
        `Are you sure you want to finish ${currentBranch}? This will merge it back to the base branch.`,
        "Finish Branch",
      );

      if (!confirm) {
        return;
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Finishing branch: ${currentBranch}`,
          cancellable: false,
        },
        async (progress: ProgressCallback) => {
          progress.report({ increment: 0, message: "Merging branch..." });

          // Use StackCode CLI for git operations
          const command = `npx @stackcode/cli git finish`;

          progress.report({ increment: 50, message: "Cleaning up..." });

          await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);

          progress.report({
            increment: 100,
            message: "Branch finished successfully!",
          });
        },
      );

      this.showSuccess(`Branch ${currentBranch} has been finished and merged!`);
    } catch (error) {
      this.showError(`Failed to finish branch: ${error}`);
    }
  }
}
