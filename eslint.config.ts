import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import cavatina from '@cavatina-solutions/eslint-plugin';

export default tseslint.config(
    {
        ignores: ['.yarn/**', 'build/**', 'coverage/**', 'node_modules/**', '**/dist/**', 'socius-artifacts/**'],
    },

    js.configs.recommended,
    tseslint.configs.recommended,

    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            globals: { ...globals.node },
            // `projectService` is what makes `cavatina/record-or-contract` possible:
            // it needs the resolved base types, not the `extends` clause as written.
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        plugins: {
            cavatina: cavatina,
        },
        rules: {
            'cavatina/data-only-implementers': 'error',
            'cavatina/max-consecutive-line-comments': 'error',
            'cavatina/max-exports': ['error', { maximum: 1, allowDeclarationMerging: true }],
            'cavatina/merged-namespaces-only': 'error',
            'cavatina/no-static-inline-style': 'error',
            'cavatina/no-block-comments': 'error',
            'cavatina/record-or-contract': 'error',
            'cavatina/static-suffix-classes': ['error', { suffixes: ['Utilities', 'Helpers'] }],

            '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],

            '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
            eqeqeq: ['warn', 'smart'],

            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_$', varsIgnorePattern: '^_$', caughtErrorsIgnorePattern: '^_$' },
            ],

            '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],

            '@typescript-eslint/no-explicit-any': 'off',
        },
    },

    {
        files: ['**/*.{js,jsx,mjs,cjs}'],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'Program',
                    message:
                        'This repo is TypeScript. Rename to .ts or .tsx, or ignore this path here and say which tool refuses anything else.',
                },
            ],
        },
    },

    // Must stay last so it can switch off anything that fights Prettier.
    prettier,
);
