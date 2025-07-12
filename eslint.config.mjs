// @ts-check

import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import stylisticJs from '@stylistic/eslint-plugin-js'
import stylisticTs from '@stylistic/eslint-plugin-ts'
import stylisticJsx from '@stylistic/eslint-plugin-jsx'
import unusedImports from 'eslint-plugin-unused-imports'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import i18nJsonPlugin from 'eslint-plugin-i18n-json'
import path from 'path'
import rnEslintPlugin from 'eslint-plugin-react-native'
import { fixupPluginRules } from '@eslint/compat'

export default tseslint.config(
  // core
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic/js': stylisticJs,
      '@stylistic/ts': stylisticTs,
      '@stylistic/jsx': stylisticJsx,
    },
    rules: {
      // Place custom rules here
      // use stylistic/{js/ts/jsx} instead of core eslint deprecated rules

      'no-var': 'error',
      '@stylistic/js/max-len': [
        1,
        {
          code: 100,
          comments: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      '@stylistic/js/comma-dangle': [1, 'always-multiline'],
      '@stylistic/js/object-curly-spacing': ['error', 'always'],
      '@stylistic/js/arrow-parens': 0,
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      'no-console': [
        1,
        {
          allow: ['warn', 'error'],
        },
      ],

      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
  },

  // import plugins
  {
    ...importPlugin.flatConfigs.recommended,
    files: ['src/**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      'import/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`

          // use <root>/path/to/folder/tsconfig.json
          project: './tsconfig.json',
        }),
      ],
    },
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      'import/no-dynamic-require': 'warn',
      'import/no-nodejs-modules': 'off',

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_|error',
        },
      ],
    },
  },

  // react
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    ...reactPlugin.configs.flat.recommended, // This is not a plugin object, but a shareable config object
    ...reactPlugin.configs.flat['jsx-runtime'], // Add this if you are using React 17+
    plugins: {
      ...reactPlugin.configs.flat.recommended.plugins,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactHooksPlugin.configs.recommended.rules,

      'react/jsx-curly-brace-presence': ['warn', 'never'],
    },
  },

  // Turns off all rules that are unnecessary or might conflict with Prettier
  eslintConfigPrettier,

  // use prettierrc
  {
    ...eslintPluginPrettierRecommended,
    rules: {
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
  },

  {
    files: ['src/core/localization/locales/*.json'],
    plugins: { 'i18n-json': i18nJsonPlugin },
    processor: {
      meta: { name: '.json' },
      ...i18nJsonPlugin.processors['.json'],
    },
    rules: {
      ...i18nJsonPlugin.configs.recommended.rules,
      'i18n-json/valid-message-syntax': [
        2,
        {
          syntax: path.resolve('./scripts/i18next-syntax-validation.cjs'),
        },
      ],
      'i18n-json/valid-json': 2,
      'i18n-json/sorted-keys': [
        2,
        {
          order: 'asc',
          indentSpaces: 2,
        },
      ],
      'i18n-json/identical-keys': [
        2,
        {
          filePath: path.resolve('./src/core/localization/locales/en.json'),
        },
      ],
      'prettier/prettier': [
        0,
        {
          singleQuote: true,
          endOfLine: 'auto',
        },
      ],
    },
  },

  {
    name: 'eslint-plugin-react-native',
    plugins: {
      'react-native': fixupPluginRules({
        rules: rnEslintPlugin.rules,
      }),
    },
    rules: {
      ...rnEslintPlugin.configs.all.rules,
      'react-native/sort-styles': 'warn',
      'react-native/no-inline-styles': 'off',
      'react-native/no-color-literals': 'off',
    },
  },

  // ignore patterns
  {
    ignores: [
      'build/',
      'dist/',
      'scripts/',
      'playground',
      '**/*.schema.js',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.config.js',
      '**/*.plugin.js',
      'index.html',
      '**/*.md',
      '**/*.js',
      '**/env.js',
      'src/contexts/Web3Provider/types',
      'node_modules/',
      '__tests__/',
      '.vscode/',
      'android/',
      'coverage/',
      'ios/',
      '.expo',
      '.expo-shared',
      '**/*.d.ts',
      'contracts/**/*.ts',
    ],
  },
)
