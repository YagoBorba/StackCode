#!/usr/bin/env node

// 1. Import the necessary types from yargs
import yargs, { ArgumentsCamelCase, Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { 
  validateCommitMessage, 
  generateGitignoreContent,
  generateReadmeContent 
} from '@stackcode/core';

yargs(hideBin(process.argv))
  .scriptName("stackcode")
  .version('1.0.0')
  // 2. Changed .description() to the correct .usage() method
  .usage('Usage: $0 <command> [options]')
  .strict()
  
  // --- Comando 'validate' ---
  .command(
    'validate <message>',
    'Validates if a string is a conventional commit message.',
    () => {},
    // 3. Added type for the 'argv' parameter
    (argv: ArgumentsCamelCase<{ message: string }>) => {
      const isValid = validateCommitMessage(argv.message);
      if (isValid) {
        console.log(chalk.green.bold('✔ Valid: This is a valid conventional commit message.'));
      } else {
        console.log(chalk.red.bold('✖ Invalid: This is not a valid conventional commit message.'));
      }
    }
  )

  // --- Comando 'generate' ---
  .command(
    'generate <filetype>',
    'Generate common project files.',
    // 4. Added type for the 'yargs' parameter
    (yargs: Argv) => {
      return yargs
        .command(
          'gitignore',
          'Generates a .gitignore file.',
          () => {},
          async () => {
            const gitignorePath = path.join(process.cwd(), '.gitignore');
            // ... (rest of the gitignore logic is unchanged)
          }
        )
        .command(
          'readme',
          'Generates a rich README.md template file.',
          () => {},
          async () => {
            const readmePath = path.join(process.cwd(), 'README.md');
            if (fs.existsSync(readmePath)) {
              const { overwrite } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'overwrite',
                  message: 'A README.md file already exists. Do you want to overwrite it?',
                  default: false,
                },
              ]);
              if (!overwrite) {
                console.log(chalk.yellow('Operation cancelled.'));
                return;
              }
            }
            const content = generateReadmeContent();
            fs.writeFileSync(readmePath, content);
            console.log(chalk.green.bold('✔ Success! README.md template generated.'));
          }
        )
    },
    () => {
      console.log(chalk.yellow('Please specify a file type to generate (e.g., gitignore, readme).'));
    }
  )
  .demandCommand(1, 'You need at least one command before moving on.')
  .help()
  .argv;