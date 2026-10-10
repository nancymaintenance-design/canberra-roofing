import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('homepage images reserve their rendered layout space', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const [src, width, height] of [
    ['/assets/home/ellis-team-trust.png', '1672', '941'],
    ['/assets/home/ellis-site-consultation.png', '1672', '941'],
    ['/assets/brand/canberraroofkind-logo.png', '1254', '1254'],
    ['/assets/brand/instagram-gradient.png', '24', '24'],
  ]) {
    assert.match(html, new RegExp(`<img[^>]+src="${src}"[^>]+width="${width}"[^>]+height="${height}"`));
  }
});
