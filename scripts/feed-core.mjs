import { JSDOM } from 'jsdom';

export const ORIGIN = 'https://www.canberraroofkind.com.au';
const languages = { en: 'en-AU', zh: 'zh-CN' };
const clean = value => String(value ?? '').toWellFormed().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '');
const text = value => clean(value).replace(/\s+/g, ' ').trim();
const xml = value => clean(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

function sourceDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return undefined;
  const day = value.slice(0, 10);
  if (value.includes('T') && (Number(value.slice(11, 13)) > 23 || Number(value.slice(14, 16)) > 59 || Number(value.slice(17, 19)) > 59)) return undefined;
  const parsedDay = new Date(day + 'T00:00:00Z');
  if (!Number.isFinite(parsedDay.valueOf()) || parsedDay.toISOString().slice(0, 10) !== day || !Number.isFinite(Date.parse(value))) return undefined;
  return value;
}

function publicContent(document, canonical) {
  const container = document.createElement('div');
  for (const element of document.querySelectorAll('article.newsArticle .articleLead, article.newsArticle .articleSection')) container.append(element.cloneNode(true));
  container.querySelectorAll('script,style,iframe,form,input,button,object,embed,link,meta').forEach(element => element.remove());
  for (const element of container.querySelectorAll('*')) {
    for (const attribute of [...element.attributes]) {
      if (!['href', 'src', 'alt', 'title'].includes(attribute.name)) element.removeAttribute(attribute.name);
      else if (['href', 'src'].includes(attribute.name)) {
        const url = new URL(attribute.value, canonical);
        if (['https:', 'http:'].includes(url.protocol)) element.setAttribute(attribute.name, url.href);
        else element.removeAttribute(attribute.name);
      }
    }
  }
  // Preserve paragraph boundaries for readers that use content_text.
  for (const block of container.querySelectorAll('p,h2,h3,li')) block.append(document.createTextNode('\n\n'));
  const content_text = clean(container.textContent).trim();
  for (const node of container.querySelectorAll('p,h2,h3,li')) {
    if (node.lastChild?.nodeType === 3 && node.lastChild.textContent === '\n\n') node.lastChild.remove();
  }
  return { content_html: clean(container.innerHTML), content_text };
}

export function extractArticle({ pathname, html, status = 'published', trustDates = true }) {
  if (status !== 'published' || !/^\/(?:zh\/)?news\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)) return null;
  const dom = new JSDOM(html);
  try {
    const d = dom.window.document;
    if ([...d.querySelectorAll('meta[name="robots"],meta[name="googlebot"]')].some(meta => /\b(noindex|none)\b/i.test(meta.content))) return null;
    const canonical = d.querySelector('link[rel="canonical"]')?.href;
    if (canonical !== ORIGIN + pathname) throw new Error(`Invalid article canonical: ${pathname}`);
    const lang = pathname.startsWith('/zh/') ? 'zh' : 'en';
    if (d.documentElement.lang !== languages[lang]) throw new Error(`Invalid article language: ${pathname}`);
    const schema = JSON.parse(d.querySelector('#news-article-schema')?.textContent ?? 'null');
    if (!schema || !['Article', 'NewsArticle'].includes(schema['@type']) || schema.inLanguage !== languages[lang] || schema.mainEntityOfPage !== canonical) throw new Error(`Missing or mismatched article schema: ${pathname}`);
    const title = text(d.querySelector('article.newsArticle h1')?.textContent);
    const summary = text(d.querySelector('meta[name="description"]')?.content);
    const content = publicContent(d, canonical);
    if (!title || !summary || !content.content_text) throw new Error(`Incomplete public article: ${pathname}`);
    return { id: canonical, url: canonical, pathname, lang, title, summary, ...content,
      published: trustDates ? sourceDate(schema.datePublished) : undefined,
      modified: trustDates ? sourceDate(schema.dateModified) : undefined };
  } finally { dom.window.close(); }
}

export function buildCatalog(records) {
  const items = records.map(extractArticle).filter(Boolean).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  if (new Set(items.map(item => item.id)).size !== items.length) throw new Error('Duplicate canonical feed IDs');
  return items;
}

export function renderFeeds(items, lang, channel) {
  if (!languages[lang] || items.some(item => item.lang !== lang)) throw new Error('Feed language mismatch');
  const prefix = lang === 'zh' ? '/zh' : '';
  const rssUrl = ORIGIN + prefix + '/rss.xml';
  const jsonUrl = ORIGIN + prefix + '/feed.json';
  const home = ORIGIN + prefix + '/news';
  const jsonItems = items.map(item => {
    const result = { id: item.id, url: item.url, title: item.title, summary: item.summary, content_html: item.content_html, content_text: item.content_text, language: languages[lang] };
    for (const [source, target] of [['published', 'date_published'], ['modified', 'date_modified']]) {
      if (item[source]) result[(item[source].includes('T') ? '' : '_') + target] = item[source];
    }
    return result;
  });
  const json = JSON.stringify({ version: 'https://jsonfeed.org/version/1.1', title: channel.title, home_page_url: home, feed_url: jsonUrl, description: channel.description, language: languages[lang], items: jsonItems }, null, 2) + '\n';
  const rssItems = items.map(item => {
    let dates = '';
    if (item.published?.includes('T')) dates += `\n      <pubDate>${new Date(item.published).toUTCString()}</pubDate>`;
    else if (item.published) dates += `\n      <dcterms:issued>${xml(item.published)}</dcterms:issued>`;
    if (item.modified) dates += `\n      <dcterms:modified>${xml(item.modified)}</dcterms:modified>`;
    return `    <item>\n      <title>${xml(item.title)}</title>\n      <link>${xml(item.url)}</link>\n      <guid isPermaLink="true">${xml(item.id)}</guid>\n      <description>${xml(item.summary)}</description>\n      <content:encoded>${xml(item.content_html)}</content:encoded>${dates}\n    </item>`;
  }).join('\n');
  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dcterms="http://purl.org/dc/terms/">\n  <channel>\n    <title>${xml(channel.title)}</title>\n    <link>${xml(home)}</link>\n    <description>${xml(channel.description)}</description>\n    <language>${languages[lang]}</language>\n    <atom:link href="${rssUrl}" rel="self" type="application/rss+xml"/>\n${rssItems}${rssItems ? '\n' : ''}  </channel>\n</rss>\n`;
  return { rss, json };
}

// Owned tags contain no surrounding whitespace, so removal restores exact bytes.
export function stripDiscovery(html) {
  return html.replace(/<link\s+[^>]*data-crk-feed="(?:rss|json)"[^>]*>/g, '');
}

export function updateDiscovery(html, lang) {
  if (!languages[lang]) throw new Error('Invalid discovery language');
  const original = stripDiscovery(html);
  const dom = new JSDOM(original);
  let tags = '';
  try {
    for (const [kind, type, filename] of [['rss', 'application/rss+xml', 'rss.xml'], ['json', 'application/feed+json', 'feed.json']]) {
      const href = ORIGIN + (lang === 'zh' ? '/zh/' : '/') + filename;
      if (![...dom.window.document.querySelectorAll('head link[rel="alternate"]')].some(link => link.type === type && link.href === href)) tags += `<link rel="alternate" type="${type}" href="${href}" data-crk-feed="${kind}">`;
    }
  } finally { dom.window.close(); }
  if (!original.includes('</head>')) throw new Error('Missing HTML head');
  return original.replace('</head>', tags + '</head>');
}
