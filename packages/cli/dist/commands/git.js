import { getStartCommand } from './git_sub/start.js';
import { getFinishCommand } from './git_sub/finish.js';
import { t } from '@stackcode/i18n';
export const getGitCommand = () => ({
    command: 'git <subcommand>',
    describe: t('git.command_description'),
    builder: (yargs) => {
        return yargs
            .command(getStartCommand())
            .command(getFinishCommand())
            .demandCommand(1, t('git.error_specify_subcommand'));
    },
    handler: () => { }
});
