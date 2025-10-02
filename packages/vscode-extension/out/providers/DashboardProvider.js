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
                switch (data.type) {
                    case "webviewReady":
                        this.updateProjectStats();
                        if (this._authService?.isAuthenticated) {
                            await this.updateIssues();
                        }
                        return;
                    case "refreshStats":
                        this.updateProjectStats();
                        return;
                    case "fetchIssues":
                        await this.updateIssues();
                        return;
                    case "refreshIssues":
                        await this.updateIssues(true);
                        return;
                    default:
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
    }
    sendMessage(message) {
        if (this._view) {
            this._view.webview.postMessage(message);
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
        if (!workspaceFolders || workspaceFolders.length === 0) {
            const extensionWorkspace = path.dirname(path.dirname(path.dirname(this._extensionUri.fsPath)));
            this.sendMessage({
                type: "updateStats",
                payload: {
                    files: 0,
                    workspaceName: "StackCode (Debug)",
                    workspacePath: extensionWorkspace,
                    mode: "development",
                },
            });
            return;
        }
        try {
            const files = await vscode.workspace.findFiles("**/*", "**/node_modules/**", 1000);
            this.sendMessage({
                type: "updateStats",
                payload: {
                    files: files.length,
                    workspaceName: workspaceFolders[0].name,
                    workspacePath: workspaceFolders[0].uri.fsPath,
                    mode: "production",
                },
            });
        }
        catch (e) {
            this.sendMessage({
                type: "updateStats",
                payload: { files: 0, error: "Failed to scan files" },
            });
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
            <strong>Build Required:</strong> O webview-ui precisa ser compilado primeiro.
            <br><br>
            Execute: <code>npm run build:ui</code>
            <br><br>
            Erro: ${error instanceof Error ? error.message : "Manifest não encontrado"}
        </div>
        <p>Status da extensão: ✅ Ativa</p>
        <p>Workspace: ${vscode.workspace.workspaceFolders?.[0]?.name || "Nenhum"}</p>
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