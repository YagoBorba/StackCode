import fs from "fs";
import path from "path";
import chalk from "chalk";
import { validateCommitMessage } from "../packages/core/dist/index.js";

const configPath = path.resolve(".stackcoderc.json");

if (fs.existsSync(configPath)) {
  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);
    if (config.features?.commitValidation === false) {
      console.log(
        chalk.yellow(
          "ℹ Commit validation is disabled in .stackcoderc.json. Skipping.",
        ),
      );
      process.exit(0);
    }
  } catch {
    console.warn(
      chalk.yellow(
        "Warning: Could not parse .stackcoderc.json. Proceeding with validation.",
      ),
    );
  }
}
const commitMsgPath = process.argv[2];
const message = fs.readFileSync(commitMsgPath, "utf-8").trim();

if (validateCommitMessage(message)) {
  console.log(chalk.green("✔ Commit message is valid."));
  process.exit(0);
} else {
  console.error(chalk.red.bold("✖ Invalid Commit Message"));
  process.exit(1);
}
