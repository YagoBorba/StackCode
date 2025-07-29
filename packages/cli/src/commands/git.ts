import { CommandModule, Argv } from 'yargs';
import inquirer from 'inquirer';
import { getStartCommand, startHandler } from './git_sub/start.js';
import { getFinishCommand, finishHandler } from './git_sub/finish.js';
import { t } from '@stackcode/i18n';

export const getGitCommand = (): CommandModule => ({
    command: 'git [subcommand]', 
    describe: t('git.command_description'),
    builder: (yargs: Argv) => {
        return yargs
            .command(getStartCommand())
            .command(getFinishCommand())
            .help(); 
    },
    handler: async (argv) => {
        if (argv.subcommand) {
            return;
        }
        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: t('git.prompt_interactive_action'),
            choices: [
                { name: t('git.action_start'), value: 'start' },
                { name: t('git.action_finish'), value: 'finish' },
            ]
        }]);

        if (action === 'start') {
            const { branchName } = await inquirer.prompt([{
                type: 'input',
                name: 'branchName',
                message: t('git.prompt_branch_name'),
                validate: (input) => input ? true : 'Branch name cannot be empty.'
            }]);
            await startHandler({ name: branchName });
        } else if (action === 'finish') {
            await finishHandler();
        }
    }
});