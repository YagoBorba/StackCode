#!/usr/bin/env node

/**
 * @fileoverview This is the entry point for the StackCode CLI.
 */

import { Command } from 'commander';
import chalk from 'chalk';

// Importa nossa função de validação do PACOTE 'core'.
// Note que precisamos primeiro renomear o pacote 'core' em seu package.json.
// Vamos fazer isso no próximo passo.
import { validateCommitMessage } from '@stackcode/core';

const program = new Command();

program
  .name('stackcode')
  .description('An intelligent tool to help junior developers with best practices.')
  .version('1.0.0');

// Define nosso primeiro comando: 'validate'
program
  .command('validate')
  .description('Validates if a string is a conventional commit message.')
  .argument('<message>', 'The message string to validate')
  .action((message) => {
    // Ação que será executada quando o comando for chamado
    const isValid = validateCommitMessage(message);

    if (isValid) {
      console.log(chalk.green.bold('✔ Valid: This is a valid conventional commit message.'));
    } else {
      console.log(chalk.red.bold('✖ Invalid: This is not a valid conventional commit message.'));
    }
  });

// Processa os argumentos da linha de comando e executa as ações
program.parse(process.argv);