import type { CommandModule, Argv, Arguments } from "yargs";
import Configstore from "configstore";
import fs from "fs/promises";
import path from "path";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";

const globalConfig = new Configstore("@stackcode/cli");

export async function handleNonInteractiveMode(
  argv: Arguments<{ action?: string; key?: string; value?: string }>,
) {
  switch (argv.action) {
    case "set":
      if (!argv.key || !argv.value) {
        ui.log.error(t("config.error.missing_set_args"));
        return;
      }
      globalConfig.set(argv.key, argv.value);
      ui.log.success(
        t("config.success.set", { key: argv.key, value: argv.value }),
      );
      break;
    default:
      ui.log.warning(
        t("config.error.invalid_action", {
          action: argv.action || "unknown",
        }),
      );
      break;
  }
}

const findProjectRoot = async (startPath: string): Promise<string | null> => {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    try {
      await fs.access(path.join(currentPath, "package.json"));
      return currentPath;
    } catch {
      // Ignore errors, continue searching
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
};

export async function runInteractiveMode() {
  const choice = await ui.promptForConfigChoice();

  if (choice === "lang") {
    const lang = await ui.promptForLanguage();
    globalConfig.set("lang", lang);
    ui.log.success(t("config.success.set", { key: "lang", value: lang }));
  } else if (choice === "commitValidation") {
    const projectRoot = await findProjectRoot(process.cwd());
    if (!projectRoot) {
      ui.log.error(t("config.error.not_in_project"));
      return;
    }

    const localConfigPath = path.join(projectRoot, ".stackcoderc.json");

    try {
      await fs.access(localConfigPath);
    } catch {
      ui.log.error(t("config.error.no_stackcoderc"));
      return;
    }

    const enable = await ui.promptToEnableValidation();

    const localConfigContent = await fs.readFile(localConfigPath, "utf-8");
    const localConfig = JSON.parse(localConfigContent);
    localConfig.features.commitValidation = enable;
    await fs.writeFile(localConfigPath, JSON.stringify(localConfig, null, 2));

    const status = enable
      ? t("config.status.enabled")
      : t("config.status.disabled");
    ui.log.success(t("config.success.set_validation", { status }));
  }
}

export const getConfigCommand = (): CommandModule => ({
  command: "config [action] [key] [value]",
  describe: t("config.command_description"),

  builder: (yargs: Argv) => {
    return yargs
      .positional("action", {
        describe: t("config.args.action_description"),
        type: "string",
        choices: ["set"],
      })
      .positional("key", {
        describe: t("config.args.key_description"),
        type: "string",
      })
      .positional("value", {
        describe: t("config.args.value_description"),
        type: "string",
      });
  },

  handler: async (argv) => {
    const isInteractive = !argv.action;
    if (isInteractive) {
      await runInteractiveMode();
    } else {
      await handleNonInteractiveMode(argv);
    }
  },
});
