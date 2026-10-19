import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { startPreview } from '../scripts/preview.mjs';

test('Solutions aliases redirect directly to the matching-language service hub, preserving the query', async () => {
  const preview = await startPreview();
  try {
    for (const prefix of ['', '/zh']) {
      for (const suffix of ['', '/', '.html', '.html/']) {
        const response = await fetch(`${preview.origin}${prefix}/solutions${suffix}?area=Kowen`, { redirect: 'manual' });
        assert.equal(response.status, 301);
        assert.equal(response.headers.get('location'), `${prefix}/services?area=Kowen`);
        const destination = await fetch(preview.origin + response.headers.get('location'), { redirect: 'manual' });
        assert.equal(destination.status, 200);
        assert.doesNotMatch(await destination.text(), /href="\/(?:zh\/)?solutions(?:["/#?])/);
      }
    }
    const sitemap = await readFile('public/sitemap.xml', 'utf8');
    assert.doesNotMatch(sitemap, /\/solutions/);
    const registry = JSON.parse(await readFile('src/route-meta.json', 'utf8'));
    assert.equal(registry['/solutions'], undefined);
    for (const page of Object.values(registry)) assert.ok(!page.links?.includes('/solutions'));
  } finally { await preview.close(); }
});
