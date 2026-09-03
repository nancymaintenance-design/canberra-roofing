import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.vitest.test.{js,jsx,ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: true,
  },
});
