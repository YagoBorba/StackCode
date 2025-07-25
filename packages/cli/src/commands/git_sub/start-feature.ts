import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { runCommand } from '@stackcode/core';

interface StartFeatureArgs {
    name: string;
}

export const startFeatureCommand: CommandModule<{}, StartFeatureArgs> = {
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
        console.log(chalk.cyan(`🚀 Starting new feature: ${branchName}`));

        try {
            // TODO: Add checks to ensure user is on 'develop' and it's up to date.
            await runCommand('git', ['switch', '-c', branchName], { cwd: process.cwd() });
            console.log(chalk.green.bold(`✅ Success! Switched to new branch '${branchName}'.`));
            console.log(chalk.yellow('   Happy coding!'));
        } catch (error) {
            console.error(chalk.red(`✖ Error: Could not create new branch. Please check your Git status.`));
        }
    }
};