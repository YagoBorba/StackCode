#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getValidateCommand } from './commands/validate.js';
import { getGenerateCommand } from './commands/generate.js';
import { getInitCommand } from './commands/init.js';
import { getGitCommand } from './commands/git.js';
import { getCommitCommand } from './commands/commit.js';
import { getConfigCommand } from './commands/config.js';
import { getReleaseCommand } from './commands/release.js';
import { initI18n, t, getLocale } from '@stackcode/i18n';
async function main() {
    try {
        await initI18n();
        const locale = getLocale();
        yargs(hideBin(process.argv))
            .scriptName("stackcode")
            .version('1.0.0')
            .alias('h', 'help')
            .alias('v', 'version')
            .strict()
            .locale(locale)
            .command(getValidateCommand())
            .command(getGenerateCommand())
            .command(getInitCommand())
            .command(getGitCommand())
            .command(getCommitCommand())
            .command(getConfigCommand())
            .command(getReleaseCommand())
            .demandCommand(1, t('common.error_demand_command'))
            .help()
            .argv;
    }
    catch (error) {
        console.error('[DEBUG] Ocorreu um erro fatal na inicialização:', error);
        process.exit(1);
    }
}
main();
