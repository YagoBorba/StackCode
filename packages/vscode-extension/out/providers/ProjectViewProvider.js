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
        const item = new vscode.TreeItem(element.label, element.collapsibleState);
        // Enhanced icons and styling
        const iconMap = {
            "StackCode Project": "rocket",
            "Quick Actions": "zap",
            "Initialize Project": "folder-opened",
            "Generate README": "book",
            "Generate .gitignore": "git-branch",
            "Validate Project": "check",
            "Git Workflow": "git-commit",
            "Start Feature": "git-branch",
            "Create Hotfix": "flame",
            "Make Release": "package",
            "Commit Changes": "git-commit",
            "Project Tools": "tools",
            Configuration: "gear",
            "Show Dashboard": "dashboard",
            "View Project Stats": "graph",
            "Help & Documentation": "question",
        };
        // Set icons with theme support
        item.iconPath = new vscode.ThemeIcon(iconMap[element.label] || "circle-filled");
        // Add commands for interactive items
        if (element.command) {
            // Handle both string and Command object types
            if (typeof element.command === "string") {
                item.command = {
                    command: element.command,
                    title: element.label,
                };
            }
            else {
                item.command = element.command;
            }
            // Add hover descriptions
            const tooltips = {
                "Initialize Project": "Create a new project with StackCode scaffolding",
                "Generate README": "Generate a comprehensive README.md file",
                "Generate .gitignore": "Generate .gitignore based on project type",
                "Validate Project": "Check project structure and best practices",
                "Start Feature": "Begin a new feature using GitFlow",
                "Create Hotfix": "Create a hotfix branch for urgent fixes",
                "Make Release": "Create a new release with automated versioning",
                "Commit Changes": "Make a conventional commit with validation",
                Configuration: "Configure StackCode settings",
                "Show Dashboard": "Open the interactive StackCode dashboard",
                "View Project Stats": "See detailed project statistics",
                "Help & Documentation": "Access StackCode documentation",
            };
            item.tooltip = tooltips[element.label] || element.label;
        }
        // Style for different types
        if (element.children && element.children.length > 0) {
            item.contextValue = "stackcode-category";
        }
        else if (element.command) {
            item.contextValue = "stackcode-action";
        }
        return item;
    }
    getChildren(element) {
        if (!element) {
            // Root level - show main categories with enhanced structure
            return Promise.resolve([
                {
                    label: "StackCode Project",
                    icon: "rocket",
                    collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                    children: [
                        {
                            label: "Quick Actions",
                            icon: "zap",
                            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                            children: [
                                {
                                    label: "Initialize Project",
                                    icon: "folder-opened",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.init",
                                        title: "Initialize Project",
                                    },
                                },
                                {
                                    label: "Generate README",
                                    icon: "book",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.generate.readme",
                                        title: "Generate README",
                                    },
                                },
                                {
                                    label: "Generate .gitignore",
                                    icon: "git-branch",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.generate.gitignore",
                                        title: "Generate .gitignore",
                                    },
                                },
                                {
                                    label: "Validate Project",
                                    icon: "check",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.validate",
                                        title: "Validate Project",
                                    },
                                },
                            ],
                        },
                        {
                            label: "Git Workflow",
                            icon: "git-commit",
                            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                            children: [
                                {
                                    label: "Start Feature",
                                    icon: "git-branch",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.git.feature.start",
                                        title: "Start Feature",
                                    },
                                },
                                {
                                    label: "Create Hotfix",
                                    icon: "flame",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.git.hotfix.start",
                                        title: "Create Hotfix",
                                    },
                                },
                                {
                                    label: "Make Release",
                                    icon: "package",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.release",
                                        title: "Make Release",
                                    },
                                },
                                {
                                    label: "Commit Changes",
                                    icon: "git-commit",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.commit",
                                        title: "Commit Changes",
                                    },
                                },
                            ],
                        },
                        {
                            label: "Project Tools",
                            icon: "tools",
                            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                            children: [
                                {
                                    label: "Configuration",
                                    icon: "gear",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.config",
                                        title: "Configuration",
                                    },
                                },
                                {
                                    label: "Show Dashboard",
                                    icon: "dashboard",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.dashboard.show",
                                        title: "Show Dashboard",
                                    },
                                },
                                {
                                    label: "View Project Stats",
                                    icon: "graph",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.stats.show",
                                        title: "View Project Stats",
                                    },
                                },
                                {
                                    label: "Help & Documentation",
                                    icon: "question",
                                    collapsibleState: vscode.TreeItemCollapsibleState.None,
                                    command: {
                                        command: "stackcode.help",
                                        title: "Help & Documentation",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ]);
        }
        else {
            return Promise.resolve(element.children || []);
        }
    }
    async getProjectInfo() {
        const items = [];
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [
                {
                    label: "No workspace",
                    description: "Open a folder to see project info",
                    icon: "folder-opened",
                },
            ];
        }
        // Project name
        items.push({
            label: workspaceFolder.name,
            description: "Project root",
            icon: "folder",
        });
        // Git status
        try {
            const gitExtension = vscode.extensions.getExtension("vscode.git");
            if (gitExtension && gitExtension.isActive) {
                const git = gitExtension.exports;
                const api = git.getAPI(1);
                const repo = api.repositories[0];
                if (repo && repo.state.HEAD) {
                    items.push({
                        label: `Branch: ${repo.state.HEAD.name}`,
                        description: `${repo.state.workingTreeChanges.length} changes`,
                        icon: "git-branch",
                    });
                }
            }
        }
        catch {
            // Git not available
        }
        // Quick actions
        items.push({
            label: "Initialize Project",
            description: "Set up StackCode project",
            icon: "play",
            command: "stackcode.init",
        }, {
            label: "Generate Files",
            description: "Create README, .gitignore, etc.",
            icon: "file-add",
            command: "stackcode.generate.readme",
        }, {
            label: "Start Branch",
            description: "Create new feature branch",
            icon: "git-branch",
            command: "stackcode.git.start",
        }, {
            label: "Create Commit",
            description: "Make conventional commit",
            icon: "git-commit",
            command: "stackcode.commit",
        });
        return items;
    }
}
exports.ProjectViewProvider = ProjectViewProvider;
//# sourceMappingURL=ProjectViewProvider.js.map