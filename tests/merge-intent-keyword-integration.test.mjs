import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { startPreview } from '../scripts/preview.mjs';

const preview = await startPreview();
test.after(async () => preview.close());

test('keeps the service-intent FAQ and related links while exposing approved keyword metadata', async () => {
  const response = await fetch(preview.origin + '/services/roof-leak-repairs');
  const dom = new JSDOM(await response.text());
  const document = dom.window.document;
  try {
    assert.equal(response.status, 200);
    assert.equal(document.title, 'Leaking Roof Repair Canberra | Ellis Services Group');
    assert.equal(document.querySelector('main h1')?.textContent, 'Leaking Roof Repair Canberra');
    assert.match(document.querySelector('meta[name="description"]')?.content ?? '', /Leaking Roof Repair Canberra/);
    assert.match(document.querySelector('main')?.textContent ?? '', /Can dry weather make a roof leak harder to assess\?/);
    assert.ok(document.querySelector('a[href="/services/roof-inspections"]'));
    assert.ok(document.querySelector('a[href="/services/rebedding-repointing"]'));
  } finally {
    dom.window.close();
  }
});
