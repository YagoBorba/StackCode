import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { 
    detectVersioningStrategy, 
    getRecommendedBump,
    updateAllVersions,
    generateChangelog,
    MonorepoInfo
} from '@stackcode/core';
import semver from 'semver';
import fs from 'fs/promises'; 
import path from 'path';
import { t } from '@stackcode/i18n';

async function handleLockedRelease(monorepoInfo: MonorepoInfo) {
    const projectRoot = monorepoInfo.rootDir;
    const currentVersion = monorepoInfo.rootVersion || '0.0.0';

    const bumpType = await getRecommendedBump(projectRoot);
    const newVersion = semver.inc(currentVersion, bumpType as semver.ReleaseType);

    if (!newVersion) {
        console.error(chalk.red(t('release.error_calculating_version')));
        return;
    }

    const { confirmRelease } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirmRelease',
        message: t('release.prompt_confirm_release').replace('{currentVersion}', currentVersion).replace('{newVersion}', newVersion),
        default: true,
    }]);

    if (!confirmRelease) {
        console.log(chalk.yellow(t('common.operation_cancelled')));
        return;
    }

    console.log(chalk.blue(t('release.step_updating_versions')));
    await updateAllVersions(monorepoInfo, newVersion); 

    console.log(chalk.blue(t('release.step_generating_changelog')));
    const changelog = await generateChangelog(monorepoInfo);
    const changelogPath = path.join(projectRoot, 'CHANGELOG.md');
    
    let existingChangelog = '';
    try {
        existingChangelog = await fs.readFile(changelogPath, 'utf-8');
    } catch (error) {
    }
    await fs.writeFile(changelogPath, changelog + existingChangelog);

    console.log(chalk.green.bold(`\n${t('release.success_ready_to_commit')}`));
    console.log(chalk.yellow(`   ${t('release.next_steps_commit')}`));
}

export const releaseCommand: CommandModule = {
    command: 'release',
    describe: t('release.command_description'),
    builder: {},
    handler: async () => {
        console.log(chalk.cyan.bold(t('release.start')));

        const monorepoInfo = await detectVersioningStrategy(process.cwd());

        if (monorepoInfo.strategy === 'unknown') {
            console.error(chalk.red(t('release.error_structure')));
            return;
        }

        const strategyText = chalk.bold(monorepoInfo.strategy);
        console.log(chalk.blue(t('release.detected_strategy').replace('{strategy}', strategyText)));

        const { proceed } = await inquirer.prompt([{
            type: 'confirm',
            name: 'proceed',
            message: t('release.prompt_continue'),
            default: true,
        }]);

        if (!proceed) {
            console.log(chalk.yellow(t('common.operation_cancelled')));
            return;
        }

        if (monorepoInfo.strategy === 'locked') {
            await handleLockedRelease(monorepoInfo);
        } else if (monorepoInfo.strategy === 'independent') {
            console.log(chalk.green(`\n${t('release.independent_mode_start')}`));
        }
    }
};