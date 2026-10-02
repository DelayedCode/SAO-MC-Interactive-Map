"use strict";

/* Minimal ESLint flat config.
 *
 * This is a static, framework-free site built from classic scripts (many globals are shared
 * across <script> tags and across pages), so `no-undef` is intentionally off: the project
 * relies on globals such as window, document, DATA, MOB_AREAS and the SAO* namespaces.
 * The rules below target real mistakes and dead code, and are warnings so they guide the
 * future cleanup passes without blocking day-to-day work. */

const commonRules = {
  "no-undef": "off",
  "no-unused-vars": ["warn", { args: "none", caughtErrors: "none", varsIgnorePattern: "^_" }],
  "no-empty": ["warn", { allowEmptyCatch: true }],
  "no-unreachable": "warn",
  "no-constant-condition": ["warn", { checkLoops: false }],
  "no-dupe-keys": "warn",
  "no-dupe-args": "warn",
  "no-func-assign": "warn",
  "no-redeclare": "warn",
  "no-self-assign": "warn",
  "no-sparse-arrays": "warn",
  "no-unexpected-multiline": "warn",
  "no-useless-escape": "off",
  eqeqeq: ["warn", "smart"]
};

module.exports = [
  {
    ignores: ["node_modules/**", ".venv/**", ".devin/**", "dist/**", "coverage/**", "**/*.min.js"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script"
    },
    rules: commonRules
  }
];
