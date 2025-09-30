import { getCommandOutput, getErrorMessage, runCommitWorkflow, } from "@stackcode/core";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";
import { initEducationalMode, showBestPractice } from "../educational-mode.js";
export const getCommitCommand = () => ({
    command: "commit",
    describe: t("commit.command_description"),
    builder: {},
    handler: async (argv) => {
        initEducationalMode(argv.educate || false);
        showBestPractice("educational.conventional_commits_explanation");
        try {
            const statusOutput = await getCommandOutput("git", ["status", "--porcelain"], { cwd: process.cwd() });
            if (!statusOutput) {
                ui.log.warning(t("commit.error_no_changes_staged"));
                return;
            }
            const answers = await ui.promptForCommitAnswers();
            const result = await runCommitWorkflow({
                cwd: process.cwd(),
                type: answers.type,
                scope: answers.scope,
                shortDescription: answers.shortDescription,
                longDescription: answers.longDescription,
                breakingChanges: answers.breakingChanges,
                affectedIssues: answers.affectedIssues,
            });
            if (result.status === "committed") {
                ui.log.success(t("commit.success"));
            }
            else if (result.reason === "no-staged-changes") {
                ui.log.warning(t("commit.error_no_changes_staged"));
            }
            else {
                ui.log.error(t("common.unexpected_error"));
                if (result.error) {
                    ui.log.gray(result.error);
                }
            }
        }
        catch (error) {
            ui.log.error(t("common.unexpected_error"));
            ui.log.gray(getErrorMessage(error));
        }
    },
});
//# sourceMappingURL=commit.js.map