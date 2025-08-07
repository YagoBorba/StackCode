import chalk from "chalk";
import { runCommand, getCommandOutput, getErrorMessage } from "@stackcode/core";
import { t } from "@stackcode/i18n";
import open from "open";
function getRepoPathFromUrl(url) {
    const match = url.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
    return match ? match[1].replace(".git", "") : null;
}
export const finishHandler = async () => {
    try {
        const currentBranch = await getCommandOutput("git", ["branch", "--show-current"], { cwd: process.cwd() });
        if (!currentBranch) {
            console.error(chalk.red(t("git.error_not_git_repo")));
            return;
        }
        console.log(chalk.blue(t("git.info_pushing_branch", { branchName: currentBranch })));
        await runCommand("git", ["push", "--set-upstream", "origin", currentBranch], { cwd: process.cwd() });
        console.log(chalk.blue(t("git.info_opening_browser")));
        const remoteUrl = await getCommandOutput("git", ["remote", "get-url", "origin"], { cwd: process.cwd() });
        const repoPath = getRepoPathFromUrl(remoteUrl);
        if (!repoPath) {
            console.error(chalk.red(t("git.error_parsing_remote")));
            return;
        }
        const prUrl = `https://github.com/${repoPath}/pull/new/${currentBranch}`;
        await open(prUrl);
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