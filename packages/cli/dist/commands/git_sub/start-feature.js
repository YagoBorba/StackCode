"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFeatureCommand = void 0;
const chalk_1 = __importDefault(require("chalk"));
const core_1 = require("@stackcode/core");
exports.startFeatureCommand = {
    command: 'start-feature <name>',
    describe: 'Starts a new feature branch from the current branch.',
    builder: (yargs) => {
        return yargs.positional('name', {
            describe: 'The name of the feature (e.g., "login-page")',
            type: 'string',
            demandOption: true,
        });
    },
    handler: async (argv) => {
        const branchName = `feature/${argv.name}`;
        console.log(chalk_1.default.cyan(`🚀 Starting new feature: ${branchName}`));
        try {
            // TODO: Add checks to ensure user is on 'develop' and it's up to date.
            await (0, core_1.runCommand)('git', ['switch', '-c', branchName], { cwd: process.cwd() });
            console.log(chalk_1.default.green.bold(`✅ Success! Switched to new branch '${branchName}'.`));
            console.log(chalk_1.default.yellow('   Happy coding!'));
        }
        catch (error) {
            console.error(chalk_1.default.red(`✖ Error: Could not create new branch. Please check your Git status.`));
        }
    }
};
