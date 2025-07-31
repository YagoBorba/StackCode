import chalk from 'chalk';
import inquirer from 'inquirer';
import semver from 'semver';
import fs from 'fs/promises';
import path from 'path';
import { t } from '@stackcode/i18n';
import Configstore from 'configstore';
import { detectVersioningStrategy, updateAllVersions, generateChangelog, getRecommendedBump, findChangedPackages, determinePackageBumps, updatePackageVersion, performReleaseCommit, createGitHubRelease, getCommandOutput, } from '@stackcode/core';
const config = new Configstore('@stackcode/cli', { github_token: '' });
async function handleGitHubReleaseCreation(tagName, releaseNotes) {
    const { createRelease } = await inquirer.prompt([{
            type: 'confirm',
            name: 'createRelease',
            message: t('release.prompt_create_github_release'),
            default: true,
        }]);
    if (!createRelease)
        return;
    let token = config.get('github_token');
    if (!token) {
        console.log(chalk.yellow(`\n${t('release.info_github_token_needed')}`));
        console.log(chalk.blue(t('release.info_github_token_instructions')));
        const { pat } = await inquirer.prompt([{
                type: 'password',
                name: 'pat',
                message: t('release.prompt_github_token'),
                mask: '*',
            }]);
        token = pat;
        const { saveToken } = await inquirer.prompt([{
                type: 'confirm',
                name: 'saveToken',
                message: t('release.prompt_save_token'),
                default: true,
            }]);
        if (saveToken) {
            config.set('github_token', token);
        }
    }
    try {
        const remoteUrl = await getCommandOutput('git', ['remote', 'get-url', 'origin'], { cwd: process.cwd() });
        const match = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
        if (!match) {
            throw new Error('Could not parse GitHub owner/repo from remote URL.');
        }
        const [owner, repo] = match[1].replace('.git', '').split('/');
        await createGitHubRelease({
            owner,
            repo,
            tagName,
            releaseNotes,
            token,
        });
    }
    catch (error) {
        console.error(chalk.red(`\n${t('common.error_generic')}`));
        console.error(chalk.gray(error.message));
        if (error.message.toLowerCase().includes('bad credentials')) {
            config.delete('github_token');
            console.log(chalk.yellow('Your saved GitHub token was invalid and has been cleared. Please try again.'));
        }
    }
}
async function handleLockedRelease(monorepoInfo) {
    const projectRoot = monorepoInfo.rootDir;
    const currentVersion = monorepoInfo.rootVersion || '0.0.0';
    const bumpType = await getRecommendedBump(projectRoot);
    const newVersion = semver.inc(currentVersion, bumpType);
    if (!newVersion) {
        console.error(chalk.red(t('release.error_calculating_version')));
        return;
    }
    const { confirmRelease } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmRelease',
            message: t('release.prompt_confirm_release', { currentVersion, newVersion }),
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
    }
    catch (error) { }
    await fs.writeFile(changelogPath, `${changelog}\n${existingChangelog}`);
    console.log(chalk.green.bold(`\n${t('release.success_ready_to_commit')}`));
    console.log(chalk.yellow(`  ${t('release.next_steps_commit')}`));
    await handleGitHubReleaseCreation(`v${newVersion}`, changelog);
}
async function handleIndependentRelease(monorepoInfo) {
    console.log(chalk.blue(t('release.independent_mode_start')));
    const changedPackages = await findChangedPackages(monorepoInfo.packages, monorepoInfo.rootDir);
    if (changedPackages.length === 0) {
        console.log(chalk.green(t('release.independent_mode_no_changes')));
        return;
    }
    const packagesToUpdate = await determinePackageBumps(changedPackages);
    if (packagesToUpdate.length === 0) {
        console.log(chalk.yellow(t('release.independent_mode_no_bumps')));
        return;
    }
    console.log(chalk.yellow(t('release.independent_mode_packages_to_update')));
    console.table(packagesToUpdate.map(info => ({
        [t('release.table_header_package')]: info.pkg.name,
        [t('release.table_header_current_version')]: info.pkg.version,
        [t('release.table_header_bump_type')]: info.bumpType,
        [t('release.table_header_new_version')]: info.newVersion,
    })));
    const { confirmRelease } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmRelease',
            message: t('release.independent_prompt_confirm'),
            default: true,
        }]);
    if (!confirmRelease) {
        console.log(chalk.yellow(t('common.operation_cancelled')));
        return;
    }
    const stepDone = chalk.green(t('release.step_done'));
    const allChangelogs = [];
    for (const pkgInfo of packagesToUpdate) {
        const pkgName = chalk.bold(pkgInfo.pkg.name);
        console.log(chalk.cyan(`\n${t('release.info_releasing_package', { pkgName })}`));
        process.stdout.write(`${t('release.step_updating_version')} `);
        await updatePackageVersion(pkgInfo);
        process.stdout.write(`${stepDone}\n`);
        process.stdout.write(`${t('release.step_generating_changelog')} `);
        const changelogContent = await generateChangelog(monorepoInfo, pkgInfo);
        const changelogPath = path.join(pkgInfo.pkg.path, 'CHANGELOG.md');
        let existingChangelog = '';
        try {
            existingChangelog = await fs.readFile(changelogPath, 'utf-8');
        }
        catch (error) { }
        await fs.writeFile(changelogPath, `${changelogContent}\n${existingChangelog}`);
        process.stdout.write(`${stepDone}\n`);
        process.stdout.write(`${t('release.step_committing_and_tagging')} `);
        await performReleaseCommit(pkgInfo, monorepoInfo.rootDir);
        process.stdout.write(`${stepDone}\n`);
        const header = `### 🎉 Release for ${pkgInfo.pkg.name}@${pkgInfo.newVersion}`;
        allChangelogs.push(header, changelogContent);
    }
    console.log(chalk.green.bold(`\n${t('release.independent_success')}`));
    const combinedReleaseNotes = allChangelogs.join('\n\n');
    const primaryPackageUpdate = packagesToUpdate.find(p => p.pkg.name === '@stackcode/cli') || packagesToUpdate[0];
    if (primaryPackageUpdate) {
        const primaryTagName = `${primaryPackageUpdate.pkg.name.split('/')[1] || primaryPackageUpdate.pkg.name}@${primaryPackageUpdate.newVersion}`;
        await handleGitHubReleaseCreation(primaryTagName, combinedReleaseNotes);
    }
    console.log(chalk.yellow(`  ${t('release.next_steps_push')}`));
}
export const getReleaseCommand = () => ({
    command: 'release',
    describe: t('release.command_description'),
    builder: {},
    handler: async () => {
        console.log(chalk.cyan.bold(t('release.start')));
        const monorepoInfo = await detectVersioningStrategy(process.cwd());
        if (monorepoInfo.strategy === 'unknown') {
            console.error(chalk.red(t('release.error_structure')));
            process.exit(1); // Encerra com erro
        }
        const strategyText = chalk.bold(monorepoInfo.strategy);
        console.log(chalk.blue(t('release.detected_strategy', { strategy: strategyText })));
        if (monorepoInfo.strategy === 'locked') {
            await handleLockedRelease(monorepoInfo);
        }
        else if (monorepoInfo.strategy === 'independent') {
            await handleIndependentRelease(monorepoInfo);
        }
        process.exit(0);
    },
});
