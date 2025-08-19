import { CommandModule } from "yargs";
import { getErrorMessage } from "@stackcode/core";
import { fetchRepositoryIssues } from "@stackcode/core";
import { Octokit } from "@octokit/rest";
import { t, initI18n } from "@stackcode/i18n";
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
      console.error(t("github.auth.error_reading_token"), error);
    }
    return null;
  }

  removeToken(): void {
    try {
      if (fs.existsSync(this.tokenPath)) {
        fs.unlinkSync(this.tokenPath);
      }
    } catch (error) {
      console.error(t("github.auth.error_removing_token"), error);
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
        .example("$0 github auth --login", "Configurar autenticação do GitHub")
        .example("$0 github auth --token ghp_xxx", "Definir token diretamente")
        .example("$0 github auth --status", "Verificar status da autenticação"),

    async handler(args: AuthArgs) {
      // Ensure i18n is initialized
      await initI18n();
      
      const authManager = new CLIAuthManager();

      try {
        if (args.logout) {
          authManager.removeToken();
          console.log(`✅ ${t("github.auth.authentication_removed")}`);
          return;
        }

        if (args.status) {
          const token = authManager.getToken();
          if (!token) {
            console.log(`❌ ${t("github.auth.not_authenticated")}`);
            console.log(t("github.auth.run_login"));
            return;
          }

          const isValid = await authManager.validateToken(token);
          if (isValid) {
            console.log(`✅ ${t("github.auth.authentication_valid")}`);
          } else {
            console.log(`❌ ${t("github.auth.token_invalid")}`);
            console.log(t("github.auth.run_login"));
          }
          return;
        }

        if (args.token) {
          const isValid = await authManager.validateToken(args.token);
          if (!isValid) {
            console.error(`❌ ${t("github.auth.token_invalid_error")}`);
            process.exit(1);
          }

          authManager.saveToken(args.token);
          console.log(`✅ ${t("github.auth.token_saved")}`);
          return;
        }

        if (args.login) {
          console.log(`🔐 ${t("github.auth.setup_title")}`);
          console.log("");
          console.log(t("github.auth.setup_instructions"));
          console.log(t("github.auth.setup_step1"));
          console.log(t("github.auth.setup_step2"));
          console.log(t("github.auth.setup_step3"));
          console.log(t("github.auth.setup_step4"));
          console.log(t("github.auth.setup_step5"));
          console.log(t("github.auth.setup_step6"));
          console.log("");
          console.log(t("github.auth.setup_alternative"));
          return;
        }

        console.log(t("github.auth.use_options"));
      } catch (error) {
        console.error(`${t("github.auth.auth_error")} ${getErrorMessage(error)}`);
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
        .example("$0 github issues", "Listar issues do repositório atual")
        .example("$0 github issues --repo owner/repo", "Listar issues de repositório específico")
        .example("$0 github issues --assignee me", "Listar minhas issues atribuídas") as any,

    async handler(args: IssuesArgs) {
      // Ensure i18n is initialized
      await initI18n();
      
      const authManager = new CLIAuthManager();

      try {
        // Verificar autenticação
        const token = authManager.getToken();
        if (!token) {
          console.error(`❌ ${t("github.auth.not_authenticated")}`);
          console.error(t("github.auth.run_login"));
          process.exit(1);
        }

        // Determinar repositório
        let owner: string, repo: string;
        if (args.repo) {
          const parts = args.repo.split("/");
          if (parts.length !== 2) {
            console.error(`❌ ${t("github.issues.repository_format_error")}`);
            process.exit(1);
          }
          [owner, repo] = parts;
        } else {
          const currentRepo = getCurrentRepository();
          if (!currentRepo) {
            console.error(`❌ ${t("github.issues.no_repository_detected")}`);
            console.error(t("github.issues.run_from_git_repo"));
            process.exit(1);
          }
          ({ owner, repo } = currentRepo);
        }

        console.log(`📋 ${t("github.issues.fetching")} ${owner}/${repo}...`);

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
          console.log(`✅ ${t("github.issues.no_issues_found")} ${owner}/${repo}`);
          return;
        }

        console.log(`\n📄 ${t("github.issues.found_issues")} ${issues.length} ${args.state} ${t("github.issues.issues")}:\n`);

        issues.forEach((issue) => {
          console.log(`#${issue.number} ${issue.title}`);
          console.log(`   👤 ${issue.user.login} • 🕐 ${new Date(issue.updated_at).toLocaleDateString()}`);
          
          if (issue.labels.length > 0) {
            const labels = issue.labels.map(l => l.name).join(", ");
            console.log(`   🏷️  ${labels}`);
          }
          
          if (issue.assignees.length > 0) {
            const assignees = issue.assignees.map(a => a.login).join(", ");
            console.log(`   👥 ${t("github.issues.assigned_to")} ${assignees}`);
          }
          
          console.log(`   🔗 ${issue.html_url}`);
          console.log("");
        });

      } catch (error) {
        console.error(`${t("github.issues.error_fetching")} ${getErrorMessage(error)}`);
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
