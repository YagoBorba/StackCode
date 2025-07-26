import type { CommandModule } from 'yargs';
import chalk from 'chalk';
import Configstore from 'configstore';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { t } from '@stackcode/i18n';

const findProjectRoot = (startPath: string): string | null => {
    let currentPath = startPath;
    while (currentPath !== path.parse(currentPath).root) {
        if (fs.existsSync(path.join(currentPath, 'package.json'))) {
            return currentPath;
        }
        currentPath = path.dirname(currentPath);
    }
    return null;
};

const globalConfig = new Configstore('@stackcode/cli');

export const configCommand: CommandModule = {
    command: 'config',
    describe: t('config.command_description'),
    builder: {},
    handler: async () => {
        const { choice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: t('config.prompt.main'),
                choices: [
                    { name: t('config.prompt.select_lang'), value: 'lang' },
                    { name: t('config.prompt.toggle_validation'), value: 'commitValidation' },
                ],
            }
        ]);

        if (choice === 'lang') {
            const { lang } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'lang',
                    message: t('config.prompt.select_lang'),
                    choices: [ { name: 'English', value: 'en' }, { name: 'Português', value: 'pt' } ],
                }
            ]);
            globalConfig.set('lang', lang);
            console.log(chalk.green(t('config.success.set').replace('{key}', 'lang').replace('{value}', lang)));
        } 
        
        else if (choice === 'commitValidation') {
            const projectRoot = findProjectRoot(process.cwd());
            if (!projectRoot) {
                console.error(chalk.red(t('config.error.not_in_project')));
                return;
            }

            const localConfigPath = path.join(projectRoot, '.stackcoderc.json');

            // Se o arquivo não existir, significa que o projeto não foi criado com a feature
            if (!fs.existsSync(localConfigPath)) {
                console.error(chalk.red(t('config.error.not_in_project')));
                return;
            }

            const { enable } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'enable',
                    message: t('config.prompt.toggle_validation'),
                    default: true,
                }
            ]);

            const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'));
            localConfig.features.commitValidation = enable;
            fs.writeFileSync(localConfigPath, JSON.stringify(localConfig, null, 2));

            const status = enable ? t('config.status.enabled') : t('config.status.disabled');
            console.log(chalk.green(t('config.success.set_validation').replace('{status}', status)));
        }
    },
};