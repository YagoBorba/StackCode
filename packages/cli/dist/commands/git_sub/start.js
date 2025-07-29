import chalk from 'chalk';
import { runCommand } from '@stackcode/core';
import { t } from '@stackcode/i18n';
import inquirer from 'inquirer';
export const getStartCommand = () => ({
    command: 'start <name>',
    describe: t('git.subcommand_start_feature_description'), // You might want a more generic description key
    builder: (yargs) => yargs.positional('name', {
        describe: t('git.option_name_description'),
        type: 'string',
        demandOption: true,
    }),
    handler: async (argv) => {
        const featureName = argv.name;
        const { branchType } = await inquirer.prompt([{
                type: 'list',
                name: 'branchType',
                message: t('git.prompt_branch_type'),
                choices: ['feature', 'fix', 'hotfix', 'chore'],
            }]);
        const branchName = `${branchType}/${featureName}`;
        try {
            console.log(chalk.blue(t('git.info_creating_branch', { branchName })));
            await runCommand('git', ['checkout', 'develop'], { cwd: process.cwd() });
            await runCommand('git', ['pull', 'origin', 'develop'], { cwd: process.cwd() });
            await runCommand('git', ['checkout', '-b', branchName], { cwd: process.cwd() });
            console.log(chalk.green(t('git.success_branch_created', { branchName })));
        }
        catch (error) {
            console.error(chalk.red(t('git.error_branch_exists', { branchName })));
            console.error(chalk.gray(error.stderr || error.message));
        }
    },
});
