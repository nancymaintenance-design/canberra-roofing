import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@site/i18n': fileURLToPath(new URL('./src/i18n', import.meta.url)) } },
  test: {
    include: ['tests/**/*.vitest.test.{js,jsx,ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: true,
  },
});
