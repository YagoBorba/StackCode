import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import open from 'open';
import { runCommand, getCommandOutput } from '@stackcode/core';
import { t } from '@stackcode/i18n';

export const finishFeatureCommand: CommandModule = {
    command: 'finish-feature',
    describe: 'Pushes the current feature branch and opens the New Pull Request page in the browser.',
    builder: (yargs) => yargs,
    handler: async () => {
        console.log(chalk.cyan(t('git.finish_feature.start')));

        try {
            const branchName = await getCommandOutput('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: process.cwd() });
            
            if (!branchName.startsWith('feature/')) {
                console.error(chalk.red(t('git.finish_feature.error_not_feature_branch')));
                console.log(chalk.yellow(`   ${t('git.finish_feature.current_branch').replace('{branchName}', branchName)}`));
                return;
            }

            console.log(chalk.blue(`   ${t('git.finish_feature.pushing').replace('{branchName}', branchName)}`));
            await runCommand('git', ['push', '--set-upstream', 'origin', branchName], { cwd: process.cwd() });

            const remoteUrl = await getCommandOutput('git', ['remote', 'get-url', 'origin'], { cwd: process.cwd() });
            
            const repoPathMatch = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-]+)\.git/);
            if (!repoPathMatch) {
                throw new Error(t('git.finish_feature.error_parsing_url'));
            }
            const repoPath = repoPathMatch[1];
            
            const prUrl = `https://github.com/${repoPath}/pull/new/${branchName}`;

            console.log(chalk.blue(`   ${t('git.finish_feature.opening_browser')}`));
            await open(prUrl);

            console.log(chalk.green.bold(`\n${t('git.finish_feature.success')}`));
            console.log(chalk.yellow(`   ${t('git.finish_feature.follow_up')}`));

        } catch (error: any) {
            console.error(chalk.red(t('common.error_generic')));
            console.error(chalk.gray(error.message));
        }
    }
};