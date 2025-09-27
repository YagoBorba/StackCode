import type { CommandModule, ArgumentsCamelCase } from "yargs";
import { runCommand, getCommandOutput, getErrorMessage } from "@stackcode/core";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";
import { initEducationalMode, showBestPractice } from "../educational-mode.js";

interface CommitArgs {
  educate?: boolean;
}

export const getCommitCommand = (): CommandModule<object, CommitArgs> => ({
  command: "commit",
  describe: t("commit.command_description"),
  builder: {},
  handler: async (argv: ArgumentsCamelCase<CommitArgs>) => {
    initEducationalMode(argv.educate || false);
    showBestPractice("educational.conventional_commits_explanation");
    try {
      const statusOutput = await getCommandOutput(
        "git",
        ["status", "--porcelain"],
        { cwd: process.cwd() },
      );
      if (!statusOutput) {
        ui.log.warning(t("commit.error_no_changes_staged"));
        return;
      }

      const answers = await ui.promptForCommitAnswers();

      let commitMessage = `${answers.type}`;
      if (answers.scope) {
        commitMessage += `(${answers.scope.trim()})`;
      }
      commitMessage += `: ${answers.shortDescription.trim()}`;

      if (answers.longDescription) {
        commitMessage += `\n\n${answers.longDescription.replace(/\|/g, "\n")}`;
      }

      if (answers.breakingChanges) {
        commitMessage += `\n\nBREAKING CHANGE: ${answers.breakingChanges.trim()}`;
      }

      if (answers.affectedIssues) {
        commitMessage += `\n\n${answers.affectedIssues.trim()}`;
      }

      await runCommand("git", ["commit", "-m", commitMessage], {
        cwd: process.cwd(),
      });
      ui.log.success(t("commit.success"));
    } catch (error: unknown) {
      ui.log.error(t("common.unexpected_error"));
      ui.log.gray(getErrorMessage(error));
    }
  },
});
