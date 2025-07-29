/**
 * Translates a key and replaces placeholders with provided variables.
 * @param key The key to translate, using dot notation (e.g., 'common.error').
 * @param variables An optional object of placeholders to replace.
 * @returns The translated and formatted string.
 */
export declare function t(key: string, variables?: Record<string, string | number>): string;
export declare function initI18n(): Promise<void>;
