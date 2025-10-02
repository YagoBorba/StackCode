import fs from "fs/promises";
import path from "path";
import { runGenerateWorkflow, } from "@stackcode/core";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";
import { showEducationalMessage } from "../educational-mode.js";
async function getProjectStack() {
    const configPath = path.join(process.cwd(), ".stackcoderc.json");
    try {
        const content = await fs.readFile(configPath, "utf-8");
        const config = JSON.parse(content);
        if (typeof config.stack === "string" && config.stack.length > 0) {
            return config.stack;
        }
    }
    catch {
        // Intentionally ignored - fallback below
    }
    return "node-ts";
}
const successMessageKey = {
    readme: "generate.success.readme",
    gitignore: "generate.success.gitignore",
};
const overwriteMessageKey = {
    readme: "generate.prompt.readme_overwrite",
    gitignore: "generate.prompt.gitignore_overwrite",
};
export const getGenerateCommand = () => ({
    command: "generate [filetype]",
    describe: t("generate.command_description"),
    builder: (yargs) => yargs.positional("filetype", {
        describe: t("generate.option_filetype_description"),
        type: "string",
        choices: ["readme", "gitignore"],
    }),
    handler: async (argv) => {
        const filetype = argv.filetype;
        const requestedFiles = new Set();
        const mapFiletype = (value) => {
            if (value === "readme")
                return "readme";
            if (value === "gitignore")
                return "gitignore";
            return null;
        };
        if (filetype) {
            const mapped = mapFiletype(filetype);
            if (mapped) {
                requestedFiles.add(mapped);
            }
        }
        else {
            const filesToGenerate = await ui.promptForFilesToGenerate();
            if (!filesToGenerate || filesToGenerate.length === 0) {
                ui.log.warning(t("common.operation_cancelled"));
                return;
            }
            filesToGenerate.forEach((value) => {
                const mapped = mapFiletype(value);
                if (mapped) {
                    requestedFiles.add(mapped);
                }
            });
        }
        if (requestedFiles.size === 0) {
            ui.log.warning(t("common.operation_cancelled"));
            return;
        }
        const projectPath = process.cwd();
        let gitignoreTechnologies;
        if (requestedFiles.has("gitignore")) {
            const stack = await getProjectStack();
            gitignoreTechnologies = stack ? [stack] : undefined;
        }
        const workflowOptions = {
            projectPath,
            files: Array.from(requestedFiles),
            gitignoreTechnologies,
        };
        const workflowHooks = {
            onEducationalMessage: async (messageKey) => {
                showEducationalMessage(messageKey);
            },
            shouldOverwriteFile: async ({ fileType }) => ui.promptForConfirmation(t(overwriteMessageKey[fileType]), false),
        };
        const result = await runGenerateWorkflow(workflowOptions, workflowHooks);
        const successfulFiles = result.files.filter((file) => file.status === "created" || file.status === "overwritten");
        const declinedFiles = result.files.filter((file) => file.reason === "overwrite-declined");
        successfulFiles.forEach((file) => {
            ui.log.success(t(successMessageKey[file.fileType]));
        });
        declinedFiles.forEach(() => {
            const message = t("common.operation_cancelled");
            ui.log.warning(message);
        });
        if (result.warnings.length > 0) {
            result.warnings.forEach((warning) => {
                const translated = t(warning);
                ui.log.warning(translated);
            });
        }
    },
});
//# sourceMappingURL=generate.js.map