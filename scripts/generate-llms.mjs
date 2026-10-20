import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';
import registry from '../src/route-meta.json' with {type:'json'};
import {LLMS_CURATION} from './llms-curation.mjs';

export const PRODUCTION_ORIGIN=new URL(registry['/'].canonical).origin;
const normalize=text=>text.replace(/\s+/gu,' ').trim();
const filename=(directory,pathname)=>path.join(directory,pathname==='/'?'index.html':pathname==='/zh/'?'zh/index.html':pathname.slice(1)+'.html');
export function extractLLMSPage(html,{url,selector,paragraph=0,role,intent,summarySentences=2}){
  const dom=new JSDOM(html);
  try{
    const d=dom.window.document,main=d.querySelector('main');
    const title=normalize(main?.querySelector('h1')?.textContent??'');
    const candidates=[...(main?.querySelectorAll('p')??[])].filter(p=>!p.classList.contains('eyebrow')&&normalize(p.textContent));
    const source=selector?main?.querySelector(selector):candidates[paragraph];
    const evidence=normalize(source?.textContent??'');
    if(!title||!evidence)throw new Error(`Missing public heading or summary source: ${url}`);
    const lang=d.documentElement.lang;
    const robots=[...d.querySelectorAll('meta[name="robots"],meta[name="googlebot"]')].map(m=>m.content).join(',');
    if(/(?:^|[,\s])(?:noindex|none)(?:$|[,\s])/i.test(robots))throw new Error(`Explicit noindex content is excluded: ${url}`);
    const canonical=d.querySelector('link[rel="canonical"]')?.href??null;
    if(canonical!==url)throw new Error(`Canonical owner mismatch: ${url}`);
    const chinese=new URL(url).pathname.startsWith('/zh/');
    if(!(chinese?/^zh(?:-|$)/i:/^en(?:-|$)/i).test(lang)||chinese&&!/[\u3400-\u9fff]/u.test(title))throw new Error(`Public page language mismatch: ${url}`);
    const sentences=[...new Intl.Segmenter(lang.startsWith('zh')?'zh':'en',{granularity:'sentence'}).segment(evidence)].map(s=>s.segment.trim()).filter(Boolean);
    const summary=sentences.slice(0,summarySentences).join(' ');
    return {url,title,lang,summary,evidence,summarySentences,sourceSelector:selector??`main p:not(.eyebrow) [nonempty index ${paragraph}]`,role,intent,
      canonical,robots,
      alternates:Object.fromEntries([...d.querySelectorAll('link[rel="alternate"][hreflang]')].map(a=>[a.hreflang,a.href])),
      mainText:normalize(main.textContent),
      internalLinks:[...main.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>h.startsWith('/')&&!h.startsWith('//')),
    };
  }finally{dom.window.close();}
}
export async function collectLLMSPages({directory='dist'}={}){
  const records=[];
  const sitemap=await readFile(path.join(directory,'sitemap.xml'),'utf8');
  const sitemapURLs=new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]));
  const seen=new Set();
  for(const item of LLMS_CURATION){
    const url=registry[item.path]?.canonical;
    if(!url)throw new Error(`Unregistered content owner: ${item.path}`);
    if(seen.has(url))throw new Error(`Duplicate selected owner: ${url}`);
    seen.add(url);
    const en=extractLLMSPage(await readFile(filename(directory,item.path),'utf8'),{...item,url});
    const zhURL=en.alternates['zh-CN'];
    if(!zhURL||new URL(zhURL).origin!==PRODUCTION_ORIGIN||!new URL(zhURL).pathname.startsWith('/zh/'))throw new Error(`Invalid Chinese counterpart: ${url}`);
    const zh=extractLLMSPage(await readFile(filename(directory,new URL(zhURL).pathname),'utf8'),{...item,url:zhURL});
    for(const page of [en,zh]){
      if(!sitemapURLs.has(page.url))throw new Error(`Selected public page is missing from the sitemap: ${page.url}`);
      if(page.alternates['en-AU']!==en.url||page.alternates['zh-CN']!==zh.url)throw new Error(`Nonreciprocal language pair: ${page.url}`);
    }
    records.push({...item,en,zh});
  }
  return records;
}
const mdLabel=text=>text.replace(/[\[\]\\]/g,'\\$&');
export async function buildLLMS(options={}){
  const records=await collectLLMSPages(options);
  const homeHTML=await readFile(filename(options.directory??'dist','/'),'utf8');
  const dom=new JSDOM(homeHTML);
  let organization;
  try{organization=[...dom.window.document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)).find(s=>s['@id']===PRODUCTION_ORIGIN+'/#organization');}finally{dom.window.close();}
  if(!organization?.name)throw new Error('Missing existing organization identity');
  const home=records.find(r=>r.path==='/');
  let markdown=`# ${organization.name} — ${home.en.title}\n\n> ${organization.name}: ${home.en.summary}\n\nContent is available in English and 简体中文. This file is a selected navigation guide to the existing public pages.\n\n`;
  const append=(heading,pages)=>{markdown+=`## ${heading}\n\n`+pages.map(p=>`- [${mdLabel(p.title)}](${p.url}): ${p.summary}`).join('\n')+'\n\n';};
  append('Website, company and contact / 网站、公司与联系',records.filter(r=>r.group==='company').flatMap(r=>[r.en,r.zh]));
  append('English services',records.filter(r=>r.group==='services').map(r=>r.en));
  append('中文服务',records.filter(r=>r.group==='services').map(r=>r.zh));
  append('Case studies / 案例',records.filter(r=>r.group==='cases').flatMap(r=>[r.en,r.zh]));
  append('Guides / 科普指南',records.filter(r=>r.group==='guides').flatMap(r=>[r.en,r.zh]));
  return {markdown:markdown.trimEnd()+'\n',records};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {markdown,records}=await buildLLMS();
  await writeFile('public/llms.txt',markdown,'utf8');
  await writeFile('dist/llms.txt',markdown,'utf8');
  console.log(`Generated bilingual llms.txt: ${records.length} curated pairs from published HTML; no network or model calls.`);
}
