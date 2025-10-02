import chalk from "chalk";
import { getErrorMessage, runGitFinishWorkflow } from "@stackcode/core";
import { t } from "@stackcode/i18n";
import open from "open";
export const finishHandler = async () => {
    try {
        const result = await runGitFinishWorkflow({ cwd: process.cwd() }, {
            onProgress: (progress) => {
                if (progress.step === "pushing" && progress.message) {
                    console.log(chalk.blue(t("git.info_pushing_branch", {
                        branchName: progress.message,
                    })));
                }
                if (progress.step === "computingPrUrl") {
                    console.log(chalk.blue(t("git.info_opening_browser")));
                }
            },
        });
        if (result.status !== "pushed" || !result.branch) {
            if (result.error === "not-on-branch") {
                console.error(chalk.red(t("git.error_not_git_repo")));
            }
            else {
                console.error(chalk.red(t("common.unexpected_error")));
                if (result.error) {
                    console.error(chalk.gray(result.error));
                }
            }
            return;
        }
        if (!result.prUrl) {
            console.error(chalk.red(t("git.error_parsing_remote")));
            return;
        }
        await open(result.prUrl);
        console.log(chalk.green(t("git.success_pr_ready")));
    }
    catch (error) {
        console.error(chalk.red(t("common.unexpected_error")));
        console.error(chalk.gray(getErrorMessage(error)));
    }
};
export const getFinishCommand = () => ({
    command: "finish",
    describe: t("git.finish_feature.description"),
    handler: finishHandler,
});
//# sourceMappingURL=finish.js.map