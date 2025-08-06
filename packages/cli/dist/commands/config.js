// packages/cli/src/commands/config.ts
import chalk from "chalk";
import Configstore from "configstore";
import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import { t } from "@stackcode/i18n";
const globalConfig = new Configstore("@stackcode/cli");
/**
 * Handles the non-interactive command logic based on provided arguments.
 * This function is easily testable in isolation.
 * @param argv - The arguments object from yargs.
 */
export async function handleNonInteractiveMode(argv) {
    switch (argv.action) {
        case "set":
            if (!argv.key || !argv.value) {
                console.error(chalk.red(t("config.error.missing_set_args")));
                return;
            }
            globalConfig.set(argv.key, argv.value);
            console.log(chalk.green(t("config.success.set", { key: argv.key, value: argv.value })));
            break;
        // Futuras implementações não-interativas (get, delete, etc.) podem ser adicionadas aqui.
        default:
            console.error(chalk.yellow(t("config.error.invalid_action", {
                action: argv.action || "unknown",
            })));
            break;
    }
}
/**
 * Finds the project root by looking for a package.json file.
 */
const findProjectRoot = async (startPath) => {
    let currentPath = startPath;
    while (currentPath !== path.parse(currentPath).root) {
        try {
            await fs.access(path.join(currentPath, "package.json"));
            return currentPath;
        }
        catch {
            // Intentionally ignored
        }
        currentPath = path.dirname(currentPath);
    }
    return null;
};
/**
 * Runs the fully interactive configuration session using inquirer.
 */
export async function runInteractiveMode() {
    const { choice } = await inquirer.prompt([
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
            ],
        },
    ]);
    if (choice === "lang") {
        const { lang } = await inquirer.prompt([
            {
                type: "list",
                name: "lang",
                message: t("config.prompt.select_lang"),
                choices: [
                    { name: "English", value: "en" },
                    { name: "Português", value: "pt" },
                ],
            },
        ]);
        globalConfig.set("lang", lang);
        console.log(chalk.green(t("config.success.set", { key: "lang", value: lang })));
    }
    else if (choice === "commitValidation") {
        const projectRoot = await findProjectRoot(process.cwd());
        if (!projectRoot) {
            console.error(chalk.red(t("config.error.not_in_project")));
            return;
        }
        const localConfigPath = path.join(projectRoot, ".stackcoderc.json");
        try {
            await fs.access(localConfigPath);
        }
        catch {
            console.error(chalk.red(t("config.error.no_stackcoderc")));
            return;
        }
        const { enable } = await inquirer.prompt([
            {
                type: "confirm",
                name: "enable",
                message: t("config.prompt.toggle_validation"),
                default: true,
            },
        ]);
        const localConfigContent = await fs.readFile(localConfigPath, "utf-8");
        const localConfig = JSON.parse(localConfigContent);
        localConfig.features.commitValidation = enable;
        await fs.writeFile(localConfigPath, JSON.stringify(localConfig, null, 2));
        const status = enable
            ? t("config.status.enabled")
            : t("config.status.disabled");
        console.log(chalk.green(t("config.success.set_validation", { status })));
    }
}
/**
 * Defines the 'config' command, its arguments, and the handler logic.
 */
export const getConfigCommand = () => ({
    command: "config [action] [key] [value]",
    describe: t("config.command_description"),
    builder: (yargs) => {
        return yargs
            .positional("action", {
            describe: t("config.args.action_description"),
            type: "string",
            choices: ["set"], // Apenas 'set' está implementado no modo não-interativo por enquanto
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
        // The handler is now an orchestrator.
        const isInteractive = !argv.action;
        if (isInteractive) {
            await runInteractiveMode();
        }
        else {
            await handleNonInteractiveMode(argv);
        }
    },
});
