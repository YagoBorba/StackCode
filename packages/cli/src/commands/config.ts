import type { CommandModule, Argv } from 'yargs';
import chalk from 'chalk';
import Configstore from 'configstore';

const config = new Configstore('@stackcode/cli');

interface SetArgs {
    key: string;
    value: string;
}

const setCommand: CommandModule<{}, SetArgs> = {
    command: 'set <key> <value>',
    describe: 'Set a configuration value (e.g., "lang en")',
    builder: (yargs) => {
        return yargs
            .positional('key', {
                describe: 'The configuration key',
                type: 'string',
                choices: ['lang'], 
                demandOption: true,
            })
            .positional('value', {
                describe: 'The configuration value',
                type: 'string',
                choices: ['en', 'pt'], 
                demandOption: true,
            });
    },
    handler: (argv) => {
        config.set(argv.key, argv.value);
        console.log(chalk.green(`✔ Success! Configuration '${argv.key}' set to '${argv.value}'.`));
    }
};

export const configCommand: CommandModule = {
    command: 'config <subcommand>',
    describe: 'Manage StackCode configuration.',
    builder: (yargs: Argv) => {
        return yargs.command(setCommand);
    },
    handler: () => {
        console.log(chalk.yellow('Please specify a config subcommand (e.g., set).'));
    }
};