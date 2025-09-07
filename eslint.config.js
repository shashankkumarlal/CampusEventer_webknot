import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/*.d.ts',
      '**/vite.config.ts',
      // Build and dependency directories
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      // Test and coverage directories
      '**/coverage/**',
      '**/__tests__/**',
      '**/__mocks__/**',
      // Framework specific
      '**/.next/**',
      '**/out/**',
      '**/.vercel/**',
      '**/.netlify/**',
      // IDE specific
      '**/.idea/**',
      '**/.vscode/**',
      '**/*.sublime-workspace',
      '**/*.sublime-project',
      // Environment variables
      '**/.env',
      '**/.env.local',
      '**/.env.*.local',
      // Logs
      '**/logs',
      '**/*.log',
      '**/npm-debug.log*',
      '**/yarn-debug.log*',
      '**/yarn-error.log*',
      // OS generated files
      '**/.DS_Store',
      '**/.DS_Store?',
      '**/._*',
      '**/.Spotlight-V100',
      '**/.Trashes',
      '**/ehthumbs.db',
      '**/Thumbs.db'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.eslint.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs['recommended'].rules,
      ...reactPlugin.configs['recommended'].rules,
      ...reactHooksPlugin.configs['recommended'].rules,
      // Convert all jsx-a11y rules to warnings
      ...Object.keys(jsxA11yPlugin.configs['recommended'].rules).reduce((acc, rule) => {
        acc[rule] = 'warn';
        return acc;
      }, {}),
      // React specific
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': ['error', { ignore: ['cmdk-input-wrapper'] }],
      // TypeScript specific
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_', 
        varsIgnorePattern: '^_',
        caughtErrors: 'none' 
      }],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      // General
      'no-undef': 'off', // TypeScript handles this
      'no-redeclare': 'off', // Handled by TypeScript
      'no-unused-vars': 'off', // Handled by TypeScript
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
