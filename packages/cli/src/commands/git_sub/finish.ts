import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import { runCommand, getCommandOutput } from '@stackcode/core';
import { t } from '@stackcode/i18n';
import open from 'open';

function getRepoPathFromUrl(url: string): string | null {
    const match = url.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
    return match ? match[1].replace('.git', '') : null;
}

export const finishHandler = async () => {
  try {
    const currentBranch = await getCommandOutput('git', ['branch', '--show-current'], { cwd: process.cwd() });
    if (!currentBranch) {
        console.error(chalk.red(t('git.error_not_git_repo')));
        return;
    }

    console.log(chalk.blue(t('git.info_pushing_branch', { branchName: currentBranch })));
    await runCommand('git', ['push', '--set-upstream', 'origin', currentBranch], { cwd: process.cwd() });

    console.log(chalk.blue(t('git.info_opening_browser')));
    const remoteUrl = await getCommandOutput('git', ['remote', 'get-url', 'origin'], { cwd: process.cwd() });
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
};


export const getFinishCommand = (): CommandModule => ({
  command: 'finish',
  describe: t('git.finish_feature.description'),
  handler: finishHandler,
});