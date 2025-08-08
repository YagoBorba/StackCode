import * as vscode from "vscode";
import { ProactiveNotificationManager } from "../notifications/ProactiveNotificationManager";
import { ConfigurationManager } from "../config/ConfigurationManager";

export class GitMonitor implements vscode.Disposable {
  private proactiveManager: ProactiveNotificationManager;
  private configManager: ConfigurationManager;
  private disposables: vscode.Disposable[] = [];
  private lastBranch: string | undefined;

  constructor(
    proactiveManager: ProactiveNotificationManager,
    configManager: ConfigurationManager,
  ) {
    this.proactiveManager = proactiveManager;
    this.configManager = configManager;
  }

  startMonitoring(): void {
    // Monitor git extension state changes
    const gitExtension = vscode.extensions.getExtension("vscode.git");
    if (gitExtension) {
      if (gitExtension.isActive) {
        this.setupGitMonitoring();
      } else {
        gitExtension.activate().then(() => {
          this.setupGitMonitoring();
        });
      }
    }

    // Monitor workspace folder changes
    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.checkCurrentBranch();
      }),
    );

    // Initial check
    setTimeout(() => {
      this.checkCurrentBranch();
    }, 2000);
  }

  private setupGitMonitoring(): void {
    try {
      const git = vscode.extensions.getExtension("vscode.git")?.exports;
      if (git) {
        const gitAPI = git.getAPI(1);

        this.disposables.push(
          gitAPI.onDidChangeState(() => {
            this.checkCurrentBranch();
          }),
        );

        this.disposables.push(
          gitAPI.onDidOpenRepository(() => {
            this.checkCurrentBranch();
          }),
        );
      }
    } catch (error) {
      console.log("Failed to setup git monitoring:", error);
    }
  }

  private async checkCurrentBranch(): Promise<void> {
    try {
      const git = vscode.extensions.getExtension("vscode.git")?.exports;
      if (git) {
        const gitAPI = git.getAPI(1);
        const repo = gitAPI.repositories[0];

        if (repo && repo.state.HEAD) {
          const currentBranch = repo.state.HEAD.name;

          if (currentBranch && currentBranch !== this.lastBranch) {
            this.lastBranch = currentBranch;
            await this.proactiveManager.showBranchWarning(currentBranch);
          }
        }
      }
    } catch (error) {
      console.log("Error checking current branch:", error);
    }
  }

  async showCreateBranchDialog(): Promise<void> {
    const branchName = await vscode.window.showInputBox({
      prompt: "Enter the name for the new branch",
      placeHolder: "feature/new-feature",
      validateInput: (value: string) => {
        if (!value) {
          return "Branch name is required";
        }
        if (!/^[a-zA-Z0-9/_-]+$/.test(value)) {
          return "Branch name can only contain letters, numbers, hyphens, underscores and slashes";
        }
        return null;
      },
    });

    if (branchName) {
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

      if (branchType) {
        const fullBranchName = branchName.includes("/")
          ? branchName
          : `${branchType.label}/${branchName}`;

        try {
          const terminal = vscode.window.createTerminal("StackCode Git");
          terminal.sendText(`git checkout -b ${fullBranchName}`);
          terminal.show();

          vscode.window.showInformationMessage(
            `✅ Created and switched to branch: ${fullBranchName}`,
          );
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create branch: ${error}`);
        }
      }
    }
  }

  async showCommitMessageDialog(): Promise<void> {
    const commitType = await vscode.window.showQuickPick(
      [
        { label: "feat", description: "A new feature" },
        { label: "fix", description: "A bug fix" },
        { label: "docs", description: "Documentation changes" },
        { label: "style", description: "Code style changes (formatting, etc)" },
        { label: "refactor", description: "Code refactoring" },
        { label: "perf", description: "Performance improvements" },
        { label: "test", description: "Adding or updating tests" },
        { label: "chore", description: "Maintenance tasks" },
        { label: "build", description: "Build system changes" },
        { label: "ci", description: "CI/CD changes" },
      ],
      {
        placeHolder: "Select commit type",
      },
    );

    if (!commitType) {
      return;
    }

    const scope = await vscode.window.showInputBox({
      prompt: "Enter scope (optional)",
      placeHolder: "auth, api, ui, etc.",
    });

    const description = await vscode.window.showInputBox({
      prompt: "Enter commit description",
      placeHolder: "add user authentication",
      validateInput: (value: string) => {
        if (!value) {
          return "Description is required";
        }
        if (value.length > 50) {
          return "Description should be 50 characters or less";
        }
        return null;
      },
    });

    if (!description) {
      return;
    }

    let commitMessage = commitType.label;
    if (scope) {
      commitMessage += `(${scope})`;
    }
    commitMessage += `: ${description}`;

    // Copy to clipboard
    await vscode.env.clipboard.writeText(commitMessage);

    vscode.window
      .showInformationMessage(
        `📋 Commit message copied to clipboard: ${commitMessage}`,
        "Open Git Panel",
      )
      .then((action: string | undefined) => {
        if (action === "Open Git Panel") {
          vscode.commands.executeCommand("workbench.view.scm");
        }
      });
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}
