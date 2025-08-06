# @stackcode/i18n

This package manages the internationalization (i18n) logic for the StackCode CLI, allowing the user interface to be displayed in multiple languages.

## Usage

The package exports three main functions:

- `initI18n()`: Initializes the system by detecting the user's configured language and loading the appropriate JSON translation file from `src/locales/`.
- `getLocale()`: Returns the currently active locale string (e.g., `'en'`, `'pt'`).
- `t(key: string, variables?: object)`: The translation function. It takes a key (e.g., `'common.yes'`) and returns the translated string.

## Adding a New Language

1.  Create a new JSON file in `src/locales/` (e.g., `es.json`).
2.  Copy the keys from `en-US.json` and provide the translations.
3.  Update the `config` command in the `@stackcode/cli` package to include the new language as an option.
