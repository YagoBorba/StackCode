import { CommandModule } from "yargs";
import { getErrorMessage } from "@stackcode/core";
import { fetchRepositoryIssues } from "@stackcode/core";
import { Octokit } from "@octokit/rest";
import { t, initI18n } from "@stackcode/i18n";
import {
  CLIAuthManager,
  getCurrentRepository,
} from "../services/githubAuth.js";

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
 * Comando para autenticação GitHub
 */
function getAuthCommand(): CommandModule<Record<string, unknown>, AuthArgs> {
  return {
    command: "auth",
    describe: t("github.auth.description") || "Manage GitHub authentication",
    builder: (yargs) =>
      yargs
        .option("token", {
          alias: "t",
          type: "string",
          describe:
            t("github.auth.token") || "Set GitHub personal access token",
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
        console.error(
          `${t("github.auth.auth_error")} ${getErrorMessage(error)}`,
        );
        process.exit(1);
      }
    },
  };
}

/**
 * Comando para listar issues
 */
function getIssuesCommand(): CommandModule<
  Record<string, unknown>,
  IssuesArgs
> {
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
          describe:
            t("github.issues.labels") || "Filter by labels (comma-separated)",
        })
        .option("limit", {
          type: "number",
          default: 30,
          describe: t("github.issues.limit") || "Number of issues to fetch",
        })
        .example("$0 github issues", "Listar issues do repositório atual")
        .example(
          "$0 github issues --repo owner/repo",
          "Listar issues de repositório específico",
        )
        .example(
          "$0 github issues --assignee me",
          "Listar minhas issues atribuídas",
        ),

    async handler(args: IssuesArgs) {
      await initI18n();

      const authManager = new CLIAuthManager();

      try {
        if (
          !args.repo &&
          !args.state &&
          !args.assignee &&
          !args.labels &&
          !args.limit
        ) {
          await showInteractiveIssuesMenu(authManager);
          return;
        }

        const token = authManager.getToken();
        if (!token) {
          console.error(`❌ ${t("github.auth.not_authenticated")}`);
          console.error(t("github.auth.run_login"));
          process.exit(1);
        }

        let owner: string, repo: string;
        if (args.repo) {
          const parts = args.repo.split("/");
          if (parts.length !== 2) {
            console.error(`❌ ${t("github.issues.repository_format_error")}`);
            process.exit(1);
          }
          [owner, repo] = parts;
        } else {
          const currentRepo = getCurrentRepository({ verbose: true });
          if (!currentRepo) {
            console.error(`❌ ${t("github.issues.no_repository_detected")}`);
            console.error(t("github.issues.run_from_git_repo"));
            process.exit(1);
          }
          ({ owner, repo } = currentRepo);
        }

        console.log(`📋 ${t("github.issues.fetching")} ${owner}/${repo}...`);

        const octokit = new Octokit({ auth: token });
        const issues = await fetchRepositoryIssues(octokit, {
          owner,
          repo,
          state: args.state || "open",
          assignee: args.assignee,
          labels: args.labels,
          per_page: args.limit || 30,
        });

        if (issues.length === 0) {
          console.log(
            `✅ ${t("github.issues.no_issues_found")} ${owner}/${repo}`,
          );
          return;
        }

        console.log(
          `\n📄 ${t("github.issues.found_issues")} ${issues.length} ${args.state} ${t("github.issues.issues")}:\n`,
        );

        issues.forEach((issue) => {
          console.log(`#${issue.number} ${issue.title}`);
          console.log(
            `   👤 ${issue.user.login} • 🕐 ${new Date(issue.updated_at).toLocaleDateString()}`,
          );

          if (issue.labels.length > 0) {
            const labels = issue.labels.map((l) => l.name).join(", ");
            console.log(`   🏷️  ${labels}`);
          }

          if (issue.assignees.length > 0) {
            const assignees = issue.assignees.map((a) => a.login).join(", ");
            console.log(`   👥 ${t("github.issues.assigned_to")} ${assignees}`);
          }

          console.log(`   🔗 ${issue.html_url}`);
          console.log("");
        });
      } catch (error) {
        console.error(
          `${t("github.issues.error_fetching")} ${getErrorMessage(error)}`,
        );
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
    handler: () => {},
  };
}

/**
 * Menu interativo para issues do GitHub
 */
async function showInteractiveIssuesMenu(
  authManager: CLIAuthManager,
): Promise<void> {
  const inquirer = await import("inquirer");

  const token = authManager.getToken();
  if (!token) {
    console.error(`❌ ${t("github.auth.not_authenticated")}`);
    console.error(t("github.auth.run_login"));
    process.exit(1);
  }

  const currentRepo = getCurrentRepository({ verbose: true });

  const choices = [
    {
      name: `📋 ${t("github.issues.list_current_repo")} ${currentRepo ? `(${currentRepo.owner}/${currentRepo.repo})` : t("github.issues.no_repo_detected")}`,
      value: "current",
      disabled: !currentRepo,
    },
    {
      name: `🔍 ${t("github.issues.list_specific_repo")}`,
      value: "specific",
    },
    {
      name: `👤 ${t("github.issues.list_assigned_to_me")}`,
      value: "assigned",
      disabled: !currentRepo,
    },
    {
      name: `🏷️ ${t("github.issues.filter_by_labels")}`,
      value: "labels",
      disabled: !currentRepo,
    },
    {
      name: `🔙 ${t("common.back")}`,
      value: "back",
    },
  ];

  const { action } = await inquirer.default.prompt([
    {
      type: "list",
      name: "action",
      message: `🐙 ${t("github.issues.select_action")}`,
      choices,
      pageSize: 10,
    },
  ]);

  switch (action) {
    case "current":
      if (currentRepo) {
        await fetchAndDisplayIssues(authManager, currentRepo);
      }
      break;

    case "specific":
      await handleSpecificRepository(authManager);
      break;

    case "assigned":
      if (currentRepo) {
        await fetchAndDisplayIssues(authManager, currentRepo, {
          assignee: "me",
        });
      }
      break;

    case "labels":
      if (currentRepo) {
        await handleLabelFilter(authManager, currentRepo);
      }
      break;

    case "back":
      return;
  }
}

/**
 * Handle repositório específico
 */
async function handleSpecificRepository(
  authManager: CLIAuthManager,
): Promise<void> {
  const inquirer = await import("inquirer");

  const { repoInput } = await inquirer.default.prompt([
    {
      type: "input",
      name: "repoInput",
      message: `📁 ${t("github.issues.enter_repository")} (formato: owner/repo):`,
      validate: (input: string) => {
        if (!input || !input.includes("/")) {
          return t("github.issues.repository_format_error");
        }
        const parts = input.split("/");
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
          return t("github.issues.repository_format_error");
        }
        return true;
      },
    },
  ]);

  const [owner, repo] = repoInput.split("/");
  await fetchAndDisplayIssues(authManager, { owner, repo });
}

/**
 * Handle filtro por labels
 */
async function handleLabelFilter(
  authManager: CLIAuthManager,
  repository: { owner: string; repo: string },
): Promise<void> {
  const inquirer = await import("inquirer");

  const { labels } = await inquirer.default.prompt([
    {
      type: "input",
      name: "labels",
      message: `🏷️ ${t("github.issues.enter_labels")} (separadas por vírgula):`,
    },
  ]);

  const labelArray = labels
    ? labels.split(",").map((l: string) => l.trim())
    : undefined;
  await fetchAndDisplayIssues(authManager, repository, { labels: labelArray });
}

/**
 * Busca e exibe issues com opções de paginação
 */
async function fetchAndDisplayIssues(
  authManager: CLIAuthManager,
  repository: { owner: string; repo: string },
  options: {
    state?: string;
    assignee?: string;
    labels?: string[];
    per_page?: number;
  } = {},
): Promise<void> {
  console.log(
    `📋 ${t("github.issues.fetching")} ${repository.owner}/${repository.repo}...`,
  );

  try {
    const token = authManager.getToken()!;
    const octokit = new Octokit({ auth: token });

    const issues = await fetchRepositoryIssues(octokit, {
      owner: repository.owner,
      repo: repository.repo,
      state: (options.state as "open" | "closed" | "all") || "open",
      assignee: options.assignee,
      labels: options.labels?.join(","),
      per_page: options.per_page || 30,
    });

    if (issues.length === 0) {
      console.log(
        `✅ ${t("github.issues.no_issues_found")} ${repository.owner}/${repository.repo}`,
      );
      return;
    }

    console.log(
      `\n📄 ${t("github.issues.found_issues")} ${issues.length} ${options.state || "open"} ${t("github.issues.issues")}:\n`,
    );

    const pageSize = 5;
    for (let i = 0; i < issues.length; i += pageSize) {
      const pageIssues = issues.slice(i, i + pageSize);

      pageIssues.forEach((issue, index) => {
        console.log(`\n${i + index + 1}. #${issue.number} ${issue.title}`);
        console.log(
          `   👤 ${issue.user.login} • 🕐 ${new Date(issue.updated_at).toLocaleDateString()}`,
        );

        if (issue.labels.length > 0) {
          const labels = issue.labels.map((l) => l.name).join(", ");
          console.log(`   🏷️  ${labels}`);
        }

        if (issue.assignees.length > 0) {
          const assignees = issue.assignees.map((a) => a.login).join(", ");
          console.log(`   👥 ${t("github.issues.assigned_to")} ${assignees}`);
        }

        console.log(`   🔗 ${issue.html_url}`);
      });

      if (i + pageSize < issues.length) {
        const inquirer = await import("inquirer");
        const { continueReading } = await inquirer.default.prompt([
          {
            type: "confirm",
            name: "continueReading",
            message: `📄 Mostrar próximas ${Math.min(pageSize, issues.length - i - pageSize)} issues? (${i + pageSize}/${issues.length})`,
            default: true,
          },
        ]);

        if (!continueReading) {
          break;
        }
      }
    }
  } catch (error) {
    console.error(
      `❌ ${t("github.issues.error_fetching")} ${getErrorMessage(error)}`,
    );
  }
}

export { CLIAuthManager, getCurrentRepository, fetchRepositoryIssues };
