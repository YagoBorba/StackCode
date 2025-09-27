import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Configstore from "configstore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = new Configstore("@stackcode/cli");
let translations: Record<string, unknown> = {};
let currentLocale = "en";

export async function initI18n(): Promise<void> {
  currentLocale = config.get("lang") || "en";
  const localeFilePath = path.join(__dirname, `locales/${currentLocale}.json`);

  try {
    const fileContent = await fs.readFile(localeFilePath, "utf-8");
    translations = JSON.parse(fileContent);
  } catch (error) {
    console.error(
      `Could not load translations for locale: ${currentLocale}`,
      error,
    );
    translations = {};
  }
}

export function getLocale(): string {
  return currentLocale;
}

export function t(
  key: string,
  variables?: Record<string, string | number>,
): string {
  const keys = key.split(".");

  const foundValue: unknown = keys.reduce(
    (acc: Record<string, unknown> | undefined, currentKey: string) => {
      if (acc && typeof acc === "object" && currentKey in acc) {
        return acc[currentKey] as Record<string, unknown>;
      }
      return undefined;
    },
    translations,
  );

  if (typeof foundValue === "string") {
    let processedString = foundValue;
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        processedString = processedString.replace(
          `{${varKey}}`,
          String(varValue),
        );
      });
    }
    return processedString;
  }

  return key;
}
