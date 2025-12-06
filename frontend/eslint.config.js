import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import sonarjs from 'eslint-plugin-sonarjs'
import promise from 'eslint-plugin-promise'
import node from 'eslint-plugin-node'
import unicorn from 'eslint-plugin-unicorn'
import perfectionist from 'eslint-plugin-perfectionist'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      prettierConfig,
    ],

    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
      'unused-imports': unusedImports,
      'jsx-a11y': jsxA11y,
      sonarjs,
      promise,
      node,
      unicorn,
      perfectionist,
    },

    rules: {
      // ===========================
      // React & Refresh
      // ===========================
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ===========================
      // Code Formatting
      // ===========================
      'prettier/prettier': 'error',

      // ===========================
      // Import Management
      // ===========================
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'off',
      'perfectionist/sort-imports': ['error', { tsconfigRootDir: '.' }],

      // ===========================
      // Unused Code Detection
      // ===========================
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],

      // ===========================
      // Accessibility
      // ===========================
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',

      // ===========================
      // Code Quality (SonarJS)
      // ===========================
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',

      // ===========================
      // Promise Handling
      // ===========================
      'promise/always-return': 'warn',
      'promise/no-return-wrap': 'warn',

      // ===========================
      // TypeScript Specific
      // ===========================
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],

      // ===========================
      // General Best Practices
      // ===========================
      'no-console': 'error',
      'no-alert': 'error',
      'no-magic-numbers': 'warn',
      'prefer-const': 'error',

      // ===========================
      // Node.js Environment
      // ===========================
      'node/prefer-global/process': 'off',
      'node/no-process-env': 'error',

      // ===========================
      // File Naming Conventions
      // ===========================
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            snakeCase: true,
            pascalCase: true,
          },
          ignore: ['README.md', 'vite-env.d.ts'],
        },
      ],
    },
  },
])
