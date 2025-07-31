import type { CommandModule, Argv } from 'yargs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { generateGitignoreContent, generateReadmeContent } from '@stackcode/core';
import { t } from '@stackcode/i18n';

interface TemplateData {
    PROJECT_NAME: string;
    APP_PORT: string;
    YEAR: string;
    AUTHOR_NAME: string;
}

async function handleGenerateCommon() {
    console.log(chalk.blue('Welcome to the StackCode common file generator!'));
    console.log(chalk.blue('Please answer a few questions to set up your project.'));

    const answers = await inquirer.prompt<Omit<TemplateData, 'YEAR'>>([
        { type: 'input', name: 'PROJECT_NAME', message: 'What is your project\'s name?', default: path.basename(process.cwd()) },
        { type: 'input', name: 'AUTHOR_NAME', message: 'What is the author/team name?' },
        { type: 'input', name: 'APP_PORT', message: 'Which port will the application use? (e.g., 3000, 8080)', default: '3000' },
    ]);

    const templateData: TemplateData = { ...answers, YEAR: new Date().getFullYear().toString() };

    await generateFilesFromTemplates(templateData);

    console.log(chalk.green.bold('\n✔ Files generated successfully!'));
    console.log(chalk.yellow('Remember to fill in any blank values in the .env.example file.'));
}

async function generateFilesFromTemplates(data: TemplateData) {
    const templateDir = path.join(__dirname, '..', 'templates');
    const outputDir = process.cwd();

    const templatesToGenerate = [
        { in: 'cicd/circle-ci.yml.tpl', out: '.circleci/config.yml' },
        { in: 'cicd/gitlab-ci.yml.tpl', out: '.gitlab-ci.yml' },
        { in: 'cicd/github-ci.yml.tpl', out: '.github/workflows/ci.yml' },
        { in: 'common/.env.example.tpl', out: '.env.example' },
        { in: 'common/CHANGELOG.md.tpl', out: 'CHANGELOG.md' },
        { in: 'common/CODE_OF_CONDUCT.md.tpl', out: 'CODE_OF_CONDUCT.md' },
        { in: 'common/docker-compose.yml.tpl', out: 'docker-compose.yml' },
        { in: 'common/Dockerfile.tpl', out: 'Dockerfile' },
        { in: 'common/.dockerignore.tpl', out: '.dockerignore' },
        { in: 'common/.editorconfig.tpl', out: '.editorconfig' },
        { in: 'common/LICENSE.tpl', out: 'LICENSE' },
        { in: 'common/CONTRIBUTING.md.tpl', out: 'CONTRIBUTING.md' },
        // Add more templates here as needed
    ];

    for (const t of templatesToGenerate) {
        const outputPath = path.join(outputDir, t.out);
        const templatePath = path.join(templateDir, t.in);

        try {
            await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
            const templateContent = await fs.promises.readFile(templatePath, 'utf-8');

            let renderedContent = templateContent;
            for (const key in data) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                renderedContent = renderedContent.replace(regex, data[key as keyof TemplateData]);
            }

            await fs.promises.writeFile(outputPath, renderedContent);
            console.log(`  ${chalk.gray('Created:')} ${t.out}`);
        } catch (error: any) {
            console.error(chalk.red(`  Error generating ${t.out}:`), error.message);
        }
    }
}

// --- END OF ADDED CODE ---


export const generateCommand: CommandModule = {
    command: 'generate <filetype>',
    describe: 'Generate common project files.',
    builder: (yargs: Argv) => {
        return yargs
            .command(
                'gitignore',
                'Generates a .gitignore file for Node.js projects.',
                {},
                async () => {
                    const gitignorePath = path.join(process.cwd(), '.gitignore');
                    if (fs.existsSync(gitignorePath)) {
                        console.log(chalk.yellow('A .gitignore file already exists. Operation cancelled to avoid overwriting.'));
                        return;
                    }
                    const content = generateGitignoreContent('node');
                    fs.writeFileSync(gitignorePath, content);
                    console.log(chalk.green.bold('✔ Success! .gitignore file generated.'));
                }
            )
            .command(
                'readme',
                'Generates a rich README.md template file.',
                {},
                async () => {
                    const readmePath = path.join(process.cwd(), 'README.md');
                    if (fs.existsSync(readmePath)) {
                        const { overwrite } = await inquirer.prompt([{
                            type: 'confirm',
                            name: 'overwrite',
                            message: 'A README.md file already exists. Do you want to overwrite it?',
                            default: false,
                        }]);
                        if (!overwrite) {
                            console.log(chalk.yellow('Operation cancelled.'));
                            return;
                        }
                    }
                    const content = generateReadmeContent({
                        projectName: 'New Project',
                        description: 'A project generated by StackCode.',
                        authorName: 'Author'
                    });
                    fs.writeFileSync(readmePath, content);
                    console.log(chalk.green.bold('✔ Success! README.md template generated.'));
                }
            )
            // --- ADDITION TO THE BUILDER ---
            .command(
                'common',
                'Generates a set of common config files (Dockerfile, etc).',
                {},
                handleGenerateCommon
            );
    },
    handler: () => {
        // --- UPDATED HELP MESSAGE ---
        console.log(chalk.yellow('Please specify a file type to generate (e.g., gitignore, readme, common).'));
    }
};