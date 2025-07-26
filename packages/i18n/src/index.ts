import * as fs from 'fs';
import * as path from 'path';
import Configstore from 'configstore';

const config = new Configstore('@stackcode/cli');

let translations: Record<string, any> = {};

function loadTranslations() {

    const lang = process.env.STACKCODE_LANG || config.get('lang') || 'en';
    
    const localesDir = path.resolve(__dirname, 'locales');
    const filePath = path.join(localesDir, `${lang}.json`);

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            translations = JSON.parse(fileContent);
        } else {
            const fallbackPath = path.join(localesDir, 'en.json');
            const fileContent = fs.readFileSync(fallbackPath, 'utf-8');
            translations = JSON.parse(fileContent);
        }
    } catch (error) {
        console.error('Failed to load translation files.', error);
        translations = {};
    }
}

export function t(key: string): string {
    const keys = key.split('.');
    let result = translations;

    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return key;
        }
    }

    return typeof result === 'string' ? result : key;
}

loadTranslations();