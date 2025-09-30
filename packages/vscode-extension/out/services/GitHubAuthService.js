"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubAuthService = void 0;
const vscode = __importStar(require("vscode"));
const rest_1 = require("@octokit/rest");
/**
 * GitHubAuthService - Gerencia autenticação OAuth2 com GitHub
 *
 * Responsabilidades:
 * 1. Implementar fluxo OAuth2 usando VS Code native authentication
 * 2. Armazenar token seguramente usando SecretStorage
 * 3. Fornecer cliente Octokit autenticado
 * 4. Gerenciar login/logout
 */
class GitHubAuthService {
    constructor(context) {
        this._octokit = null;
        this._session = null;
        this._context = context;
    }
    /**
     * Verifica se o usuário está autenticado
     */
    get isAuthenticated() {
        return this._session !== null && this._octokit !== null;
    }
    /**
     * Retorna informações do usuário autenticado
     */
    get userInfo() {
        if (!this._session)
            return null;
        return {
            username: this._session.account.label,
            email: this._session.account.id,
        };
    }
    /**
     * Obtém cliente Octokit autenticado
     * Throws se não estiver autenticado
     */
    getAuthenticatedClient() {
        if (!this._octokit) {
            throw new Error("User not authenticated. Please login first.");
        }
        return this._octokit;
    }
    /**
     * Inicia processo de login OAuth2
     */
    async login() {
        try {
            // Usar VS Code native authentication
            this._session = await vscode.authentication.getSession(GitHubAuthService.GITHUB_PROVIDER_ID, GitHubAuthService.SCOPES, { createIfNone: true });
            if (this._session) {
                // Criar cliente Octokit com token
                this._octokit = new rest_1.Octokit({
                    auth: this._session.accessToken,
                });
                // Armazenar token seguramente
                await this._context.secrets.store(GitHubAuthService.TOKEN_KEY, this._session.accessToken);
                // Verificar se o token funciona
                await this._validateToken();
                vscode.window.showInformationMessage(`✅ Successfully logged in to GitHub as ${this._session.account.label}`);
                console.log("[StackCode] GitHub authentication successful");
            }
        }
        catch (error) {
            console.error("[StackCode] GitHub authentication failed:", error);
            vscode.window.showErrorMessage(`Failed to authenticate with GitHub: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    /**
     * Remove autenticação e limpa dados
     */
    async logout() {
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
            vscode.window.showInformationMessage("✅ Successfully logged out from GitHub");
            console.log("[StackCode] GitHub logout successful");
        }
        catch (error) {
            console.error("[StackCode] GitHub logout failed:", error);
            vscode.window.showErrorMessage(`Failed to logout from GitHub: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    /**
     * Tenta restaurar sessão existente na inicialização
     */
    async initializeFromStorage() {
        try {
            // Tentar recuperar sessão existente (sem criar nova)
            const session = await vscode.authentication.getSession(GitHubAuthService.GITHUB_PROVIDER_ID, GitHubAuthService.SCOPES, { createIfNone: false });
            if (session) {
                this._session = session;
                this._octokit = new rest_1.Octokit({
                    auth: session.accessToken,
                });
                // Validar token
                await this._validateToken();
                console.log("[StackCode] GitHub session restored successfully");
            }
        }
        catch (error) {
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
    async _validateToken() {
        if (!this._octokit) {
            throw new Error("No Octokit client available");
        }
        try {
            // Fazer uma chamada simples para validar o token
            await this._octokit.users.getAuthenticated();
        }
        catch (error) {
            console.error("[StackCode] Token validation failed:", error);
            // Token inválido, limpar tudo
            await this.logout();
            throw new Error("GitHub token is invalid or expired");
        }
    }
    /**
     * Limpa recursos ao desativar extensão
     */
    dispose() {
        this._session = null;
        this._octokit = null;
    }
}
exports.GitHubAuthService = GitHubAuthService;
GitHubAuthService.GITHUB_PROVIDER_ID = "github";
GitHubAuthService.TOKEN_KEY = "stackcode.github.token";
GitHubAuthService.SCOPES = ["repo", "user:email"];
//# sourceMappingURL=GitHubAuthService.js.map