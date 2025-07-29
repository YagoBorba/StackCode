import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { runCommand, getCommandOutput } from '@stackcode/core';
import { t } from '@stackcode/i18n';
import open from 'open';


function getRepoPathFromUrl(url: string): string | null {
    const match = url.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
    return match ? match[1].replace('.git', '') : null;
}

export const getFinishCommand = (): CommandModule => ({
  command: 'finish',
  describe: t('git.subcommand_finish_feature_description'), 
  handler: async () => {
    try {
      const currentBranch = await getCommandOutput('git', ['branch', '--show-current']);
      if (!currentBranch) {
          console.error(chalk.red(t('git.error_not_git_repo')));
          return;
      }

      console.log(chalk.blue(t('git.info_pushing_branch', { branchName: currentBranch })));
      await runCommand('git', ['push', '--set-upstream', 'origin', currentBranch]);

      console.log(chalk.blue(t('git.info_opening_browser')));
      const remoteUrl = await getCommandOutput('git', ['remote', 'get-url', 'origin']);
      const repoPath = getRepoPathFromUrl(remoteUrl);

      if (!repoPath) {
          console.error(chalk.red(t('git.error_parsing_remote')));
          return;
      }
      
      const prUrl = `https://github.com/${repoPath}/pull/new/${currentBranch}`;
      
      await open(prUrl);

      console.log(chalk.green(t('git.success_pr_ready')));

    } catch (error: any) {
      console.error(chalk.red(t('common.unexpected_error')));
      console.error(chalk.gray(error.stderr || error.message));
    }
  },
});