import * as vscode from "vscode";
import { GitHubAuthService } from "../services/GitHubAuthService";

/**
 * Authentication flow manager
 * Handles the interactive authentication experience for users
 */
export class AuthFlowManager {
  constructor(
    private readonly authService: GitHubAuthService,
    private readonly context: vscode.ExtensionContext,
  ) {}

  /**
   * Check if user is authenticated and guide them if not
   * @returns true if authenticated, false if user cancelled
   */
  async ensureAuthenticated(
    reason?: string,
  ): Promise<{ authenticated: boolean; cancelled: boolean }> {
    // Check if already authenticated
    if (this.authService.isAuthenticated) {
      return { authenticated: true, cancelled: false };
    }

    // Show why authentication is needed
    const message = reason
      ? `🔐 GitHub Authentication Required\n\n${reason}`
      : "🔐 GitHub Authentication Required\n\nThis feature requires GitHub authentication to access your repository data.";

    const action = await vscode.window.showInformationMessage(
      message,
      { modal: true },
      "Connect with GitHub",
      "Cancel",
    );

    if (action !== "Connect with GitHub") {
      return { authenticated: false, cancelled: true };
    }

    // Show authentication guide
    return await this.showAuthenticationGuide();
  }

  /**
   * Interactive authentication guide
   */
  private async showAuthenticationGuide(): Promise<{
    authenticated: boolean;
    cancelled: boolean;
  }> {
    // Step 1: Explain what will happen
    const step1 = await vscode.window.showInformationMessage(
      "🚀 Let's Connect to GitHub!\n\n" +
        "StackCode will:\n" +
        "✅ Open GitHub authentication in your browser\n" +
        "✅ Request read access to your repositories\n" +
        "✅ Securely store your token\n\n" +
        "Your data stays private and secure.",
      { modal: true },
      "Continue",
      "Cancel",
    );

    if (step1 !== "Continue") {
      return { authenticated: false, cancelled: true };
    }

    // Step 2: Perform authentication
    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Connecting to GitHub...",
          cancellable: false,
        },
        async () => {
          await this.authService.login();
        },
      );

      // Step 3: Success message
      const userInfo = this.authService.userInfo;
      await vscode.window.showInformationMessage(
        `🎉 Successfully connected!\n\n` +
          `Welcome, ${userInfo?.username || "GitHub User"}!\n\n` +
          `You can now access all StackCode features.`,
        { modal: true },
        "Got it!",
      );

      return { authenticated: true, cancelled: false };
    } catch (error) {
      // Step 3: Error handling
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      const retry = await vscode.window.showErrorMessage(
        "❌ Authentication Failed\n\n" +
          `Error: ${errorMessage}\n\n` +
          "Would you like to try again?",
        { modal: true },
        "Try Again",
        "Cancel",
      );

      if (retry === "Try Again") {
        return await this.showAuthenticationGuide();
      }

      return { authenticated: false, cancelled: true };
    }
  }

  /**
   * Show authentication status
   */
  async showAuthStatus() {
    if (this.authService.isAuthenticated) {
      const userInfo = this.authService.userInfo;
      const action = await vscode.window.showInformationMessage(
        `✅ Connected to GitHub\n\n` +
          `User: ${userInfo?.username || "Unknown"}\n` +
          `Email: ${userInfo?.email || "Not available"}`,
        { modal: true },
        "Disconnect",
        "Close",
      );

      if (action === "Disconnect") {
        await this.disconnect();
      }
    } else {
      const action = await vscode.window.showInformationMessage(
        "❌ Not Connected to GitHub\n\n" +
          "Connect to access:\n" +
          "• Project statistics\n" +
          "• Issues management\n" +
          "• Repository insights",
        { modal: true },
        "Connect Now",
        "Later",
      );

      if (action === "Connect Now") {
        await this.showAuthenticationGuide();
      }
    }
  }

  /**
   * Disconnect from GitHub
   */
  private async disconnect() {
    const confirm = await vscode.window.showWarningMessage(
      "⚠️ Disconnect from GitHub?\n\n" +
        "You will need to reconnect to access:\n" +
        "• Project statistics\n" +
        "• Issues management\n" +
        "• Repository insights",
      { modal: true },
      "Disconnect",
      "Cancel",
    );

    if (confirm === "Disconnect") {
      await this.authService.logout();
      vscode.window.showInformationMessage(
        "✅ Disconnected from GitHub successfully.",
      );
    }
  }

  /**
   * Show feature requires authentication
   */
  async showFeatureRequiresAuth(featureName: string): Promise<boolean> {
    const result = await this.ensureAuthenticated(
      `To use "${featureName}", you need to connect with GitHub.\n\n` +
        "This allows StackCode to fetch real-time data from your repository.",
    );

    if (result.cancelled) {
      vscode.window.showInformationMessage(
        `ℹ️ ${featureName} requires GitHub authentication.`,
      );
    }

    return result.authenticated;
  }
}
