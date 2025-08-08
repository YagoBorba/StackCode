import * as vscode from "vscode";
import { ConfigurationManager } from "../config/ConfigurationManager";

export interface NotificationAction {
  title: string;
  action: () => Promise<void>;
}

export class ProactiveNotificationManager {
  private configManager: ConfigurationManager;
  private readonly notificationQueue: Array<{
    message: string;
    type: "info" | "warning" | "error";
    actions?: NotificationAction[];
  }> = [];

  constructor(configManager: ConfigurationManager) {
    this.configManager = configManager;
  }

  async showWelcomeMessage(): Promise<void> {
    if (!this.configManager.notificationsEnabled) {
      return;
    }

    const action = await vscode.window.showInformationMessage(
      "🚀 StackCode is now active! Get proactive suggestions to improve your development workflow.",
      "Learn More",
      "Settings",
    );

    if (action === "Learn More") {
      vscode.env.openExternal(
        vscode.Uri.parse("https://github.com/YagoBorba/StackCode"),
      );
    } else if (action === "Settings") {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "stackcode",
      );
    }
  }

  async showBranchWarning(currentBranch: string): Promise<void> {
    if (!this.configManager.branchCheckEnabled) {
      return;
    }

    const isMainBranch = ["main", "master", "develop"].includes(currentBranch);

    if (isMainBranch) {
      const action = await vscode.window.showWarningMessage(
        `⚠️ You are working on the ${currentBranch} branch. Would you like to create a new feature branch?`,
        "Create Branch",
        "Continue",
        "Don't Show Again",
      );

      if (action === "Create Branch") {
        vscode.commands.executeCommand("stackcode.createBranch");
      } else if (action === "Don't Show Again") {
        await this.configManager.updateConfiguration(
          "notifications.branchCheck",
          false,
        );
      }
    }
  }

  async showCommitMessageWarning(message: string): Promise<void> {
    if (!this.configManager.commitCheckEnabled) {
      return;
    }

    const isConventional = this.isConventionalCommit(message);

    if (!isConventional) {
      const action = await vscode.window.showWarningMessage(
        "💬 We detected you are trying to commit without a conventional message. Would you like help formatting it?",
        "Format Message",
        "Continue",
        "Learn More",
      );

      if (action === "Format Message") {
        vscode.commands.executeCommand("stackcode.formatCommitMessage");
      } else if (action === "Learn More") {
        vscode.env.openExternal(
          vscode.Uri.parse("https://conventionalcommits.org/"),
        );
      }
    }
  }

  async showFileCreationSuggestion(fileName: string): Promise<void> {
    if (!this.configManager.notificationsEnabled) {
      return;
    }

    if (fileName === "README.md") {
      const action = await vscode.window.showInformationMessage(
        "📝 Would you like to generate a comprehensive README.md using StackCode templates?",
        "Generate README",
        "Not Now",
      );

      if (action === "Generate README") {
        // TODO: Implement README generation
        vscode.window.showInformationMessage(
          "README generation will be available soon!",
        );
      }
    } else if (fileName === ".gitignore") {
      const action = await vscode.window.showInformationMessage(
        "🚫 Would you like to generate a .gitignore file based on your project type?",
        "Generate .gitignore",
        "Not Now",
      );

      if (action === "Generate .gitignore") {
        // TODO: Implement .gitignore generation
        vscode.window.showInformationMessage(
          ".gitignore generation will be available soon!",
        );
      }
    }
  }

  async runFullBestPracticesCheck(): Promise<void> {
    const issues: string[] = [];

    // Check if working on main branch
    try {
      const gitExtension =
        vscode.extensions.getExtension("vscode.git")?.exports;
      if (gitExtension) {
        const repo = gitExtension.getAPI(1).repositories[0];
        if (
          repo &&
          ["main", "master", "develop"].includes(repo.state.HEAD?.name || "")
        ) {
          issues.push("Working on main/develop branch");
        }
      }
    } catch (error: unknown) {
      // Git extension not available or error accessing it
      console.log("Git extension error:", error);
    }

    // Check for missing files
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      const files = await vscode.workspace.fs.readDirectory(
        workspaceFolder.uri,
      );
      const fileNames = files.map(([name]: [string, vscode.FileType]) => name);

      if (!fileNames.includes("README.md")) {
        issues.push("Missing README.md file");
      }
      if (!fileNames.includes(".gitignore")) {
        issues.push("Missing .gitignore file");
      }
    }

    if (issues.length === 0) {
      vscode.window.showInformationMessage(
        "✅ All best practices checks passed!",
      );
    } else {
      const message = `Found ${issues.length} potential improvements:\n${issues.map((issue) => `• ${issue}`).join("\n")}`;
      vscode.window.showWarningMessage(message, "Fix Issues");
    }
  }

  private isConventionalCommit(message: string): boolean {
    const conventionalPattern =
      /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\(.+\))?: .+/;
    return conventionalPattern.test(message);
  }

  private async handleApplyFix(message: string): Promise<void> {
    // Enhanced fix handling with specific actions
    if (message.includes("README")) {
      await vscode.commands.executeCommand("stackcode.generate.readme");
    } else if (message.includes("gitignore")) {
      await vscode.commands.executeCommand("stackcode.generate.gitignore");
    } else if (message.includes("commit")) {
      await vscode.commands.executeCommand("stackcode.commit");
    } else {
      await vscode.commands.executeCommand("stackcode.validate");
    }
  }

  private async handleLearnMore(message: string): Promise<void> {
    const learnMoreUrls = {
      "conventional commits": "https://conventionalcommits.org/",
      gitflow:
        "https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow",
      readme: "https://www.makeareadme.com/",
      "git best practices": "https://sethrobertson.github.io/GitBestPractices/",
    };

    const topic =
      Object.keys(learnMoreUrls).find((key) =>
        message.toLowerCase().includes(key),
      ) || "git best practices";

    await vscode.env.openExternal(
      vscode.Uri.parse(learnMoreUrls[topic as keyof typeof learnMoreUrls]),
    );
  }

  private async handleStartWorkflow(workflowType: string): Promise<void> {
    switch (workflowType) {
      case "feature":
        await vscode.commands.executeCommand("stackcode.git.feature.start");
        break;
      case "hotfix":
        await vscode.commands.executeCommand("stackcode.git.hotfix.start");
        break;
      case "release":
        await vscode.commands.executeCommand("stackcode.release");
        break;
      default:
        await vscode.commands.executeCommand("stackcode.git.feature.start");
    }
  }

  private async handleConfigureWorkflow(): Promise<void> {
    await vscode.commands.executeCommand("stackcode.config");
  }

  private async handleFixProjectIssue(issue: string): Promise<void> {
    if (issue.includes("README")) {
      await vscode.commands.executeCommand("stackcode.generate.readme");
    } else if (issue.includes("gitignore")) {
      await vscode.commands.executeCommand("stackcode.generate.gitignore");
    } else {
      await vscode.commands.executeCommand("stackcode.validate");
    }
  }

  private async handleShowDetails(issue: string): Promise<void> {
    const outputChannel =
      vscode.window.createOutputChannel("StackCode Details");
    outputChannel.appendLine(`=== Project Issue Details ===`);
    outputChannel.appendLine(`Issue: ${issue}`);
    outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
    outputChannel.appendLine(
      `Workspace: ${vscode.workspace.name || "Unknown"}`,
    );
    outputChannel.appendLine("");
    outputChannel.appendLine("Suggested Actions:");
    outputChannel.appendLine("1. Run project validation");
    outputChannel.appendLine("2. Check project structure");
    outputChannel.appendLine("3. Review best practices");
    outputChannel.show();
  }

  dispose(): void {
    // Cleanup if needed
  }
}
