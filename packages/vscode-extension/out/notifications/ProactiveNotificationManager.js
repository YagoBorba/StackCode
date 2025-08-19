"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProactiveNotificationManager = void 0;
const vscode = __importStar(require("vscode"));
class ProactiveNotificationManager {
  constructor(configManager) {
    this.notificationQueue = [];
    this.configManager = configManager;
  }
  async showWelcomeMessage() {
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
  async showBranchWarning(currentBranch) {
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
  async showCommitMessageWarning(message) {
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
  async showFileCreationSuggestion(fileName) {
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
  async runFullBestPracticesCheck() {
    const issues = [];
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
    } catch (error) {
      // Git extension not available or error accessing it
      console.log("Git extension error:", error);
    }
    // Check for missing files
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      const files = await vscode.workspace.fs.readDirectory(
        workspaceFolder.uri,
      );
      const fileNames = files.map(([name]) => name);
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
  isConventionalCommit(message) {
    const conventionalPattern =
      /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\(.+\))?: .+/;
    return conventionalPattern.test(message);
  }
  async handleApplyFix(message) {
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
  async handleLearnMore(message) {
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
    await vscode.env.openExternal(vscode.Uri.parse(learnMoreUrls[topic]));
  }
  async handleStartWorkflow(workflowType) {
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
  async handleConfigureWorkflow() {
    await vscode.commands.executeCommand("stackcode.config");
  }
  async handleFixProjectIssue(issue) {
    if (issue.includes("README")) {
      await vscode.commands.executeCommand("stackcode.generate.readme");
    } else if (issue.includes("gitignore")) {
      await vscode.commands.executeCommand("stackcode.generate.gitignore");
    } else {
      await vscode.commands.executeCommand("stackcode.validate");
    }
  }
  async handleShowDetails(issue) {
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
  dispose() {
    // Cleanup if needed
  }
}
exports.ProactiveNotificationManager = ProactiveNotificationManager;
//# sourceMappingURL=ProactiveNotificationManager.js.map
