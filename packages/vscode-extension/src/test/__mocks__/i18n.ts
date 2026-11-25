/**
 * Mock for @stackcode/i18n
 */
export const t = jest.fn((key: string) => key);

export const setLanguage = jest.fn();

export const getAvailableLanguages = jest.fn(() => ["en", "pt-BR", "es"]);
