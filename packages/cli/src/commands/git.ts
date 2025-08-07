import { CommandModule, Argv } from "yargs";
import { getStartCommand, createBranch } from "./git_sub/start.js";
import { getFinishCommand, finishHandler } from "./git_sub/finish.js";
import { t } from "@stackcode/i18n";
import * as ui from "./ui.js";

export const getGitCommand = (): CommandModule => ({
  command: "git",
  describe: t("git.command_description"),
  builder: (yargs: Argv) => {
    return yargs.command(getStartCommand()).command(getFinishCommand()).help();
  },
  handler: async (argv) => {
    if (argv._[1]) {
      return;
    }

    const action = await ui.promptForGitAction();

    if (action === "start") {
      const branchName = await ui.promptForBranchName();
      const branchType = await ui.promptForBranchType();
      await createBranch(branchName, branchType);
    } else if (action === "finish") {
      await finishHandler();
    }
  },
});
