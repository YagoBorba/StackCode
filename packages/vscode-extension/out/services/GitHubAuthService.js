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
const github_auth_1 = require("@stackcode/github-auth");
class GitHubAuthService {
    constructor(context) {
        this.context = context;
        this.cachedContext = null;
        const sharedStorage = (0, github_auth_1.createFileTokenStorage)();
        this.auth = (0, github_auth_1.createGitHubAuth)({
            provider: (0, github_auth_1.createVSCodeAuthProvider)({
                vscode,
                context,
                scopes: GitHubAuthService.SCOPES,
                sharedStorage,
                shareTokens: true,
            }),
        });
    }
    get isAuthenticated() {
        return this.auth.isAuthenticated();
    }
    get userInfo() {
        const account = this.cachedContext?.session.account;
        if (!account) {
            return null;
        }
        return {
            username: account.username ?? account.displayName,
            email: account.email ?? undefined,
        };
    }
    async getAuthenticatedClient() {
        const context = await this.ensureSession();
        return context.client;
    }
    async login() {
        try {
            const context = await this.auth.login({ interactive: true });
            this.cachedContext = context;
            const label = context.session.account?.username ??
                context.session.account?.displayName ??
                context.session.account?.id ??
                "GitHub";
            vscode.window.showInformationMessage(`✅ Successfully logged in to GitHub as ${label}`);
            console.log("[StackCode] GitHub authentication successful");
        }
        catch (error) {
            console.error("[StackCode] GitHub authentication failed:", error);
            vscode.window.showErrorMessage(`Failed to authenticate with GitHub: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async logout() {
        try {
            await this.auth.logout();
            this.cachedContext = null;
            vscode.window.showInformationMessage("✅ Successfully logged out from GitHub");
            console.log("[StackCode] GitHub logout successful");
        }
        catch (error) {
            console.error("[StackCode] GitHub logout failed:", error);
            vscode.window.showErrorMessage(`Failed to logout from GitHub: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async initializeFromStorage() {
        try {
            const context = await this.auth.getSession({ forceRefresh: true });
            if (context) {
                this.cachedContext = context;
                console.log("[StackCode] GitHub session restored successfully");
            }
            else {
                this.cachedContext = null;
            }
        }
        catch (error) {
            console.warn("[StackCode] Failed to restore GitHub session:", error);
            this.cachedContext = null;
            await this.auth.removeToken();
        }
    }
    dispose() {
        this.cachedContext = null;
    }
    async ensureSession() {
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
exports.GitHubAuthService = GitHubAuthService;
GitHubAuthService.SCOPES = ["repo", "user:email"];
//# sourceMappingURL=GitHubAuthService.js.map