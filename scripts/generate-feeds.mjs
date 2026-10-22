import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { buildCatalog, renderFeeds, updateDiscovery, stripDiscovery } from './feed-core.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export const pageFile = pathname => pathname === '/' ? 'index.html' : pathname === '/zh/' ? 'zh/index.html' : pathname.slice(1) + '.html';

export async function generateFeeds({ directory, pagePaths, editorArticles = [] }) {
  const records = [];
  const documents = new Map();
  for (const pathname of pagePaths) {
    const html = await readFile(path.join(directory, pageFile(pathname)), 'utf8');
    documents.set(pathname, html);
    if (!/^\/(?:zh\/)?news\//.test(pathname)) continue;
    const editor = editorArticles.find(article => pathname.replace(/^\/zh/, '') === '/news/' + article.slug);
    // Editor articles inherit a UI fallback date. It is not a verified article date.
    records.push({ pathname, html, status: editor?.draft ? 'draft' : editor?.status ?? 'published', trustDates: !editor });
  }
  const catalog = buildCatalog(records);
  for (const lang of ['en', 'zh']) {
    const prefix = lang === 'zh' ? '/zh' : '';
    const dom = new JSDOM(documents.get(prefix + '/news'));
    let channel;
    try {
      channel = { title: dom.window.document.querySelector('h1')?.textContent.trim(), description: dom.window.document.querySelector('meta[name="description"]')?.content };
      if (!channel.title || !channel.description) throw new Error('Missing published News channel metadata');
    } finally { dom.window.close(); }
    const feeds = renderFeeds(catalog.filter(item => item.lang === lang), lang, channel);
    for (const [filename, content] of [['rss.xml', feeds.rss], ['feed.json', feeds.json]]) {
      const target = path.join(directory, prefix.slice(1), filename);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, content, 'utf8');
    }
  }
  const eligible = new Set(['/', '/zh/', '/news', '/zh/news', ...catalog.map(item => item.pathname)]);
  for (const [pathname, html] of documents) {
    const updated = eligible.has(pathname) ? updateDiscovery(html, pathname.startsWith('/zh') ? 'zh' : 'en') : stripDiscovery(html);
    if (updated !== html) await writeFile(path.join(directory, pageFile(pathname)), updated, 'utf8');
  }
  return catalog;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { pagePaths } = await import(new URL('../.ssr/entry-server.js', import.meta.url));
  const editorial = JSON.parse(await readFile(path.join(root, 'src/i18n/content.json'), 'utf8'));
  const catalog = await generateFeeds({ directory: path.join(root, 'dist'), pagePaths, editorArticles: editorial.articles });
  console.log(`Generated RSS 2.0 and JSON Feed 1.1: ${catalog.filter(item => item.lang === 'en').length} English, ${catalog.filter(item => item.lang === 'zh').length} Chinese articles; head-only discovery.`);
}
