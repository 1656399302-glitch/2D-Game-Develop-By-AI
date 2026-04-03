import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  cacheDir: 'node_modules/.vitest-cache',
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Use threads pool with 10 workers - fastest overall
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 10,
        minThreads: 6,
        useAtomics: true,
      },
    },
    // Keep isolation enabled
    isolate: true,
    // Coverage configuration - skip during test run
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
