import * as vscode from 'vscode';

export class DashboardProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'stackcode.dashboard';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _context: vscode.WebviewViewResolveContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars  
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage((data: { type: string }) => {
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

    public show() {
        if (this._view) {
            this._view.show?.(true);
        }
    }

    dispose() {
        // Cleanup if needed
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _getHtmlForWebview(_webview: vscode.Webview) {
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
