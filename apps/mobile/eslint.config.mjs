import { fixupConfigRules } from '@eslint/compat';
import reactNativePlugin from 'eslint-plugin-react-native';
import reactPlugin from 'eslint-plugin-react';
import typescriptEslint from 'typescript-eslint';
import js from '@eslint/js';

export default [
    js.configs.recommended,
    ...fixupConfigRules({
        extends: ['@react-native'],
    }),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            react: reactPlugin,
            'react-native': reactNativePlugin,
        },
        languageOptions: {
            parser: typescriptEslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            'react-native/no-unused-styles': 'warn',
            'react-native/no-inline-styles': 'warn',
            'react-native/no-color-literals': 'off',
            'react/react-in-jsx-scope': 'off',
        },
    },
];
