import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractArticle, buildCatalog, renderFeeds, updateDiscovery, stripDiscovery, ORIGIN } from '../scripts/feed-core.mjs';
import { generateFeeds, pageFile } from '../scripts/generate-feeds.mjs';
import { startPreview } from '../scripts/preview.mjs';

const pathname='/news/test-roof-guide';
function html({lang='en-AU', canonical=ORIGIN+pathname, title='Roof & rain <test>', robots='', dates={}, body='<p>A &amp; B 中文 ]]> <a href="/contact">Ask us</a></p>'}={}) {
 return `<!doctype html><html lang="${lang}"><head><title>Existing title</title><meta name="description" content="Roof &amp; rain"><link rel="canonical" href="${canonical}"><meta name="robots" content="${robots}"><link rel="alternate" hreflang="en-AU" href="${ORIGIN+pathname}"></head><body><main><article class="newsArticle"><h1>${title.replaceAll('&','&amp;').replaceAll('<','&lt;')}</h1><p class="articleLead">Lead text</p><section class="articleSection"><h2>Roof problem</h2>${body}</section></article></main><script id="news-article-schema" type="application/ld+json">${JSON.stringify({'@type':'Article',inLanguage:lang, mainEntityOfPage:canonical,...dates})}</script></body></html>`;
}
const record=(options={})=>({pathname,html:html(options)});

test('RSS and JSON share canonical IDs, published text, Chinese and escaped HTML',()=>{
 const item=extractArticle(record());
 const feeds=renderFeeds([item],'en',{title:'News & guides',description:'Roof advice'});
 const xml=new JSDOM(feeds.rss,{contentType:'application/xml'}).window.document;
 const json=JSON.parse(feeds.json);
 assert.equal(xml.querySelector('parsererror'),null);
 assert.equal(xml.querySelector('guid').textContent,json.items[0].id);
 assert.equal(json.items[0].id,ORIGIN+pathname);
 assert.equal(xml.querySelector('item > title').textContent,'Roof & rain <test>');
 assert.match(json.items[0].content_html,/中文/);
 assert.match(json.items[0].content_html,/href="https:\/\/www.canberraroofkind.com.au\/contact"/);
 assert.match(json.items[0].content_text,/A & B 中文 \]\]>/);
 assert.equal(xml.getElementsByTagName('content:encoded')[0].textContent,json.items[0].content_html);
 assert.equal(json.version,'https://jsonfeed.org/version/1.1');
 assert.equal(json.language,'en-AU');
});

test('dates retain source precision; no deployment date or invented publication date',()=>{
 const item=extractArticle(record({dates:{dateModified:'2026-10-21'}}));
 const {rss,json}=renderFeeds([item],'en',{title:'News',description:'Guides'});
 assert.doesNotMatch(rss,/<pubDate>|<lastBuildDate>/);
 assert.match(rss,/<dcterms:modified>2026-10-21<\/dcterms:modified>/);
 const entry=JSON.parse(json).items[0];
 assert.equal(entry.date_published,undefined); assert.equal(entry.date_modified,undefined);
 assert.equal(entry._date_modified,'2026-10-21');
 const precise=JSON.parse(renderFeeds([extractArticle(record({dates:{datePublished:'2026-10-20T09:00:00+10:00'}}))],'en',{title:'News',description:'Guides'}).json).items[0];
 assert.equal(precise.date_published,'2026-10-20T09:00:00+10:00');
 for(const dateModified of ['2026-02-30','nonsense','2026-13-01','2026-10-20T24:00:00Z'])assert.equal(extractArticle(record({dates:{dateModified}})).modified,undefined);
 assert.equal(extractArticle({...record({dates:{dateModified:'2026-10-21'}}),trustDates:false}).modified,undefined);
});

test('only published indexable canonical article routes are eligible',()=>{
 for(const robots of ['noindex','noindex, follow','none'])assert.equal(extractArticle(record({robots})),null);
 for(const route of ['/news','/services/roof-repairs','/areas/test','/__editor','/news/draft/preview'])assert.equal(extractArticle({...record(),pathname:route}),null);
 for(const status of ['draft','preview','withdrawn'])assert.equal(extractArticle({...record(),status}),null);
 assert.throws(()=>extractArticle(record({canonical:'https://example.com/news/test-roof-guide'})),/canonical/i);
 assert.throws(()=>extractArticle(record({lang:'zh-CN'})),/language/i);
 const zh=extractArticle({pathname:'/zh'+pathname,html:html({lang:'zh-CN',canonical:ORIGIN+'/zh'+pathname,title:'屋顶漏水检查'})});
 const feeds=renderFeeds([zh],'zh',{title:'屋顶知识',description:'维修指南'});
 assert.equal(JSON.parse(feeds.json).feed_url,ORIGIN+'/zh/feed.json');
 assert.match(feeds.rss,/<language>zh-CN<\/language>/);
 assert.throws(()=>renderFeeds([zh],'en',{title:'News',description:'Guides'}),/language/i);
});

test('catalog updates, withdrawals, additions and empty feeds are deterministic',()=>{
 const before=buildCatalog([record()]);
 const changed=buildCatalog([record({title:'Changed roof guide'})]);
 assert.equal(before[0].id,changed[0].id); assert.notEqual(before[0].title,changed[0].title);
 assert.equal(buildCatalog([{...record(),status:'withdrawn'}]).length,0);
 const extra={pathname:'/news/another',html:html({canonical:ORIGIN+'/news/another'})};
 const channel={title:'News',description:'Guides'};
 assert.equal(buildCatalog([extra,record()]).length,2);
 assert.deepEqual(renderFeeds(buildCatalog([extra,record()]),'en',channel),renderFeeds(buildCatalog([record(),extra]),'en',channel));
 const empty=renderFeeds([],'en',channel);
 assert.equal(JSON.parse(empty.json).items.length,0);
 assert.equal(new JSDOM(empty.rss,{contentType:'application/xml'}).window.document.querySelectorAll('item').length,0);
 assert.throws(()=>buildCatalog([record(),record()]),/duplicate/i);
});

test('feed content removes executable markup, unsafe URLs and invalid XML characters',()=>{
 const item=extractArticle(record({body:'<p onclick="bad()">Text\u0001<script>bad()</script><a href="javascript:bad()">safe label</a><img src="/assets/roof.webp" onerror="bad()"></p>'}));
 assert.doesNotMatch(item.content_html,/onclick|onerror|javascript:|<script|\u0001/);
 assert.match(item.content_html,/https:\/\/www.canberraroofkind.com.au\/assets\/roof.webp/);
 assert.doesNotThrow(()=>new JSDOM(renderFeeds([item],'en',{title:'News',description:'Guides'}).rss,{contentType:'application/xml'}));
});

test('head-only discovery is reversible, idempotent, language-specific and preserves existing alternates',()=>{
 const original=html();
 const edited=updateDiscovery(original,'en');
 assert.equal(stripDiscovery(edited),original);
 assert.equal(updateDiscovery(edited,'en'),edited);
 assert.equal(edited.split('</head>')[1],original.split('</head>')[1]);
 const doc=new JSDOM(edited).window.document;
 assert.equal(doc.querySelectorAll('link[hreflang]').length,1);
 assert.equal(doc.querySelector('link[type="application/rss+xml"]').href,ORIGIN+'/rss.xml');
 assert.equal(doc.querySelector('link[type="application/feed+json"]').href,ORIGIN+'/feed.json');
 assert.equal(new JSDOM(updateDiscovery(html(),'zh')).window.document.querySelector('link[type="application/rss+xml"]').href,ORIGIN+'/zh/rss.xml');
 const existing=original.replace('</head>',`<link rel="alternate" type="application/rss+xml" href="${ORIGIN}/rss.xml"></head>`);
 assert.equal(new JSDOM(updateDiscovery(existing,'en')).window.document.querySelectorAll('link[type="application/rss+xml"]').length,1);
 assert.equal(stripDiscovery(updateDiscovery(existing,'en')),existing);
});

test('build generator reflects additions, edits, noindex, draft and withdrawal from the published inventory',async()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 const temp=await mkdtemp(path.join(root,'node_modules/.feed-test-'));
 const put=async(route,value)=>{const target=path.join(temp,pageFile(route));await mkdir(path.dirname(target),{recursive:true});await writeFile(target,value);};
 try{
  const pages=['/','/zh/','/news','/zh/news'];
  for(const route of pages)await put(route,html({lang:route.startsWith('/zh')?'zh-CN':'en-AU'}));
  await put(pathname,html());
  const read=async()=>JSON.parse(await readFile(path.join(temp,'feed.json'),'utf8'));
  await generateFeeds({directory:temp,pagePaths:pages});
  assert.equal((await read()).items.length,0); // A stale file is not a published route.
  await generateFeeds({directory:temp,pagePaths:[...pages,pathname]});
  assert.equal((await read()).items.length,1);
  const original=await readFile(path.join(temp,'feed.json'),'utf8');
  await generateFeeds({directory:temp,pagePaths:[...pages,pathname]});
  assert.equal(await readFile(path.join(temp,'feed.json'),'utf8'),original);
  await put(pathname,html({title:'Updated content'}));
  await generateFeeds({directory:temp,pagePaths:[...pages,pathname]});
  assert.equal((await read()).items[0].title,'Updated content');
  await put(pathname,html({robots:'noindex'}));
  await generateFeeds({directory:temp,pagePaths:[...pages,pathname]});
  assert.equal((await read()).items.length,0);
  assert.doesNotMatch(await readFile(path.join(temp,pageFile(pathname)),'utf8'),/data-crk-feed/);
  await put(pathname,html({dates:{dateModified:'2026-10-16'}}));
  await generateFeeds({directory:temp,pagePaths:[...pages,pathname],editorArticles:[{slug:'test-roof-guide',status:'draft'}]});
  assert.equal((await read()).items.length,0);
  await generateFeeds({directory:temp,pagePaths:[...pages,pathname],editorArticles:[{slug:'test-roof-guide'}]});
  assert.equal((await read()).items[0]._date_modified,undefined);
  await generateFeeds({directory:temp,pagePaths:pages});
  assert.equal((await read()).items.length,0);
 }finally{
  assert.ok(path.resolve(temp).startsWith(path.resolve(root,'node_modules')+path.sep));
  await rm(temp,{recursive:true,force:true});
 }
});

test('local HTTP serves four generated feeds with exact MIME types and keeps unknown feed routes as HTML 404',async()=>{
 const preview=await startPreview();
 try{
  for(const prefix of ['','/zh'])for(const [filename,type]of [['rss.xml','application/rss+xml'],['feed.json','application/feed+json']]){
   const res=await fetch(preview.origin+prefix+'/'+filename);
   assert.equal(res.status,200);assert.equal(res.headers.get('content-type'),type+'; charset=utf-8');
   const body=await res.text();
   if(filename==='rss.xml')assert.equal(new JSDOM(body,{contentType:'application/xml'}).window.document.querySelectorAll('item').length,12);
   else assert.equal(JSON.parse(body).items.length,12);
  }
  for(const route of ['/rssXxml','/feed.xml','/zh/rssXxml','/unknown/feed.json']){
   const res=await fetch(preview.origin+route,{redirect:'manual'});
   assert.equal(res.status,404);assert.match(res.headers.get('content-type'),/^text\/html/);
  }
 }finally{await preview.close();}
});
