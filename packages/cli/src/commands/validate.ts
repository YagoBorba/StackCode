import { CommandModule, ArgumentsCamelCase } from "yargs";
import { t } from "@stackcode/i18n";
import { validateCommitMessage } from "@stackcode/core";
import * as ui from "./ui.js";
import { initEducationalMode, showBestPractice } from "../educational-mode.js";

interface ValidateArgs {
  message: string;
  educate?: boolean;
}

export const getValidateCommand = (): CommandModule<object, ValidateArgs> => ({
  command: "validate <message>",
  describe: t("validate.command_description"),
  builder: (yargs) => {
    return yargs.positional("message", {
      describe: t("validate.option_message_description"),
      type: "string",
      demandOption: true,
    });
  },
  handler: (argv: ArgumentsCamelCase<ValidateArgs>) => {
    initEducationalMode(argv.educate || false);

    const message = argv.message as string;
    if (validateCommitMessage(message)) {
      ui.log.success(`✔ ${t("validate.success")}`);
      showBestPractice("educational.commit_validation_explanation");
    } else {
      ui.log.error(`✖ ${t("validate.error_invalid")}`);
      showBestPractice("educational.conventional_commits_explanation");
      process.exit(1);
    }
  },
});
