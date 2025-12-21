import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: false,
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
