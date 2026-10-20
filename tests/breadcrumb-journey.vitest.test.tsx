// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { getBreadcrumbs, getRouteHead, bilingualPagePaths, HeadMarkup } from '../src/route-meta';
import { getNavigationMap } from '../src/navigation-map';
import { getEditorialContent, setEditorialContent, copyId, configureLocale, getCatalog } from '../src/i18n/runtime';
import { renderPage } from '../src/entry-server';
function page(path:string){const d=document.createElement('div');d.innerHTML=renderToStaticMarkup(<AppV3 pathname={path}/>);return d;}
it('takes a single-service guide back to its real service, not a directory',()=>{
 expect(getBreadcrumbs('/news/after-rain-roof-leak-check-canberra').map(c=>c.path)).toEqual(['/','/services/roof-leak-repairs','/news/after-rain-roof-leak-check-canberra']);
 expect(getBreadcrumbs('/services/roof-inspections').map(c=>c.path)).toEqual(['/','/services/roof-inspections']);
 expect(getBreadcrumbs('/case-studies/tile-roof-repair-canberra').map(c=>c.path)).toEqual(['/','/services/tile-roof-repairs','/case-studies/tile-roof-repair-canberra']);
});
it('keeps broad comparisons in the journal rather than claiming one service owns all work',()=>{
 expect(getBreadcrumbs('/news/roof-repair-vs-restoration-vs-replacement-canberra').map(c=>c.path)).toEqual(['/','/news','/news/roof-repair-vs-restoration-vs-replacement-canberra']);
});
it('emits Chinese ancestor URLs and identical localized visible/schema names in initial HTML',()=>{
 const path='/zh/news/when-to-arrange-roof-inspection-canberra';
 const template='<html lang="en-AU"><head><!--route-head--></head><body><!--document-route--><div id="root"><!--app-html--></div></body></html>';
 const html=renderPage(path,template);const host=document.createElement('div');host.innerHTML=html;
 const nav=host.querySelector('.breadcrumbs')!;
 expect(nav.getAttribute('aria-label')).toBe('面包屑导航');
 expect([...nav.querySelectorAll('a')].map(a=>a.getAttribute('href'))).toEqual(['https://www.canberraroofkind.com.au/zh/','https://www.canberraroofkind.com.au/zh/services/roof-inspections']);
 const schema=JSON.parse(host.querySelector('#breadcrumb-schema')!.textContent!);
 expect(schema.itemListElement.map((e:any)=>e.name)).toEqual([...nav.querySelectorAll('li')].map(li=>li.querySelector('a,[aria-current]')?.textContent));
 expect(nav.querySelector('[aria-current=page]')?.tagName).toBe('SPAN');
 expect(host.querySelectorAll('#breadcrumb-schema')).toHaveLength(1);
});
it('lists both inspection guides on their service and offers an immediate scoped enquiry from a guide',()=>{
 const owner=page('/services/roof-inspections');
 expect(owner.querySelector('a[href="/news/when-to-arrange-roof-inspection-canberra"]')).not.toBeNull();
 expect(owner.querySelector('a[href="/news/roof-leak-vs-condensation-canberra"]')).not.toBeNull();
 const guide=page('/news/after-rain-roof-leak-check-canberra');
 expect(guide.querySelector('.contentNextStep a[href="/services/roof-leak-repairs"]')).not.toBeNull();
 expect(guide.querySelector('.contentNextStep a[href="/contact?service=Roof%20Leak%20Repairs"]')).not.toBeNull();
 expect(owner.querySelector('.serviceHero a[href="/contact?service=Roof%20Inspections"]')).not.toBeNull();
});
it('covers every registered bilingual document with an acyclic same-language path and real indexable parents',()=>{
 const rows=[...getNavigationMap('en'),...getNavigationMap('zh')];const urls=new Map(rows.map(r=>[r.url,r]));
 expect(new Set(rows.map(r=>r.path))).toEqual(new Set(bilingualPagePaths));
 for(const row of rows){
  expect(urls.get(row.alternate_url!)?.alternate_url).toBe(row.url);
  const crumbs=getBreadcrumbs(row.path);
  if(row.page_type==='Homepage'){expect(crumbs).toHaveLength(0);expect(getRouteHead(row.path).breadcrumb).toBeNull();continue;}
  expect(crumbs.length).toBeGreaterThanOrEqual(2);expect(new Set(crumbs.map(c=>c.path)).size).toBe(crumbs.length);
  for(const crumb of crumbs.slice(0,-1)){const p=urls.get('https://www.canberraroofkind.com.au'+crumb.path)!;expect(p).toBeDefined();expect(p.locale).toBe(row.locale);expect(p.robots).toBe('index,follow');}
  const schema=getRouteHead(row.path).breadcrumb!;
  expect(schema.itemListElement.map(e=>e.item)).toEqual(crumbs.map(c=>'https://www.canberraroofkind.com.au'+c.path));
 }
});
it('keeps quoted Chinese labels as data rather than executable markup',()=>{
 const previous=getEditorialContent();const source='Roof Inspections';const label='屋顶检查 "范围" & </script><script>unsafe()</script>';
 setEditorialContent({...previous,entries:{...previous.entries,[copyId(source)]:{source,zh:label}}});
 try{
  const host=document.createElement('div');host.innerHTML=renderToStaticMarkup(<HeadMarkup pathname="/zh/services/roof-inspections"/>);
  const schema=JSON.parse(host.querySelector('#breadcrumb-schema')!.textContent!);
  expect(schema.itemListElement.at(-1).name).toBe(label);
  expect(host.querySelectorAll('script:not([type="application/ld+json"])')).toHaveLength(0);
 }finally{setEditorialContent(previous);}
});
it('does not invent breadcrumb nodes for unknown or private endpoints',()=>{
 for(const path of ['/404','/__editor/','/api/contact','/missing-service','/zh/missing-service'])expect(getBreadcrumbs(path)).toHaveLength(0);
});
it('does not expose unrelated page fields in the local editor when enumerating navigation',()=>{
 const editorPath='/navigation-test-editor-scope';configureLocale(editorPath,true);
 try{getNavigationMap('en');expect(getCatalog().filter(field=>field.pages.includes(editorPath))).toHaveLength(0);}finally{configureLocale('/');}
});
it('lets a district visitor choose a core service or enquiry before the long suburb table',()=>{
 const host=page('/areas/belconnen');const nav=host.querySelector('.districtEntryLinks')!;
 expect(nav).not.toBeNull();
 expect([...nav.querySelectorAll('a')].map(a=>a.getAttribute('href'))).toEqual(['/services/roof-leak-repairs','/services/roof-inspections','/services/roof-cleaning','#local-enquiry']);
 expect(nav.compareDocumentPosition(host.querySelector('.districtDirectory')!)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
