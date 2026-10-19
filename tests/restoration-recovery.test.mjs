import assert from 'node:assert/strict';
import test from 'node:test';
import { startPreview } from '../scripts/preview.mjs';
test('restoration aliases reach the matching-language renovation page in one permanent hop', async () => {
  const server = await startPreview();
  try {
    for (const prefix of ['', '/zh']) for (const suffix of ['', '/', '.html', '.html/']) {
      const response = await fetch(server.origin+prefix+'/services/roof-restoration'+suffix+'?utm_source=history', {redirect:'manual'});
      assert.equal(response.status,301);
      assert.equal(response.headers.get('location'),prefix+'/services/roof-renovation?utm_source=history');
      const final = await fetch(server.origin+response.headers.get('location'), {redirect:'manual'});
      assert.equal(final.status,200);
    }
  } finally { await server.close(); }
});
