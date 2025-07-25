#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Import all command modules from their dedicated files
import { validateCommand } from './commands/validate';
import { generateCommand } from './commands/generate';
import { initCommand } from './commands/init';
import { gitCommand } from './commands/git'; // <-- NOSSA NOVA IMPORTAÇÃO
import { commitCommand } from './commands/commit';

yargs(hideBin(process.argv))
  .scriptName("stackcode")
  .version('1.0.0')
  .usage('Usage: $0 <command> [options]')
  .strict()
  
  .command(validateCommand)
  .command(generateCommand)
  .command(initCommand)
  .command(gitCommand)
   .command(commitCommand)
  
  .demandCommand(1, 'You need at least one command before moving on.')
  .help()
  .argv;