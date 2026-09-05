import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { request } from 'node:http';
import { startPreview } from '../scripts/preview.mjs';

const routes = JSON.parse(await readFile(new URL('./fixtures/seo-routes.json', import.meta.url), 'utf8'));
const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const aliases = routes.flatMap(({ pathname }) => (pathname === '/' ? ['/index.html', '/index.html/'] : [`${pathname}.html`, `${pathname}/`, `${pathname}.html/`]).map(source => ({ source, destination: pathname })));
const query = '?service=Rebedding%20%26%20Repointing&area=Belconnen%20%E2%80%94%20Belconnen&utm_source=fix&tag=one&tag=two';
const preview = await startPreview();
test.after(() => preview.close());

function rawRequest(pathname) {
  const url = new URL(preview.origin);
  return new Promise((resolve, reject) => {
    const requestHandle = request({ hostname: url.hostname, port: url.port, path: pathname, method: 'GET' }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, text: Buffer.concat(chunks).toString() }));
    });
    requestHandle.on('error', reject);
    requestHandle.end();
  });
}

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

for (const pathname of ['/missing', '/missing/', '/missing.html', '/missing.html/', '/services/missing', '/services/missing/', '/news/missing.html', '/wrong/about.html', '/about//', '/about.html//', '/index', '/insights.html']) {
  test(`unknown stays HTTP 404 without redirect: ${pathname}`, async () => {
    const response = await fetch(preview.origin + pathname + query, { redirect: 'manual' });
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('location'), null);
    const html = await response.text();
    assert.match(html, /<h1>Page not found<\/h1>/);
    assert.doesNotMatch(html, /rel="canonical"/);
  });
}

for (const [pathname, destination] of [['/%61bout', '/about'], ['/services/r%6fof-leak-repairs', '/services/roof-leak-repairs']]) {
  test(`valid encoded published path serves its page once: ${pathname}`, async () => {
    const response = await fetch(preview.origin + pathname + query, { redirect: 'manual' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    const html = await response.text();
    assert.match(html, new RegExp(`rel="canonical" href="https://www\\.canberraroofkind\\.com\\.au${destination}"`));
  });
}

for (const pathname of ['/services%2Froof-leak-repairs', '/services%2froof-leak-repairs', '/services%5croof-leak-repairs', '/%2e%2e/about', '/%252e%252e%252fabout', '/%2561bout', '/about%2ehtml', '/unknown%2dpath']) {
  test(`encoded separator, percent, traversal, or unknown never serves a published page: ${pathname}`, async () => {
    const response = await rawRequest(pathname + query);
    assert.equal(response.status, 404);
    assert.equal(response.headers.location, undefined);
    const html = response.text;
    assert.match(html, /<h1>Page not found<\/h1>/);
    assert.doesNotMatch(html, /rel="canonical"/);
  });
}

for (const pathname of ['/%', '/about%ZZ', '/services/%E0%A4%A']) {
  test(`malformed encoding has no route fallback: ${pathname}`, async () => {
    const response = await rawRequest(pathname);
    assert.equal(response.status, 400);
    assert.equal(response.headers.location, undefined);
    assert.equal(response.text, 'Request could not be served');
  });
}
