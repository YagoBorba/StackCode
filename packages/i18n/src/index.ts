import * as fs from 'fs/promises'; // Changed to promises API
import * as path from 'path';
import { fileURLToPath } from 'url'; // For ESM __dirname equivalent
import Configstore from 'configstore';

// This block creates a reliable __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = new Configstore('@stackcode/cli');
let translations: Record<string, any> = {};

/**
 * Loads translation files asynchronously.
 * It determines the language from environment variables or config, falling back to 'en'.
 * @returns {Promise<void>}
 */
async function loadTranslations(): Promise<void> {
  const lang = process.env.STACKCODE_LANG || config.get('lang') || 'en';
  const localesDir = path.resolve(__dirname, 'locales');
  const filePath = path.join(localesDir, `${lang}.json`);
  const fallbackPath = path.join(localesDir, 'en.json');

  let fileToLoad = filePath;

  try {
    // Check if the desired language file exists.
    await fs.access(fileToLoad);
  } catch {
    // If not, fall back to English.
    fileToLoad = fallbackPath;
  }

  try {
    const fileContent = await fs.readFile(fileToLoad, 'utf-8');
    translations = JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to load translation files.', error);
    translations = {}; // Reset to empty on failure
  }
}

/**
 * Translates a given key by looking it up in the loaded translations.
 * @param {string} key - The key to translate, using dot notation (e.g., 'common.error').
 * @returns {string} The translated string or the key itself if not found.
 */
export function t(key: string): string {
  // This function remains the same, it's already well-written.
  const keys = key.split('.');
  let result: any = translations;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key; // Return the original key if path is broken
    }
  }

  return typeof result === 'string' ? result : key;
}

/**
 * Initializes the internationalization module.
 * This should be called once when the application starts.
 * @returns {Promise<void>}
 */
export async function initI18n(): Promise<void> {
  await loadTranslations();
}