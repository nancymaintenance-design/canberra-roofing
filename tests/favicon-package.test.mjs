import assert from 'node:assert/strict';
import test from 'node:test';
import { access, readFile } from 'node:fs/promises';

test('the public build has a standalone Ellis favicon package', async () => {
  const publicRoot = new URL('../public/', import.meta.url);
  await Promise.all(['favicon.ico', 'favicon-48.png', 'favicon-192.png', 'favicon-512.png', 'apple-touch-icon.png', 'site.webmanifest'].map((file) => access(new URL(file, publicRoot))));
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /href=["']\/favicon\.ico["']/i);
  assert.match(html, /href=["']\/favicon-192\.png["']/i);
  assert.match(html, /href=["']\/site\.webmanifest["']/i);
});
