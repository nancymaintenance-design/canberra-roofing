// Read built HTML, never infer click distance from directory depth.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { SERVICE_CATALOG } from '../src/service-catalog.js';
const origin='https://www.canberraroofkind.com.au';
export async function navigationEvidence() {
 const {pagePaths}=await import(pathToFileURL(path.resolve('.ssr/entry-server.js')).href);
 const rows=[];
 for(const pathname of pagePaths){
  const html=await readFile(path.join('dist',pathname==='/'?'index.html':pathname==='/zh/'?'zh/index.html':pathname.slice(1)+'.html'),'utf8');
  const dom=new JSDOM(html), d=dom.window.document;
  const links=[...d.querySelectorAll('a[href]')].flatMap(a=>{let u;try{u=new URL(a.getAttribute('href'),origin+pathname);}catch{return [];}if(u.origin!==origin)return [];return [{target:u.pathname,fragment:u.hash,zone:a.closest('.breadcrumbs')?'breadcrumb':a.closest('header nav,header .nav')?'navigation':a.closest('main')?'body':a.closest('footer')?'footer':'shell'}];});
  rows.push({path:pathname,canonical:d.querySelector('link[rel=canonical]')?.getAttribute('href'),hreflang:[...d.querySelectorAll('link[hreflang]')].map(e=>[e.getAttribute('hreflang'),e.getAttribute('href')]),h1:d.querySelector('h1')?.textContent,robots:d.querySelector('meta[name=robots]')?.getAttribute('content')??null,breadcrumb:[...d.querySelectorAll('.breadcrumbs li')].map(li=>({name:li.querySelector('a,[aria-current]')?.textContent,href:li.querySelector('a')?.getAttribute('href')??null})),ids:[...d.querySelectorAll('[id]')].map(e=>e.id),links});dom.window.close();
 }
 const byPath=new Map(rows.map(r=>[r.path,r]));
 const metrics=[];
 for(const locale of ['en','zh']){
  const root=locale==='en'?'/':'/zh/', prefix=locale==='en'?'':'/zh';
  const distance=new Map([[root,0]]),queue=[root];
  while(queue.length){const p=queue.shift();for(const {target} of byPath.get(p)?.links??[]){if(!byPath.has(target)||distance.has(target))continue;distance.set(target,distance.get(p)+1);queue.push(target);}}
  for(const service of SERVICE_CATALOG){const target=prefix+service.path;const sources={};for(const zone of ['navigation','breadcrumb','body','footer','shell'])sources[zone]=rows.filter(r=>r.path!==target&&r.links.some(l=>l.target===target&&l.zone===zone)).map(r=>r.path);metrics.push({locale,target,homeClickDistance:distance.get(target)??null,uniqueSourcePages:rows.filter(r=>r.path!==target&&r.links.some(l=>l.target===target)).length,sources});}
 }
 return {origin,createdAt:new Date().toISOString(),pageCount:rows.length,metrics,pages:rows};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const folder='../reports/breadcrumbs-2026-10-20';await mkdir(folder,{recursive:true});const stage=process.argv[2]??'after';await writeFile(path.join(folder,stage+'.json'),JSON.stringify(await navigationEvidence(),null,2));console.log(`Saved ${stage} built navigation evidence.`);
}
