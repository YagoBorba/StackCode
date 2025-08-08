import * as vscode from 'vscode';
interface ProjectItem {
    label: string;
    description?: string;
    icon: string;
    command?: string;
}
export declare class ProjectViewProvider implements vscode.TreeDataProvider<ProjectItem> {
    private workspaceState;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<ProjectItem | undefined | null | void>;
    constructor(workspaceState: vscode.Memento);
    refresh(): void;
    getTreeItem(element: ProjectItem): vscode.TreeItem;
    getChildren(element?: ProjectItem): Promise<ProjectItem[]>;
    private getProjectInfo;
}
export {};
