import type { CommandModule, ArgumentsCamelCase } from "yargs";
import chalk from "chalk";
import { getErrorMessage, runGitStartWorkflow } from "@stackcode/core";
import { t } from "@stackcode/i18n";
import inquirer from "inquirer";

type StartCommandArgs = {
  name: string;
};

/**
 * A lógica principal de criar a branch. Agora está separada e pode ser
 * chamada de qualquer lugar, inclusive do nosso menu interativo.
 */
export async function createBranch(branchName: string, branchType: string) {
  const fullBranchName = `${branchType}/${branchName}`;
  try {
    console.log(
      chalk.blue(t("git.info_creating_branch", { branchName: fullBranchName })),
    );

    const result = await runGitStartWorkflow({
      cwd: process.cwd(),
      branchName,
      branchType,
    });

    if (result.status === "created") {
      console.log(
        chalk.green(
          t("git.success_branch_created", {
            branchName: result.fullBranchName ?? fullBranchName,
          }),
        ),
      );
    } else {
      throw new Error(result.error ?? "Failed to create branch");
    }
  } catch (error: unknown) {
    console.error(
      chalk.red(t("git.error_branch_exists", { branchName: fullBranchName })),
    );
    console.error(chalk.gray(getErrorMessage(error)));
  }
}

export const startHandler = async (
  argv: ArgumentsCamelCase<StartCommandArgs>,
) => {
  const { branchType } = await inquirer.prompt([
    {
      type: "list",
      name: "branchType",
      message: t("git.prompt_branch_type"),
      choices: ["feature", "fix", "hotfix", "chore"],
    },
  ]);

  await createBranch(argv.name, branchType);
};

export const getStartCommand = (): CommandModule<object, StartCommandArgs> => ({
  command: "start <name>",
  describe: t("git.subcommand_start_feature_description"),
  builder: (yargs) =>
    yargs.positional("name", {
      describe: t("git.option_name_description"),
      type: "string",
      demandOption: true,
    }),
  handler: startHandler,
});
