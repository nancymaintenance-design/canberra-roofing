import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { pagePaths } from '../.ssr/entry-server.js';
let pages=0, phoneLinks=0, articles=0;
for(const pathname of pagePaths) {
  const filename=pathname==='/'?'dist/index.html':pathname==='/zh/'?'dist/zh/index.html':`dist${pathname}.html`;
  const dom=new JSDOM(await readFile(filename,'utf8'));
  try {
    const d=dom.window.document;const zh=pathname.startsWith('/zh/');
    assert.equal(d.documentElement.lang,zh?'zh-CN':'en-AU',pathname);
    assert.equal(d.documentElement.dataset.route,pathname);
    assert.equal(d.querySelectorAll('main h1').length,1);
    if(zh) assert.match(d.querySelector('main h1').textContent,/[\u3400-\u9fff]/,pathname+' Chinese heading');
    assert.equal(d.querySelector('link[rel="canonical"]').href,'https://www.canberraroofkind.com.au'+pathname);
    assert.equal(d.querySelectorAll('link[rel="alternate"][hreflang]').length,3);
    assert.ok(d.querySelector('main').textContent.length>100);
    assert.equal(d.querySelectorAll('[data-copy-id],.adminBtn').length,0,'No editor controls in production');
    for(const a of d.querySelectorAll('a[href^="tel:"]')) { const href=a.getAttribute('href'); if(!['tel:000','tel:132500'].includes(href)) {assert.ok(['tel:0405878406','tel:+61405878406'].includes(href),pathname+': '+href);phoneLinks++;} }
    for(const a of d.querySelectorAll('a[href^="mailto:"]')) assert.equal(a.getAttribute('href'),'mailto:elliservices.group@gmail.com');
    const article=d.querySelector('#news-article-schema');if(article){const schema=JSON.parse(article.textContent);assert.equal(schema.inLanguage,zh?'zh-CN':'en-AU');assert.equal(schema.mainEntityOfPage,'https://www.canberraroofkind.com.au'+pathname);articles++;}
    pages++;
  } finally {dom.window.close();}
}
assert.equal(pages,pagePaths.length);assert.equal(articles,pagePaths.filter(path=>path.replace(/^\/zh/,'').startsWith('/news/')).length);
console.log(`Bilingual HTML verified: ${pages} pages, ${articles} article schemas, ${phoneLinks} original phone targets; canonical/hreflang/lang, Chinese headings and production editor isolation passed.`);
