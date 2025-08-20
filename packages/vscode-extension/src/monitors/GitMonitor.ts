import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { ProactiveNotificationManager } from "../notifications/ProactiveNotificationManager";
import { ConfigurationManager } from "../config/ConfigurationManager";

export interface GitHubRepository {
  owner: string;
  repo: string;
  fullName: string;
  remoteUrl: string;
}

export class GitMonitor implements vscode.Disposable {
  private proactiveManager: ProactiveNotificationManager;
  private configManager: ConfigurationManager;
  private disposables: vscode.Disposable[] = [];
  private lastBranch: string | undefined;

  constructor(
    proactiveManager: ProactiveNotificationManager,
    configManager: ConfigurationManager,
  ) {
    this.proactiveManager = proactiveManager;
    this.configManager = configManager;
  }

  startMonitoring(): void {
    const gitExtension = vscode.extensions.getExtension("vscode.git");
    if (gitExtension) {
      if (gitExtension.isActive) {
        this.setupGitMonitoring();
      } else {
        gitExtension.activate().then(() => {
          this.setupGitMonitoring();
        });
      }
    }

    this.disposables.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        this.checkCurrentBranch();
      }),
    );

    setTimeout(() => {
      this.checkCurrentBranch();
    }, 2000);
  }

  private setupGitMonitoring(): void {
    try {
      const git = vscode.extensions.getExtension("vscode.git")?.exports;
      if (git) {
        const gitAPI = git.getAPI(1);

        this.disposables.push(
          gitAPI.onDidChangeState(() => {
            this.checkCurrentBranch();
          }),
        );

        this.disposables.push(
          gitAPI.onDidOpenRepository(() => {
            this.checkCurrentBranch();
          }),
        );
      }
    } catch (error) {
      console.log("Failed to setup git monitoring:", error);
    }
  }

  private async checkCurrentBranch(): Promise<void> {
    try {
      const git = vscode.extensions.getExtension("vscode.git")?.exports;
      if (git) {
        const gitAPI = git.getAPI(1);
        const repo = gitAPI.repositories[0];

        if (repo && repo.state.HEAD) {
          const currentBranch = repo.state.HEAD.name;

          if (currentBranch && currentBranch !== this.lastBranch) {
            this.lastBranch = currentBranch;
            await this.proactiveManager.showBranchWarning(currentBranch);
          }
        }
      }
    } catch (error) {
      console.log("Error checking current branch:", error);
    }
  }

  async showCreateBranchDialog(): Promise<void> {
    const branchName = await vscode.window.showInputBox({
      prompt: "Enter the name for the new branch",
      placeHolder: "feature/new-feature",
      validateInput: (value: string) => {
        if (!value) {
          return "Branch name is required";
        }
        if (!/^[a-zA-Z0-9/_-]+$/.test(value)) {
          return "Branch name can only contain letters, numbers, hyphens, underscores and slashes";
        }
        return null;
      },
    });

    if (branchName) {
      const branchType = await vscode.window.showQuickPick(
        [
          { label: "feature", description: "A new feature branch" },
          { label: "bugfix", description: "A bug fix branch" },
          { label: "hotfix", description: "A hotfix branch" },
          { label: "release", description: "A release branch" },
        ],
        {
          placeHolder: "Select branch type",
        },
      );

      if (branchType) {
        const fullBranchName = branchName.includes("/")
          ? branchName
          : `${branchType.label}/${branchName}`;

        try {
          const terminal = vscode.window.createTerminal("StackCode Git");
          terminal.sendText(`git checkout -b ${fullBranchName}`);
          terminal.show();

          vscode.window.showInformationMessage(
            `✅ Created and switched to branch: ${fullBranchName}`,
          );
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create branch: ${error}`);
        }
      }
    }
  }

  async showCommitMessageDialog(): Promise<void> {
    const commitType = await vscode.window.showQuickPick(
      [
        { label: "feat", description: "A new feature" },
        { label: "fix", description: "A bug fix" },
        { label: "docs", description: "Documentation changes" },
        { label: "style", description: "Code style changes (formatting, etc)" },
        { label: "refactor", description: "Code refactoring" },
        { label: "perf", description: "Performance improvements" },
        { label: "test", description: "Adding or updating tests" },
        { label: "chore", description: "Maintenance tasks" },
        { label: "build", description: "Build system changes" },
        { label: "ci", description: "CI/CD changes" },
      ],
      {
        placeHolder: "Select commit type",
      },
    );

    if (!commitType) {
      return;
    }

    const scope = await vscode.window.showInputBox({
      prompt: "Enter scope (optional)",
      placeHolder: "auth, api, ui, etc.",
    });

    const description = await vscode.window.showInputBox({
      prompt: "Enter commit description",
      placeHolder: "add user authentication",
      validateInput: (value: string) => {
        if (!value) {
          return "Description is required";
        }
        if (value.length > 50) {
          return "Description should be 50 characters or less";
        }
        return null;
      },
    });

    if (!description) {
      return;
    }

    let commitMessage = commitType.label;
    if (scope) {
      commitMessage += `(${scope})`;
    }
    commitMessage += `: ${description}`;

    await vscode.env.clipboard.writeText(commitMessage);

    vscode.window
      .showInformationMessage(
        `📋 Commit message copied to clipboard: ${commitMessage}`,
        "Open Git Panel",
      )
      .then((action: string | undefined) => {
        if (action === "Open Git Panel") {
          vscode.commands.executeCommand("workbench.view.scm");
        }
      });
  }

  /**
   * Detecta o repositório GitHub atual usando múltiplas estratégias
   */
  public async getCurrentGitHubRepository(): Promise<GitHubRepository | null> {
    try {
      console.log("🔍 [GitMonitor] Starting repository detection...");

      const fromConfigFile = await this.getRepositoryFromGitConfig();
      if (fromConfigFile) {
        console.log(
          `✅ [GitMonitor] Repository detected via .git/config: ${fromConfigFile.fullName}`,
        );
        return fromConfigFile;
      }

      const fromGitAPI = await this.getRepositoryFromGitAPI();
      if (fromGitAPI) {
        console.log(
          `✅ [GitMonitor] Repository detected via Git API: ${fromGitAPI.fullName}`,
        );
        return fromGitAPI;
      }

      console.warn(
        "❌ [GitMonitor] No GitHub repository detected with any strategy",
      );
      return null;
    } catch (error) {
      console.error(
        "❌ [GitMonitor] Failed to get current GitHub repository:",
        error,
      );
      return null;
    }
  }

  /**
   * Estratégia 1: Lê repositório diretamente do .git/config
   */
  private async getRepositoryFromGitConfig(): Promise<GitHubRepository | null> {
    try {
      const workspaceFolders = vscode.workspace.workspaceFolders;

      // Lista de caminhos para tentar
      const pathsToTry: string[] = [];

      if (workspaceFolders && workspaceFolders.length > 0) {
        // Adicionar workspace folders configurados
        workspaceFolders.forEach((folder) => {
          pathsToTry.push(folder.uri.fsPath);
        });
      }

      // Adicionar caminhos alternativos comuns em dev containers
      pathsToTry.push(
        "/workspaces/StackCode",
        process.cwd(),
        path.join(process.cwd(), ".."),
        path.join(process.cwd(), "..", ".."),
      );

      console.log(
        `🔍 [GitMonitor] Trying ${pathsToTry.length} possible paths:`,
        pathsToTry,
      );

      for (const folderPath of pathsToTry) {
        const gitConfigPath = path.join(folderPath, ".git", "config");

        console.log(`🔍 [GitMonitor] Checking git config at: ${gitConfigPath}`);

        if (fs.existsSync(gitConfigPath)) {
          const configContent = fs.readFileSync(gitConfigPath, "utf8");
          console.log(`📄 [GitMonitor] Found .git/config at: ${folderPath}`);

          // Procurar pela URL do remote origin
          const originMatch = configContent.match(
            /\[remote "origin"\]\s*\n\s*url\s*=\s*(.+)/,
          );
          if (originMatch) {
            const remoteUrl = originMatch[1].trim();
            console.log(`🔗 [GitMonitor] Found remote origin: ${remoteUrl}`);

            const githubRepo = this.parseGitHubUrl(remoteUrl);
            if (githubRepo) {
              return githubRepo;
            }
          }
        }
      }

      console.log("❌ [GitMonitor] No .git/config found in any path");
      return null;
    } catch (error) {
      console.error("❌ [GitMonitor] Error reading .git/config:", error);
      return null;
    }
  } /**
   * Estratégia 2: Via Git Extension API (método original como fallback)
   */
  private async getRepositoryFromGitAPI(): Promise<GitHubRepository | null> {
    try {
      const git = vscode.extensions.getExtension("vscode.git")?.exports;
      if (!git) {
        console.warn("⚠️ [GitMonitor] Git extension not available");
        return null;
      }

      const gitAPI = git.getAPI(1);
      if (!gitAPI || gitAPI.repositories.length === 0) {
        console.warn("⚠️ [GitMonitor] No git repositories found via API");
        return null;
      }

      const repository = gitAPI.repositories[0];
      const remotes = repository.state.remotes;

      const originRemote = remotes.find(
        (remote: { name: string; fetchUrl?: string; pushUrl?: string }) =>
          remote.name === "origin",
      );
      if (!originRemote) {
        console.warn("⚠️ [GitMonitor] No origin remote found via API");
        return null;
      }

      const remoteUrl = originRemote.fetchUrl || originRemote.pushUrl;
      if (!remoteUrl) {
        console.warn("⚠️ [GitMonitor] No remote URL found via API");
        return null;
      }

      const githubRepo = this.parseGitHubUrl(remoteUrl);
      if (!githubRepo) {
        console.warn(
          "⚠️ [GitMonitor] Remote is not a GitHub repository:",
          remoteUrl,
        );
        return null;
      }

      return githubRepo;
    } catch (error) {
      console.error(
        "❌ [GitMonitor] Failed to get repository via Git API:",
        error,
      );
      return null;
    }
  }

  /**
   * Parse URLs do GitHub em diferentes formatos
   */
  private parseGitHubUrl(url: string): GitHubRepository | null {
    try {
      const cleanUrl = url.replace(/\.git$/, "");

      const patterns = [
        // HTTPS: https://github.com/owner/repo
        /^https:\/\/github\.com\/([^/]+)\/([^/]+)$/,
        // SSH: git@github.com:owner/repo
        /^git@github\.com:([^/]+)\/([^/]+)$/,
        // SSH alternative: ssh://git@github.com/owner/repo
        /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+)$/,
      ];

      for (const pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match) {
          const [, owner, repo] = match;
          return {
            owner,
            repo,
            fullName: `${owner}/${repo}`,
            remoteUrl: url,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("[GitMonitor] Failed to parse GitHub URL:", error);
      return null;
    }
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}
