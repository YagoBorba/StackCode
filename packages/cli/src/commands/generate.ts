import type { CommandModule } from "yargs";
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import {
  generateGitignoreContent,
  generateReadmeContent,
} from "@stackcode/core";
import { t } from "@stackcode/i18n";

async function getProjectStack(): Promise<string> {
  const configPath = path.join(process.cwd(), ".stackcoderc.json");
  try {
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return config.stack || "node-ts";
  } catch {
    return "node-ts";
  }
}
async function handleFileGeneration(options: {
  fileName: string;
  overwriteMsgKey: string;
  successMsgKey: string;
  contentPromise: Promise<string>;
}) {
  const filePath = path.join(process.cwd(), options.fileName);
  try {
    await fs.access(filePath);
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: t(options.overwriteMsgKey),
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log(chalk.yellow(t("common.operation_cancelled")));
      return;
    }
  } catch {
    // Intentionally ignored
  }

  const content = await options.contentPromise;
  await fs.writeFile(filePath, content);
  console.log(chalk.green.bold(t(options.successMsgKey)));
}

export const getGenerateCommand = (): CommandModule => ({
  command: "generate [filetype]",
  describe: t("generate.command_description"),
  builder: (yargs) =>
    yargs.positional("filetype", {
      describe: t("generate.option_filetype_description"),
      type: "string",
      choices: ["readme", "gitignore"],
    }),
  handler: async (argv) => {
    const filetype = argv.filetype as string | undefined;

    if (filetype) {
      if (filetype === "readme") {
        await handleFileGeneration({
          fileName: "README.md",
          overwriteMsgKey: "generate.prompt.readme_overwrite",
          successMsgKey: "generate.success.readme",
          contentPromise: generateReadmeContent(),
        });
      }
      if (filetype === "gitignore") {
        const stack = await getProjectStack();
        await handleFileGeneration({
          fileName: ".gitignore",
          overwriteMsgKey: "generate.prompt.gitignore_overwrite",
          successMsgKey: "generate.success.gitignore",
          contentPromise: generateGitignoreContent([stack]),
        });
      }
      return;
    }

    const { filesToGenerate } = await inquirer.prompt([
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

    if (!filesToGenerate || filesToGenerate.length === 0) {
      console.log(chalk.yellow(t("common.operation_cancelled")));
      return;
    }

    if (filesToGenerate.includes("readme")) {
      await handleFileGeneration({
        fileName: "README.md",
        overwriteMsgKey: "generate.prompt.readme_overwrite",
        successMsgKey: "generate.success.readme",
        contentPromise: generateReadmeContent(),
      });
    }
    if (filesToGenerate.includes("gitignore")) {
      const stack = await getProjectStack();
      await handleFileGeneration({
        fileName: ".gitignore",
        overwriteMsgKey: "generate.prompt.gitignore_overwrite",
        successMsgKey: "generate.success.gitignore",
        contentPromise: generateGitignoreContent([stack]),
      });
    }
  },
});
