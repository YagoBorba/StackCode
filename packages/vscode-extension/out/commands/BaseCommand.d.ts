import * as vscode from 'vscode';
export declare abstract class BaseCommand {
    abstract execute(): Promise<void>;
    protected showError(message: string): Promise<void>;
    protected showWarning(message: string): Promise<void>;
    protected showInfo(message: string): Promise<void>;
    protected showSuccess(message: string): Promise<void>;
    protected getCurrentWorkspaceFolder(): vscode.WorkspaceFolder | undefined;
    protected runTerminalCommand(command: string, cwd?: string): Promise<void>;
    protected confirmAction(message: string, confirmText?: string): Promise<boolean>;
}
