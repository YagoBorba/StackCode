import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { runCommand, getCommandOutput } from '@stackcode/core';
import { t } from '@stackcode/i18n';
import inquirer from 'inquirer';

export const getFinishFeatureCommand = (): CommandModule => ({
  command: 'finish-feature',
  describe: t('git.subcommand_finish_feature_description'),
  handler: async () => {
    try {
      const currentBranch = await getCommandOutput('git', ['branch', '--show-current'], { cwd: process.cwd() });

      if (!currentBranch.startsWith('feature/')) {
        console.error(chalk.red(t('git.error_not_on_feature_branch')));
        return;
      }

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: t('git.prompt_finish_feature', { branchName: currentBranch }),
        default: true,
      }]);

      if (!confirm) {
        console.log(chalk.yellow(t('common.operation_cancelled')));
        return;
      }

      console.log(chalk.blue(t('git.info_merging_branch', { branchName: currentBranch })));
      
      await runCommand('git', ['checkout', 'develop'], { cwd: process.cwd() });
      await runCommand('git', ['pull', 'origin', 'develop'], { cwd: process.cwd() });
      await runCommand('git', ['merge', '--no-ff', currentBranch], { cwd: process.cwd() });
      await runCommand('git', ['branch', '-d', currentBranch], { cwd: process.cwd() });

      console.log(chalk.green(t('git.success_feature_merged', { branchName: currentBranch })));
      console.log(chalk.yellow(t('git.info_push_develop')));

    } catch (error: any) {
      console.error(chalk.red(t('common.unexpected_error')));
      console.error(chalk.gray(error.message));
    }
  },
});