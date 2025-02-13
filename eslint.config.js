// eslint.config.js
const js = require('@eslint/js');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
    {
        files: ['**/*.ts', '**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': ts,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...ts.configs.recommended.rules,
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    {
        files: ['**/*.test.ts'],
        languageOptions: {
            globals: {
                ...globals.jest,
                AudioWorkletGlobalScope: true,
            },
        },
        rules: {
            'no-console': 'off',
        },
    },
];
