// Usamos 'import' pois .mjs nos permite usar ES Modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Importa nossa função de validação do pacote 'core' já compilado
import { validateCommitMessage } from '../packages/core/dist/index.js';

// Pega o caminho para o arquivo de mensagem de commit passado pelo Git ($1)
const commitMsgPath = process.argv[2];

// Lê a mensagem do commit
const message = fs.readFileSync(commitMsgPath, 'utf-8').trim();

// Valida a mensagem
if (validateCommitMessage(message)) {
  console.log(chalk.green('✔ Commit message is valid.'));
  process.exit(0);
} else {
  console.error(chalk.red.bold('✖ Invalid Commit Message'));
  console.error(chalk.yellow('----------------------------------------------------'));
  console.error(chalk.yellow(`Your commit message: "${message}"`));
  console.error(chalk.yellow('It does not adhere to the Conventional Commits format.'));
  console.error(chalk.cyan('\nPlease use the format: type(scope?): subject'));
  console.error(chalk.cyan('Examples:'));
  console.error(chalk.cyan('  feat: ✨ Add user authentication'));
  console.error(chalk.cyan('  fix(api): 🐛 Correct calculation for payment totals'));
  console.error(chalk.yellow('----------------------------------------------------'));

  // Sai com código 1 para abortar o commit
  process.exit(1); 
}