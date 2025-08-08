"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectViewProvider = void 0;
const vscode = __importStar(require("vscode"));
class ProjectViewProvider {
    constructor(workspaceState) {
        this.workspaceState = workspaceState;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
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
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.getProjectInfo());
        }
        return Promise.resolve([]);
    }
    async getProjectInfo() {
        const items = [];
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
        }
        catch {
            // Git not available
        }
        // Quick actions
        items.push({
            label: 'Initialize Project',
            description: 'Set up StackCode project',
            icon: 'play',
            command: 'stackcode.init'
        }, {
            label: 'Generate Files',
            description: 'Create README, .gitignore, etc.',
            icon: 'file-add',
            command: 'stackcode.generate.readme'
        }, {
            label: 'Start Branch',
            description: 'Create new feature branch',
            icon: 'git-branch',
            command: 'stackcode.git.start'
        }, {
            label: 'Create Commit',
            description: 'Make conventional commit',
            icon: 'git-commit',
            command: 'stackcode.commit'
        });
        return items;
    }
}
exports.ProjectViewProvider = ProjectViewProvider;
//# sourceMappingURL=ProjectViewProvider.js.map