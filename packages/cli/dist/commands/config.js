import chalk from 'chalk';
import Configstore from 'configstore';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';
import { t } from '@stackcode/i18n';
const findProjectRoot = async (startPath) => {
    let currentPath = startPath;
    while (currentPath !== path.parse(currentPath).root) {
        try {
            await fs.access(path.join(currentPath, 'package.json'));
            return currentPath;
        }
        catch { }
        currentPath = path.dirname(currentPath);
    }
    return null;
};
const globalConfig = new Configstore('@stackcode/cli');
export const getConfigCommand = () => ({
    command: 'config',
    describe: t('config.command_description'),
    builder: {},
    handler: async () => {
        const { choice } = await inquirer.prompt([
            {
                type: 'list', name: 'choice', message: t('config.prompt.main'),
                choices: [
                    { name: t('config.prompt.select_lang'), value: 'lang' },
                    { name: t('config.prompt.toggle_validation'), value: 'commitValidation' },
                ],
            }
        ]);
        if (choice === 'lang') {
            const { lang } = await inquirer.prompt([
                {
                    type: 'list', name: 'lang', message: t('config.prompt.select_lang'),
                    choices: [{ name: 'English', value: 'en' }, { name: 'Português', value: 'pt' }],
                }
            ]);
            globalConfig.set('lang', lang);
            console.log(chalk.green(t('config.success.set', { key: 'lang', value: lang })));
        }
        else if (choice === 'commitValidation') {
            const projectRoot = await findProjectRoot(process.cwd());
            if (!projectRoot) {
                console.error(chalk.red(t('config.error.not_in_project')));
                return;
            }
            const localConfigPath = path.join(projectRoot, '.stackcoderc.json');
            try {
                await fs.access(localConfigPath);
            }
            catch {
                console.error(chalk.red(t('config.error.not_in_project')));
                return;
            }
            const { enable } = await inquirer.prompt([
                {
                    type: 'confirm', name: 'enable', message: t('config.prompt.toggle_validation'),
                    default: true,
                }
            ]);
            const localConfigContent = await fs.readFile(localConfigPath, 'utf-8');
            const localConfig = JSON.parse(localConfigContent);
            localConfig.features.commitValidation = enable;
            await fs.writeFile(localConfigPath, JSON.stringify(localConfig, null, 2));
            const status = enable ? t('config.status.enabled') : t('config.status.disabled');
            console.log(chalk.green(t('config.success.set_validation', { status })));
        }
    },
});
