import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
    testTimeout: 60000,
    hookTimeout: 60000,
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
