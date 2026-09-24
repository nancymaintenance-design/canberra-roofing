import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { startPreview } from '../scripts/preview.mjs';

const expected = JSON.parse(await readFile(new URL('./fixtures/seo-routes.json', import.meta.url), 'utf8'));
const normal = (text) => text.replace(/\s+/g, ' ').trim();
const report = [];
const preview = await startPreview();
test.after(async () => {
  await preview.close();
  if (process.env.SEO_REPORT_DIR) {
    await mkdir(process.env.SEO_REPORT_DIR, { recursive: true });
    await writeFile(`${process.env.SEO_REPORT_DIR}/raw-html-results.json`, JSON.stringify(report, null, 2));
  }
});

for (const route of expected) {
  test(`raw HTML: ${route.pathname} serves full content and unique route head`, async () => {
    const response = await fetch(preview.origin + route.pathname);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const record = { pathname: route.pathname, status: response.status, contentType: response.headers.get('content-type'), sha256: createHash('sha256').update(html).digest('hex'), title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.href, h1: document.querySelector('main h1')?.textContent, links: document.querySelectorAll('a[href]').length, passed: false };
    record.description = document.querySelector('meta[name="description"]')?.content;
    record.htmlBytes = Buffer.byteLength(html);
    if (process.env.SEO_REPORT_DIR) {
      const directory = `${process.env.SEO_REPORT_DIR}/raw-html`;
      const filename = route.pathname === '/' ? 'index' : route.pathname.slice(1).replaceAll('/', '__');
      await mkdir(directory, { recursive: true });
      await writeFile(`${directory}/${filename}.html`, html);
      await writeFile(`${directory}/${filename}.headers.json`, JSON.stringify({ url: route.pathname, status: response.status, headers: Object.fromEntries(response.headers) }, null, 2));
    }
    report.push(record);
    try {
      assert.equal(response.status, 200);
      assert.match(record.contentType, /^text\/html/);
      assert.equal(document.querySelectorAll('head title').length, 1, 'one title in raw head');
      assert.equal(document.title, route.title);
      assert.equal(document.querySelectorAll('head meta[name="description"]').length, 1);
      assert.equal(document.querySelector('head meta[name="description"]').content, route.description);
      assert.equal(document.querySelectorAll('head link[rel="canonical"]').length, 1);
      assert.equal(record.canonical, `https://www.canberraroofkind.com.au${route.pathname}`);
      assert.doesNotMatch(document.querySelector('meta[name="robots"]')?.content ?? '', /noindex|nofollow/);
      assert.equal(document.querySelectorAll('main h1').length, 1);
      assert.equal(normal(record.h1), route.h1);
      const mainText = normal(document.querySelector('main').textContent);
      if (route.mainTextIncludes) {
        for (const phrase of route.mainTextIncludes) assert.ok(mainText.includes(phrase), `main text includes approved copy: ${phrase}`);
      } else {
        assert.equal(mainText, route.mainText, 'full baseline main text, including FAQ answers, privacy and all article paragraphs');
      }
      for (const href of route.links) assert.ok([...document.querySelectorAll('a[href]')].some((a) => a.getAttribute('href') === href), `missing original link ${href}`);
      assert.ok(document.querySelector('a[href="tel:0405878406"]'));
      assert.ok(document.querySelector('a[href="mailto:elliservices.group@gmail.com"]'));
      const article = [...document.querySelectorAll('script[type="application/ld+json"]')].map((n) => JSON.parse(n.textContent)).filter((s) => s['@type'] === 'Article');
      assert.equal(article.length, route.pathname.startsWith('/news/') ? 1 : 0);
      if (article.length) assert.equal(article[0].mainEntityOfPage, record.canonical);
      if (route.pathname === '/faq') assert.equal(document.querySelectorAll('main details').length, 27);
      record.passed = true;
    } finally { dom.window.close(); }
  });
}

test('homepage provides a safe roof-leak observation block with verified entity details', async () => {
  const response = await fetch(preview.origin + '/');
  const dom = new JSDOM(await response.text());
  const document = dom.window.document;
  try {
    const guidance = [...document.querySelectorAll('main section')].find((section) => section.textContent.includes('Roof leak: safe observations before an inspection'));
    assert.ok(guidance, 'homepage includes the roof-leak observation block');
    assert.match(guidance.textContent, /Do not climb onto the roof or touch wet electrical areas\./);
    assert.ok(guidance.querySelector('a[href="/services/roof-leak-repairs"]'));
    assert.ok(guidance.querySelector('a[href="/contact?service=Roof%20Leak%20Repairs"]'));

    const entity = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    assert.equal(entity.name, 'Ellis Services Group');
    assert.equal(entity.telephone, '+61405878406');
    assert.equal(entity.address.streetAddress, '121 Marcus Clarke St');
    assert.equal(entity.address.addressLocality, 'Canberra');
    assert.equal(entity.address.addressRegion, 'ACT');
    assert.equal(entity.address.postalCode, '2600');
    assert.equal(entity.openingHours, 'Mo-Su 00:00-23:59');
  } finally {
    dom.window.close();
  }
});

test('priority service pages show intent-specific FAQs alongside their two related pathways', async () => {
  const expectations = [
    {
      pathname: '/services/roof-leak-repairs',
      questions: [
        'Is the water mark always below the leak entry point?',
        'Can dry weather make a roof leak harder to assess?',
      ],
      links: ['/services/roof-inspections', '/services/rebedding-repointing'],
    },
    {
      pathname: '/services/rebedding-repointing',
      questions: [
        'Does every crack mean all ridge caps need repointing?',
        'What is the difference between roof rebedding and repointing?',
      ],
      links: ['/services/roof-leak-repairs', '/services/roof-inspections'],
    },
    {
      pathname: '/services/roof-inspections',
      questions: [
        'Is a roof inspection a structural or compliance certificate?',
        'Can I arrange a roof inspection before deciding what to repair?',
      ],
      links: ['/services/roof-leak-repairs', '/services/rebedding-repointing'],
    },
  ];

  for (const { pathname, questions, links } of expectations) {
    const dom = new JSDOM(await (await fetch(preview.origin + pathname)).text());
    const document = dom.window.document;
    try {
      const faq = document.querySelector('.pageFaq');
      const summaries = [...faq.querySelectorAll('summary')].map((summary) => normal(summary.textContent));
      assert.ok(summaries.length >= questions.length, `${pathname} keeps its original page-specific FAQs`);
      for (const question of questions) assert.ok(summaries.includes(question), `${pathname} retains FAQ: ${question}`);
      for (const href of links) {
        assert.ok(document.querySelector(`.relatedServices a[href="${href}"]`), `${pathname} links to ${href}`);
      }
    } finally {
      dom.window.close();
    }
  }
});

test('raw HTML pages have distinct titles, descriptions and response bodies; sitemap stays aligned with published URLs', async () => {
  const xml = await (await fetch(preview.origin + '/sitemap.xml')).text();
  const dom = new JSDOM(xml, { contentType: 'application/xml' });
  const urls = [...dom.window.document.querySelectorAll('loc')].map((n) => n.textContent);
  const expectedSitemapUrls = new Set(expected.filter((r) => r.pathname !== '/privacy').map((r) => `https://www.canberraroofkind.com.au${r.pathname}`));
  assert.equal(urls.length, expectedSitemapUrls.size);
  assert.equal(new Set(urls).size, expectedSitemapUrls.size);
  assert.deepEqual(new Set(urls), expectedSitemapUrls);
  assert.equal(new Set(report.map((r) => r.sha256)).size, report.length);
  assert.equal(new Set(report.map((r) => r.title)).size, report.length);
  const descriptions = await Promise.all(expected.map(async ({ pathname }) => {
    const html = await (await fetch(preview.origin + pathname)).text();
    const page = new JSDOM(html);
    const description = page.window.document.querySelector('meta[name="description"]').content;
    page.window.close();
    return description;
  }));
  assert.equal(new Set(descriptions).size, expected.length);
  dom.window.close();
});

for (const pathname of ['/seo-cbr-002-missing', '/services/not-published', '/news/not-published', '/wrong/services/roof-leak-repairs', '/news/extra/after-rain-roof-leak-check-canberra', '/assets/missing.js', '/assets/missing.png', '/api/not-published']) {
  test(`HTTP 404: ${pathname} never serves the homepage`, async () => {
    const response = await fetch(preview.origin + pathname);
    assert.equal(response.status, 404);
    const dom = new JSDOM(await response.text());
    assert.equal(dom.window.document.querySelector('h1')?.textContent, 'Page not found');
    assert.equal(dom.window.document.querySelector('link[rel="canonical"]'), null);
    dom.window.close();
  });
}

for (const pathname of ['/contact?service=Roof%20Leak%20Repairs', '/contact?area=Belconnen%20%E2%80%94%20Belconnen', '/contact?area=Belconnen%20%E2%80%94%20Belconnen&service=Roof%20Leak%20Repairs&utm_source=test', '/services/roof-leak-repairs?utm_source=test']) {
  test(`query canonical stays clean without redirect: ${pathname}`, async () => {
    const response = await fetch(preview.origin + pathname, { redirect: 'manual' });
    assert.equal(response.status, 200);
    const dom = new JSDOM(await response.text());
    assert.equal(dom.window.document.querySelector('link[rel="canonical"]').href, `https://www.canberraroofkind.com.au${pathname.split('?')[0]}`);
    dom.window.close();
  });
}

test('system files, real assets and the Contact endpoint are not swallowed by page routes', async () => {
  for (const [pathname, mime] of [['/robots.txt', 'text/plain'], ['/sitemap.xml', 'application/xml'], ['/assets/brand/canberraroofkind-logo.png', 'image/png'], ['/google28003a8fb6bb282a.html', 'text/html']]) {
    const response = await fetch(preview.origin + pathname);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type').startsWith(mime));
  }
  const response = await fetch(preview.origin + '/api/contact');
  assert.equal(response.status, 405);
  assert.equal((await response.json()).code, 'METHOD_NOT_ALLOWED');
});

test('existing HTML verification and contact fallback files keep direct responses without extension redirects', async () => {
  for (const pathname of ['/google28003a8fb6bb282a.html', '/contact-unavailable.html']) {
    const response = await fetch(preview.origin + pathname, { redirect: 'manual' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    assert.match(response.headers.get('content-type'), /^text\/html/);
  }
});

test('raw links from the homepage reach every published page including Privacy', async () => {
  const pending = ['/'];
  const visited = new Set();
  const published = new Set(expected.map((r) => r.pathname));
  while (pending.length) {
    const pathname = pending.shift();
    if (visited.has(pathname)) continue;
    visited.add(pathname);
    const dom = new JSDOM(await (await fetch(preview.origin + pathname)).text());
    for (const a of dom.window.document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (!href.startsWith('/')) continue;
      const next = new URL(href, preview.origin).pathname;
      if (published.has(next) && !visited.has(next)) pending.push(next);
    }
    dom.window.close();
  }
  assert.deepEqual(visited, published);
});
