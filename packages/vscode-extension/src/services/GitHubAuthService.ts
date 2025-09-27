import * as vscode from "vscode";
import { Octokit } from "@octokit/rest";

/**
 * GitHubAuthService - Gerencia autenticação OAuth2 com GitHub
 *
 * Responsabilidades:
 * 1. Implementar fluxo OAuth2 usando VS Code native authentication
 * 2. Armazenar token seguramente usando SecretStorage
 * 3. Fornecer cliente Octokit autenticado
 * 4. Gerenciar login/logout
 */
export class GitHubAuthService {
  private static readonly GITHUB_PROVIDER_ID = "github";
  private static readonly TOKEN_KEY = "stackcode.github.token";
  private static readonly SCOPES = ["repo", "user:email"];

  private _context: vscode.ExtensionContext;
  private _octokit: Octokit | null = null;
  private _session: vscode.AuthenticationSession | null = null;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  /**
   * Verifica se o usuário está autenticado
   */
  public get isAuthenticated(): boolean {
    return this._session !== null && this._octokit !== null;
  }

  /**
   * Retorna informações do usuário autenticado
   */
  public get userInfo(): { username?: string; email?: string } | null {
    if (!this._session) return null;

    return {
      username: this._session.account.label,
      email: this._session.account.id,
    };
  }

  /**
   * Obtém cliente Octokit autenticado
   * Throws se não estiver autenticado
   */
  public getAuthenticatedClient(): Octokit {
    if (!this._octokit) {
      throw new Error("User not authenticated. Please login first.");
    }
    return this._octokit;
  }

  /**
   * Inicia processo de login OAuth2
   */
  public async login(): Promise<void> {
    try {
      // Usar VS Code native authentication
      this._session = await vscode.authentication.getSession(
        GitHubAuthService.GITHUB_PROVIDER_ID,
        GitHubAuthService.SCOPES,
        { createIfNone: true },
      );

      if (this._session) {
        // Criar cliente Octokit com token
        this._octokit = new Octokit({
          auth: this._session.accessToken,
        });

        // Armazenar token seguramente
        await this._context.secrets.store(
          GitHubAuthService.TOKEN_KEY,
          this._session.accessToken,
        );

        // Verificar se o token funciona
        await this._validateToken();

        vscode.window.showInformationMessage(
          `✅ Successfully logged in to GitHub as ${this._session.account.label}`,
        );

        console.log("[StackCode] GitHub authentication successful");
      }
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

  /**
   * Remove autenticação e limpa dados
   */
  public async logout(): Promise<void> {
    try {
      // Remover token do storage seguro
      await this._context.secrets.delete(GitHubAuthService.TOKEN_KEY);

      // Limpar sessão do VS Code
      if (this._session) {
        // Note: VS Code handles session cleanup automatically
        this._session = null;
      }

      // Limpar cliente
      this._octokit = null;

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

  /**
   * Tenta restaurar sessão existente na inicialização
   */
  public async initializeFromStorage(): Promise<void> {
    try {
      // Tentar recuperar sessão existente (sem criar nova)
      const session = await vscode.authentication.getSession(
        GitHubAuthService.GITHUB_PROVIDER_ID,
        GitHubAuthService.SCOPES,
        { createIfNone: false },
      );

      if (session) {
        this._session = session;
        this._octokit = new Octokit({
          auth: session.accessToken,
        });

        // Validar token
        await this._validateToken();
        console.log("[StackCode] GitHub session restored successfully");
      }
    } catch (error) {
      console.warn("[StackCode] Failed to restore GitHub session:", error);
      // Se não conseguir restaurar, limpar dados corrompidos
      await this._context.secrets.delete(GitHubAuthService.TOKEN_KEY);
      this._session = null;
      this._octokit = null;
    }
  }

  /**
   * Valida se o token atual ainda é válido
   */
  private async _validateToken(): Promise<void> {
    if (!this._octokit) {
      throw new Error("No Octokit client available");
    }

    try {
      // Fazer uma chamada simples para validar o token
      await this._octokit.users.getAuthenticated();
    } catch (error) {
      console.error("[StackCode] Token validation failed:", error);
      // Token inválido, limpar tudo
      await this.logout();
      throw new Error("GitHub token is invalid or expired");
    }
  }

  /**
   * Limpa recursos ao desativar extensão
   */
  public dispose(): void {
    this._session = null;
    this._octokit = null;
  }
}
