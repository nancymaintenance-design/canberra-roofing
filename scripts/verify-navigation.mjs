import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import {startPreview} from './preview.mjs';
import {navigationEvidence} from './navigation-evidence.mjs';
const folder='../reports/breadcrumbs-2026-10-20';await mkdir(folder,{recursive:true});
const {getNavigationMap}=await import(pathToFileURL(path.resolve('.ssr/entry-server.js')).href);
const rows=[...getNavigationMap('en'),...getNavigationMap('zh')], byURL=new Map(rows.map(r=>[r.url,r]));
const before=JSON.parse(await readFile(path.join(folder,'before.json'),'utf8'));
const after=await navigationEvidence(),byPath=new Map(after.pages.map(p=>[p.path,p]));
const server=await startPreview();const results=[];const errors=[];
const docs=new Map();
try{
 for(const row of rows){
  try{
   const response=await fetch(server.origin+row.path,{redirect:'manual'});assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/html/);const html=await response.text();
   const dom=new JSDOM(html),d=dom.window.document;docs.set(row.url,[...d.querySelectorAll('a[href]')].map(a=>new URL(a.getAttribute('href'),row.url).href));
   assert.ok(d.querySelector('main')?.textContent.trim().length>80,'empty body');
   const prior=before.pages.find(p=>p.path===row.path),current=byPath.get(row.path);assert.ok(prior);for(const field of ['canonical','hreflang','h1','robots'])assert.deepEqual(current[field],prior[field],field+' regression');
   const trail=[];let item=row;const seen=new Set();while(item){assert.ok(!seen.has(item.url),'cycle');seen.add(item.url);trail.unshift(item);if(!item.primary_parent_url)break;item=byURL.get(item.primary_parent_url);assert.ok(item,'parent missing');assert.equal(item.locale,row.locale);assert.equal(item.robots,'index,follow');}
   const nav=d.querySelector('.breadcrumbs');const scripts=[...d.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent));
   const schemas=scripts.flatMap(s=>s['@graph']??[s]).filter(s=>s['@type']==='BreadcrumbList');
   if(row.page_type==='Homepage'){assert.equal(nav,null);assert.equal(schemas.length,0);}else{
    assert.equal(d.querySelectorAll('.breadcrumbs').length,1);assert.equal(schemas.length,1);assert.equal(nav.getAttribute('aria-label'),row.locale==='zh'?'面包屑导航':'Breadcrumb');assert.ok(nav.querySelector('ol'));assert.equal(nav.querySelectorAll('[aria-current="page"]').length,1);assert.equal(nav.querySelector('[aria-current="page"]').tagName,'SPAN');
    const list=[...nav.querySelectorAll('li')];assert.equal(list.length,trail.length);assert.ok(trail.length>=2);
    const expected=trail.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.breadcrumb_label,item:p.url}));assert.deepEqual(schemas[0].itemListElement,expected);
    list.forEach((li,i)=>{assert.equal(li.querySelector('a,[aria-current]')?.textContent,trail[i].breadcrumb_label);if(i<list.length-1){const a=li.querySelector('a');assert.equal(a.getAttribute('href'),trail[i].url);assert.ok(!a.hasAttribute('target'));assert.ok(!a.hasAttribute('rel'));}});
   }
   results.push({path:row.path,status:response.status,locale:row.locale,robots:current.robots,bodyReadable:true,canonicalAndHreflangUnchanged:true,breadcrumbConsistent:true});dom.window.close();
  }catch(e){errors.push({path:row.path,error:e.message});}
 }
 // Reciprocal hierarchy: the real parent must visibly link to its child.
 for(const row of rows){try{if(!row.primary_parent_url)continue;const parent=docs.get(row.primary_parent_url);assert.ok(parent,'parent body absent');assert.ok(parent.includes(row.url),'parent does not link back to child');assert.equal(byURL.get(row.alternate_url)?.alternate_url,row.url,'language pairing');if(row.commercial_owner_url)assert.ok(byURL.has(row.commercial_owner_url),'owner missing');}catch(e){errors.push({path:row.path,error:e.message});}}
 for(const page of after.pages)for(const link of page.links){
  if(link.target.startsWith('/assets/'))continue;
  const target=byPath.get(link.target);
  if(!target){errors.push({path:page.path,error:'Missing internal document '+link.target});continue;}
  if(link.fragment){try{const id=decodeURIComponent(link.fragment.slice(1));if(!target.ids.includes(id))errors.push({path:page.path,error:'Missing internal fragment '+link.target+link.fragment});}catch{errors.push({path:page.path,error:'Malformed fragment '+link.fragment});}}
 }
 await writeFile(path.join(folder,'after.json'),JSON.stringify(after,null,2));
 await writeFile(path.join(folder,'navigation-map.json'),JSON.stringify(rows,null,2));
 await writeFile(path.join(folder,'all-pages-checks.json'),JSON.stringify({total:rows.length,passed:results.length,errors,results,excluded:[{path:'/404',reason:'No commercial hierarchy for error page'},{path:'/solutions and legacy redirects',reason:'Redirects are not canonical page nodes'},{path:'/__editor, /api, drafts and assets',reason:'Not public customer document routes'}]},null,2));
 console.log(JSON.stringify({total:rows.length,checked:results.length,errors},null,2));if(errors.length)process.exitCode=1;
}finally{await server.close();}
