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
exports.AuthCommand = void 0;
const vscode = __importStar(require("vscode"));
const BaseCommand_1 = require("./BaseCommand");
/**
 * AuthCommand - Manages GitHub authentication commands
 *
 * Available commands:
 * - stackcode.auth.login: Inicia processo de login
 * - stackcode.auth.logout: Removes authentication
 */
class AuthCommand extends BaseCommand_1.BaseCommand {
    constructor(authService, dashboardProvider) {
        super();
        this._authService = authService;
        this._dashboardProvider = dashboardProvider;
    }
    /**
     * Abstract method implementation - shows authentication status
     */
    async execute() {
        await this.showStatus();
    }
    /**
     * Executa comando de login
     */
    async executeLogin() {
        try {
            if (this._authService.isAuthenticated) {
                const userInfo = this._authService.userInfo;
                const result = await vscode.window.showInformationMessage(`Already logged in as ${userInfo?.username}. Would you like to logout and login again?`, "Yes, re-login", "Cancel");
                if (result === "Yes, re-login") {
                    await this._authService.logout();
                    await this._authService.login();
                }
                return;
            }
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Authenticating with GitHub...",
                cancellable: false,
            }, async () => {
                await this._authService.login();
            });
        }
        catch (error) {
            console.error("[AuthCommand] Login failed:", error);
        }
    }
    /**
     * Executa comando de logout
     */
    async executeLogout() {
        try {
            if (!this._authService.isAuthenticated) {
                vscode.window.showInformationMessage("You are not logged in to GitHub");
                return;
            }
            const userInfo = this._authService.userInfo;
            const result = await vscode.window.showWarningMessage(`Are you sure you want to logout from GitHub (${userInfo?.username})?`, "Yes, logout", "Cancel");
            if (result === "Yes, logout") {
                await this._authService.logout();
                if (this._dashboardProvider && typeof this._dashboardProvider.refreshAuthState === "function") {
                    await this._dashboardProvider.refreshAuthState();
                }
            }
        }
        catch (error) {
            console.error("[AuthCommand] Logout failed:", error);
        }
    }
    /**
     * Shows current authentication status
     */
    async showStatus() {
        if (this._authService.isAuthenticated) {
            const userInfo = this._authService.userInfo;
            vscode.window.showInformationMessage(`✅ Authenticated with GitHub as ${userInfo?.username}`);
        }
        else {
            const result = await vscode.window.showInformationMessage("❌ Not authenticated with GitHub", "Login now");
            if (result === "Login now") {
                await this.executeLogin();
            }
        }
    }
}
exports.AuthCommand = AuthCommand;
//# sourceMappingURL=AuthCommand.js.map