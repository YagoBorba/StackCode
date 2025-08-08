import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "coverage/",
      "packages/*/dist/",
      "packages/*/out/",
      "packages/*/build/",
      "packages/**/test/",
      "packages/**/__mocks__/",
      "**/*.js.map",
      "**/vite.config.*",
      "**/tailwind.config.*",
      "**/postcss.config.*",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
];
