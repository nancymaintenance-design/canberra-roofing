import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

test('homepage images reserve their rendered layout space', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const { document } = new JSDOM(html).window;
  for (const [src, width, height] of [
    ['/assets/projects/site-long-gutter-cleared.webp', '1200', '900'],
    ['/assets/brand/canberraroofkind-logo.png', '1254', '1254'],
    ['/assets/brand/instagram-gradient.png', '24', '24'],
  ]) {
    const images = document.querySelectorAll(`img[src="${src}"]`);
    assert.ok(images.length > 0, `Expected original image fallback ${src}`);
    for (const image of images) {
      assert.equal(image.getAttribute('width'), width, `${src} width`);
      assert.equal(image.getAttribute('height'), height, `${src} height`);
    }
  }
});
