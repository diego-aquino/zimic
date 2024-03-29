/// <reference types="vitest" />

import path from 'path';
import { UserConfig, defineConfig } from 'vitest/config';

export const defaultConfig: UserConfig = {
  publicDir: './public',
  test: {
    globals: false,
    allowOnly: process.env.CI !== 'true',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      reportsDirectory: './tests/coverage',
      thresholds: {
        functions: 100,
        lines: 100,
        statements: 100,
        branches: 100,
      },
      exclude: [
        '**/public/**',
        '**/.eslintrc.js',
        '**/.lintstagedrc.js',
        '**/types/**',
        '**/types.ts',
        '**/typescript.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      '@scripts': path.resolve(__dirname, './scripts'),
      '@@': path.resolve(__dirname, '.'),
    },
  },
  plugins: [],
};

export default defineConfig(defaultConfig);
