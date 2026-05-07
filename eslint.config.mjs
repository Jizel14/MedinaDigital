// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.nx/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/playwright/.cache/**',
      '**/next-env.d.ts',
      'archive/**',
      '.superpowers/**',
      'apps/web/node_modules/.cache/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:ui', 'scope:product', 'scope:i18n'],
            },
            {
              sourceTag: 'scope:product',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:ui', 'scope:i18n'],
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:i18n',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  prettier,
);
