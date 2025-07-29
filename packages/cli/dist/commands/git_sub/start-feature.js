import chalk from 'chalk';
import { runCommand } from '@stackcode/core';
import { t } from '@stackcode/i18n';
export const getStartFeatureCommand = () => ({
    command: 'start-feature <name>',
    describe: t('git.subcommand_start_feature_description'),
    builder: (yargs) => yargs.positional('name', {
        describe: t('git.option_name_description'),
        type: 'string',
        demandOption: true,
    }),
    handler: async (argv) => {
        const featureName = argv.name;
        const branchName = `feature/${featureName}`;
        try {
            console.log(chalk.blue(t('git.info_creating_branch', { branchName })));
            await runCommand('git', ['checkout', '-b', branchName], { cwd: process.cwd() });
            console.log(chalk.green(t('git.success_branch_created', { branchName })));
        }
        catch (error) {
            console.error(chalk.red(t('git.error_branch_exists', { branchName })));
        }
    },
});
