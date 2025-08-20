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
import { AuthCommand } from "./commands/AuthCommand";
import { TestGitHubDetectionCommand } from "./commands/TestGitHubDetectionCommand";
import { DashboardProvider } from "./providers/DashboardProvider";
import { ProjectViewProvider } from "./providers/ProjectViewProvider";
import { GitHubAuthService } from "./services/GitHubAuthService";
import { GitHubIssuesService } from "./services/GitHubIssuesService";

let proactiveManager: ProactiveNotificationManager;
let gitMonitor: GitMonitor;
let fileMonitor: FileMonitor;
let configManager: ConfigurationManager;
let dashboardProvider: DashboardProvider;
let projectViewProvider: ProjectViewProvider;
let gitHubAuthService: GitHubAuthService;
let gitHubIssuesService: GitHubIssuesService;

// Command instances
let initCommand: InitCommand;
let generateCommand: GenerateCommand;
let gitCommand: GitCommand;
let commitCommand: CommitCommand;
let validateCommand: ValidateCommand;
let releaseCommand: ReleaseCommand;
let configCommand: ConfigCommand;
let authCommand: AuthCommand;

export async function activate(context: vscode.ExtensionContext) {
  console.log("🚀 [StackCode] Extension activation started!");
  console.log("🚀 [StackCode] Extension is now active!");
  console.log("🚀 [StackCode] Extension activation started...");
  console.log(
    "🚀 [StackCode] Workspace folders:",
    vscode.workspace.workspaceFolders?.length || 0,
  );
  console.log("🚀 [StackCode] Extension path:", context.extensionPath);

  // Initialize configuration manager
  configManager = new ConfigurationManager();

  // Initialize GitHub authentication service
  gitHubAuthService = new GitHubAuthService(context);

  // Initialize notification manager
  proactiveManager = new ProactiveNotificationManager(configManager);

  // Initialize monitors FIRST (dependencies for other services)
  gitMonitor = new GitMonitor(proactiveManager, configManager);
  fileMonitor = new FileMonitor(proactiveManager, configManager);

  // Initialize GitHub issues service (depends on gitMonitor)
  gitHubIssuesService = new GitHubIssuesService(gitHubAuthService, gitMonitor);

  // Initialize providers (after services are ready)
  dashboardProvider = new DashboardProvider(
    context,
    gitHubIssuesService,
    gitHubAuthService,
  );
  projectViewProvider = new ProjectViewProvider(context.workspaceState);

  // Initialize commands
  initCommand = new InitCommand();
  generateCommand = new GenerateCommand();
  gitCommand = new GitCommand();
  commitCommand = new CommitCommand();
  validateCommand = new ValidateCommand();
  releaseCommand = new ReleaseCommand();
  configCommand = new ConfigCommand();
  authCommand = new AuthCommand(gitHubAuthService);

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
    vscode.commands.registerCommand("stackcode.auth.login", () => {
      console.log("🔐 [StackCode] AUTH LOGIN command executed!");
      vscode.window.showInformationMessage(
        "🔐 StackCode: Executando login GitHub...",
      );
      return authCommand.executeLogin();
    }),
    vscode.commands.registerCommand("stackcode.auth.logout", () => {
      console.log("🔓 [StackCode] AUTH LOGOUT command executed!");
      vscode.window.showInformationMessage(
        "🔓 StackCode: Executando logout GitHub...",
      );
      return authCommand.executeLogout();
    }),

    // Test commands (development only)
    vscode.commands.registerCommand("stackcode.test.github.detection", () => {
      console.log("🧪 [StackCode] TEST GITHUB DETECTION command executed!");
      const testCommand = new TestGitHubDetectionCommand();
      return testCommand.execute();
    }),

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

    // Webview commands
    vscode.commands.registerCommand("webviewReady", () => {
      console.log("[StackCode] Webview is ready!");
      // Pode enviar dados iniciais aqui se necessário
    }),
    vscode.commands.registerCommand("stackcode.webview.init", () =>
      initCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.webview.generate.readme", () =>
      generateCommand.generateReadme(),
    ),
    vscode.commands.registerCommand(
      "stackcode.webview.generate.gitignore",
      () => generateCommand.generateGitignore(),
    ),
    vscode.commands.registerCommand("stackcode.webview.git.start", () =>
      gitCommand.startBranch(),
    ),
    vscode.commands.registerCommand("stackcode.webview.commit", () =>
      commitCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.webview.validate", () =>
      validateCommand.execute(),
    ),
  ];

  // Add all to context subscriptions for cleanup
  context.subscriptions.push(
    ...commands,
    gitMonitor,
    fileMonitor,
    proactiveManager,
    dashboardProvider,
    gitHubAuthService,
  );

  console.log("📋 [StackCode] Commands registered:", commands.length);
  console.log("🔐 [StackCode] Auth commands should be available now");
  console.log(
    "🎯 [StackCode] Available commands: stackcode.auth.login, stackcode.auth.logout, stackcode.dashboard",
  );

  // Initialize GitHub authentication
  await gitHubAuthService.initializeFromStorage();

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
