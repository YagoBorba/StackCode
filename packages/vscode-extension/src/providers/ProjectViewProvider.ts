import * as vscode from 'vscode';

interface ProjectItem {
    label: string;
    description?: string;
    icon: string;
    command?: string;
}

export class ProjectViewProvider implements vscode.TreeDataProvider<ProjectItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProjectItem | undefined | null | void> = new vscode.EventEmitter<ProjectItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProjectItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceState: vscode.Memento) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ProjectItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        treeItem.description = element.description;
        treeItem.iconPath = new vscode.ThemeIcon(element.icon);
        if (element.command) {
            treeItem.command = {
                command: element.command,
                title: element.label
            };
        }
        return treeItem;
    }

    getChildren(element?: ProjectItem): Promise<ProjectItem[]> {
        if (!element) {
            return Promise.resolve(this.getProjectInfo());
        }
        return Promise.resolve([]);
    }

    private async getProjectInfo(): Promise<ProjectItem[]> {
        const items: ProjectItem[] = [];
        
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [
                {
                    label: 'No workspace',
                    description: 'Open a folder to see project info',
                    icon: 'folder-opened'
                }
            ];
        }

        // Project name
        items.push({
            label: workspaceFolder.name,
            description: 'Project root',
            icon: 'folder'
        });

        // Git status
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (gitExtension && gitExtension.isActive) {
                const git = gitExtension.exports;
                const api = git.getAPI(1);
                const repo = api.repositories[0];
                
                if (repo && repo.state.HEAD) {
                    items.push({
                        label: `Branch: ${repo.state.HEAD.name}`,
                        description: `${repo.state.workingTreeChanges.length} changes`,
                        icon: 'git-branch'
                    });
                }
            }
        } catch {
            // Git not available
        }

        // Quick actions
        items.push(
            {
                label: 'Initialize Project',
                description: 'Set up StackCode project',
                icon: 'play',
                command: 'stackcode.init'
            },
            {
                label: 'Generate Files',
                description: 'Create README, .gitignore, etc.',
                icon: 'file-add',
                command: 'stackcode.generate.readme'
            },
            {
                label: 'Start Branch',
                description: 'Create new feature branch',
                icon: 'git-branch',
                command: 'stackcode.git.start'
            },
            {
                label: 'Create Commit',
                description: 'Make conventional commit',
                icon: 'git-commit',
                command: 'stackcode.commit'
            }
        );

        return items;
    }
}
