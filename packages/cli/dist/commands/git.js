import { getStartFeatureCommand } from './git_sub/start-feature.js';
import { getFinishFeatureCommand } from './git_sub/finish-feature.js';
import { t } from '@stackcode/i18n';
export const getGitCommand = () => ({
    command: 'git <subcommand>',
    describe: t('git.command_description'),
    builder: (yargs) => {
        return yargs
            .command(getStartFeatureCommand())
            .command(getFinishFeatureCommand())
            .demandCommand(1, t('git.error_specify_subcommand'));
    },
    handler: () => { }
});
