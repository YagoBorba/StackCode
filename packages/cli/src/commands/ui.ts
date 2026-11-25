import chalk from "chalk";
import inquirer from "inquirer";
import { t } from "@stackcode/i18n";
import { type PackageBumpInfo } from "@stackcode/core";
import {
  createCLIAuthFacade,
  getCurrentRepository,
  type CLIAuthFacade,
} from "../services/githubAuth.js";
import { fetchRepositoryIssues } from "@stackcode/core";

export const log = {
  info: (message: string) => console.log(chalk.blue(message)),
  success: (message: string) => console.log(chalk.green.bold(message)),
  warning: (message: string) => console.log(chalk.yellow(message)),
  error: (message: string) => console.error(chalk.red(message)),
  step: (message: string) => console.log(chalk.cyan.bold(message)),
  raw: (message: string) => console.log(message),
  table: (data: object[]) => console.table(data),
  gray: (message: string) => console.log(chalk.gray(message)),
  divider: () =>
    console.log(
      chalk.gray("----------------------------------------------------"),
    ),
};

export async function promptForConfirmation(
  message: string,
  defaultValue = true,
): Promise<boolean> {
  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: "confirm",
      name: "confirm",
      message,
      default: defaultValue,
    },
  ]);
  return confirm;
}

export async function promptToCreateGitHubRelease(): Promise<boolean> {
  return promptForConfirmation(t("release.prompt_create_github_release"));
}

export async function promptForToken(): Promise<string> {
  log.warning(`\n${t("release.info_github_token_needed")}`);
  log.info(t("release.info_github_token_instructions"));

  const { token } = await inquirer.prompt<{ token: string }>([
    {
      type: "password",
      name: "token",
      message: t("release.prompt_github_token"),
      mask: "*",
    },
  ]);
  return token;
}

export async function promptToSaveToken(): Promise<boolean> {
  return promptForConfirmation(t("release.prompt_save_token"));
}

export async function promptForLockedRelease(
  currentVersion: string,
  newVersion: string,
): Promise<boolean> {
  const message = t("release.prompt_confirm_release", {
    currentVersion,
    newVersion,
  });
  return promptForConfirmation(message);
}

export function displayIndependentReleasePlan(
  packagesToUpdate: PackageBumpInfo[],
): void {
  log.warning(t("release.independent_mode_packages_to_update"));
  log.table(
    packagesToUpdate.map((info) => ({
      Package: info.pkg.name,
      "Current Version": info.pkg.version,
      "Bump Type": info.bumpType,
      "New Version": info.newVersion,
    })),
  );
}

export async function promptForIndependentRelease(): Promise<boolean> {
  return promptForConfirmation(t("release.independent_prompt_confirm"));
}

export async function promptForConfigChoice(): Promise<string> {
  const { choice } = await inquirer.prompt<{ choice: string }>([
    {
      type: "list",
      name: "choice",
      message: t("config.prompt.main"),
      choices: [
        { name: t("config.prompt.select_lang"), value: "lang" },
        {
          name: t("config.prompt.toggle_validation"),
          value: "commitValidation",
        },
        {
          name: t("config.prompt.toggle_educate"),
          value: "educate",
        },
      ],
    },
  ]);
  return choice;
}

export async function promptForLanguage(): Promise<string> {
  const { lang } = await inquirer.prompt<{ lang: string }>([
    {
      type: "list",
      name: "lang",
      message: t("config.prompt.select_lang"),
      choices: [
        { name: "English", value: "en" },
        { name: "Português", value: "pt" },
        { name: "Español", value: "es" },
      ],
    },
  ]);
  return lang;
}

export async function promptToEnableValidation(): Promise<boolean> {
  const { enable } = await inquirer.prompt<{ enable: boolean }>([
    {
      type: "confirm",
      name: "enable",
      message: t("config.prompt.toggle_validation"),
      default: true,
    },
  ]);
  return enable;
}

export async function promptToEnableEducate(): Promise<boolean> {
  const { enable } = await inquirer.prompt<{ enable: boolean }>([
    {
      type: "confirm",
      name: "enable",
      message: t("config.prompt.enable_educate"),
      default: false,
    },
  ]);
  return enable;
}

export async function promptForFilesToGenerate(): Promise<string[]> {
  const { filesToGenerate } = await inquirer.prompt<{
    filesToGenerate: string[];
  }>([
    {
      type: "checkbox",
      name: "filesToGenerate",
      message: t("generate.prompt.interactive_select"),
      choices: [
        { name: "README.md", value: "readme" },
        { name: ".gitignore", value: "gitignore" },
      ],
    },
  ]);
  return filesToGenerate;
}

export async function promptForGitAction(): Promise<"start" | "finish"> {
  const { action } = await inquirer.prompt<{ action: "start" | "finish" }>([
    {
      type: "list",
      name: "action",
      message: t("git.prompt_interactive_action"),
      choices: [
        { name: t("git.action_start"), value: "start" },
        { name: t("git.action_finish"), value: "finish" },
      ],
    },
  ]);
  return action;
}

export async function promptForBranchName(): Promise<string> {
  const { branchName } = await inquirer.prompt<{ branchName: string }>([
    {
      type: "input",
      name: "branchName",
      message: t("git.prompt_branch_name"),
      validate: (input: string) =>
        !!input || "O nome da branch não pode ser vazio.",
    },
  ]);
  return branchName;
}

export async function promptForBranchType(): Promise<string> {
  const { branchType } = await inquirer.prompt<{ branchType: string }>([
    {
      type: "list",
      name: "branchType",
      message: t("git.prompt_branch_type"),
      choices: ["feature", "fix", "hotfix", "chore"],
    },
  ]);
  return branchType;
}

export interface InitAnswers {
  projectName: string;
  description: string;
  authorName: string;
  stack:
    | "node-js"
    | "node-ts"
    | "react"
    | "vue"
    | "python"
    | "java"
    | "go"
    | "php";
  features: ("docker" | "husky")[];
  commitValidation?: boolean;
}

export async function promptForInitAnswers(): Promise<InitAnswers> {
  return inquirer.prompt<InitAnswers>([
    {
      type: "input",
      name: "projectName",
      message: t("init.prompt.project_name"),
      validate: (input: string) =>
        !!input || t("init.prompt.project_name_error"),
    },
    {
      type: "input",
      name: "description",
      message: t("init.prompt.description"),
      default: "A new project generated by StackCode.",
    },
    {
      type: "input",
      name: "authorName",
      message: t("init.prompt.author_name"),
    },
    {
      type: "list",
      name: "stack",
      message: t("init.prompt.stack"),
      choices: [
        { name: "Node.js + JavaScript", value: "node-js" },
        { name: "Node.js + TypeScript", value: "node-ts" },
        { name: "React + TypeScript", value: "react" },
        { name: "Vue.js + TypeScript", value: "vue" },
        { name: "Python + FastAPI", value: "python" },
        { name: "Java + Spring", value: "java" },
        { name: "Go + Gin", value: "go" },
        { name: "PHP + Laravel", value: "php" },
      ],
    },
    {
      type: "checkbox",
      name: "features",
      message: t("init.prompt.features"),
      choices: [
        { name: "Docker support", value: "docker", checked: true },
        { name: "Husky for commit linting", value: "husky", checked: true },
      ],
    },
    {
      type: "confirm",
      name: "commitValidation",
      message: t("init.prompt.commit_validation"),
      default: true,
      when: (answers) => answers.features.includes("husky"),
    },
  ]);
}

export async function promptForOverwriteProject(
  projectName: string,
): Promise<boolean> {
  const message = chalk.yellow(t("init.prompt.overwrite", { projectName }));
  return promptForConfirmation(message, false);
}

export interface CommitAnswers {
  type: string;
  scope: string;
  shortDescription: string;
  longDescription: string;
  breakingChanges: string;
  affectedIssues: string;
}

export interface GitHubIssueChoice {
  number: number;
  title: string;
  url: string;
}

export async function promptForCommitAnswers(): Promise<CommitAnswers> {
  const getCommitTypes = () => [
    { name: t("commit.types.feat"), value: "feat" },
    { name: t("commit.types.fix"), value: "fix" },
    { name: t("commit.types.docs"), value: "docs" },
    { name: t("commit.types.style"), value: "style" },
    { name: t("commit.types.refactor"), value: "refactor" },
    { name: t("commit.types.perf"), value: "perf" },
    { name: t("commit.types.test"), value: "test" },
    { name: t("commit.types.chore"), value: "chore" },
    { name: t("commit.types.revert"), value: "revert" },
  ];

  const basicAnswers = await inquirer.prompt<CommitAnswers>([
    {
      type: "list",
      name: "type",
      message: t("commit.prompt.select_type"),
      choices: getCommitTypes(),
    },
    { type: "input", name: "scope", message: t("commit.prompt.scope") },
    {
      type: "input",
      name: "shortDescription",
      message: t("commit.prompt.short_description"),
      validate: (input: string) =>
        input ? true : "A short description is required.",
    },
    {
      type: "input",
      name: "longDescription",
      message: t("commit.prompt.long_description"),
    },
    {
      type: "input",
      name: "breakingChanges",
      message: t("commit.prompt.breaking_changes"),
    },
  ]);

  const authManager = createCLIAuthFacade();
  const hasGitHubAuth = (await authManager.getToken()) !== null;
  const currentRepo = hasGitHubAuth ? getCurrentRepository() : null;

  let affectedIssues = "";

  if (hasGitHubAuth && currentRepo) {
    const { useGitHubIntegration } = await inquirer.prompt<{
      useGitHubIntegration: boolean;
    }>([
      {
        type: "confirm",
        name: "useGitHubIntegration",
        message: `🔗 ${t("commit.prompt.link_github_issues")} (${currentRepo.owner}/${currentRepo.repo})?`,
        default: false,
      },
    ]);

    if (useGitHubIntegration) {
      const selectedIssues = await promptForGitHubIssues(
        authManager,
        currentRepo,
      );
      if (selectedIssues.length > 0) {
        affectedIssues = selectedIssues
          .map((issue) => `closes #${issue.number}`)
          .join(", ");
      }
    }
  }

  if (!affectedIssues) {
    const { manualIssues } = await inquirer.prompt<{ manualIssues: string }>([
      {
        type: "input",
        name: "manualIssues",
        message: t("commit.prompt.affected_issues"),
      },
    ]);
    affectedIssues = manualIssues;
  }

  return {
    ...basicAnswers,
    affectedIssues,
  };
}

/**
 * Prompt para seleção de issues do GitHub
 */
async function promptForGitHubIssues(
  authManager: CLIAuthFacade,
  repository: { owner: string; repo: string },
): Promise<GitHubIssueChoice[]> {
  try {
    log.info(
      `📋 ${t("github.issues.fetching")} ${repository.owner}/${repository.repo}...`,
    );

    const token = await authManager.getToken();
    if (!token) {
      log.warning(`❌ ${t("github.auth.not_authenticated")}`);
      log.warning(t("github.auth.run_login"));
      return [];
    }

    let octokit;
    try {
      octokit = await authManager.getClient();
    } catch (error) {
      log.error(`❌ ${t("github.auth.token_invalid")}`);
      if (error instanceof Error) {
        log.gray(error.message);
      }
      await authManager.removeToken();
      log.warning(t("github.auth.run_login"));
      return [];
    }

    const issues = await fetchRepositoryIssues(octokit, {
      owner: repository.owner,
      repo: repository.repo,
      state: "open",
      per_page: 20, // Limite razoável para seleção
    });

    if (issues.length === 0) {
      log.warning(
        `✅ ${t("github.issues.no_issues_found")} ${repository.owner}/${repository.repo}`,
      );
      return [];
    }

    const choices = issues.map((issue) => ({
      name: `#${issue.number} ${issue.title}`,
      value: {
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
      },
      short: `#${issue.number}`,
    }));

    choices.push({
      name: `❌ ${t("common.cancel")}`,
      value: { number: -1, title: "cancel", url: "" }, // Valor especial para cancelamento
      short: "cancel",
    });

    const { selectedIssues } = await inquirer.prompt<{
      selectedIssues: GitHubIssueChoice[];
    }>([
      {
        type: "checkbox",
        name: "selectedIssues",
        message: `🎯 ${t("commit.prompt.select_issues_to_link")}:`,
        choices,
        pageSize: 10,
        validate: (answer: GitHubIssueChoice[]) => {
          return answer.length > 0
            ? true
            : t("commit.prompt.select_at_least_one_issue");
        },
      },
    ]);

    return selectedIssues.filter((issue) => issue.number !== -1);
  } catch (error) {
    log.error(`❌ ${t("github.issues.error_fetching")} ${error}`);
    return [];
  }
}
