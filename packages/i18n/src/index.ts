import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Configstore from 'configstore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = new Configstore('@stackcode/cli');
let translations: Record<string, any> = {};
let currentLocale = 'en';

/**
 * Loads the translation file for the configured locale.
 */
export async function initI18n(): Promise<void> {
  currentLocale = config.get('lang') || 'en';
  const localeFilePath = path.join(__dirname, `locales/${currentLocale}.json`);
  
  try {
    const fileContent = await fs.readFile(localeFilePath, 'utf-8');
    translations = JSON.parse(fileContent);
  } catch (error) {
    console.error(`Could not load translations for locale: ${currentLocale}`, error);
    translations = {};
  }
}

/**
 * Returns the currently configured locale.
 * @returns {string} The active locale string (e.g., 'en', 'pt').
 */
export function getLocale(): string {
  return currentLocale;
}

/**
 * Gets a translation string for a given key.
 * @param {string} key - The key to translate (e.g., 'common.operation_cancelled').
 * @param {Record<string, string>} [variables] - Variables to replace in the string.
 * @returns {string} The translated string or the key itself if not found.
 */
export function t(key: string, variables?: Record<string, string>): string {
  const keys = key.split('.');
  let result = keys.reduce((acc, currentKey) => acc?.[currentKey], translations);

  if (typeof result === 'string') {
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        result = (result as string).replace(`{${varKey}}`, varValue);
      });
    }
    return result;
  }
  
  return key;
}