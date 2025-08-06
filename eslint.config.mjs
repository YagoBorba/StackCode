import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/", "dist/", "coverage/", "packages/*/dist/"],
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
