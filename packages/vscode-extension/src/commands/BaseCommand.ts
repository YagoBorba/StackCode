import * as vscode from "vscode";

export abstract class BaseCommand {
  abstract execute(): Promise<void>;

  protected async showError(message: string): Promise<void> {
    vscode.window.showErrorMessage(`StackCode: ${message}`);
  }

  protected async showWarning(message: string): Promise<void> {
    vscode.window.showWarningMessage(`StackCode: ${message}`);
  }

  protected async showInfo(message: string): Promise<void> {
    vscode.window.showInformationMessage(`StackCode: ${message}`);
  }

  protected async showSuccess(message: string): Promise<void> {
    vscode.window.showInformationMessage(`✅ ${message}`);
  }

  protected getCurrentWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
    return vscode.workspace.workspaceFolders?.[0];
  }

  protected async runTerminalCommand(
    command: string,
    cwd?: string,
  ): Promise<void> {
    const terminal = vscode.window.createTerminal({
      name: "StackCode",
      cwd: cwd || this.getCurrentWorkspaceFolder()?.uri.fsPath,
    });
    terminal.sendText(command);
    terminal.show();
  }

  protected async confirmAction(
    message: string,
    confirmText: string = "Yes",
  ): Promise<boolean> {
    const result = await vscode.window.showWarningMessage(
      message,
      { modal: true },
      confirmText,
      "Cancel",
    );
    return result === confirmText;
  }
}
