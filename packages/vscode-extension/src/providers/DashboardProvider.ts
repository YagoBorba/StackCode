import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { runIssuesWorkflow, clearRepositoryCache } from "@stackcode/core";
import { GitHubAuthService } from "../services/GitHubAuthService";
import { GitMonitor } from "../monitors/GitMonitor";
import {
  ProgressManager,
  WebviewProgressListener,
} from "../services/ProgressManager";
import type {
  WebviewProgressMessage,
  WebviewProgressStateMessage,
  WebviewProgressCompleteMessage,
} from "../types/progress-events";

/**
 * Provides the StackCode dashboard webview interface.
 * Manages project statistics, GitHub issues, and integrates with core workflows.
 * Implements WebviewProgressListener to receive and display progress updates.
 */
export class DashboardProvider
  implements
    vscode.WebviewViewProvider,
    vscode.Disposable,
    WebviewProgressListener
{
  public static readonly viewType = "stackcode.dashboard";
  private _view?: vscode.WebviewView;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _authService?: GitHubAuthService;
  private _gitMonitor?: GitMonitor;
  private _progressManager?: ProgressManager;

  constructor(
    context: vscode.ExtensionContext,
    authService?: GitHubAuthService,
    gitMonitor?: GitMonitor,
    progressManager?: ProgressManager,
  ) {
    this._extensionUri = context.extensionUri;
    this._authService = authService;
    this._gitMonitor = gitMonitor;
    this._progressManager = progressManager;

    if (this._progressManager) {
      this._progressManager.registerWebviewProvider(this);
    }
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, "dist")],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      async (data: { type: string; payload?: unknown }) => {
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
        } catch (error) {
          this.sendMessage({
            type: "commandError",
            payload: {
              command: data.type,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          });
        }
      },
      undefined,
      this._disposables,
    );

    this.updateProjectStats();
  }

  public sendMessage(
    message:
      | { type: string; payload?: unknown }
      | WebviewProgressMessage
      | WebviewProgressStateMessage
      | WebviewProgressCompleteMessage,
  ) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  public show() {
    if (this._view) {
      this._view.show?.(true);
    } else {
      vscode.commands.executeCommand("workbench.view.extension.stackcode");
    }
  }

  private async updateIssues(forceRefresh = false): Promise<void> {
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
        clearRepositoryCache({
          owner: repository.owner,
          repo: repository.repo,
          fullName: repository.fullName,
        });
      }

      const client = await this._authService.getAuthenticatedClient();

      if (this._progressManager) {
        this._progressManager.startWorkflow("issues");
      }

      const result = await runIssuesWorkflow(
        {
          client,
          repository: {
            owner: repository.owner,
            repo: repository.repo,
            fullName: repository.fullName,
          },
          enableCache: !forceRefresh,
        },
        {
          onProgress: this._progressManager
            ? this._progressManager.createProgressHook("issues")
            : undefined,
        },
      );

      if (result.status === "error") {
        if (this._progressManager) {
          this._progressManager.failWorkflow(
            "issues",
            result.error || "Failed to fetch issues",
          );
        }
        throw new Error(result.error || "Failed to fetch issues");
      }

      if (this._progressManager) {
        this._progressManager.completeWorkflow(
          "issues",
          `Fetched ${result.issues.length} issues`,
        );
      }

      this.sendMessage({
        type: "updateIssues",
        payload: {
          issues: result.issues,
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      if (this._progressManager) {
        this._progressManager.failWorkflow(
          "issues",
          error instanceof Error ? error.message : "Failed to fetch issues",
        );
      }

      this.sendMessage({
        type: "updateIssues",
        payload: {
          issues: [],
          error:
            error instanceof Error ? error.message : "Failed to fetch issues",
          needsAuth:
            error instanceof Error &&
            error.message.includes("not authenticated"),
        },
      });
    }
  }

  private async updateProjectStats() {
    if (!this._view) {
      return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
      const extensionWorkspace = path.dirname(
        path.dirname(path.dirname(this._extensionUri.fsPath)),
      );

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
      const files = await vscode.workspace.findFiles(
        "**/*",
        "**/node_modules/**",
        1000,
      );

      this.sendMessage({
        type: "updateStats",
        payload: {
          files: files.length,
          workspaceName: workspaceFolders[0].name,
          workspacePath: workspaceFolders[0].uri.fsPath,
          mode: "production",
        },
      });
    } catch {
      this.sendMessage({
        type: "updateStats",
        payload: { files: 0, error: "Failed to scan files" },
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();
    const buildPath = vscode.Uri.joinPath(
      this._extensionUri,
      "dist",
      "webview-ui",
    );

    const manifestPath = path.join(buildPath.fsPath, ".vite", "manifest.json");

    try {
      const manifestContent = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent);

      const indexEntry = manifest["index.html"];
      const scriptFile = indexEntry.file;
      const cssFiles = indexEntry.css || [];

      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(buildPath, scriptFile),
      );
      const cssUris = cssFiles.map((cssFile: string) =>
        webview.asWebviewUri(vscode.Uri.joinPath(buildPath, cssFile)),
      );

      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'; img-src ${webview.cspSource} https: data:; connect-src ${webview.cspSource};">
    ${cssUris.map((uri: vscode.Uri) => `<link href="${uri}" rel="stylesheet">`).join("\n    ")}
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
    } catch (error) {
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

  public dispose() {
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

/**
 * Generates a cryptographically random nonce for CSP.
 */
function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
