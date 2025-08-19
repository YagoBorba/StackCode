import { CommandModule } from "yargs";
import { getErrorMessage } from "@stackcode/core";
import { fetchRepositoryIssues } from "@stackcode/core";
import { Octokit } from "@octokit/rest";
import { t } from "@stackcode/i18n";
import fs from "fs";
import os from "os";
import path from "path";

interface AuthArgs {
  token?: string;
  login?: boolean;
  logout?: boolean;
  status?: boolean;
}

interface IssuesArgs {
  repo?: string;
  state?: "open" | "closed" | "all";
  assignee?: string;
  labels?: string;
  limit?: number;
}

/**
 * Gerenciamento de token de autenticação GitHub no CLI
 */
class CLIAuthManager {
  private tokenPath: string;

  constructor() {
    const configDir = path.join(os.homedir(), ".stackcode");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.tokenPath = path.join(configDir, "github_token");
  }

  saveToken(token: string): void {
    fs.writeFileSync(this.tokenPath, token, { mode: 0o600 });
  }

  getToken(): string | null {
    try {
      if (fs.existsSync(this.tokenPath)) {
        return fs.readFileSync(this.tokenPath, "utf-8").trim();
      }
    } catch (error) {
      console.error("Error reading token:", error);
    }
    return null;
  }

  removeToken(): void {
    try {
      if (fs.existsSync(this.tokenPath)) {
        fs.unlinkSync(this.tokenPath);
      }
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const octokit = new Octokit({ auth: token });
      await octokit.users.getAuthenticated();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Detecta repositório GitHub atual baseado no git remote
 */
function getCurrentRepository(): { owner: string; repo: string } | null {
  try {
    const { execSync } = require("child_process");
    const remoteUrl = execSync("git remote get-url origin", { 
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"] 
    }).trim();

    // Parse GitHub URLs
    const patterns = [
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/,
      /^git@github\.com:([^\/]+)\/([^\/]+)(?:\.git)?$/,
      /^ssh:\/\/git@github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/,
    ];

    for (const pattern of patterns) {
      const match = remoteUrl.match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Comando para autenticação GitHub
 */
function getAuthCommand(): CommandModule<{}, AuthArgs> {
  return {
    command: "auth",
    describe: t("github.auth.description") || "Manage GitHub authentication",
    builder: (yargs) =>
      yargs
        .option("token", {
          alias: "t",
          type: "string",
          describe: t("github.auth.token") || "Set GitHub personal access token",
        })
        .option("login", {
          alias: "l",
          type: "boolean",
          describe: t("github.auth.login") || "Set up GitHub authentication",
        })
        .option("logout", {
          type: "boolean",
          describe: t("github.auth.logout") || "Remove GitHub authentication",
        })
        .option("status", {
          alias: "s",
          type: "boolean",
          describe: t("github.auth.status") || "Check authentication status",
        })
        .example("$0 github auth --login", "Set up GitHub authentication")
        .example("$0 github auth --token ghp_xxx", "Set token directly")
        .example("$0 github auth --status", "Check authentication status"),

    async handler(args: AuthArgs) {
      const authManager = new CLIAuthManager();

      try {
        if (args.logout) {
          authManager.removeToken();
          console.log("✅ GitHub authentication removed");
          return;
        }

        if (args.status) {
          const token = authManager.getToken();
          if (!token) {
            console.log("❌ Not authenticated with GitHub");
            console.log("Run 'stackcode github auth --login' to authenticate");
            return;
          }

          const isValid = await authManager.validateToken(token);
          if (isValid) {
            console.log("✅ GitHub authentication is valid");
          } else {
            console.log("❌ GitHub token is invalid or expired");
            console.log("Run 'stackcode github auth --login' to re-authenticate");
          }
          return;
        }

        if (args.token) {
          const isValid = await authManager.validateToken(args.token);
          if (!isValid) {
            console.error("❌ Invalid GitHub token");
            process.exit(1);
          }

          authManager.saveToken(args.token);
          console.log("✅ GitHub token saved successfully");
          return;
        }

        if (args.login) {
          console.log("🔐 GitHub Authentication Setup");
          console.log("");
          console.log("To authenticate with GitHub:");
          console.log("1. Go to https://github.com/settings/tokens");
          console.log("2. Click 'Generate new token' → 'Generate new token (classic)'");
          console.log("3. Add note: 'StackCode CLI'");
          console.log("4. Select scopes: 'repo', 'user:email'");
          console.log("5. Click 'Generate token'");
          console.log("6. Run: stackcode github auth --token YOUR_TOKEN");
          console.log("");
          console.log("Or use the VS Code extension for easier OAuth authentication.");
          return;
        }

        console.log("Use --login, --token, --status, or --logout");
      } catch (error) {
        console.error("GitHub auth error:", getErrorMessage(error));
        process.exit(1);
      }
    },
  };
}

/**
 * Comando para listar issues
 */
function getIssuesCommand(): CommandModule<{}, IssuesArgs> {
  return {
    command: "issues",
    describe: t("github.issues.description") || "List repository issues",
    builder: (yargs) =>
      yargs
        .option("repo", {
          alias: "r",
          type: "string",
          describe: t("github.issues.repo") || "Repository (owner/repo)",
        })
        .option("state", {
          alias: "s",
          type: "string",
          choices: ["open", "closed", "all"] as const,
          default: "open" as const,
          describe: t("github.issues.state") || "Issue state",
        })
        .option("assignee", {
          alias: "a",
          type: "string",
          describe: t("github.issues.assignee") || "Filter by assignee",
        })
        .option("labels", {
          alias: "l",
          type: "string",
          describe: t("github.issues.labels") || "Filter by labels (comma-separated)",
        })
        .option("limit", {
          type: "number",
          default: 30,
          describe: t("github.issues.limit") || "Number of issues to fetch",
        })
        .example("$0 github issues", "List issues from current repository")
        .example("$0 github issues --repo owner/repo", "List issues from specific repository")
        .example("$0 github issues --assignee me", "List my assigned issues") as any,

    async handler(args: IssuesArgs) {
      const authManager = new CLIAuthManager();

      try {
        // Verificar autenticação
        const token = authManager.getToken();
        if (!token) {
          console.error("❌ Not authenticated with GitHub");
          console.error("Run 'stackcode github auth --login' to authenticate");
          process.exit(1);
        }

        // Determinar repositório
        let owner: string, repo: string;
        if (args.repo) {
          const parts = args.repo.split("/");
          if (parts.length !== 2) {
            console.error("❌ Repository must be in format 'owner/repo'");
            process.exit(1);
          }
          [owner, repo] = parts;
        } else {
          const currentRepo = getCurrentRepository();
          if (!currentRepo) {
            console.error("❌ No GitHub repository detected");
            console.error("Run this command from a Git repository or use --repo option");
            process.exit(1);
          }
          ({ owner, repo } = currentRepo);
        }

        console.log(`📋 Fetching issues from ${owner}/${repo}...`);

        // Buscar issues
        const octokit = new Octokit({ auth: token });
        const issues = await fetchRepositoryIssues(octokit, {
          owner,
          repo,
          state: args.state || "open",
          assignee: args.assignee,
          labels: args.labels,
          per_page: args.limit || 30,
        });

        // Exibir resultados
        if (issues.length === 0) {
          console.log(`✅ No ${args.state} issues found in ${owner}/${repo}`);
          return;
        }

        console.log(`\n📄 Found ${issues.length} ${args.state} issues:\n`);

        issues.forEach((issue) => {
          console.log(`#${issue.number} ${issue.title}`);
          console.log(`   👤 ${issue.user.login} • 🕐 ${new Date(issue.updated_at).toLocaleDateString()}`);
          
          if (issue.labels.length > 0) {
            const labels = issue.labels.map(l => l.name).join(", ");
            console.log(`   🏷️  ${labels}`);
          }
          
          if (issue.assignees.length > 0) {
            const assignees = issue.assignees.map(a => a.login).join(", ");
            console.log(`   👥 Assigned to: ${assignees}`);
          }
          
          console.log(`   🔗 ${issue.html_url}`);
          console.log("");
        });

      } catch (error) {
        console.error("Error fetching issues:", getErrorMessage(error));
        process.exit(1);
      }
    },
  };
}

/**
 * Comando principal do GitHub
 */
export function getGitHubCommand(): CommandModule {
  return {
    command: "github",
    describe: t("github.description") || "GitHub integration commands",
    builder: (yargs) =>
      yargs
        .command(getAuthCommand())
        .command(getIssuesCommand())
        .demandCommand(1, "You need to specify a subcommand")
        .help(),
    handler: () => {
      // Será tratado pelos subcomandos
    },
  };
}
