import type { CommandModule } from 'yargs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { runCommand } from '@stackcode/core';
import { t } from '@stackcode/i18n';

// Tipos de commit baseados no Conventional Commits
const commitTypes = [
    { name: 'feat:     A new feature', value: 'feat' },
    { name: 'fix:      A bug fix', value: 'fix' },
    { name: 'docs:     Documentation only changes', value: 'docs' },
    { name: 'style:    Changes that do not affect the meaning of the code', value: 'style' },
    { name: 'refactor: A code change that neither fixes a bug nor adds a feature', value: 'refactor' },
    { name: 'perf:     A code change that improves performance', value: 'perf' },
    { name: 'test:     Adding missing tests or correcting existing tests', value: 'test' },
    { name: 'chore:    Changes to the build process or auxiliary tools', value: 'chore' },
    { name: 'revert:   Reverts a previous commit', value: 'revert' },
];

export const commitCommand: CommandModule = {
    command: 'commit',
    describe: t('commit.command_description'),
    builder: {},
    handler: async () => {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'type',
                message: t('commit.prompt.select_type'),
                choices: commitTypes,
            },
            {
                type: 'input',
                name: 'scope',
                message: t('commit.prompt.scope'),
            },
            {
                type: 'input',
                name: 'shortDescription',
                message: t('commit.prompt.short_description'),
                validate: (input) => input ? true : 'A short description is required.',
            },
            {
                type: 'input',
                name: 'longDescription',
                message: t('commit.prompt.long_description'),
            },
            {
                type: 'input',
                name: 'breakingChanges',
                message: t('commit.prompt.breaking_changes'),
            },
            {
                type: 'input',
                name: 'affectedIssues',
                message: t('commit.prompt.affected_issues'),
            },
        ]);

        // Monta a mensagem de commit
        let commitMessage = `${answers.type}`;
        if (answers.scope) {
            commitMessage += `(${answers.scope.trim()})`;
        }
        commitMessage += `: ${answers.shortDescription.trim()}`;

        if (answers.longDescription) {
            commitMessage += `\n\n${answers.longDescription.replace(/\|/g, '\n')}`;
        }
        
        if (answers.breakingChanges) {
            commitMessage += `\n\nBREAKING CHANGE: ${answers.breakingChanges.trim()}`;
        }

        if (answers.affectedIssues) {
            commitMessage += `\n\n${answers.affectedIssues.trim()}`;
        }

        try {
            await runCommand('git', ['commit', '-m', commitMessage], { cwd: process.cwd() });
            console.log(chalk.green(t('commit.success')));
        } catch (error: any) {
            console.error(chalk.red('✖ An error occurred during commit.'));
            console.error(chalk.gray(error.message));
        }
    },
};