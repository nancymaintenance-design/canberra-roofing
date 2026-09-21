import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { startPreview } from '../scripts/preview.mjs';

const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const preview = await startPreview();
test.after(async () => preview.close());

test('the sitemap excludes the four retired service URLs that return 404', () => {
  for (const pathname of [
    '/services/metal-colorbond-roof-repairs',
    '/services/roof-restoration',
    '/services/reroof-replacement',
    '/services/gutter-fascia-repairs',
  ]) {
    assert.doesNotMatch(sitemap, new RegExp(pathname));
  }
});

async function page(pathname) {
  const response = await fetch(preview.origin + pathname);
  assert.equal(response.status, 200);
  return new JSDOM(await response.text());
}

test('the home page serves Canberra roofer and small-repair enquiry intent without promising acceptance', async () => {
  const dom = await page('/');
  try {
    const copy = dom.window.document.querySelector('main')?.textContent ?? '';
    assert.match(copy, /roofer in Canberra/i);
    assert.match(copy, /small roof repair/i);
    assert.match(copy, /does not confirm that a job can be accepted/i);
  } finally {
    dom.window.close();
  }
});

test('chimney and inspection pages use their approved Canberra P1 wording', async () => {
  for (const [pathname, title, h1] of [
    ['/services/chimney-flashing-repairs', 'Chimney Flashing Repairs Canberra | Ellis Services Group', 'Chimney Flashing Repairs Canberra'],
    ['/services/roof-inspections', 'Roof Inspection Canberra | Ellis Services Group', 'Roof Inspection Canberra'],
  ]) {
    const dom = await page(pathname);
    try {
      assert.equal(dom.window.document.title, title);
      assert.equal(dom.window.document.querySelector('main h1')?.textContent, h1);
    } finally {
      dom.window.close();
    }
  }
});

test('the chimney service page links users to leak and inspection pathways', async () => {
  const dom = await page('/services/chimney-flashing-repairs');
  try {
    const links = [...dom.window.document.querySelectorAll('main a')].map((link) => link.getAttribute('href'));
    assert.ok(links.includes('/services/roof-leak-repairs'));
    assert.ok(links.includes('/services/roof-inspections'));
  } finally {
    dom.window.close();
  }
});

test('the tile service page distinguishes terracotta and concrete tile context without promising a match', async () => {
  const dom = await page('/services/tile-roof-repairs');
  try {
    const copy = dom.window.document.querySelector('main')?.textContent ?? '';
    assert.match(copy, /terracotta/i);
    assert.match(copy, /concrete/i);
    assert.match(copy, /cannot be confirmed from a photo alone/i);
  } finally {
    dom.window.close();
  }
});
