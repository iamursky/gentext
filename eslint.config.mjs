import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * @filename: eslint.config.mjs
 * @type {import('eslint/config').Config}
 */
const config = defineConfig([
  {
    files: ["**/*.ts"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  eslintConfigPrettier,
]);

export default config;
