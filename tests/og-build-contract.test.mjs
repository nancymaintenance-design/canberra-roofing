import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.resolve('dist');
const pages = fs.readdirSync(dist, { recursive: true })
  .filter((file) => file.endsWith('.html') && !['404.html', 'contact-unavailable.html', 'google28003a8fb6bb282a.html'].includes(file));

test('prerendered indexable pages publish Open Graph metadata matching their canonical URL', () => {
  assert.ok(pages.length > 0, 'expected prerendered pages');
  for (const relative of pages) {
    const html = fs.readFileSync(path.join(dist, relative), 'utf8');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"\s*\/?>(?:<\/link>)?/)?.[1];
    const ogUrl = html.match(/<meta property="og:url" content="([^"]+)"\s*\/?>(?:<\/meta>)?/)?.[1];
    assert.ok(canonical, `${relative}: canonical`);
    assert.match(html, /<meta property="og:title" content="[^"]+"\s*\/?>(?:<\/meta>)?/, `${relative}: og:title`);
    assert.match(html, /<meta property="og:description" content="[^"]+"\s*\/?>(?:<\/meta>)?/, `${relative}: og:description`);
    assert.equal(ogUrl, canonical, `${relative}: og:url`);
  }
});
