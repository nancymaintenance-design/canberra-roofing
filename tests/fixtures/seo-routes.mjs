import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const { JSDOM } = createRequire(import.meta.url)('jsdom');

const registry = JSON.parse(await readFile(new URL('../../src/route-meta.json', import.meta.url), 'utf8'));
export const normal = text => text.replace(/\s+/g, ' ').trim();

// Metadata comes from the maintained route contract, never from rendered output.
// mainText is only a raw SSR baseline for hydration/alias parity; semantic content
// correctness remains covered by the independent content and intent tests.
const routes = [];
for (const [pathname, meta] of Object.entries(registry)) {
  const filename = pathname === '/' ? 'index.html' : `${pathname.slice(1)}.html`;
  const dom = new JSDOM(await readFile(new URL(`../../dist/${filename}`, import.meta.url), 'utf8'));
  try {
    const main = dom.window.document.querySelector('main');
    assert.ok(main, `${pathname} has a built SSR main region`);
    routes.push({ pathname, ...meta, robots: meta.indexability?.includes('noindex') ? meta.indexability : null, mainText: normal(main.textContent) });
  } finally { dom.window.close(); }
}
assert.equal(routes.length, 34, 'the browser fixture covers all maintained registry routes');
export default routes;
