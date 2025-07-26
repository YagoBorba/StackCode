import type { CommandModule, Argv } from 'yargs';
import chalk from 'chalk';
import { startFeatureCommand } from './git_sub/start-feature';
import { finishFeatureCommand } from './git_sub/finish-feature';
import { t } from '@stackcode/i18n';

export const gitCommand: CommandModule = {
    command: 'git <subcommand>',
    describe: t('git.command_description'),
    builder: (yargs: Argv) => {
        return yargs
            .command(startFeatureCommand)
            .command(finishFeatureCommand);
    },
    handler: () => {
        console.log(chalk.yellow(t('git.error_specify_subcommand')));
    }
};