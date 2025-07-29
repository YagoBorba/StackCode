import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { generateGitignoreContent, generateReadmeContent } from '@stackcode/core';
import { t } from '@stackcode/i18n';

async function handleReadmeGeneration() {
  const readmePath = path.join(process.cwd(), 'README.md');
  try {
    await fs.access(readmePath);
    const { overwrite } = await inquirer.prompt([{
      type: 'list',
      name: 'overwrite',
      message: t('generate.prompt.readme_overwrite'),
      choices: [
          { name: t('common.yes'), value: true },
          { name: t('common.no'), value: false }
      ],
      default: false,
    }]);
    if (!overwrite) {
      console.log(chalk.yellow(t('common.operation_cancelled')));
      return;
    }
  } catch {}

  const content = await generateReadmeContent();
  await fs.writeFile(readmePath, content);
  console.log(chalk.green.bold(t('generate.success.readme')));
}

async function handleGitignoreGeneration() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  try {
    await fs.access(gitignorePath);
    const { overwrite } = await inquirer.prompt([{
      type: 'list',
      name: 'overwrite',
      message: t('generate.prompt.gitignore_overwrite'),
      choices: [
        { name: t('common.yes'), value: true },
        { name: t('common.no'), value: false }
      ],
      default: false,
    }]);
    if (!overwrite) {
        console.log(chalk.yellow(t('common.operation_cancelled')));
        return;
    }
  } catch {}

  const content = await generateGitignoreContent('node-ts');
  await fs.writeFile(gitignorePath, content);
  console.log(chalk.green.bold(t('generate.success.gitignore')));
}


export const getGenerateCommand = (): CommandModule => ({
  command: 'generate [filetype]',
  describe: t('generate.command_description'),
  builder: (yargs) =>
    yargs.positional('filetype', {
      describe: t('generate.option_filetype_description'),
      type: 'string',
      choices: ['readme', 'gitignore'],
    }),
  handler: async (argv) => {
    const filetype = argv.filetype as string | undefined;

    if (filetype) {
      if (filetype === 'readme') await handleReadmeGeneration();
      if (filetype === 'gitignore') await handleGitignoreGeneration();
      return;
    }

    const { filesToGenerate } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'filesToGenerate',
        message: t('generate.prompt.interactive_select'),
        choices: [
            { name: 'README.md', value: 'readme' },
            { name: '.gitignore', value: 'gitignore' },
        ],
    }]);

    if (!filesToGenerate || filesToGenerate.length === 0) {
        console.log(chalk.yellow(t('common.operation_cancelled')));
        return;
    }

    if (filesToGenerate.includes('readme')) {
        await handleReadmeGeneration();
    }
    if (filesToGenerate.includes('gitignore')) {
        await handleGitignoreGeneration();
    }
  },
});