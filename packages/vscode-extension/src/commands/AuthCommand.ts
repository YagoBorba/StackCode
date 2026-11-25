import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { GitHubAuthService } from "../services/GitHubAuthService";

export class AuthCommand extends BaseCommand {
  private _authService: GitHubAuthService;
  private _dashboardProvider: import("../providers/DashboardProvider").DashboardProvider;

  constructor(authService: GitHubAuthService, dashboardProvider: import("../providers/DashboardProvider").DashboardProvider) {
    super();
    this._authService = authService;
    this._dashboardProvider = dashboardProvider;
  }

  /**
   * Abstract method implementation - shows authentication status
   */
  public async execute(): Promise<void> {
    await this.showStatus();
  }

  /**
   * Executa comando de login
   */
  public async executeLogin(): Promise<void> {
    try {
      if (this._authService.isAuthenticated) {
        const userInfo = this._authService.userInfo;
        const result = await vscode.window.showInformationMessage(
          `Already logged in as ${userInfo?.username}. Would you like to logout and login again?`,
          "Yes, re-login",
          "Cancel",
        );

        if (result === "Yes, re-login") {
          await this._authService.logout();
          await this._authService.login();
        }
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Authenticating with GitHub...",
          cancellable: false,
        },
        async () => {
          await this._authService.login();
        },
      );
    } catch (error) {
      console.error("[AuthCommand] Login failed:", error);
    }
  }

  /**
   * Executa comando de logout
   */
  public async executeLogout(): Promise<void> {
    try {
      if (!this._authService.isAuthenticated) {
        vscode.window.showInformationMessage("You are not logged in to GitHub");
        return;
      }

      const userInfo = this._authService.userInfo;
      const result = await vscode.window.showWarningMessage(
        `Are you sure you want to logout from GitHub (${userInfo?.username})?`,
        "Yes, logout",
        "Cancel",
      );

      if (result === "Yes, logout") {
        await this._authService.logout();
        if (this._dashboardProvider && typeof this._dashboardProvider.refreshAuthState === "function") {
          await this._dashboardProvider.refreshAuthState();
        }
      }
    } catch (error) {
      console.error("[AuthCommand] Logout failed:", error);
    }
  }

  /**
   * Shows current authentication status
   */
  public async showStatus(): Promise<void> {
    if (this._authService.isAuthenticated) {
      const userInfo = this._authService.userInfo;
      vscode.window.showInformationMessage(
        `✅ Authenticated with GitHub as ${userInfo?.username}`,
      );
    } else {
      const result = await vscode.window.showInformationMessage(
        "❌ Not authenticated with GitHub",
        "Login now",
      );

      if (result === "Login now") {
        await this.executeLogin();
      }
    }
  }
}
