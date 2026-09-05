import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { expectedPages, validateDocument, verifyBuild } from '../scripts/verify-dist.mjs';

test('production files are reread from disk and include full head, root, body, main script and closing tags', async () => {
  const report = await verifyBuild();
  assert.equal(report.length, 20);
  assert.ok(report.every((record) => record.passed));
});

test('the release gate rejects truncated, empty-root and scriptless HTML even when a build process could exit zero', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const expected = expectedPages.find(([pathname]) => pathname === '/')[1];
  for (const [name, damaged] of [
    ['truncated tail', html.slice(0, -60)],
    ['empty application', html.replace(/<div id="root">[\s\S]*<\/div>/, '<div id="root"></div>')],
    ['missing entry', html.replace(/<script type="module"[^>]*><\/script>/, '')],
    ['missing head close', html.replace('</head>', '')],
    ['missing div close', html.replace('</div>', '')],
  ]) assert.throws(() => validateDocument(damaged, '/', expected), undefined, name);
});
