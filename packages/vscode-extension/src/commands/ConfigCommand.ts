import * as vscode from 'vscode';
import { BaseCommand } from './BaseCommand';

export class ConfigCommand extends BaseCommand {
    async execute(): Promise<void> {
        try {
            const workspaceFolder = this.getCurrentWorkspaceFolder();
            if (!workspaceFolder) {
                this.showError('No workspace folder found');
                return;
            }

            const action = await vscode.window.showQuickPick([
                { label: 'Open StackCode Settings', description: 'Configure StackCode extension settings' },
                { label: 'Open Project Config', description: 'Edit .stackcoderc.json file' },
                { label: 'Create Project Config', description: 'Create a new .stackcoderc.json file' }
            ], {
                placeHolder: 'What would you like to configure?'
            });

            if (!action) {
                return;
            }

            if (action.label === 'Open StackCode Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'stackcode');
            } else if (action.label === 'Open Project Config') {
                const configPath = vscode.Uri.joinPath(workspaceFolder.uri, '.stackcoderc.json');
                try {
                    const document = await vscode.workspace.openTextDocument(configPath);
                    await vscode.window.showTextDocument(document);
                } catch {
                    this.showError('.stackcoderc.json file not found. Use "Create Project Config" to create one.');
                }
            } else if (action.label === 'Create Project Config') {
                // Use StackCode CLI for config creation
                const command = `npx @stackcode/cli config init`;
                await this.runTerminalCommand(command, workspaceFolder.uri.fsPath);
                this.showSuccess('Project configuration initialized!');
            }

        } catch (error) {
            this.showError(`Failed to open configuration: ${error}`);
        }
    }
}
