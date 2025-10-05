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
exports.DashboardProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const core_1 = require("@stackcode/core");
const GitHubRemoteStatsService_1 = require("../services/GitHubRemoteStatsService");
const AuthFlowManager_1 = require("../services/AuthFlowManager");
/**
 * Provides the StackCode dashboard webview interface.
 * Manages project statistics, GitHub issues, and integrates with core workflows.
 * Implements WebviewProgressListener to receive and display progress updates.
 */
class DashboardProvider {
    constructor(context, authService, gitMonitor, progressManager) {
        this._disposables = [];
        this._extensionUri = context.extensionUri;
        this._authService = authService;
        this._gitMonitor = gitMonitor;
        this._progressManager = progressManager;
        if (this._progressManager) {
            this._progressManager.registerWebviewProvider(this);
        }
        // Initialize remote services
        if (authService && gitMonitor) {
            this._remoteStatsService = new GitHubRemoteStatsService_1.GitHubRemoteStatsService(authService, gitMonitor);
            this._authFlowManager = new AuthFlowManager_1.AuthFlowManager(authService, context);
        }
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "dist")],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (data) => {
            try {
                if (DashboardProvider.DEBUG) {
                    console.log("[DashboardProvider] Received message from webview:", data.type);
                }
                switch (data.type) {
                    case "webviewReady":
                        if (DashboardProvider.DEBUG) {
                            console.log("[DashboardProvider] Webview ready, updating stats...");
                        }
                        this.updateProjectStats();
                        this.updateCurrentBranch();
                        if (this._authService?.isAuthenticated) {
                            if (DashboardProvider.DEBUG) {
                                console.log("[DashboardProvider] Authenticated, updating issues...");
                            }
                            await this.updateIssues();
                        }
                        return;
                    case "refreshStats":
                        if (DashboardProvider.DEBUG) {
                            console.log("[DashboardProvider] Refreshing stats...");
                        }
                        this.updateProjectStats();
                        return;
                    case "connectGitHub":
                        if (DashboardProvider.DEBUG) {
                            console.log("[DashboardProvider] Connect GitHub requested");
                        }
                        await this.handleGitHubConnect();
                        return;
                    case "fetchIssues":
                        if (DashboardProvider.DEBUG) {
                            console.log("[DashboardProvider] Fetching issues...");
                        }
                        await this.updateIssues();
                        return;
                    case "refreshIssues":
                        if (DashboardProvider.DEBUG) {
                            console.log("[DashboardProvider] Refreshing issues...");
                        }
                        await this.updateIssues(true);
                        return;
                    case "openExternal": {
                        const payload = data.payload;
                        const url = typeof payload === "string" ? payload : payload?.url;
                        if (url) {
                            try {
                                await vscode.env.openExternal(vscode.Uri.parse(url));
                            }
                            catch (error) {
                                console.error("[DashboardProvider] Failed to open URL:", url, error);
                                vscode.window.showErrorMessage(`Failed to open URL: ${url}`);
                            }
                        }
                        return;
                    }
                    case "expandSidebar":
                    case "expandFull":
                        // Esses comandos são tratados no frontend (App.tsx)
                        return;
                    case "resizePanel":
                        // Modo de visualização controlado apenas no frontend
                        // Não executar comandos externos que podem causar comportamento inesperado
                        return;
                    default:
                        if (DashboardProvider.DEBUG) {
                            console.log("[DashboardProvider] Executing command:", data.type);
                        }
                        await vscode.commands.executeCommand(data.type, data.payload);
                }
            }
            catch (error) {
                this.sendMessage({
                    type: "commandError",
                    payload: {
                        command: data.type,
                        error: error instanceof Error ? error.message : "Unknown error",
                    },
                });
            }
        }, undefined, this._disposables);
        this.updateProjectStats();
        // Auto-refresh: periodically refresh stats and issues
        const interval = setInterval(() => {
            try {
                this.updateProjectStats();
                if (this._authService?.isAuthenticated) {
                    this.updateIssues();
                }
            }
            catch (e) {
                if (DashboardProvider.DEBUG) {
                    console.log("[DashboardProvider] Auto-refresh error:", e);
                }
            }
        }, 20000); // 20s
        this._disposables.push({ dispose: () => clearInterval(interval) });
    }
    sendMessage(message) {
        if (this._view) {
            if (DashboardProvider.DEBUG) {
                const m = message;
                console.log("[DashboardProvider] Sending message to webview:", m.type, message);
            }
            this._view.webview.postMessage(message);
        }
        else {
            if (DashboardProvider.DEBUG) {
                console.log("[DashboardProvider] Cannot send message, no view available");
            }
        }
    }
    show() {
        if (this._view) {
            this._view.show?.(true);
        }
        else {
            vscode.commands.executeCommand("workbench.view.extension.stackcode");
        }
    }
    /**
     * Handle GitHub authentication from webview
     */
    async handleGitHubConnect() {
        if (!this._authFlowManager) {
            vscode.window.showErrorMessage("Authentication service not available");
            return;
        }
        const result = await this._authFlowManager.ensureAuthenticated("To view project statistics and manage issues, StackCode needs to connect with GitHub.\n\n" +
            "This allows access to:\n" +
            "• 📊 Repository statistics (stars, forks, commits)\n" +
            "• 👥 Contributors and activity data\n" +
            "• 📝 Issues and pull requests\n" +
            "• 💻 Language breakdown");
        if (result.authenticated) {
            // Refresh stats and issues after authentication
            await this.updateProjectStats();
            await this.updateIssues();
        }
    }
    async updateIssues(forceRefresh = false) {
        try {
            if (!this._authService || !this._gitMonitor) {
                return;
            }
            if (!this._authService.isAuthenticated) {
                this.sendMessage({
                    type: "updateIssues",
                    payload: {
                        issues: [],
                        error: "Not authenticated with GitHub",
                        needsAuth: true,
                    },
                });
                return;
            }
            const repository = await this._gitMonitor.getCurrentGitHubRepository();
            if (!repository) {
                this.sendMessage({
                    type: "updateIssues",
                    payload: {
                        issues: [],
                        error: "No GitHub repository detected",
                        needsAuth: false,
                    },
                });
                return;
            }
            if (forceRefresh) {
                (0, core_1.clearRepositoryCache)({
                    owner: repository.owner,
                    repo: repository.repo,
                    fullName: repository.fullName,
                });
            }
            const client = await this._authService.getAuthenticatedClient();
            if (this._progressManager) {
                this._progressManager.startWorkflow("issues");
            }
            const result = await (0, core_1.runIssuesWorkflow)({
                client,
                repository: {
                    owner: repository.owner,
                    repo: repository.repo,
                    fullName: repository.fullName,
                },
                enableCache: !forceRefresh,
            }, {
                onProgress: this._progressManager
                    ? this._progressManager.createProgressHook("issues")
                    : undefined,
            });
            if (result.status === "error") {
                if (this._progressManager) {
                    this._progressManager.failWorkflow("issues", result.error || "Failed to fetch issues");
                }
                throw new Error(result.error || "Failed to fetch issues");
            }
            if (this._progressManager) {
                this._progressManager.completeWorkflow("issues", `Fetched ${result.issues.length} issues`);
            }
            this.sendMessage({
                type: "updateIssues",
                payload: {
                    issues: result.issues,
                    timestamp: result.timestamp,
                },
            });
        }
        catch (error) {
            if (this._progressManager) {
                this._progressManager.failWorkflow("issues", error instanceof Error ? error.message : "Failed to fetch issues");
            }
            this.sendMessage({
                type: "updateIssues",
                payload: {
                    issues: [],
                    error: error instanceof Error ? error.message : "Failed to fetch issues",
                    needsAuth: error instanceof Error &&
                        error.message.includes("not authenticated"),
                },
            });
        }
    }
    async updateProjectStats() {
        if (!this._view) {
            return;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        // Check if authenticated
        if (!this._authService?.isAuthenticated) {
            this.sendMessage({
                type: "updateStats",
                payload: {
                    files: 0,
                    branches: 0,
                    commits: 0,
                    issues: 0,
                    contributors: 0,
                    linesOfCode: 0,
                    workspaceName: workspaceFolders?.[0]?.name || "(No Workspace)",
                    mode: "production",
                    needsAuth: true,
                    error: "GitHub authentication required to view statistics",
                },
            });
            return;
        }
        // Fetch remote statistics from GitHub
        try {
            if (!this._remoteStatsService) {
                throw new Error("Remote stats service not initialized");
            }
            const remoteStats = await this._remoteStatsService.fetchRemoteStats();
            // Transform to dashboard format
            this.sendMessage({
                type: "updateStats",
                payload: {
                    // Basic info
                    workspaceName: workspaceFolders?.[0]?.name || remoteStats.repository.name,
                    workspacePath: workspaceFolders?.[0]?.uri.fsPath || "",
                    mode: "production",
                    needsAuth: false,
                    // GitHub stats
                    files: 0,
                    branches: remoteStats.branches.total,
                    commits: remoteStats.commits.total,
                    issues: remoteStats.stats.openIssues,
                    contributors: remoteStats.contributors.total,
                    linesOfCode: 0,
                    // Additional GitHub data
                    stars: remoteStats.stats.stars,
                    forks: remoteStats.stats.forks,
                    watchers: remoteStats.stats.watchers,
                    defaultBranch: remoteStats.branches.default,
                    isPrivate: remoteStats.repository.isPrivate,
                    languages: remoteStats.languages,
                    topContributors: remoteStats.contributors.topContributors,
                    recentActivity: {
                        thisWeek: remoteStats.commits.thisWeek,
                        thisMonth: remoteStats.commits.thisMonth,
                        lastPush: remoteStats.timestamps.pushedAt,
                    },
                },
            });
        }
        catch (error) {
            if (DashboardProvider.DEBUG) {
                console.error("[DashboardProvider] Failed to fetch remote stats:", error);
            }
            const isAuthError = error instanceof Error &&
                (error.message.includes("authentication") ||
                    error.message.includes("No GitHub repository"));
            this.sendMessage({
                type: "updateStats",
                payload: {
                    files: 0,
                    branches: 0,
                    commits: 0,
                    issues: 0,
                    contributors: 0,
                    linesOfCode: 0,
                    workspaceName: workspaceFolders?.[0]?.name || "(No Workspace)",
                    workspacePath: workspaceFolders?.[0]?.uri.fsPath || "",
                    mode: "production",
                    needsAuth: isAuthError,
                    error: error instanceof Error
                        ? error.message
                        : "Failed to fetch statistics from GitHub",
                },
            });
        }
    }
    async updateCurrentBranch() {
        try {
            const git = vscode.extensions.getExtension("vscode.git")?.exports;
            if (git) {
                const gitAPI = git.getAPI(1);
                const repo = gitAPI.repositories[0];
                if (repo && repo.state.HEAD) {
                    const currentBranch = repo.state.HEAD.name || "main";
                    this.sendMessage({
                        type: "updateBranch",
                        payload: { branch: currentBranch },
                    });
                }
            }
        }
        catch (error) {
            console.error("[DashboardProvider] Failed to get current branch:", error);
        }
    }
    _getHtmlForWebview(webview) {
        const nonce = getNonce();
        const buildPath = vscode.Uri.joinPath(this._extensionUri, "dist", "webview-ui");
        const manifestPath = path.join(buildPath.fsPath, ".vite", "manifest.json");
        try {
            const manifestContent = fs.readFileSync(manifestPath, "utf-8");
            const manifest = JSON.parse(manifestContent);
            const indexEntry = manifest["index.html"];
            const scriptFile = indexEntry.file;
            const cssFiles = indexEntry.css || [];
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(buildPath, scriptFile));
            const cssUris = cssFiles.map((cssFile) => webview.asWebviewUri(vscode.Uri.joinPath(buildPath, cssFile)));
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'; img-src ${webview.cspSource} https: data:; connect-src ${webview.cspSource};">
    ${cssUris.map((uri) => `<link href="${uri}" rel="stylesheet">`).join("\n    ")}
    <title>StackCode Dashboard</title>
</head>
<body>
    <div id="loading" style="padding: 20px; color: #fff; background: #1e1e1e;">
        ⏳ Carregando StackCode Dashboard...
    </div>
    <div id="root"></div>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
        }
        catch (error) {
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StackCode Dashboard</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: var(--vscode-editor-background, #1e293b); 
            color: var(--vscode-editor-foreground, white); 
            font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
            font-size: var(--vscode-font-size, 13px);
        }
        .container {
            max-width: 100%;
            padding: 16px;
        }
        .error-message {
            background: var(--vscode-inputValidation-errorBackground, #f14c4c20);
            border: 1px solid var(--vscode-inputValidation-errorBorder, #f14c4c);
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 16px;
        }
        .status {
            background: var(--vscode-badge-background, #007acc);
            color: var(--vscode-badge-foreground, white);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            display: inline-block;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">Development Mode</div>
        <h2>🏗️ StackCode Dashboard</h2>
        <div class="error-message">
            <strong>Build Required:</strong> The webview-ui needs to be compiled first.
            <br><br>
            Run: <code>npm run build:ui</code>
            <br><br>
            Error: ${error instanceof Error ? error.message : "Manifest not found"}
        </div>
        <p>Extension Status: ✅ Active</p>
        <p>Workspace: ${vscode.workspace.workspaceFolders?.[0]?.name || "None"}</p>
    </div>
</body>
</html>`;
        }
    }
    dispose() {
        if (this._progressManager) {
            this._progressManager.unregisterWebviewProvider(this);
        }
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.DashboardProvider = DashboardProvider;
DashboardProvider.viewType = "stackcode.dashboard";
DashboardProvider.DEBUG = false;
/**
 * Generates a cryptographically random nonce for CSP.
 */
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=DashboardProvider.js.map