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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const ProactiveNotificationManager_1 = require("./notifications/ProactiveNotificationManager");
const GitMonitor_1 = require("./monitors/GitMonitor");
const FileMonitor_1 = require("./monitors/FileMonitor");
const ConfigurationManager_1 = require("./config/ConfigurationManager");
const InitCommand_1 = require("./commands/InitCommand");
const GenerateCommand_1 = require("./commands/GenerateCommand");
const GitCommand_1 = require("./commands/GitCommand");
const CommitCommand_1 = require("./commands/CommitCommand");
const ValidateCommand_1 = require("./commands/ValidateCommand");
const ReleaseCommand_1 = require("./commands/ReleaseCommand");
const ConfigCommand_1 = require("./commands/ConfigCommand");
const DashboardProvider_1 = require("./providers/DashboardProvider");
const ProjectViewProvider_1 = require("./providers/ProjectViewProvider");
let proactiveManager;
let gitMonitor;
let fileMonitor;
let configManager;
let dashboardProvider;
let projectViewProvider;
// Command instances
let initCommand;
let generateCommand;
let gitCommand;
let commitCommand;
let validateCommand;
let releaseCommand;
let configCommand;
function activate(context) {
    console.log('StackCode extension is now active!');
    // Initialize configuration manager
    configManager = new ConfigurationManager_1.ConfigurationManager();
    // Initialize notification manager
    proactiveManager = new ProactiveNotificationManager_1.ProactiveNotificationManager(configManager);
    // Initialize monitors
    gitMonitor = new GitMonitor_1.GitMonitor(proactiveManager, configManager);
    fileMonitor = new FileMonitor_1.FileMonitor(proactiveManager, configManager);
    // Initialize providers
    dashboardProvider = new DashboardProvider_1.DashboardProvider(context.extensionUri);
    projectViewProvider = new ProjectViewProvider_1.ProjectViewProvider(context.workspaceState);
    // Initialize commands
    initCommand = new InitCommand_1.InitCommand();
    generateCommand = new GenerateCommand_1.GenerateCommand();
    gitCommand = new GitCommand_1.GitCommand();
    commitCommand = new CommitCommand_1.CommitCommand();
    validateCommand = new ValidateCommand_1.ValidateCommand();
    releaseCommand = new ReleaseCommand_1.ReleaseCommand();
    configCommand = new ConfigCommand_1.ConfigCommand();
    // Register webview providers
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('stackcode.dashboard', dashboardProvider), vscode.window.registerTreeDataProvider('stackcode.projectView', projectViewProvider));
    // Register all commands
    const commands = [
        // Core functionality commands
        vscode.commands.registerCommand('stackcode.init', () => initCommand.execute()),
        vscode.commands.registerCommand('stackcode.generate.readme', () => generateCommand.generateReadme()),
        vscode.commands.registerCommand('stackcode.generate.gitignore', () => generateCommand.generateGitignore()),
        vscode.commands.registerCommand('stackcode.git.start', () => gitCommand.startBranch()),
        vscode.commands.registerCommand('stackcode.git.finish', () => gitCommand.finishBranch()),
        vscode.commands.registerCommand('stackcode.commit', () => commitCommand.execute()),
        vscode.commands.registerCommand('stackcode.validate', () => validateCommand.execute()),
        vscode.commands.registerCommand('stackcode.release', () => releaseCommand.execute()),
        vscode.commands.registerCommand('stackcode.config', () => configCommand.execute()),
        vscode.commands.registerCommand('stackcode.dashboard', () => dashboardProvider.show()),
        // Legacy commands for backward compatibility
        vscode.commands.registerCommand('stackcode.createBranch', () => gitCommand.startBranch()),
        vscode.commands.registerCommand('stackcode.formatCommitMessage', () => commitCommand.execute()),
        vscode.commands.registerCommand('stackcode.checkBestPractices', () => validateCommand.execute()),
        // Project view commands
        vscode.commands.registerCommand('stackcode.projectView.refresh', () => projectViewProvider.refresh()),
    ];
    // Add all to context subscriptions for cleanup
    context.subscriptions.push(...commands, gitMonitor, fileMonitor, proactiveManager, dashboardProvider);
    // Start monitoring
    gitMonitor.startMonitoring();
    fileMonitor.startMonitoring();
    // Auto-open dashboard if configured
    if (configManager.dashboardAutoOpen) {
        setTimeout(() => {
            dashboardProvider.show();
        }, 1000);
    }
    // Show welcome message
    proactiveManager.showWelcomeMessage();
}
exports.activate = activate;
function deactivate() {
    if (gitMonitor) {
        gitMonitor.dispose();
    }
    if (fileMonitor) {
        fileMonitor.dispose();
    }
    if (proactiveManager) {
        proactiveManager.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map