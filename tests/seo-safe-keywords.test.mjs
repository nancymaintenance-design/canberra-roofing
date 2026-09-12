import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { startPreview } from '../scripts/preview.mjs';

const keywordRoutes = [
  {
    pathname: '/services',
    title: 'Roof Repairs Canberra | Ellis Services Group',
    h1: 'Roof Repairs Canberra',
    keyword: 'Roof Repairs Canberra',
  },
  {
    pathname: '/services/roof-leak-repairs',
    title: 'Leaking Roof Repair Canberra | Ellis Services Group',
    h1: 'Leaking Roof Repair Canberra',
    keyword: 'Leaking Roof Repair Canberra',
  },
  {
    pathname: '/services/tile-roof-repairs',
    title: 'Tile Roof Repair Canberra | Ellis Services Group',
    h1: 'Tile Roof Repair Canberra',
    keyword: 'Tile Roof Repair Canberra',
  },
  {
    pathname: '/services/rebedding-repointing',
    title: 'Ridge Capping Repair Canberra | Ellis Services Group',
    h1: 'Ridge Capping Repair Canberra',
    keyword: 'Ridge Capping Repair Canberra',
  },
];

const preview = await startPreview();
test.after(async () => preview.close());

for (const route of keywordRoutes) {
  test(`${route.pathname} exposes its approved keyword in crawlable metadata and page content`, async () => {
    const response = await fetch(preview.origin + route.pathname);
    const dom = new JSDOM(await response.text());
    const document = dom.window.document;
    try {
      assert.equal(response.status, 200);
      assert.equal(document.title, route.title);
      assert.equal(document.querySelector('main h1')?.textContent, route.h1);
      assert.match(document.querySelector('meta[name="description"]')?.content ?? '', new RegExp(route.keyword));
      assert.equal(document.querySelector('link[rel="canonical"]')?.href, `https://www.canberraroofkind.com.au${route.pathname}`);
    } finally {
      dom.window.close();
    }
  });
}
