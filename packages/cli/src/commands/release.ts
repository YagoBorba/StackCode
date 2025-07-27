import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import semver from 'semver';
import fs from 'fs/promises'; 
import path from 'path';
import { t } from '@stackcode/i18n';
import {
  MonorepoInfo,
  PackageBumpInfo,
  detectVersioningStrategy,
  updateAllVersions,
  generateChangelog,
  getRecommendedBump,
  findChangedPackages,
  determinePackageBumps,
  updatePackageVersion,
  commitAndTagPackage,
} from '@stackcode/core';

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
  } catch (error) {
    // Arquivo não existe, o que é normal.
  }
  await fs.writeFile(changelogPath, `${changelog}\n${existingChangelog}`);

  console.log(chalk.green.bold(`\n${t('release.success_ready_to_commit')}`));
  console.log(chalk.yellow(`  ${t('release.next_steps_commit')}`));
}

async function handleIndependentRelease(monorepoInfo: MonorepoInfo) {
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
  
  console.log(chalk.yellow('Os seguintes pacotes serão atualizados:'));
  console.table(
    packagesToUpdate.map(info => ({
      Package: info.pkg.name,
      'Versão Atual': info.pkg.version,
      'Tipo de Bump': info.bumpType,
      'Nova Versão': info.newVersion,
    }))
  );

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

  for (const pkgInfo of packagesToUpdate) {
    const pkgName = chalk.bold(pkgInfo.pkg.name);
    console.log(chalk.cyan(`\nIniciando release para ${pkgName}...`));
    
    process.stdout.write(' -> Atualizando versão... ');
    await updatePackageVersion(pkgInfo);
    process.stdout.write(chalk.green('✔\n'));

    process.stdout.write(' -> Gerando changelog... ');
    const changelogContent = await generateChangelog(monorepoInfo, pkgInfo);
    const changelogPath = path.join(pkgInfo.pkg.path, 'CHANGELOG.md');
    let existingChangelog = '';
    try { existingChangelog = await fs.readFile(changelogPath, 'utf-8'); } catch (error) {}
    await fs.writeFile(changelogPath, `${changelogContent}\n${existingChangelog}`);
    process.stdout.write(chalk.green('✔\n'));

    process.stdout.write(' -> Criando commit e tag... ');
    await commitAndTagPackage(pkgInfo, monorepoInfo.rootDir);
    process.stdout.write(chalk.green('✔\n'));
  }

  console.log(chalk.green.bold(`\n${t('release.independent_success')}`));
  console.log(chalk.yellow(`  ${t('release.next_steps_push')}`));
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
    console.log(chalk.blue(t('release.detected_strategy', { strategy: strategyText })));

    if (monorepoInfo.strategy === 'locked') {
      await handleLockedRelease(monorepoInfo);
    } else if (monorepoInfo.strategy === 'independent') {
      await handleIndependentRelease(monorepoInfo);
    }
  }
};