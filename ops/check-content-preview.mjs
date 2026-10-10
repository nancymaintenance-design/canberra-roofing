import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { chromium } from '@playwright/test';
import { startPreview } from '../scripts/preview.mjs';
import registry from '../src/route-meta.json' with { type: 'json' };
import { DISTRICT_PROFILES, SUBURB_PROFILES } from '../src/suburb-profiles.js';

const paths = [...Object.keys(registry), ...DISTRICT_PROFILES.map(p => p.path), ...SUBURB_PROFILES.map(p => p.path)];
const expectedSocial = [
  'https://share.google/y50AZRJwjOdVOlj5o',
  'https://www.instagram.com/elliservices_group/',
  'https://share.google/Z4tImXHToPi9H4LmH',
  'https://share.google/tU1c5vEAlELqXCifu',
];
const preview = await startPreview();
const errors = [];
const articles = [];
let browser;
try {
  for (const path of paths) {
    const response = await fetch(preview.origin + path);
    const dom = new JSDOM(await response.text());
    try {
      const d = dom.window.document;
      assert.equal(response.status, 200, path);
      assert.equal(d.querySelectorAll('main h1').length, 1, `${path}: one main H1`);
      const headings = [...d.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6')];
      for (let i = 1; i < headings.length; i++) {
        assert.ok(Number(headings[i].tagName[1]) <= Number(headings[i - 1].tagName[1]) + 1, `${path}: heading skip at ${headings[i].textContent}`);
      }
      for (const url of expectedSocial) {
        assert.ok([...d.querySelectorAll('footer a')].some(a => a.getAttribute('href') === url), `${path}: social link ${url}`);
      }
      for (const a of d.querySelectorAll('main a[href^="/"]')) {
        const target = new URL(a.getAttribute('href'), preview.origin);
        const normalized = target.pathname.replace(/\/$/, '') || '/';
        assert.ok(paths.includes(normalized), `${path}: broken internal target ${target.pathname}`);
        if (target.hash && normalized === path) assert.ok(d.getElementById(decodeURIComponent(target.hash.slice(1))), `${path}: broken anchor ${target.hash}`);
      }
      if (path.startsWith('/news/')) articles.push({ path, bodyWords: d.querySelector('.articleBody')?.textContent.split(/\s+/).filter(Boolean).length, bodyH2: d.querySelectorAll('.articleBody h2').length });
    } catch (error) { errors.push(error.message); }
    finally { dom.window.close(); }
  }
  const homeDom = new JSDOM(await readFile(new URL('../dist/index.html', import.meta.url), 'utf8'));
  for (const claim of [/15 years/, /1,000/, /98%/]) {
    if (!claim.test(homeDom.window.document.querySelector('main')?.textContent ?? '')) errors.push(`Homepage missing protected claim ${claim}`);
  }
  homeDom.window.close();
  const viewports = [];
  if (process.argv.includes('--browser')) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const samples = ['/', '/about', '/services', '/areas', '/news', '/faq', '/contact', '/services/roof-leak-repairs', '/services/roof-renovation', '/news/after-rain-roof-leak-check-canberra', '/news/when-to-arrange-roof-inspection-canberra', DISTRICT_PROFILES[0].path, SUBURB_PROFILES[0].path];
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 960 } });
      page.on('pageerror', error => errors.push(`browser ${width}: ${error.message}`));
      for (const path of samples) {
        await page.goto(preview.origin + path, { waitUntil: 'networkidle' });
        const result = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, h1: document.querySelector('main h1')?.textContent }));
        if (result.scrollWidth > width) errors.push(`${path}: overflow ${result.scrollWidth} > ${width}`);
        viewports.push({ path, ...result });
      }
      await page.close();
    }
  }
  console.log(JSON.stringify({ publishedPages: paths.length, articles, browserPages: viewports.length, errors }, null, 2));
  assert.equal(errors.length, 0, 'All-page content acceptance failed');
} finally {
  await browser?.close();
  await preview.close();
}
