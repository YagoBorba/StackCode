import * as vscode from "vscode";
import { ProactiveNotificationManager } from "./notifications/ProactiveNotificationManager";
import { GitMonitor } from "./monitors/GitMonitor";
import { FileMonitor } from "./monitors/FileMonitor";
import { ConfigurationManager } from "./config/ConfigurationManager";
import { InitCommand } from "./commands/InitCommand";
import { GenerateCommand } from "./commands/GenerateCommand";
import { GitCommand } from "./commands/GitCommand";
import { CommitCommand } from "./commands/CommitCommand";
import { ValidateCommand } from "./commands/ValidateCommand";
import { ReleaseCommand } from "./commands/ReleaseCommand";
import { ConfigCommand } from "./commands/ConfigCommand";
import { DashboardProvider } from "./providers/DashboardProvider";
import { ProjectViewProvider } from "./providers/ProjectViewProvider";

let proactiveManager: ProactiveNotificationManager;
let gitMonitor: GitMonitor;
let fileMonitor: FileMonitor;
let configManager: ConfigurationManager;
let dashboardProvider: DashboardProvider;
let projectViewProvider: ProjectViewProvider;

// Command instances
let initCommand: InitCommand;
let generateCommand: GenerateCommand;
let gitCommand: GitCommand;
let commitCommand: CommitCommand;
let validateCommand: ValidateCommand;
let releaseCommand: ReleaseCommand;
let configCommand: ConfigCommand;

export function activate(context: vscode.ExtensionContext) {
  console.log("StackCode extension is now active!");

  // Initialize configuration manager
  configManager = new ConfigurationManager();

  // Initialize notification manager
  proactiveManager = new ProactiveNotificationManager(configManager);

  // Initialize monitors
  gitMonitor = new GitMonitor(proactiveManager, configManager);
  fileMonitor = new FileMonitor(proactiveManager, configManager);

  // Initialize providers
  dashboardProvider = new DashboardProvider(context.extensionUri);
  projectViewProvider = new ProjectViewProvider(context.workspaceState);

  // Initialize commands
  initCommand = new InitCommand();
  generateCommand = new GenerateCommand();
  gitCommand = new GitCommand();
  commitCommand = new CommitCommand();
  validateCommand = new ValidateCommand();
  releaseCommand = new ReleaseCommand();
  configCommand = new ConfigCommand();

  // Register webview providers
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "stackcode.dashboard",
      dashboardProvider,
    ),
    vscode.window.registerTreeDataProvider(
      "stackcode.projectView",
      projectViewProvider,
    ),
  );

  // Register all commands
  const commands = [
    // Core functionality commands
    vscode.commands.registerCommand("stackcode.init", () =>
      initCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.generate.readme", () =>
      generateCommand.generateReadme(),
    ),
    vscode.commands.registerCommand("stackcode.generate.gitignore", () =>
      generateCommand.generateGitignore(),
    ),
    vscode.commands.registerCommand("stackcode.git.start", () =>
      gitCommand.startBranch(),
    ),
    vscode.commands.registerCommand("stackcode.git.finish", () =>
      gitCommand.finishBranch(),
    ),
    vscode.commands.registerCommand("stackcode.commit", () =>
      commitCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.validate", () =>
      validateCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.release", () =>
      releaseCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.config", () =>
      configCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.dashboard", () =>
      dashboardProvider.show(),
    ),

    // Legacy commands for backward compatibility
    vscode.commands.registerCommand("stackcode.createBranch", () =>
      gitCommand.startBranch(),
    ),
    vscode.commands.registerCommand("stackcode.formatCommitMessage", () =>
      commitCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.checkBestPractices", () =>
      validateCommand.execute(),
    ),

    // Project view commands
    vscode.commands.registerCommand("stackcode.projectView.refresh", () =>
      projectViewProvider.refresh(),
    ),
  ];

  // Add all to context subscriptions for cleanup
  context.subscriptions.push(
    ...commands,
    gitMonitor,
    fileMonitor,
    proactiveManager,
    dashboardProvider,
  );

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

export function deactivate() {
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
