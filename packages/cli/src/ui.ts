import inquirer from 'inquirer';
import chalk from 'chalk';

// Prompt wrappers
export async function prompt(questions: inquirer.QuestionCollection) {
  return inquirer.prompt(questions);
}

// Logging helpers
export function logSuccess(message: string) {
  console.log(chalk.green('✔ ' + message));
}

export function logError(message: string) {
  console.error(chalk.red('✖ ' + message));
}

export function logInfo(message: string) {
  console.log(chalk.blue('ℹ ' + message));
}

export function logWarning(message: string) {
  console.warn(chalk.yellow('⚠ ' + message));
}
