import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['navigation-accessibility.spec.js'],
  workers: 1,
  timeout: 30000,
  outputDir: '../reports/full-site-remediation-2026-10-15/task-1/browser-artifacts',
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4194', channel: 'msedge', headless: true, viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', screenshot: 'only-on-failure' },
  webServer: {
    command: '"C:/Users/UFTR/.workbuddy-ai/binaries/node/versions/22.22.2-2/node.exe" node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4194 --strictPort',
    url: 'http://127.0.0.1:4194',
    reuseExistingServer: false,
  },
});
