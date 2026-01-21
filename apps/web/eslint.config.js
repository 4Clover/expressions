import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      // Allow underscore-prefixed unused variables globally (common TypeScript/JS pattern)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    },
    rules: {
      // Disable navigation-without-resolve for static routes (SvelteKit handles these correctly)
      'svelte/no-navigation-without-resolve': 'off',
      // Allow @html for trusted CMS content (Storyblok rich text)
      'svelte/no-at-html-tags': 'off',
      // Allow unused props - component interfaces define contracts, not all props need immediate use
      'svelte/no-unused-props': 'off',
      // Map/Set inside $derived.by are recreated fresh each derivation, not mutated
      'svelte/prefer-svelte-reactivity': 'off',
      // Allow underscore-prefixed unused variables (common pattern for {#each} index-only loops)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    // SvelteKit app.d.ts uses empty interfaces as extension points
    files: ['src/app.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  },
  {
    ignores: [
      '.svelte-kit/**',
      'node_modules/**',
      'build/**',
      'dist/**'
    ]
  }
);
