import { config } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: ['node_modules/', '.turbo/', 'scripts/'],
  },
  ...config,

  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.mjs',
            'vitest.config.ts',
            'test/*/*.test.ts',
            'test/*/*.test.tsx',
            'test/*/*.spec.ts',
            'test/*/*.spec.tsx',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // JS no-unused-vars는 TS에서 처리하므로 off
      'no-unused-vars': 'off',
      // unused-vars: underscore prefix는 무시
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // explicit-any: 점진적으로 개선 (warn)
      '@typescript-eslint/no-explicit-any': 'warn',
      // ts-comment: 활성화
      '@typescript-eslint/ban-ts-comment': 'error',
      // empty-object-type: 활성화
      '@typescript-eslint/no-empty-object-type': 'error',
      'react/jsx-pascal-case': 'warn', // PascalCase 변환 경고
      'react/no-unknown-property': ['error', { ignore: [] }], // fill-rule 같은 속성 변환
    },
  },
];
