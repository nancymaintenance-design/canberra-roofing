import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { startPreview } from '../scripts/preview.mjs';

const routes = JSON.parse(await readFile(new URL('./fixtures/seo-routes.json', import.meta.url), 'utf8'));
const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const aliases = routes.flatMap(({ pathname }) => (pathname === '/' ? ['/index.html', '/index.html/'] : [`${pathname}.html`, `${pathname}/`, `${pathname}.html/`]).map(source => ({ source, destination: pathname })));
const query = '?service=Rebedding%20%26%20Repointing&area=Belconnen%20%E2%80%94%20Belconnen&utm_source=fix&tag=one&tag=two';
const preview = await startPreview();
test.after(() => preview.close());

test('Vercel declares bounded one-hop permanent aliases without changing system HTML or unknown routes', () => {
  assert.notEqual(config.cleanUrls, true);
  assert.equal(config.trailingSlash, undefined, 'no global redirect of unknown trailing-slash paths');
  assert.deepEqual(config.redirects, [
    { source: '/insights', destination: '/faq', permanent: false },
    { source: '/insights/', destination: '/faq', permanent: false },
    ...aliases.map(alias => ({ ...alias, permanent: true })),
  ]);
  assert.deepEqual(config.rewrites, routes.filter(r => r.pathname !== '/').map(r => ({ source: r.pathname, destination: `${r.pathname}.html` })));
});

for (const { pathname } of routes) {
  test(`clean route has no redirect: ${pathname}`, async () => {
    const response = await fetch(preview.origin + pathname + query, { redirect: 'manual' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    await response.arrayBuffer();
  });
}

for (const { source, destination } of aliases) {
  test(`single 308 preserves query: ${source} -> ${destination}`, async () => {
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(preview.origin + source + query, { method, redirect: 'manual' });
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('location'), destination + query);
      await response.arrayBuffer();
      const final = await fetch(preview.origin + response.headers.get('location'), { method, redirect: 'manual' });
      assert.equal(final.status, 200, 'redirect terminates at clean path in one hop');
      assert.equal(final.headers.get('location'), null);
      await final.arrayBuffer();
    }
  });
}

for (const pathname of ['/missing', '/missing/', '/missing.html', '/missing.html/', '/services/missing', '/services/missing/', '/news/missing.html', '/wrong/about.html', '/about//', '/index', '/insights.html']) {
  test(`unknown stays HTTP 404 without redirect: ${pathname}`, async () => {
    const response = await fetch(preview.origin + pathname + query, { redirect: 'manual' });
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('location'), null);
    const html = await response.text();
    assert.match(html, /<h1>Page not found<\/h1>/);
    assert.doesNotMatch(html, /rel="canonical"/);
  });
}
