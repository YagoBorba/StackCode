import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import type { GitHubRemoteStats } from "../services/GitHubRemoteStatsService";
import type { AuthFlowManager } from "../services/AuthFlowManager";
import type { GitHubRemoteStatsService } from "../services/GitHubRemoteStatsService";

/**
 * Test command to verify GitHub Remote Statistics
 * Requires authentication and fetches data from GitHub API
 * 
 * Note: This command needs to be instantiated with services from extension.ts
 */
export class TestRemoteStatsCommand extends BaseCommand {
  constructor(
    private readonly authFlowManager: AuthFlowManager,
    private readonly remoteStatsService: GitHubRemoteStatsService,
  ) {
    super();
  }

  async execute(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        "❌ No workspace folder open.\n\nPlease open a folder with a GitHub repository.",
        { modal: true },
      );
      return;
    }

    // Ensure authenticated with interactive flow
    const authResult = await this.authFlowManager.ensureAuthenticated(
      "To view project statistics, StackCode needs to connect with GitHub.\n\n" +
        "This allows access to:\n" +
        "• ⭐ Stars, forks, and watchers\n" +
        "• 📊 Repository statistics\n" +
        "• 👥 Contributors data\n" +
        "• 💻 Language breakdown\n" +
        "• 📈 Commit activity",
    );

    if (!authResult.authenticated) {
      if (!authResult.cancelled) {
        vscode.window.showWarningMessage(
          "ℹ️ Project statistics require GitHub authentication.",
        );
      }
      return;
    }

    // Fetch remote statistics from GitHub
    try {
      const stats = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "📊 Fetching statistics from GitHub...",
          cancellable: false,
        },
        async () => {
          return await this.remoteStatsService.fetchRemoteStats();
        },
      );

      await this.displayStats(stats);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      vscode.window.showErrorMessage(
        `❌ Failed to fetch statistics from GitHub\n\n${errorMessage}`,
        { modal: true },
      );
    }
  }

  private async displayStats(stats: GitHubRemoteStats) {
    // Format message
    const message = [
      "📊 **GitHub Repository Statistics**",
      "",
      `📁 **Repository:** ${stats.repository.fullName}`,
      `🔒 **Visibility:** ${stats.repository.isPrivate ? "Private" : "Public"}`,
      "",
      "**Engagement:**",
      `⭐ Stars: ${stats.stats.stars.toLocaleString()}`,
      `🍴 Forks: ${stats.stats.forks.toLocaleString()}`,
      `👀 Watchers: ${stats.stats.watchers.toLocaleString()}`,
      `⚠️ Open Issues: ${stats.stats.openIssues.toLocaleString()}`,
      "",
      "**Branches:**",
      `🌿 Default Branch: ${stats.branches.default}`,
      `🔀 Total Branches: ${stats.branches.total}`,
      `🔐 Protected: ${stats.branches.protected}`,
      "",
      "**Commits:**",
      `📌 Total: ${stats.commits.total.toLocaleString()}`,
      `📅 This Week: ${stats.commits.thisWeek}`,
      `📅 This Month: ${stats.commits.thisMonth}`,
      "",
      "**Contributors:**",
      `👥 Total: ${stats.contributors.total}`,
    ];

    // Add top contributors
    if (stats.contributors.topContributors.length > 0) {
      message.push("", "**Top Contributors:**");
      stats.contributors.topContributors.forEach((c) => {
        message.push(`  • ${c.username}: ${c.contributions} contributions`);
      });
    }

    // Add languages
    if (stats.languages.length > 0) {
      message.push("", "**Languages:**");
      stats.languages.slice(0, 5).forEach((lang) => {
        message.push(`  • ${lang.name}: ${lang.percentage}%`);
      });
    }

    // Add timestamps
    message.push(
      "",
      "**Timeline:**",
      `📅 Created: ${new Date(stats.timestamps.createdAt).toLocaleDateString()}`,
      `🔄 Updated: ${new Date(stats.timestamps.updatedAt).toLocaleDateString()}`,
      `📤 Last Push: ${new Date(stats.timestamps.pushedAt).toLocaleDateString()}`,
    );

    // Show in information message
    const action = await vscode.window.showInformationMessage(
      message.join("\n"),
      { modal: false },
      "View on GitHub",
      "Close",
    );

    if (action === "View on GitHub") {
      vscode.env.openExternal(vscode.Uri.parse(stats.repository.url));
    }

    // Show in output channel for full details
    const outputChannel =
      vscode.window.createOutputChannel("StackCode GitHub Stats");
    outputChannel.clear();
    outputChannel.appendLine("=".repeat(50));
    outputChannel.appendLine("📊 GITHUB REPOSITORY STATISTICS");
    outputChannel.appendLine("=".repeat(50));
    outputChannel.appendLine("");
    outputChannel.appendLine(message.join("\n"));
    outputChannel.appendLine("");
    outputChannel.appendLine("=".repeat(50));
    outputChannel.appendLine("📄 Full JSON Output:");
    outputChannel.appendLine(JSON.stringify(stats, null, 2));
    outputChannel.show();

    // Log to console
    console.log("📊 GitHub Statistics (Full Data):", stats);
  }
}
