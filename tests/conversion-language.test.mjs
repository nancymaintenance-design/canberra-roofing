import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

const collect = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? collect(join(dir, entry.name)) : entry.name.endsWith('.html') ? [join(dir, entry.name)] : []);
test('rendered repair pages explain inspection and keep customers with Ellis', () => {
  const bad = /Where a concern may begin|What may be considered|The next step may range|An enquiry may consider|A discussion may consider|prompt booking subject to availability|not a customer case/i;
  const failures = collect('dist').filter((path) => !/privacy|legal/.test(path)).filter((path) => bad.test(new JSDOM(readFileSync(path, 'utf8')).window.document.body.textContent));
  assert.deepEqual(failures, [], 'Uncertainty-first template copy returned');
  const doc = new JSDOM(readFileSync('dist/services/roof-leak-repairs.html', 'utf8')).window.document;
  assert.match(doc.body.textContent, /on-site|on site/i);
  assert.match(doc.body.textContent, /repair scope and quote/i);
  assert.ok(doc.querySelector('a[href^="/contact"]'));
});
test('privacy consent, roof safety and inspection fee transparency survive', () => {
  const privacy = new JSDOM(readFileSync('dist/privacy.html', 'utf8')).window.document;
  assert.match(privacy.body.textContent, /This may include your contact details/);
  const html = readFileSync('dist/services/roof-inspections.html', 'utf8');
  assert.match(new JSDOM(html).window.document.body.textContent, /inspection or booking fee/);
  assert.match(html, /tel:0405878406/);
});
