import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'seo-browser.spec.js',
  workers: 2,
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4175', channel: 'msedge', viewport: { width: 1440, height: 1000 }, screenshot: 'only-on-failure' },
  globalSetup: './tests/preview-setup.mjs',
  reporter: [['list'], ['json', { outputFile: 'test-results/browser-results.json' }]],
});
