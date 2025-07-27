#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { validateCommand } from './commands/validate.js';
import { generateCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';
import { gitCommand } from './commands/git.js'; 
import { commitCommand } from './commands/commit.js';
import { configCommand } from './commands/config.js'; 
import { releaseCommand } from './commands/release.js';
import { initI18n } from '@stackcode/i18n';

async function main() {
  await initI18n();

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
    .command(releaseCommand)
    
    .demandCommand(1, 'You need at least one command before moving on.')
    .help()
    .argv;
}

main();