import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { runCommand } from '@stackcode/core';
import { t } from '@stackcode/i18n';

interface StartFeatureArgs {
    name: string;
}

export const startFeatureCommand: CommandModule<{}, StartFeatureArgs> = {
    command: 'start-feature <name>',
    describe: t('git.start_feature.description'),
    builder: (yargs) => {
        return yargs.positional('name', {
            describe: 'The name of the feature (e.g., "login-page")',
            type: 'string',
            demandOption: true,
        });
    },
    handler: async (argv) => {
        const branchName = `feature/${argv.name}`;
        console.log(chalk.cyan(t('git.start_feature.start').replace('{branchName}', branchName)));

        try {
            await runCommand('git', ['switch', '-c', branchName], { cwd: process.cwd() });
            console.log(chalk.green.bold(t('git.start_feature.success').replace('{branchName}', branchName)));
            console.log(chalk.yellow('   Happy coding!'));
        } catch (error) {
            console.error(chalk.red(t('git.start_feature.error')));
        }
    }
};