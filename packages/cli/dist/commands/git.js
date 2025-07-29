import inquirer from 'inquirer';
// Importamos a lógica desacoplada, não mais os handlers
import { getStartCommand, createBranch } from './git_sub/start.js';
import { getFinishCommand, finishHandler } from './git_sub/finish.js';
import { t } from '@stackcode/i18n';
export const getGitCommand = () => ({
    command: 'git [subcommand]',
    describe: t('git.command_description'),
    builder: (yargs) => {
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
                    validate: (input) => !!input || 'O nome da branch não pode ser vazio.',
                }]);
            const { branchType } = await inquirer.prompt([{
                    type: 'list',
                    name: 'branchType',
                    message: t('git.prompt_branch_type'),
                    choices: ['feature', 'fix', 'hotfix', 'chore'],
                }]);
            await createBranch(branchName, branchType);
        }
        else if (action === 'finish') {
            await finishHandler();
        }
    }
});
