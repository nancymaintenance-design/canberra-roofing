import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('TC-WEB-027 exposes the authorised brand logo as a browser favicon', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(
    html,
    /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']\/assets\/brand\/canberraroofkind-logo\.png(?:\?[^"']*)?["']/i,
    'index.html must reference the public brand logo as a favicon',
  );
});
