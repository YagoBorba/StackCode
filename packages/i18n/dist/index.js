import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Configstore from 'configstore';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = new Configstore('@stackcode/cli');
let translations = {};
async function loadTranslations() {
    const lang = process.env.STACKCODE_LANG || config.get('lang') || 'en';
    const localesDir = path.resolve(__dirname, 'locales');
    const filePath = path.join(localesDir, `${lang}.json`);
    const fallbackPath = path.join(localesDir, 'en.json');
    let fileToLoad = filePath;
    try {
        await fs.access(fileToLoad);
    }
    catch {
        fileToLoad = fallbackPath;
    }
    try {
        const fileContent = await fs.readFile(fileToLoad, 'utf-8');
        translations = JSON.parse(fileContent);
    }
    catch (error) {
        console.error('Failed to load translation files.', error);
        translations = {};
    }
}
/**
 * Translates a key and replaces placeholders with provided variables.
 * @param key The key to translate, using dot notation (e.g., 'common.error').
 * @param variables An optional object of placeholders to replace.
 * @returns The translated and formatted string.
 */
export function t(key, variables) {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        }
        else {
            return key;
        }
    }
    if (typeof result === 'string') {
        let formattedString = result;
        // This logic replaces placeholders like {variable} with their value.
        if (variables) {
            for (const [varName, varValue] of Object.entries(variables)) {
                formattedString = formattedString.replace(new RegExp(`\\{${varName}\\}`, 'g'), String(varValue));
            }
        }
        return formattedString;
    }
    return key;
}
export async function initI18n() {
    await loadTranslations();
}
