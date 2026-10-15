import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { DISTRICT_PROFILES, SUBURB_PROFILES } from '../src/suburb-profiles.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const registry = JSON.parse(await readFile(path.join(root, 'src/route-meta.json'), 'utf8'));
const districtPages = DISTRICT_PROFILES.map(({ path: pathname, title, h1, canonical }) => [pathname, { title, h1, canonical }]);
const suburbPages = SUBURB_PROFILES.map(({ path: pathname, title, h1, canonical }) => [pathname, { title, h1, canonical }]);
export const expectedPages = [...Object.entries(registry), ...districtPages, ...suburbPages, ['/404', { title: 'Page not found | Canberra Roof Kind', h1: 'Page not found' }]];

export function validateDocument(html, pathname, expected) {
  assert.ok(Buffer.byteLength(html) >= 4096, `${pathname}: HTML shorter than 4 KiB`);
  for (const tag of ['html', 'head', 'body']) {
    assert.match(html, new RegExp(`<${tag}(?:\\s|>)`, 'i'), `${pathname}: missing opening ${tag}`);
    assert.match(html, new RegExp(`</${tag}>`, 'i'), `${pathname}: missing closing ${tag}`);
  }
  for (const tag of ['html', 'head', 'body', 'header', 'main', 'footer', 'div', 'script', 'title']) {
    assert.equal((html.match(new RegExp(`<${tag}(?:\\s|>)`, 'gi')) ?? []).length, (html.match(new RegExp(`</${tag}>`, 'gi')) ?? []).length, `${pathname}: unbalanced ${tag} tags`);
  }
  assert.match(html.trim(), /<\/body>\s*<\/html>$/i, `${pathname}: truncated document ending`);
  assert.doesNotMatch(html, /<!--(?:route-head|app-html)-->/, `${pathname}: unexpanded build placeholder`);
  const dom = new JSDOM(html);
  try {
    const document = dom.window.document;
    assert.equal(document.documentElement.getAttribute('data-route'), pathname, `${pathname}: document route marker missing or mismatched`);
    const app = document.querySelector('body > #root');
    assert.ok(app && app.children.length >= 3, `${pathname}: missing populated application root`);
    assert.equal(app.querySelectorAll('main').length, 1, `${pathname}: one main content region`);
    assert.ok(app.querySelector('main').textContent.trim().length >= (pathname === '/404' ? 60 : 100), `${pathname}: empty main content`);
    assert.equal(app.querySelector('main h1')?.textContent, expected.h1, `${pathname}: route H1 missing`);
    assert.equal(document.querySelectorAll('head title').length, 1);
    assert.equal(document.title, expected.title, `${pathname}: incomplete title`);
    assert.ok(document.querySelector('head meta[name="description"]')?.content);
    assert.equal(document.querySelector('head link[rel="canonical"]')?.getAttribute('href'), expected.canonical);
    const socialImages = document.querySelectorAll('head meta[property="og:image"]');
    assert.equal(socialImages.length, pathname === '/404' ? 0 : 1, `${pathname}: sharing image cardinality`);
    if (pathname !== '/404') {
      const image = socialImages[0].content;
      assert.match(image, /^https:\/\/www\.canberraroofkind\.com\.au\/assets\/responsive\/.+\.webp\?v=[a-f0-9]+$/, `${pathname}: absolute HTTPS sharing image`);
      for (const property of ['width', 'height', 'type', 'alt']) {
        const metadata = document.querySelectorAll(`head meta[property="og:image:${property}"]`);
        assert.equal(metadata.length, 1, `${pathname}: sharing image ${property} cardinality`);
        assert.ok(metadata[0].content, `${pathname}: missing sharing image ${property}`);
      }
      const article = document.querySelector('#news-article-schema');
      if (article) {
        const schema = JSON.parse(article.textContent);
        assert.equal(schema.headline, expected.h1, `${pathname}: Article headline`);
        assert.equal(schema.image, image, `${pathname}: article sharing image matches its existing cover`);
      }
    } else assert.equal(document.querySelectorAll('head meta[property^="og:"]').length, 0, '404: no stale Open Graph metadata');
    const entries = [...document.querySelectorAll('script[type="module"][src]')].map((node) => node.getAttribute('src'));
    assert.equal(entries.length, 1, `${pathname}: missing or duplicated main script`);
    assert.match(entries[0], /^\/assets\/[^/?#]+\.js$/, `${pathname}: invalid main script URL`);
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map((node) => node.getAttribute('href'));
    assert.ok(styles.length > 0, `${pathname}: missing styles`);
    return { pathname, htmlBytes: Buffer.byteLength(html), title: document.title, mainTextLength: app.querySelector('main').textContent.trim().length, scripts: entries, styles, passed: true };
  } finally { dom.window.close(); }
}

export async function verifyBuild(directory = path.join(root, 'dist')) {
  const report = [];
  for (const [pathname, expected] of expectedPages) {
    const filename = pathname === '/' ? 'index.html' : `${pathname.slice(1)}.html`;
    const html = await readFile(path.join(directory, filename), 'utf8');
    const record = validateDocument(html, pathname, expected);
    for (const asset of [...record.scripts, ...record.styles]) {
      assert.match(asset, /^\/assets\/[A-Za-z0-9_.-]+$/, `${pathname}: asset outside build directory`);
      const file = await stat(path.join(directory, asset.slice(1)));
      assert.ok(file.isFile() && file.size >= 1024, `${pathname}: missing or truncated asset ${asset}`);
    }
    report.push({ file: filename, ...record });
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await verifyBuild();
  console.log(JSON.stringify({ gate: 'production HTML integrity', node: process.version, pages: report.length, passed: true, results: report }, null, 2));
}
