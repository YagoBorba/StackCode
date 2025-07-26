import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { validateCommitMessage } from '@stackcode/core';
import { t } from '@stackcode/i18n';

interface ValidateArgs {
    message: string;
}

export const validateCommand: CommandModule<{}, ValidateArgs> = {
    command: 'validate <message>',
    describe: 'Validates if a string is a conventional commit message.',
    builder: (yargs) => {
        return yargs.positional('message', {
            describe: 'The commit message to validate',
            type: 'string',
            demandOption: true,
        });
    },
    handler: (argv) => {
        const isValid = validateCommitMessage(argv.message);
        if (isValid) {
            console.log(chalk.green.bold(t('validate.success')));
        } else {
            console.log(chalk.red.bold(t('validate.error')));
        }
    }
};