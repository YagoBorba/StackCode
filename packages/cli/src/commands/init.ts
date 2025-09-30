import type { CommandModule, ArgumentsCamelCase } from "yargs";
import fs from "fs/promises";
import path from "path";
import {
  runInitWorkflow,
  type InitWorkflowHooks,
  type InitWorkflowOptions,
  type InitWorkflowResult,
  type InitWorkflowProgress,
  type InitWorkflowDependencyDecision,
} from "@stackcode/core";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";
import {
  initEducationalMode,
  showEducationalMessage,
} from "../educational-mode.js";

interface InitArgs {
  educate?: boolean;
}

/**
 * Creates and returns the init command configuration for yargs.
 * This command initializes a new project with the selected stack and configurations.
 * @returns The yargs command module for the init command.
 */
export const getInitCommand = (): CommandModule<object, InitArgs> => ({
  command: "init",
  describe: t("init.command_description"),
  builder: {},
  handler: async (argv: ArgumentsCamelCase<InitArgs>) => {
    initEducationalMode(argv.educate || false);
    ui.log.step(t("init.welcome"));
    ui.log.divider();

    const answers = await ui.promptForInitAnswers();
    const projectPath = path.join(process.cwd(), answers.projectName);

    try {
      await fs.access(projectPath);
      const overwrite = await ui.promptForOverwriteProject(answers.projectName);
      if (!overwrite) {
        ui.log.warning(t("common.operation_cancelled"));
        return;
      }
    } catch {
      // Directory doesn't exist - proceed with creation
    }

    ui.log.divider();
    ui.log.success(t("init.setup_start"));

    const workflowOptions: InitWorkflowOptions = {
      projectPath,
      projectName: answers.projectName,
      description: answers.description,
      authorName: answers.authorName,
      stack: answers.stack,
      features: answers.features,
      commitValidation: answers.commitValidation,
    };

    const workflowHooks: InitWorkflowHooks = {
      onProgress: async ({ step }: InitWorkflowProgress) => {
        switch (step) {
          case "scaffold":
            ui.log.info(`  ${t("init.step.scaffold")}`);
            break;
          case "generateReadme":
            ui.log.info(`  ${t("init.step.readme")}`);
            break;
          case "generateGitignore":
            ui.log.info(`  ${t("init.step.gitignore")}`);
            break;
          case "setupHusky":
            ui.log.info(`  ${t("init.step.husky")}`);
            break;
          case "initializeGit":
            ui.log.info(`  ${t("init.step.git")}`);
            break;
          case "validateDependencies":
            ui.log.info(`  ${t("init.step.validate_deps")}`);
            break;
          case "installDependencies":
            ui.log.info(`  ${t("init.step.deps")}`);
            break;
          case "saveConfig":
          case "completed":
            break;
        }
      },
      onEducationalMessage: async (messageKey: string) => {
        showEducationalMessage(messageKey);
      },
      onMissingDependencies: async ({
        stack,
        missingDependencies,
      }: InitWorkflowDependencyDecision) => {
        ui.log.warning(t("init.dependencies.missing", { stack }));
        missingDependencies.forEach((dependency: string) => {
          ui.log.raw(
            t("init.dependencies.missing_detail", { command: dependency }),
          );
        });
        ui.log.raw(`\n${t("init.dependencies.install_instructions")}`);
        missingDependencies.forEach((dependency: string) => {
          const installKey = `init.dependencies.install_${dependency}`;
          try {
            ui.log.raw(t(installKey));
          } catch {
            ui.log.raw(
              `  - ${dependency}: Check the official documentation for installation instructions`,
            );
          }
        });
        ui.log.warning(`\n${t("init.dependencies.optional_skip")}`);
      },
      confirmContinueAfterMissingDependencies: async () =>
        ui.promptForConfirmation(
          t("init.dependencies.prompt_continue"),
          false,
        ),
    };

    const result: InitWorkflowResult = await runInitWorkflow(
      workflowOptions,
      workflowHooks,
    );

    if (result.status === "cancelled") {
      ui.log.info(t("common.operation_cancelled"));
      return;
    }

    if (result.dependencyValidation.isValid) {
      ui.log.success(`  ${t("init.dependencies.all_available")}`);
    }

    if (!result.dependenciesInstalled && result.installCommand) {
      const installCommandString = `${result.installCommand.command} ${result.installCommand.args.join(" ")}`.trim();
      const warningMessage = result.warnings.at(-1) ?? "Unknown error";
      ui.log.error(
        `\n${t("init.error.deps_install_failed", { error: warningMessage })}`,
      );
      ui.log.warning(t("init.error.deps_install_manual"));
      ui.log.info(t("init.error.suggested_command"));
      ui.log.raw(`  ${installCommandString}`);
    }

    ui.log.divider();
    ui.log.success(t("init.success.ready"));
    ui.log.info(`\n${t("init.success.next_steps")}`);
    ui.log.raw(
      `  ${t("init.success.step1", { projectName: answers.projectName })}`,
    );
    ui.log.raw(`  ${t("init.success.step2")}`);
    ui.log.raw(`  ${t("init.success.step3")}`);
  },
});
