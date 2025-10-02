import * as vscode from "vscode";
import { GitMonitor } from "../monitors/GitMonitor";
import { ProactiveNotificationManager } from "../notifications/ProactiveNotificationManager";
import { ConfigurationManager } from "../config/ConfigurationManager";

/**
 * Test command to verify GitHub repository detection
 */
export class TestGitHubDetectionCommand {
  private gitMonitor: GitMonitor;

  constructor() {
    const configManager = new ConfigurationManager();
    const proactiveManager = new ProactiveNotificationManager(configManager);
    this.gitMonitor = new GitMonitor(proactiveManager, configManager);
  }

  async execute(): Promise<void> {
    try {
      console.log(
        "🧪 [TestCommand] Starting GitHub repository detection test...",
      );

      const repository = await this.gitMonitor.getCurrentGitHubRepository();

      if (repository) {
        const message = `✅ Repository Detected!\n\nOwner: ${repository.owner}\nRepo: ${repository.repo}\nFull Name: ${repository.fullName}\nRemote URL: ${repository.remoteUrl}`;

        vscode.window
          .showInformationMessage(message, "Copy Full Name")
          .then((selection) => {
            if (selection === "Copy Full Name") {
              vscode.env.clipboard.writeText(repository.fullName);
              vscode.window.showInformationMessage(
                `Copied "${repository.fullName}" to clipboard!`,
              );
            }
          });

        console.log(
          "✅ [TestCommand] Repository detection successful:",
          repository,
        );
      } else {
        const message =
          "❌ No GitHub repository detected\n\nPossible causes:\n• Not in a Git repository\n• No GitHub remote configured\n• Remote is not a GitHub URL";

        vscode.window
          .showWarningMessage(message, "Show Debug Info")
          .then((selection) => {
            if (selection === "Show Debug Info") {
              const workspaceFolders = vscode.workspace.workspaceFolders;
              const debugInfo = `Debug Info:\n\nWorkspace Folders: ${workspaceFolders?.length || 0}\nFolders: ${workspaceFolders?.map((f) => f.uri.fsPath).join(", ") || "None"}`;
              vscode.window.showInformationMessage(debugInfo);
            }
          });

        console.warn("❌ [TestCommand] Repository detection failed");
      }
    } catch (error) {
      const errorMessage = `❌ Error testing repository detection: ${error}`;
      vscode.window.showErrorMessage(errorMessage);
      console.error("❌ [TestCommand] Error:", error);
    }
  }
}
