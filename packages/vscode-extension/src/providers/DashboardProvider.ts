import * as vscode from "vscode";

export class DashboardProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "stackcode.dashboard";
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
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage((data: { type: string }) => {
      switch (data.type) {
        case "init":
          vscode.commands.executeCommand("stackcode.init");
          break;
        case "generate":
          vscode.commands.executeCommand("stackcode.generate.readme");
          break;
        case "git":
          vscode.commands.executeCommand("stackcode.git.start");
          break;
        case "commit":
          vscode.commands.executeCommand("stackcode.commit");
          break;
        case "validate":
          vscode.commands.executeCommand("stackcode.validate");
          break;
        case "release":
          vscode.commands.executeCommand("stackcode.release");
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
                * {
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, var(--vscode-editor-background) 0%, var(--vscode-sideBar-background) 100%);
                    color: var(--vscode-editor-foreground);
                    min-height: 100vh;
                }
                
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    position: relative;
                }
                
                .logo {
                    font-size: 3em;
                    font-weight: 900;
                    background: linear-gradient(135deg, #007acc 0%, #005a9e 50%, #4CAF50 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 10px;
                    text-shadow: 0 4px 8px rgba(0, 122, 204, 0.3);
                }
                
                .subtitle {
                    color: var(--vscode-descriptionForeground);
                    font-size: 1.3em;
                    font-weight: 300;
                    opacity: 0.8;
                }
                
                .grid-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: auto auto auto;
                    gap: 25px;
                    grid-template-areas: 
                        "stats actions"
                        "recent recent"
                        "tips tips";
                }
                
                @media (max-width: 768px) {
                    .grid-layout {
                        grid-template-columns: 1fr;
                        grid-template-areas: 
                            "stats"
                            "actions"
                            "recent"
                            "tips";
                    }
                }
                
                .section {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    padding: 25px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
                
                .section:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
                }
                
                .stats-section { grid-area: stats; }
                .actions-section { grid-area: actions; }
                .recent-section { grid-area: recent; }
                .tips-section { grid-area: tips; }
                
                .section h2 {
                    margin: 0 0 20px 0;
                    color: var(--vscode-titleBar-activeForeground);
                    font-size: 1.4em;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .section h2::before {
                    content: '';
                    width: 4px;
                    height: 24px;
                    background: linear-gradient(135deg, #007acc, #4CAF50);
                    border-radius: 2px;
                }
                
                .stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                }
                
                .stat-card {
                    background: linear-gradient(135deg, var(--vscode-input-background), var(--vscode-input-placeholderForeground));
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                
                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #007acc, #4CAF50, #FF9800);
                }
                
                .stat-card:hover {
                    transform: scale(1.05);
                }
                
                .stat-number {
                    font-size: 2.2em;
                    font-weight: 700;
                    background: linear-gradient(135deg, #007acc, #4CAF50);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 5px;
                }
                
                .stat-label {
                    color: var(--vscode-descriptionForeground);
                    font-size: 0.9em;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                
                .action-card {
                    background: linear-gradient(135deg, var(--vscode-button-background), var(--vscode-button-hoverBackground));
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 12px;
                    padding: 18px 12px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    font-weight: 500;
                }
                
                .action-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                }
                
                .action-card:hover::before {
                    left: 100%;
                }
                
                .action-card:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 25px rgba(0, 122, 204, 0.3);
                }
                
                .action-card:active {
                    transform: translateY(-1px) scale(0.98);
                }
                
                .action-card .icon {
                    font-size: 1.8em;
                    margin-bottom: 8px;
                    display: block;
                }
                
                .action-card .label {
                    font-size: 0.85em;
                    line-height: 1.2;
                }
                
                .recent-activity {
                    max-height: 350px;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                
                .recent-activity::-webkit-scrollbar {
                    width: 6px;
                }
                
                .recent-activity::-webkit-scrollbar-track {
                    background: var(--vscode-scrollbar-shadow);
                    border-radius: 3px;
                }
                
                .recent-activity::-webkit-scrollbar-thumb {
                    background: var(--vscode-scrollbarSlider-background);
                    border-radius: 3px;
                }
                
                .activity-item {
                    display: flex;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.2s ease;
                }
                
                .activity-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 15px 10px;
                }
                
                .activity-item:last-child {
                    border-bottom: none;
                }
                
                .activity-icon {
                    margin-right: 15px;
                    font-size: 1.3em;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, var(--vscode-button-background), var(--vscode-button-hoverBackground));
                    border-radius: 50%;
                }
                
                .activity-content {
                    flex: 1;
                }
                
                .activity-text {
                    font-weight: 500;
                    margin-bottom: 2px;
                }
                
                .activity-description {
                    font-size: 0.85em;
                    color: var(--vscode-descriptionForeground);
                    opacity: 0.8;
                }
                
                .activity-time {
                    color: var(--vscode-descriptionForeground);
                    font-size: 0.8em;
                    font-weight: 400;
                    opacity: 0.7;
                }
                
                .tips-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 15px;
                }
                
                .tip-card {
                    background: linear-gradient(135deg, rgba(0, 122, 204, 0.1), rgba(76, 175, 80, 0.1));
                    border: 1px solid rgba(0, 122, 204, 0.2);
                    border-radius: 12px;
                    padding: 20px;
                    transition: all 0.3s ease;
                }
                
                .tip-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(0, 122, 204, 0.4);
                }
                
                .tip-title {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: var(--vscode-titleBar-activeForeground);
                }
                
                .tip-text {
                    font-size: 0.9em;
                    line-height: 1.4;
                    color: var(--vscode-descriptionForeground);
                }
                
                .pulse {
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                
                .floating {
                    animation: floating 3s ease-in-out infinite;
                }
                
                @keyframes floating {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header floating">
                    <div class="logo">🚀 StackCode</div>
                    <div class="subtitle">Your Complete Development Assistant</div>
                </div>

                <div class="grid-layout">
                    <div class="section stats-section">
                        <h2>📊 Project Overview</h2>
                        <div class="stats">
                            <div class="stat-card">
                                <div class="stat-number">23</div>
                                <div class="stat-label">Files</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">5</div>
                                <div class="stat-label">Branches</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">42</div>
                                <div class="stat-label">Commits</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">0</div>
                                <div class="stat-label">Issues</div>
                            </div>
                        </div>
                    </div>

                    <div class="section actions-section">
                        <h2>⚡ Quick Actions</h2>
                        <div class="quick-actions">
                            <button class="action-card" onclick="sendMessage('init')">
                                <div class="icon">🏗️</div>
                                <div class="label">Initialize Project</div>
                            </button>
                            <button class="action-card" onclick="sendMessage('generate')">
                                <div class="icon">📝</div>
                                <div class="label">Generate README</div>
                            </button>
                            <button class="action-card" onclick="sendMessage('git')">
                                <div class="icon">🌟</div>
                                <div class="label">Start Feature</div>
                            </button>
                            <button class="action-card" onclick="sendMessage('commit')">
                                <div class="icon">💾</div>
                                <div class="label">Smart Commit</div>
                            </button>
                            <button class="action-card" onclick="sendMessage('validate')">
                                <div class="icon">✅</div>
                                <div class="label">Validate Project</div>
                            </button>
                            <button class="action-card" onclick="sendMessage('release')">
                                <div class="icon">🚀</div>
                                <div class="label">Create Release</div>
                            </button>
                        </div>
                    </div>

                    <div class="section recent-section">
                        <h2>🕒 Recent Activity</h2>
                        <div class="recent-activity">
                            <div class="activity-item">
                                <div class="activity-icon">🎉</div>
                                <div class="activity-content">
                                    <div class="activity-text">VS Code Extension Created</div>
                                    <div class="activity-description">Successfully packaged and installed StackCode extension</div>
                                </div>
                                <div class="activity-time">2 min ago</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">🔄</div>
                                <div class="activity-content">
                                    <div class="activity-text">Project Compiled</div>
                                    <div class="activity-description">TypeScript compilation completed successfully</div>
                                </div>
                                <div class="activity-time">5 min ago</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">📝</div>
                                <div class="activity-content">
                                    <div class="activity-text">README Updated</div>
                                    <div class="activity-description">Added new documentation sections</div>
                                </div>
                                <div class="activity-time">15 min ago</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">🌟</div>
                                <div class="activity-content">
                                    <div class="activity-text">Feature Branch</div>
                                    <div class="activity-description">Created feature/vscode-proactive-notifications</div>
                                </div>
                                <div class="activity-time">30 min ago</div>
                            </div>
                        </div>
                    </div>

                    <div class="section tips-section">
                        <h2>💡 Pro Tips</h2>
                        <div class="tips-grid">
                            <div class="tip-card">
                                <div class="tip-title">🚀 Quick Start</div>
                                <div class="tip-text">Use Ctrl+Shift+P and type "StackCode" to access all commands quickly!</div>
                            </div>
                            <div class="tip-card">
                                <div class="tip-title">🔄 Auto Monitor</div>
                                <div class="tip-text">The extension automatically monitors your files and suggests improvements.</div>
                            </div>
                            <div class="tip-card">
                                <div class="tip-title">🎯 Git Flow</div>
                                <div class="tip-text">Follow best practices with automated feature, hotfix, and release workflows.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                function sendMessage(type) {
                    vscode.postMessage({ type: type });
                }
                
                // Add some interactive effects
                document.addEventListener('DOMContentLoaded', function() {
                    // Animate stat numbers
                    const statNumbers = document.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const finalNumber = parseInt(stat.textContent);
                        let currentNumber = 0;
                        const increment = finalNumber / 30;
                        
                        const timer = setInterval(() => {
                            currentNumber += increment;
                            if (currentNumber >= finalNumber) {
                                stat.textContent = finalNumber;
                                clearInterval(timer);
                            } else {
                                stat.textContent = Math.floor(currentNumber);
                            }
                        }, 50);
                    });
                });
            </script>
        </body>
        </html>`;
  }
}
