import type { CommandModule } from 'yargs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { runCommand } from '@stackcode/core';
import { t } from '@stackcode/i18n';

// Esta função agora constrói as opções usando as traduções
const getCommitTypes = () => [
    { name: t('commit.types.feat'), value: 'feat' },
    { name: t('commit.types.fix'), value: 'fix' },
    { name: t('commit.types.docs'), value: 'docs' },
    { name: t('commit.types.style'), value: 'style' },
    { name: t('commit.types.refactor'), value: 'refactor' },
    { name: t('commit.types.perf'), value: 'perf' },
    { name: t('commit.types.test'), value: 'test' },
    { name: t('commit.types.chore'), value: 'chore' },
    { name: t('commit.types.revert'), value: 'revert' },
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
                choices: getCommitTypes(), // Usamos a função para obter as opções traduzidas
            },
            // ...resto das perguntas permanecem iguais
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

        // ...lógica para montar e executar o commit permanece a mesma
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