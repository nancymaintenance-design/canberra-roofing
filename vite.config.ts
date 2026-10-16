import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [react({ jsxImportSource: '@site/i18n' }), {
    name: 'single-editorial-runtime',
    configResolved(config) { config.optimizeDeps.include = (config.optimizeDeps.include || []).filter(name => !name.startsWith('@site/i18n')); },
  }],
  resolve: { alias: { '@site/i18n': fileURLToPath(new URL('./src/i18n', import.meta.url)) } },
  optimizeDeps: { exclude: ['@site/i18n/jsx-runtime', '@site/i18n/jsx-dev-runtime'] },
});
