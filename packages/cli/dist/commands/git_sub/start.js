import chalk from 'chalk';
import { runCommand } from '@stackcode/core';
import { t } from '@stackcode/i18n';
import inquirer from 'inquirer';
/**
 * A lógica principal de criar a branch. Agora está separada e pode ser
 * chamada de qualquer lugar, inclusive do nosso menu interativo.
 */
export async function createBranch(branchName, branchType) {
    const fullBranchName = `${branchType}/${branchName}`;
    try {
        console.log(chalk.blue(t('git.info_creating_branch', { branchName: fullBranchName })));
        await runCommand('git', ['checkout', 'develop'], { cwd: process.cwd() });
        await runCommand('git', ['pull', 'origin', 'develop'], { cwd: process.cwd() });
        await runCommand('git', ['checkout', '-b', fullBranchName], { cwd: process.cwd() });
        console.log(chalk.green(t('git.success_branch_created', { branchName: fullBranchName })));
    }
    catch (error) {
        console.error(chalk.red(t('git.error_branch_exists', { branchName: fullBranchName })));
        console.error(chalk.gray(error.stderr || error.message));
    }
}
export const startHandler = async (argv) => {
    const { branchType } = await inquirer.prompt([{
            type: 'list',
            name: 'branchType',
            message: t('git.prompt_branch_type'),
            choices: ['feature', 'fix', 'hotfix', 'chore'],
        }]);
    await createBranch(argv.name, branchType);
};
export const getStartCommand = () => ({
    command: 'start <name>',
    describe: t('git.subcommand_start_feature_description'),
    builder: (yargs) => yargs.positional('name', {
        describe: t('git.option_name_description'),
        type: 'string',
        demandOption: true,
    }),
    handler: startHandler,
});
