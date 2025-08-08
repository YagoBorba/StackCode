import * as vscode from 'vscode';

export class ConfigurationManager {
    private configuration: vscode.WorkspaceConfiguration;

    constructor() {
        this.configuration = vscode.workspace.getConfiguration('stackcode');
        
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
            if (event.affectsConfiguration('stackcode')) {
                this.configuration = vscode.workspace.getConfiguration('stackcode');
            }
        });
    }

    get notificationsEnabled(): boolean {
        return this.configuration.get('notifications.enabled', true);
    }

    get branchCheckEnabled(): boolean {
        return this.configuration.get('notifications.branchCheck', true);
    }

    get commitCheckEnabled(): boolean {
        return this.configuration.get('notifications.commitCheck', true);
    }

    get autoGenerateReadme(): boolean {
        return this.configuration.get('autoGenerate.readme', false);
    }

    get autoGenerateGitignore(): boolean {
        return this.configuration.get('autoGenerate.gitignore', true);
    }

    get defaultBranchType(): string {
        return this.configuration.get('git.defaultBranchType', 'feature');
    }

    get dashboardAutoOpen(): boolean {
        return this.configuration.get('dashboard.autoOpen', false);
    }

    async updateConfiguration(key: string, value: unknown): Promise<void> {
        await this.configuration.update(key, value, vscode.ConfigurationTarget.Workspace);
    }
}
