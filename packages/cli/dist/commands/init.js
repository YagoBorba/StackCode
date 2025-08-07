// packages/cli/src/commands/init.ts
import fs from "fs/promises";
import path from "path";
import { scaffoldProject, setupHusky, generateReadmeContent, generateGitignoreContent, runCommand, } from "@stackcode/core";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";
export const getInitCommand = () => ({
    command: "init",
    describe: t("init.command_description"),
    builder: {},
    handler: async () => {
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
        }
        catch {
            // Intentionally ignored
        }
        ui.log.divider();
        ui.log.success(t("init.setup_start"));
        const replacements = {
            projectName: answers.projectName,
            description: answers.description,
            authorName: answers.authorName,
        };
        const projectOptions = {
            projectPath,
            stack: answers.stack,
            features: answers.features,
            replacements,
        };
        ui.log.info(`  ${t("init.step.scaffold")}`);
        await scaffoldProject(projectOptions);
        if (answers.features.includes("husky") &&
            answers.commitValidation !== undefined) {
            const config = {
                stack: answers.stack,
                features: { commitValidation: answers.commitValidation },
            };
            await fs.writeFile(path.join(projectPath, ".stackcoderc.json"), JSON.stringify(config, null, 2));
        }
        ui.log.info(`  ${t("init.step.readme")}`);
        const readmeContent = await generateReadmeContent();
        await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
        ui.log.info(`  ${t("init.step.gitignore")}`);
        const gitignoreContent = await generateGitignoreContent([answers.stack]);
        await fs.writeFile(path.join(projectPath, ".gitignore"), gitignoreContent);
        if (answers.features.includes("husky")) {
            ui.log.info(`  ${t("init.step.husky")}`);
            await setupHusky(projectPath);
        }
        ui.log.info(`  ${t("init.step.git")}`);
        await runCommand("git", ["init"], { cwd: projectPath });
        ui.log.info(`  ${t("init.step.deps")}`);
        await runCommand("npm", ["install"], { cwd: projectPath });
        ui.log.divider();
        ui.log.success(t("init.success.ready"));
        ui.log.info(`\n${t("init.success.next_steps")}`);
        ui.log.raw(`  1. cd ${answers.projectName}`);
        ui.log.raw("  2. Open the project in your favorite editor.");
        ui.log.raw("  3. Start coding! 🎉");
    },
});
//# sourceMappingURL=init.js.map