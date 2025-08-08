import * as vscode from 'vscode';
export declare class DashboardProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    static readonly viewType = "stackcode.dashboard";
    private _view?;
    constructor(_extensionUri: vscode.Uri);
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    show(): void;
    dispose(): void;
    private _getHtmlForWebview;
}
