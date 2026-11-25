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
import { TestRemoteStatsCommand } from "./commands/TestRemoteStatsCommand";
import { DashboardProvider } from "./providers/DashboardProvider";
import { AuthFlowManager } from "./services/AuthFlowManager";
import { GitHubRemoteStatsService } from "./services/GitHubRemoteStatsService";
import { ProjectViewProvider } from "./providers/ProjectViewProvider";
import { GitHubAuthService } from "./services/GitHubAuthService";
import { ProgressManager } from "./services/ProgressManager";

let proactiveManager: ProactiveNotificationManager;
let gitMonitor: GitMonitor;
let fileMonitor: FileMonitor;
let configManager: ConfigurationManager;
let dashboardProvider: DashboardProvider;
let projectViewProvider: ProjectViewProvider;
let gitHubAuthService: GitHubAuthService;
let progressManager: ProgressManager;
let initCommand: InitCommand;
let generateCommand: GenerateCommand;
let gitCommand: GitCommand;
let commitCommand: CommitCommand;
let validateCommand: ValidateCommand;
let releaseCommand: ReleaseCommand;
let configCommand: ConfigCommand;
let authCommand: AuthCommand;
let authFlowManager: AuthFlowManager;
let gitHubRemoteStatsService: GitHubRemoteStatsService;
let testRemoteStatsCommand: TestRemoteStatsCommand;

export async function activate(context: vscode.ExtensionContext) {
  console.log("🚀 [StackCode] Extension activating...");

  configManager = new ConfigurationManager();
  gitHubAuthService = new GitHubAuthService(context);
  progressManager = new ProgressManager();
  proactiveManager = new ProactiveNotificationManager(configManager);
  gitMonitor = new GitMonitor(proactiveManager, configManager);
  fileMonitor = new FileMonitor(proactiveManager, configManager);
  
  // Initialize auth flow and remote stats services
  authFlowManager = new AuthFlowManager(gitHubAuthService, context);
  gitHubRemoteStatsService = new GitHubRemoteStatsService(
    gitHubAuthService,
    gitMonitor,
  );
  testRemoteStatsCommand = new TestRemoteStatsCommand(
    authFlowManager,
    gitHubRemoteStatsService,
  );
  
  dashboardProvider = new DashboardProvider(
    context,
    gitHubAuthService,
    gitMonitor,
    progressManager,
  );
  projectViewProvider = new ProjectViewProvider(context.workspaceState);
  initCommand = new InitCommand();
  generateCommand = new GenerateCommand();
  gitCommand = new GitCommand();
  commitCommand = new CommitCommand(
    gitHubAuthService,
    gitMonitor,
    progressManager,
    context,
  );
  validateCommand = new ValidateCommand();
  releaseCommand = new ReleaseCommand(gitHubAuthService, progressManager, context);
  configCommand = new ConfigCommand();
  authCommand = new AuthCommand(gitHubAuthService, dashboardProvider);
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

  const commands = [
    vscode.commands.registerCommand("stackcode.init", () =>
      initCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.validate.commit", () =>
      validateCommand.validateCommitMessage(),
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
    vscode.commands.registerCommand("stackcode.auth.login", () =>
      authCommand.executeLogin(),
    ),
    vscode.commands.registerCommand("stackcode.auth.logout", () =>
      authCommand.executeLogout(),
    ),
    vscode.commands.registerCommand("stackcode.test.github.detection", () =>
      new TestGitHubDetectionCommand().execute(),
    ),
    vscode.commands.registerCommand("stackcode.test.stats", () =>
      testRemoteStatsCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.createBranch", () =>
      gitCommand.startBranch(),
    ),
    vscode.commands.registerCommand("stackcode.formatCommitMessage", () =>
      commitCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.checkBestPractices", () =>
      validateCommand.execute(),
    ),
    vscode.commands.registerCommand("stackcode.projectView.refresh", () =>
      projectViewProvider.refresh(),
    ),
    vscode.commands.registerCommand("webviewReady", () => {}),
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

  context.subscriptions.push(
    ...commands,
    gitMonitor,
    fileMonitor,
    proactiveManager,
    dashboardProvider,
    gitHubAuthService,
    progressManager,
  );

  await gitHubAuthService.initializeFromStorage();
  gitMonitor.startMonitoring();
  fileMonitor.startMonitoring();

  if (configManager.dashboardAutoOpen) {
    setTimeout(() => dashboardProvider.show(), 1000);
  }

  proactiveManager.showWelcomeMessage();
  console.log("✅ [StackCode] Extension activated successfully");
}

export function deactivate() {
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
