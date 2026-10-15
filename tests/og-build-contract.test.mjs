import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';
import { startPreview } from '../scripts/preview.mjs';
import { expectedPages, validateDocument } from '../scripts/verify-dist.mjs';

const dist = path.resolve('dist');
const pages = fs.readdirSync(dist, { recursive: true })
  .filter((file) => file.endsWith('.html') && !['404.html', 'contact-unavailable.html', 'google28003a8fb6bb282a.html'].includes(file));

test('prerendered indexable pages publish Open Graph metadata matching their canonical URL', () => {
  assert.equal(pages.length, 120, 'all published pages, including noindex suburbs');
  for (const relative of pages) {
    const html = fs.readFileSync(path.join(dist, relative), 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>(?:<\/link>)?/)?.[1];
    const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"\s*\/?>(?:<\/meta>)?/)?.[1];
    assert.ok(canonical, `${relative}: canonical`);
    assert.match(html, /<meta property="og:title" content="[^"]+"\s*\/?>(?:<\/meta>)?/, `${relative}: og:title`);
    assert.match(html, /<meta property="og:description" content="[^"]+"\s*\/?>(?:<\/meta>)?/, `${relative}: og:description`);
    assert.equal(ogUrl, canonical, `${relative}: og:url`);
    const dom = new JSDOM(html);
    const images = dom.window.document.querySelectorAll('head meta[property="og:image"]');
    assert.equal(images.length, 1, `${relative}: one sharing image`);
    assert.match(images[0].content, /^https:\/\/www\.canberraroofkind\.com\.au\/assets\//, `${relative}: absolute HTTPS image`);
    dom.window.close();
  }
});

test('selected sharing images return actual image bytes with matching metadata over local HTTP', async () => {
  const preview = await startPreview();
  const checked = new Set();
  try {
    for (const relative of pages) {
      const dom = new JSDOM(fs.readFileSync(path.join(dist, relative), 'utf8'));
      try {
        const meta = property => dom.window.document.querySelector(`head meta[property="${property}"]`)?.content;
        const image = meta('og:image');
        assert.ok(image, `${relative}: sharing image`);
        if (checked.has(image)) continue;
        checked.add(image);
        const url = new URL(image);
        const response = await fetch(preview.origin + url.pathname + url.search, { redirect: 'manual' });
        assert.equal(response.status, 200, image);
        assert.equal(response.headers.get('location'), null);
        const buffer = Buffer.from(await response.arrayBuffer());
        const actual = await sharp(buffer).metadata();
        assert.equal(response.headers.get('content-type'), 'image/' + actual.format);
        assert.equal(meta('og:image:type'), 'image/' + actual.format);
        assert.equal(Number(meta('og:image:width')), actual.width);
        assert.equal(Number(meta('og:image:height')), actual.height);
        assert.ok(actual.width >= 1200, image);
        assert.ok(meta('og:image:alt'), `${relative}: descriptive sharing alt`);
      } finally { dom.window.close(); }
    }
    console.log(`Verified ${checked.size} distinct sharing images over local HTTP`);
  } finally { await preview.close(); }
});

test('404 has no canonical or stale social image metadata', () => {
  const dom = new JSDOM(fs.readFileSync(path.join(dist, '404.html'), 'utf8'));
  assert.equal(dom.window.document.querySelector('link[rel="canonical"], meta[property^="og:image"]'), null);
  dom.window.close();
});

test('build gate rejects missing, duplicated and non-HTTPS sharing images', () => {
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const expected = expectedPages.find(([pathname]) => pathname === '/')[1];
  const image = html.match(/<meta property="og:image" content="[^"]+"\s*\/?>(?:<\/meta>)?/)[0];
  for (const [name, damaged] of [
    ['missing image', html.replace(image, '')],
    ['duplicate image', html.replace(image, image + image)],
    ['insecure image', html.replace(image, image.replace('https:', 'http:'))],
  ]) assert.throws(() => validateDocument(damaged, '/', expected), /sharing image/, name);
});

test('built discovery and robots preserve 42 sitemap URLs and 77 noindex suburbs', () => {
  assert.equal((fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').match(/<loc>/g) ?? []).length, 42);
  const noindex = pages.filter(file => /<meta name="robots" content="noindex,follow"/.test(fs.readFileSync(path.join(dist, file), 'utf8')));
  assert.equal(noindex.length, 77);
  assert.ok(noindex.every(file => /^areas[/\\][^/\\]+[/\\][^/\\]+-roof-repairs\.html$/.test(file)));
});
