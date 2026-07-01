import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pure-logic tests need no DOM.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
