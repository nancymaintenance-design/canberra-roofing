import { build } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
await build({ root, build: { ssr: 'src/entry-server.tsx', outDir: '.ssr', emptyOutDir: true, copyPublicDir: false } });
const { renderPage, pagePaths } = await import(new URL('../.ssr/entry-server.js', import.meta.url));
const template = await readFile(path.join(root, 'dist/index.html'), 'utf8');
for (const pathname of [...pagePaths, '/404']) {
  const filename = path.join(root, 'dist', pathname === '/' ? 'index.html' : `${pathname.slice(1)}.html`);
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(filename, renderPage(pathname, template));
}
console.log(`Prerendered ${pagePaths.length} published pages and a 404 page from the shared React content.`);
