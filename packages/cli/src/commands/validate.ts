import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { validateCommitMessage } from '@stackcode/core';

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
            console.log(chalk.green.bold('✔ Valid: This is a valid conventional commit message.'));
        } else {
            console.log(chalk.red.bold('✖ Invalid: This is not a valid conventional commit message.'));
        }
    }
};