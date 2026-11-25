import * as vscode from "vscode";
import type { Octokit } from "@octokit/rest";
import {
  createFileTokenStorage,
  createGitHubAuth,
  createVSCodeAuthProvider,
  type GitHubAuthContext,
} from "@stackcode/github-auth";

export class GitHubAuthService {
  private static readonly SCOPES = ["repo", "user:email"] as const;

  private readonly auth;
  private cachedContext: GitHubAuthContext | null = null;

  constructor(private readonly context: vscode.ExtensionContext) {
    const sharedStorage = createFileTokenStorage();
    this.auth = createGitHubAuth({
      provider: createVSCodeAuthProvider({
        vscode,
        context,
        scopes: GitHubAuthService.SCOPES,
        sharedStorage,
        shareTokens: true,
      }),
    });
  }

  public get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  public get userInfo(): { username?: string; email?: string } | null {
    const account = this.cachedContext?.session.account;
    if (!account) {
      return null;
    }

    return {
      username: account.username ?? account.displayName,
      email: account.email ?? undefined,
    };
  }

  public async getAuthenticatedClient(): Promise<Octokit> {
    const context = await this.ensureSession();
    return context.client;
  }

  public async login(): Promise<void> {
    try {
      const context = await this.auth.login({ interactive: true });
      this.cachedContext = context;

      const label =
        context.session.account?.username ??
        context.session.account?.displayName ??
        context.session.account?.id ??
        "GitHub";

      vscode.window.showInformationMessage(
        `✅ Successfully logged in to GitHub as ${label}`,
      );
      console.log("[StackCode] GitHub authentication successful");
    } catch (error) {
      console.error("[StackCode] GitHub authentication failed:", error);
      vscode.window.showErrorMessage(
        `Failed to authenticate with GitHub: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.auth.logout();
      this.cachedContext = null;

      vscode.window.showInformationMessage(
        "✅ Successfully logged out from GitHub",
      );
      console.log("[StackCode] GitHub logout successful");
    } catch (error) {
      console.error("[StackCode] GitHub logout failed:", error);
      vscode.window.showErrorMessage(
        `Failed to logout from GitHub: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  public async initializeFromStorage(): Promise<void> {
    try {
      const context = await this.auth.getSession({ forceRefresh: true });
      if (context) {
        this.cachedContext = context;
        console.log("[StackCode] GitHub session restored successfully");
      } else {
        this.cachedContext = null;
      }
    } catch (error) {
      console.warn("[StackCode] Failed to restore GitHub session:", error);
      this.cachedContext = null;
      await this.auth.removeToken();
    }
  }

  public dispose(): void {
    this.cachedContext = null;
  }

  private async ensureSession(): Promise<GitHubAuthContext> {
    if (this.cachedContext) {
      return this.cachedContext;
    }

    const context = await this.auth.getSession({ forceRefresh: false });
    if (!context) {
      throw new Error("User not authenticated. Please login first.");
    }

    this.cachedContext = context;
    return context;
  }
}
