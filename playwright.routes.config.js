import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

export default defineConfig({
  ...base,
  testMatch: 'route-browser.spec.js',
  timeout: 60000,
  reporter: [['list'], ['json', { outputFile: 'test-results/route-browser-results.json' }]],
});
