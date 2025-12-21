import { config } from '@repo/eslint-config/react-internal';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['node_modules/', 'dist/', '.turbo/', 'coverage/'],
  },
  ...config,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
