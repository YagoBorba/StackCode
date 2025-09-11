import fs from "fs/promises";
import path from "path";
import { scaffoldProject, setupHusky, generateReadmeContent, generateGitignoreContent, runCommand, validateStackDependencies, saveStackCodeConfig, } from "@stackcode/core";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";
/**
 * Creates and returns the init command configuration for yargs.
 * This command initializes a new project with the selected stack and configurations.
 * @returns The yargs command module for the init command.
 */
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
            // Directory doesn't exist - proceed with creation
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
                defaultAuthor: answers.authorName,
                defaultLicense: "MIT", // Default license, could be prompted in future
                features: { commitValidation: answers.commitValidation },
            };
            await saveStackCodeConfig(projectPath, config);
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
        ui.log.info(`  ${t("init.step.validate_deps")}`);
        const dependencyValidation = await validateStackDependencies(answers.stack);
        if (!dependencyValidation.isValid) {
            ui.log.warning(t("init.dependencies.missing", { stack: answers.stack }));
            dependencyValidation.missingDependencies.forEach((dep) => {
                ui.log.raw(t("init.dependencies.missing_detail", { command: dep }));
            });
            ui.log.raw("\n" + t("init.dependencies.install_instructions"));
            dependencyValidation.missingDependencies.forEach((dep) => {
                const installKey = `init.dependencies.install_${dep}`;
                try {
                    ui.log.raw(t(installKey));
                }
                catch {
                    ui.log.raw(`  - ${dep}: Check the official documentation for installation instructions`);
                }
            });
            ui.log.warning("\n" + t("init.dependencies.optional_skip"));
            const shouldContinue = await ui.promptForConfirmation(t("init.dependencies.prompt_continue"), false);
            if (!shouldContinue) {
                ui.log.info(t("common.operation_cancelled"));
                return;
            }
        }
        else {
            ui.log.success(`  ${t("init.dependencies.all_available")}`);
        }
        ui.log.info(`  ${t("init.step.deps")}`);
        try {
            if (answers.stack === "python") {
                await runCommand("pip", ["install", "-e", "."], { cwd: projectPath });
            }
            else if (answers.stack === "java") {
                await runCommand("mvn", ["install"], { cwd: projectPath });
            }
            else if (answers.stack === "go") {
                await runCommand("go", ["mod", "tidy"], { cwd: projectPath });
            }
            else if (answers.stack === "php") {
                await runCommand("composer", ["install"], { cwd: projectPath });
            }
            else {
                await runCommand("npm", ["install"], { cwd: projectPath });
            }
        }
        catch (error) {
            ui.log.error(`\n${t("init.error.deps_install_failed", {
                error: error instanceof Error ? error.message : String(error),
            })}`);
            ui.log.warning(t("init.error.deps_install_manual"));
            ui.log.info(t("init.error.suggested_command"));
            if (answers.stack === "python") {
                ui.log.raw("  pip install -e .");
            }
            else if (answers.stack === "java") {
                ui.log.raw("  mvn install");
            }
            else if (answers.stack === "go") {
                ui.log.raw("  go mod tidy");
            }
            else if (answers.stack === "php") {
                ui.log.raw("  composer install");
            }
            else {
                ui.log.raw("  npm install");
            }
        }
        ui.log.divider();
        ui.log.success(t("init.success.ready"));
        ui.log.info(`\n${t("init.success.next_steps")}`);
        ui.log.raw(`  ${t("init.success.step1", { projectName: answers.projectName })}`);
        ui.log.raw(`  ${t("init.success.step2")}`);
        ui.log.raw(`  ${t("init.success.step3")}`);
    },
});
//# sourceMappingURL=init.js.map