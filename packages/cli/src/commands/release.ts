import type { CommandModule } from 'yargs';
import path from 'path';
import fs from 'fs/promises';
import semver from 'semver';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Configstore from 'configstore';
import { t } from '@stackcode/i18n';
import {
  MonorepoInfo,
  PackageBumpInfo,
  detectVersioningStrategy,
  findChangedPackages,
  determinePackageBumps,
  updatePackageVersion,
  updateAllVersions,
  generateChangelog,
  getRecommendedBump,
  performReleaseCommit,
  createGitHubRelease,
  getCommandOutput,
} from '@stackcode/core';

const config = new Configstore('@stackcode/cli', { github_token: '' });

async function handleGitHubReleaseCreation(tagName: string, releaseNotes: string) {
  const { createRelease } = await inquirer.prompt([{
    type: 'confirm',
    name: 'createRelease',
    message: t('release.prompt_create_github_release'),
    default: true,
  }]);

  if (!createRelease) return;

  let token = config.get('github_token');

  if (!token) {
    console.log(chalk.yellow(`\n${t('release.info_github_token_needed')}`));
    console.log(chalk.blue(t('release.info_github_token_instructions')));
    
    const { pat } = await inquirer.prompt([{
      type: 'password', name: 'pat', message: t('release.prompt_github_token'), mask: '*'
    }]);
    token = pat;

    const { saveToken } = await inquirer.prompt([{
      type: 'confirm', name: 'saveToken', message: t('release.prompt_save_token'), default: true
    }]);

    if (saveToken) config.set('github_token', token);
  }

  try {
    const remoteUrl = await getCommandOutput('git', ['remote', 'get-url', 'origin'], { cwd: process.cwd() });
    const match = remoteUrl.match(/github\.com[/:]([\w-]+\/[\w-.]+)/);
    if (!match) throw new Error('Could not parse GitHub owner/repo from remote URL.');
    
    const [owner, repo] = match[1].replace('.git', '').split('/');
    await createGitHubRelease({ owner, repo, tagName, releaseNotes, token });

  } catch (error: any) {
    console.error(chalk.red(`\n${t('common.error_generic')}`), chalk.gray(error.message));
    if (error.message?.toLowerCase().includes('bad credentials')) {
      config.delete('github_token');
      console.log(chalk.yellow('Your saved GitHub token was invalid and has been cleared.'));
    }
  }
}

async function handleLockedRelease(monorepoInfo: MonorepoInfo) {
  const bumpType = await getRecommendedBump(monorepoInfo.rootDir);
  const currentVersion = monorepoInfo.rootVersion || '0.0.0';
  const newVersion = semver.inc(currentVersion, bumpType as semver.ReleaseType);
  if (!newVersion) {
    console.error(chalk.red(t('release.error_calculating_version')));
    return;
  }

  const { confirm } = await inquirer.prompt([{
    type: 'confirm', name: 'confirm',
    message: t('release.prompt_confirm_release', { currentVersion, newVersion }),
    default: true,
  }]);
  if (!confirm) return console.log(chalk.yellow(t('common.operation_cancelled')));

  console.log(chalk.blue(t('release.step_updating_versions')));
  await updateAllVersions(monorepoInfo, newVersion);

  console.log(chalk.blue(t('release.step_generating_changelog')));
  const changelog = await generateChangelog(monorepoInfo);
  const changelogPath = path.join(monorepoInfo.rootDir, 'CHANGELOG.md');
  const existing = await fs.readFile(changelogPath, 'utf-8').catch(() => '');
  await fs.writeFile(changelogPath, `${changelog}\n${existing}`);

  console.log(chalk.green.bold(`\n${t('release.success_ready_to_commit')}`));
  console.log(chalk.yellow(`  ${t('release.next_steps_commit')}`));
  await handleGitHubReleaseCreation(`v${newVersion}`, changelog);
}

async function handleIndependentRelease(monorepoInfo: MonorepoInfo) {
  const changedPackages = await findChangedPackages(monorepoInfo.packages, monorepoInfo.rootDir);
  if (changedPackages.length === 0) {
    return console.log(chalk.green(t('release.independent_mode_no_changes')));
  }

  const packagesToUpdate = await determinePackageBumps(changedPackages);
  if (packagesToUpdate.length === 0) {
    return console.log(chalk.yellow(t('release.independent_mode_no_bumps')));
  }

  console.log(chalk.yellow(t('release.independent_mode_packages_to_update')));
  console.table(packagesToUpdate.map(info => ({
    Package: info.pkg.name,
    'Current Version': info.pkg.version,
    'Bump Type': info.bumpType,
    'New Version': info.newVersion,
  })));

  const { confirm } = await inquirer.prompt([{
    type: 'confirm', name: 'confirm', message: t('release.independent_prompt_confirm'), default: true
  }]);
  if (!confirm) return console.log(chalk.yellow(t('common.operation_cancelled')));
  
  const allChangelogs: { header: string; content: string }[] = [];
  for (const pkgInfo of packagesToUpdate) {
    await updatePackageVersion(pkgInfo);
    const changelogContent = await generateChangelog(monorepoInfo, pkgInfo);
    const changelogPath = path.join(pkgInfo.pkg.path, 'CHANGELOG.md');
    const existing = await fs.readFile(changelogPath, 'utf-8').catch(() => '');
    await fs.writeFile(changelogPath, `${changelogContent}\n${existing}`);
    allChangelogs.push({
      header: `### 🎉 Release for ${pkgInfo.pkg.name}@${pkgInfo.newVersion}`,
      content: changelogContent,
    });
  }

  await performReleaseCommit(packagesToUpdate, monorepoInfo.rootDir);
  console.log(chalk.green.bold(`\n${t('release.independent_success')}`));

  const combinedNotes = allChangelogs.map(c => `${c.header}\n\n${c.content}`).join('\n\n');
  const primaryPackage = packagesToUpdate.find(p => p.pkg.name === '@stackcode/cli') || packagesToUpdate[0];
  const tagName = `${primaryPackage.pkg.name.split('/')[1] || primaryPackage.pkg.name}@${primaryPackage.newVersion}`;
  await handleGitHubReleaseCreation(tagName, combinedNotes);

  console.log(chalk.yellow(`  ${t('release.next_steps_push')}`));
}

export const getReleaseCommand = (): CommandModule => ({
  command: 'release',
  describe: t('release.command_description'),
  builder: {},
  handler: async () => {
    try {
      console.log(chalk.cyan.bold(t('release.start')));
      const monorepoInfo = await detectVersioningStrategy(process.cwd());

      if (monorepoInfo.strategy === 'unknown') {
        throw new Error(t('release.error_structure'));
      }

      console.log(chalk.blue(t('release.detected_strategy', { strategy: chalk.bold(monorepoInfo.strategy) })));

      if (monorepoInfo.strategy === 'locked') {
        await handleLockedRelease(monorepoInfo);
      } else if (monorepoInfo.strategy === 'independent') {
        await handleIndependentRelease(monorepoInfo);
      }
    } catch (error: any) {
      console.error(chalk.red(`\n${t('common.error_unexpected')}`), chalk.gray(error.message));
      process.exit(1);
    }
  },
});