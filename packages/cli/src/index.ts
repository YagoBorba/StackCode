#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

// Importa ambas as funções do nosso pacote core
import { validateCommitMessage, generateGitignoreContent } from '@stackcode/core';

const program = new Command();

program
  .name('stackcode')
  .description('An intelligent tool to help junior developers with best practices.')
  .version('1.0.0');

// ... (O comando 'validate' que já fizemos continua aqui)
program
  .command('validate')
  .description('Validates if a string is a conventional commit message.')
  // ... (código do validate)

// Nosso NOVO comando: 'generate'
const generate = program.command('generate')
  .description('Generate common project files.');

generate
  .command('gitignore')
  .description('Generates a .gitignore file based on the project stack.')
  .action(async () => {
    const gitignorePath = path.join(process.cwd(), '.gitignore');

    if (fs.existsSync(gitignorePath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: 'A .gitignore file already exists. Do you want to overwrite it?',
          default: false,
        },
      ]);

      if (!overwrite) {
        console.log(chalk.yellow('Operation cancelled.'));
        return;
      }
    }

    // Futuramente, esta função será inteligente. Por agora, usamos 'node' como padrão.
    const stack = 'node'; 
    const content = generateGitignoreContent(stack);

    fs.writeFileSync(gitignorePath, content);
    console.log(chalk.green.bold('✔ Success! .gitignore file generated for a Node.js project.'));
  });


program.parse(process.argv);