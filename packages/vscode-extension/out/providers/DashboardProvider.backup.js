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
class DashboardProvider {
    constructor(context) {
        this._disposables = [];
        this._extensionUri = context.extensionUri;
    }
    resolveWebviewView(webviewView, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars  
    token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist')],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (data) => {
            console.log(`[StackCode] Received command from webview: ${data.type}`);
            try {
                // Tratar comandos específicos do webview
                switch (data.type) {
                    case 'webviewReady':
                        console.log('[StackCode] Webview reported ready, sending initial data');
                        this.updateProjectStats();
                        return;
                    case 'refreshStats':
                        this.updateProjectStats();
                        return;
                    default:
                        // Executar comando normal do VS Code
                        await vscode.commands.executeCommand(data.type, data.payload);
                }
            }
            catch (error) {
                console.error(`[StackCode] Error executing command ${data.type}:`, error);
                this.sendMessage({
                    type: 'commandError',
                    payload: { command: data.type, error: error instanceof Error ? error.message : 'Unknown error' }
                });
            }
        }, undefined, this._disposables);
        // WebviewView doesn't have onDidBecomeVisible, so we'll update stats immediately
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
            // If view is not created yet, trigger the creation by executing the show command
            vscode.commands.executeCommand('workbench.view.extension.stackcode');
        }
    }
    async updateProjectStats() {
        if (!this._view) {
            console.log('[StackCode] No view available for stats update');
            return;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        console.log('[StackCode] Workspace folders:', workspaceFolders?.length || 0);
        console.log('[StackCode] Workspace name:', vscode.workspace.name);
        console.log('[StackCode] Workspace file:', vscode.workspace.workspaceFile?.toString());
        if (!workspaceFolders || workspaceFolders.length === 0) {
            console.log('[StackCode] No workspace folders found, using alternative detection');
            // Fallback: usar informações do contexto da extensão
            const extensionWorkspace = path.dirname(path.dirname(path.dirname(this._extensionUri.fsPath)));
            console.log('[StackCode] Extension workspace path:', extensionWorkspace);
            this.sendMessage({
                type: 'updateStats',
                payload: {
                    files: 0,
                    workspaceName: 'StackCode (Debug)',
                    workspacePath: extensionWorkspace,
                    mode: 'development'
                }
            });
            return;
        }
        try {
            const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**', 1000);
            console.log('[StackCode] Found files:', files.length);
            this.sendMessage({
                type: 'updateStats',
                payload: {
                    files: files.length,
                    workspaceName: workspaceFolders[0].name,
                    workspacePath: workspaceFolders[0].uri.fsPath,
                    mode: 'production'
                },
            });
        }
        catch (e) {
            console.error("[StackCode] Error fetching project stats:", e);
            this.sendMessage({
                type: 'updateStats',
                payload: { files: 0, error: 'Failed to scan files' }
            });
        }
    }
    _getHtmlForWebview(webview) {
        const nonce = getNonce();
        const buildPath = vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview-ui');
        // Lê o manifest.json do Vite
        const manifestPath = path.join(buildPath.fsPath, '.vite', 'manifest.json');
        console.log('[StackCode] Build path:', buildPath.fsPath);
        console.log('[StackCode] Manifest path:', manifestPath);
        console.log('[StackCode] Manifest exists:', fs.existsSync(manifestPath));
        try {
            const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestContent);
            console.log('[StackCode] Manifest content:', manifest);
            // Pega os arquivos do manifest do Vite
            const indexEntry = manifest['index.html'];
            const scriptFile = indexEntry.file;
            const cssFiles = indexEntry.css || [];
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(buildPath, scriptFile));
            const cssUris = cssFiles.map((cssFile) => webview.asWebviewUri(vscode.Uri.joinPath(buildPath, cssFile)));
            console.log('[StackCode] Script URI:', scriptUri.toString());
            console.log('[StackCode] CSS URIs:', cssUris.map((uri) => uri.toString()));
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'; img-src ${webview.cspSource} https: data:; connect-src ${webview.cspSource};">
    ${cssUris.map((uri) => `<link href="${uri}" rel="stylesheet">`).join('\n    ')}
    <title>StackCode Dashboard</title>
</head>
<body>
    <div id="loading" style="padding: 20px; color: #fff; background: #1e1e1e;">
        ⏳ Carregando StackCode Dashboard...
    </div>
    <div id="root"></div>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
    <script nonce="${nonce}">
        console.log('[StackCode Webview] HTML loaded, waiting for React...');
        console.log('[StackCode Webview] Script URI:', '${scriptUri}');
        console.log('[StackCode Webview] CSS loaded:', ${cssUris.length});
        
        // Debug: verificar se o root está sendo populado
        setTimeout(() => {
            const root = document.getElementById('root');
            const loading = document.getElementById('loading');
            if (root && root.innerHTML.trim() !== '') {
                console.log('[StackCode Webview] React carregou com sucesso!');
                if (loading) loading.style.display = 'none';
            } else {
                console.error('[StackCode Webview] React não carregou! Root está vazio.');
                if (loading) {
                    loading.innerHTML = '❌ Erro: React não carregou. Verifique o console.';
                    loading.style.background = '#f14c4c20';
                    loading.style.border = '1px solid #f14c4c';
                }
            }
        }, 2000);
    </script>
</body>
</html>`;
        }
        catch (error) {
            console.error("[StackCode] Error reading manifest:", error);
            // Fallback melhorado para desenvolvimento
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
            Erro: ${error instanceof Error ? error.message : 'Manifest não encontrado'}
        </div>
        <p>Status da extensão: ✅ Ativa</p>
        <p>Workspace: ${vscode.workspace.workspaceFolders?.[0]?.name || 'Nenhum'}</p>
    </div>
</body>
</html>`;
        }
    }
    // CORREÇÃO: Adicionando o método dispose para conformidade.
    dispose() {
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
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=DashboardProvider.backup.js.map