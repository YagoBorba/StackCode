import type { CommandModule, Argv } from 'yargs';
import chalk from 'chalk';
import { startFeatureCommand } from './git_sub/start-feature';

export const gitCommand: CommandModule = {
    command: 'git <subcommand>',
    describe: 'Provides a suite of commands to assist with the GitFlow workflow.',
    builder: (yargs: Argv) => {
        // Registra todos os sub-comandos do 'git' aqui
        return yargs
            .command(startFeatureCommand);
    },
    handler: () => {
        console.log(chalk.yellow('Please specify a git subcommand (e.g., start-feature).'));
    }
};