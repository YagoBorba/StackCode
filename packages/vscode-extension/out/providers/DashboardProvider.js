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
class DashboardProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.type) {
                case 'init':
                    vscode.commands.executeCommand('stackcode.init');
                    break;
                case 'generate':
                    vscode.commands.executeCommand('stackcode.generate.readme');
                    break;
                case 'git':
                    vscode.commands.executeCommand('stackcode.git.start');
                    break;
                case 'commit':
                    vscode.commands.executeCommand('stackcode.commit');
                    break;
                case 'validate':
                    vscode.commands.executeCommand('stackcode.validate');
                    break;
                case 'release':
                    vscode.commands.executeCommand('stackcode.release');
                    break;
            }
        });
    }
    show() {
        if (this._view) {
            this._view.show?.(true);
        }
    }
    dispose() {
        // Cleanup if needed
    }
    _getHtmlForWebview(_webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>StackCode Dashboard</title>
            <style>
                body {
                    padding: 10px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    font-family: var(--vscode-font-family);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--vscode-textLink-foreground);
                }
                .subtitle {
                    font-size: 14px;
                    opacity: 0.7;
                    margin-top: 5px;
                }
                .actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .action-button {
                    padding: 12px 16px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .action-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .action-button .icon {
                    font-size: 16px;
                }
                .section {
                    margin: 20px 0;
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: var(--vscode-textLink-foreground);
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">⚡ StackCode</div>
                <div class="subtitle">Development Assistant</div>
            </div>

            <div class="section">
                <div class="section-title">Project Management</div>
                <div class="actions">
                    <button class="action-button" onclick="sendMessage('init')">
                        <span class="icon">📁</span>
                        Initialize New Project
                    </button>
                    <button class="action-button" onclick="sendMessage('generate')">
                        <span class="icon">📝</span>
                        Generate Files
                    </button>
                    <button class="action-button" onclick="sendMessage('validate')">
                        <span class="icon">✅</span>
                        Validate Project
                    </button>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Git Workflow</div>
                <div class="actions">
                    <button class="action-button" onclick="sendMessage('git')">
                        <span class="icon">🌿</span>
                        Start New Branch
                    </button>
                    <button class="action-button" onclick="sendMessage('commit')">
                        <span class="icon">💾</span>
                        Create Commit
                    </button>
                    <button class="action-button" onclick="sendMessage('release')">
                        <span class="icon">🚀</span>
                        Create Release
                    </button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                function sendMessage(type) {
                    vscode.postMessage({ type: type });
                }
            </script>
        </body>
        </html>`;
    }
}
exports.DashboardProvider = DashboardProvider;
DashboardProvider.viewType = 'stackcode.dashboard';
//# sourceMappingURL=DashboardProvider.js.map