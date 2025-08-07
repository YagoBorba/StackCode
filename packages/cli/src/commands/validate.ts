import { CommandModule } from "yargs";
import { t } from "@stackcode/i18n";
import { validateCommitMessage } from "@stackcode/core";
import * as ui from "./ui.js";

export const getValidateCommand = (): CommandModule => ({
  command: "validate <message>",
  describe: t("validate.command_description"),
  builder: (yargs) => {
    return yargs.positional("message", {
      describe: t("validate.option_message_description"),
      type: "string",
      demandOption: true,
    });
  },
  handler: (argv) => {
    const message = argv.message as string;
    if (validateCommitMessage(message)) {
      ui.log.success(`✔ ${t("validate.success")}`);
    } else {
      ui.log.error(`✖ ${t("validate.error_invalid")}`);
      process.exit(1);
    }
  },
});
