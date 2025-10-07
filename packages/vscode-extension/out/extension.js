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
const AuthCommand_1 = require("./commands/AuthCommand");
const TestGitHubDetectionCommand_1 = require("./commands/TestGitHubDetectionCommand");
const TestRemoteStatsCommand_1 = require("./commands/TestRemoteStatsCommand");
const DashboardProvider_1 = require("./providers/DashboardProvider");
const AuthFlowManager_1 = require("./services/AuthFlowManager");
const GitHubRemoteStatsService_1 = require("./services/GitHubRemoteStatsService");
const ProjectViewProvider_1 = require("./providers/ProjectViewProvider");
const GitHubAuthService_1 = require("./services/GitHubAuthService");
const ProgressManager_1 = require("./services/ProgressManager");
let proactiveManager;
let gitMonitor;
let fileMonitor;
let configManager;
let dashboardProvider;
let projectViewProvider;
let gitHubAuthService;
let progressManager;
let initCommand;
let generateCommand;
let gitCommand;
let commitCommand;
let validateCommand;
let releaseCommand;
let configCommand;
let authCommand;
let authFlowManager;
let gitHubRemoteStatsService;
let testRemoteStatsCommand;
/**
 * Activates the StackCode VS Code extension.
 * Initializes all services, monitors, providers, and registers commands.
 */
async function activate(context) {
    console.log("🚀 [StackCode] Extension activating...");
    configManager = new ConfigurationManager_1.ConfigurationManager();
    gitHubAuthService = new GitHubAuthService_1.GitHubAuthService(context);
    progressManager = new ProgressManager_1.ProgressManager();
    proactiveManager = new ProactiveNotificationManager_1.ProactiveNotificationManager(configManager);
    gitMonitor = new GitMonitor_1.GitMonitor(proactiveManager, configManager);
    fileMonitor = new FileMonitor_1.FileMonitor(proactiveManager, configManager);
    // Initialize auth flow and remote stats services
    authFlowManager = new AuthFlowManager_1.AuthFlowManager(gitHubAuthService, context);
    gitHubRemoteStatsService = new GitHubRemoteStatsService_1.GitHubRemoteStatsService(gitHubAuthService, gitMonitor);
    testRemoteStatsCommand = new TestRemoteStatsCommand_1.TestRemoteStatsCommand(authFlowManager, gitHubRemoteStatsService);
    dashboardProvider = new DashboardProvider_1.DashboardProvider(context, gitHubAuthService, gitMonitor, progressManager);
    projectViewProvider = new ProjectViewProvider_1.ProjectViewProvider(context.workspaceState);
    initCommand = new InitCommand_1.InitCommand();
    generateCommand = new GenerateCommand_1.GenerateCommand();
    gitCommand = new GitCommand_1.GitCommand();
    commitCommand = new CommitCommand_1.CommitCommand(gitHubAuthService, gitMonitor, progressManager, context);
    validateCommand = new ValidateCommand_1.ValidateCommand();
    releaseCommand = new ReleaseCommand_1.ReleaseCommand(gitHubAuthService, progressManager, context);
    configCommand = new ConfigCommand_1.ConfigCommand();
    authCommand = new AuthCommand_1.AuthCommand(gitHubAuthService, dashboardProvider);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("stackcode.dashboard", dashboardProvider), vscode.window.registerTreeDataProvider("stackcode.projectView", projectViewProvider));
    const commands = [
        vscode.commands.registerCommand("stackcode.init", () => initCommand.execute()),
        vscode.commands.registerCommand("stackcode.validate.commit", () => validateCommand.validateCommitMessage()),
        vscode.commands.registerCommand("stackcode.generate.readme", () => generateCommand.generateReadme()),
        vscode.commands.registerCommand("stackcode.generate.gitignore", () => generateCommand.generateGitignore()),
        vscode.commands.registerCommand("stackcode.git.start", () => gitCommand.startBranch()),
        vscode.commands.registerCommand("stackcode.git.finish", () => gitCommand.finishBranch()),
        vscode.commands.registerCommand("stackcode.commit", () => commitCommand.execute()),
        vscode.commands.registerCommand("stackcode.validate", () => validateCommand.execute()),
        vscode.commands.registerCommand("stackcode.release", () => releaseCommand.execute()),
        vscode.commands.registerCommand("stackcode.config", () => configCommand.execute()),
        vscode.commands.registerCommand("stackcode.dashboard", () => dashboardProvider.show()),
        vscode.commands.registerCommand("stackcode.auth.login", () => authCommand.executeLogin()),
        vscode.commands.registerCommand("stackcode.auth.logout", () => authCommand.executeLogout()),
        vscode.commands.registerCommand("stackcode.test.github.detection", () => new TestGitHubDetectionCommand_1.TestGitHubDetectionCommand().execute()),
        vscode.commands.registerCommand("stackcode.test.stats", () => testRemoteStatsCommand.execute()),
        vscode.commands.registerCommand("stackcode.createBranch", () => gitCommand.startBranch()),
        vscode.commands.registerCommand("stackcode.formatCommitMessage", () => commitCommand.execute()),
        vscode.commands.registerCommand("stackcode.checkBestPractices", () => validateCommand.execute()),
        vscode.commands.registerCommand("stackcode.projectView.refresh", () => projectViewProvider.refresh()),
        vscode.commands.registerCommand("webviewReady", () => { }),
        vscode.commands.registerCommand("stackcode.webview.init", () => initCommand.execute()),
        vscode.commands.registerCommand("stackcode.webview.generate.readme", () => generateCommand.generateReadme()),
        vscode.commands.registerCommand("stackcode.webview.generate.gitignore", () => generateCommand.generateGitignore()),
        vscode.commands.registerCommand("stackcode.webview.git.start", () => gitCommand.startBranch()),
        vscode.commands.registerCommand("stackcode.webview.commit", () => commitCommand.execute()),
        vscode.commands.registerCommand("stackcode.webview.validate", () => validateCommand.execute()),
    ];
    context.subscriptions.push(...commands, gitMonitor, fileMonitor, proactiveManager, dashboardProvider, gitHubAuthService, progressManager);
    await gitHubAuthService.initializeFromStorage();
    gitMonitor.startMonitoring();
    fileMonitor.startMonitoring();
    if (configManager.dashboardAutoOpen) {
        setTimeout(() => dashboardProvider.show(), 1000);
    }
    proactiveManager.showWelcomeMessage();
    console.log("✅ [StackCode] Extension activated successfully");
}
exports.activate = activate;
/**
 * Deactivates the extension and cleans up resources.
 */
function deactivate() {
    if (progressManager) {
        progressManager.dispose();
    }
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