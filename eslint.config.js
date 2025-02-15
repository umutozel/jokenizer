// eslint.config.js
const js = require('@eslint/js');
const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
    {
        files: ['lib/**/*.ts'],
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
            "constructor-super": "error",
            "@typescript-eslint/no-explicit-any": "off",
        },
    }
];
