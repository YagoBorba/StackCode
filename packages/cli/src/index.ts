#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { validateCommand } from './commands/validate';
import { generateCommand } from './commands/generate';
import { initCommand } from './commands/init';
import { gitCommand } from './commands/git'; 
import { commitCommand } from './commands/commit';
import { configCommand } from './commands/config'; 

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
  .command(configCommand)
  
  .demandCommand(1, 'You need at least one command before moving on.')
  .help()
  .argv;