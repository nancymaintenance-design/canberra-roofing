import { createServer } from 'vite';
import { writeFile, mkdir } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
const vite = await createServer({ configFile: 'vite.config.ts', server: { middlewareMode: true, hmr:{server:createHttpServer()} }, appType: 'custom' });
try {
  const { renderPage, pagePaths, getCatalog } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const template = '<html lang="en-AU" data-route="<!--document-route-->"><head><!--route-head--></head><body><div id="root"><!--app-html--></div></body></html>';
  for (const path of pagePaths.filter(path => !path.startsWith('/zh'))) renderPage(path, template);
  await mkdir('.local-editor', { recursive: true });
  const catalog = getCatalog();
  await writeFile('.local-editor/catalog.json', JSON.stringify(catalog, null, 2));
  console.log(`Catalogued ${catalog.length} text fields across ${pagePaths.length / 2} pages.`);
} finally { await vite.close(); }
