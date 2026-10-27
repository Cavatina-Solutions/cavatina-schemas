import type { UserConfig } from '@commitlint/types';

// Read by @commitlint/cli, which validates with `rules`, and by czg, which authors with `prompt`.

const types = [
    { value: 'feat', description: 'A new feature' },
    { value: 'fix', description: 'A bug fix' },
    { value: 'docs', description: 'Documentation only changes' },
    { value: 'refactor', description: 'A change that neither fixes a bug nor adds a feature' },
    { value: 'style', description: 'Formatting only; no change to code behavior' },
    { value: 'test', description: 'Adding or correcting tests' },
    { value: 'perf', description: 'A performance improvement' },
    { value: 'build', description: 'Build system, tooling, or dependencies' },
    { value: 'ci', description: 'CI configuration and scripts' },
    { value: 'chore', description: "Other changes that don't modify src or test files" },
    { value: 'revert', description: 'Reverts a previous commit' },
];

// The repo's own scopes, one per part of it a change can be about.
const scopes = [
    { value: 'socius', description: 'The Socius schemas (socius/)' },
    { value: 'verify', description: 'The schema verifier (scripts/verify.ts)' },
    { value: 'repo', description: 'Repo-wide: tooling, hooks, CLAUDE.md, governance' },
    { value: 'deps', description: 'Dependency bumps' },
];

const config: UserConfig & { prompt?: Record<string, unknown> } = {
    extends: ['@commitlint/config-conventional'],

    rules: {
        'type-enum': [2, 'always', types.map((t) => t.value)],
        'scope-enum': [2, 'always', scopes.map((s) => s.value)],
        'scope-empty': [2, 'never'],
        'header-max-length': [2, 'always', 100],
        'body-max-line-length': [2, 'always', 100],
        'trailer-exists': [2, 'never', 'Co-Authored-By:'],
    },

    prompt: {
        alias: { b: 'chore(repo): bump dependencies' },
        allowCustomScopes: false,
        allowEmptyScopes: false,
        allowBreakingChanges: ['feat', 'fix'],
        types: types.map((t) => ({
            value: t.value,
            name: `${(t.value + ':').padEnd(10)}${t.description}`,
        })),
        scopes: scopes.map((s) => ({ value: s.value, name: `${s.value.padEnd(20)}${s.description}` })),
        messages: {
            type: "Select the type of change that you're committing:",
            scope: 'Denote the SCOPE of this change:',
            subject: 'Write a SHORT, IMPERATIVE, lowercase description of the change:\n',
            body: 'Provide a LONGER description of the change (optional). Use "|" for new lines:\n',
            breaking: 'List any BREAKING CHANGES (optional):\n',
            footerPrefixesSelect: 'Select the ISSUES type of change (optional):',
            customFooterPrefix: 'Input ISSUES prefix:',
            footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
            confirmCommit: 'Are you sure you want to proceed with the commit above?',
        },
    },
};

export default config;
