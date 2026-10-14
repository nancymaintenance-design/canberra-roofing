// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { HeadManager, HeadMarkup, getRouteHead, pagePaths } from '../src/route-meta';
import { getArticleEditorial } from '../src/article-editorial';
import { readFileSync } from 'node:fs';
import imageManifest from '../src/image-manifest.json';
afterEach(cleanup);
it('gives all 42 indexable nonhome pages visible matching breadcrumbs', () => {
 const eligible = pagePaths.filter(p => p !== '/' && !getRouteHead(p).robots);
 expect(eligible).toHaveLength(42);
 for (const p of eligible) {
  const host = document.createElement('div'); host.innerHTML = renderToStaticMarkup(<AppV3 pathname={p}/>);
  const nav = host.querySelector('nav[aria-label="Breadcrumb"]')!;
  expect(nav, p).not.toBeNull();
  const schema = getRouteHead(p).breadcrumb!;
  expect(Array.from(nav.querySelectorAll('li')).map(n => n.textContent)).toEqual(schema.itemListElement.map(n => n.name));
  expect(nav.querySelector('[aria-current="page"]')?.tagName).toBe('SPAN');
  for (const a of nav.querySelectorAll('a')) expect(pagePaths).toContain(a.getAttribute('href'));
 }
});
it('adds twelve truthful Article and twelve Service entities', () => {
 expect(pagePaths.filter(p => getRouteHead(p).service)).toHaveLength(12);
 const articles = pagePaths.filter(p => getRouteHead(p).article); expect(articles).toHaveLength(12);
 for(const p of articles) {
  const a = getRouteHead(p).article!; const editorial = getArticleEditorial(p.split('/').pop()!)!;
  expect(a.author.name).toBe(editorial.author.name); expect(a.author.url).toBe('https://www.canberraroofkind.com.au/about');
  expect(a.dateModified).toBe(editorial.dateModified); expect(a).not.toHaveProperty('datePublished');
  expect(a.image).toMatch(/^https:\/\/www.canberraroofkind.com.au\/assets\/responsive\/.+\.webp\?v=[a-f0-9]+$/);
  expect((imageManifest as Record<string, { variants: { src: string }[] }>)[editorial.image.src].variants.map(v => new URL(v.src, 'https://www.canberraroofkind.com.au').href)).toContain(a.image);
  expect(a.publisher['@id']).toBe('https://www.canberraroofkind.com.au/#organization');
 }
});
it('preserves discovery totals, real providers and confirmed profiles without invented claims', () => {
 expect(pagePaths).toHaveLength(120);
 expect(pagePaths.filter(p => getRouteHead(p).robots === 'noindex,follow')).toHaveLength(77);
 expect((readFileSync('public/sitemap.xml','utf8').match(/<loc>/g) ?? [])).toHaveLength(42);
 const html = readFileSync('index.html','utf8');
 const entity = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1]);
 expect(entity.sameAs).toEqual(['https://www.instagram.com/elliservices_group/','https://www.facebook.com/p/Ellis-Services-Group-100082926022259/']);
 expect(entity.openingHours).toBe('Mo-Su 09:00-21:00');
 for (const p of pagePaths) {
  const head = getRouteHead(p);
  if(head.service) {
   expect(head.service.provider['@id']).toBe(entity['@id']);
   expect(head.service.areaServed).toEqual({'@type':'City',name:'Canberra'});
   expect(head).toEqual(getRouteHead(p + '.html/'));
  }
  expect(JSON.stringify(head)).not.toMatch(/aggregateRating|ratingValue|datePublished|HowTo|FAQPage|GeoCoordinates/);
 }
});
it('keeps static and client schemas in sync and clears stale schemas on navigation and 404', () => {
 const suburb = '/areas/belconnen/aranda-roof-repairs';
 const paths = ['/news/roof-repair-cost-canberra', '/services/roof-leak-repairs.html/', '/about', suburb, '/missing', '/'];
 const view = render(<HeadManager pathname={paths[0]}/>);
 for(const p of paths) {
  view.rerender(<HeadManager pathname={p}/>);
  const host = document.createElement('div'); host.innerHTML = renderToStaticMarkup(<HeadMarkup pathname={p}/>);
  for(const id of ['news-article-schema','service-schema','breadcrumb-schema','service-area-schema']) expect(document.head.querySelector('#'+id)?.textContent ?? null).toBe(host.querySelector('#'+id)?.textContent ?? null);
  if (p === suburb) {
   const area = document.head.querySelector('#service-area-schema');
   expect(area).not.toBeNull();
   expect(JSON.parse(area!.textContent!).url).toBe('https://www.canberraroofkind.com.au/areas/belconnen/aranda-roof-repairs');
   expect(document.head.querySelector('#breadcrumb-schema')).not.toBeNull();
   expect(document.head.querySelector('#news-article-schema')).toBeNull();
   expect(document.head.querySelector('#service-schema')).toBeNull();
   expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex,follow');
   expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://www.canberraroofkind.com.au/areas/belconnen/aranda-roof-repairs');
  }
  if (p === '/missing' || p === '/') {
   for (const id of ['news-article-schema', 'service-schema', 'breadcrumb-schema', 'service-area-schema']) expect(document.head.querySelector('#' + id)).toBeNull();
   expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null).toBe(p === '/missing' ? 'noindex,follow' : null);
   expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null).toBe(p === '/missing' ? null : 'https://www.canberraroofkind.com.au/');
  }
 }
});
it('uses confirmed Facebook with all four existing social destinations', () => {
 const host = document.createElement('div'); host.innerHTML = renderToStaticMarkup(<AppV3/>);
 const links = host.querySelectorAll('.footerSocialLinks a'); expect(links).toHaveLength(4);
 expect(Array.from(links).map(a => a.getAttribute('href'))).toEqual(['https://share.google/y50AZRJwjOdVOlj5o','https://www.instagram.com/elliservices_group/','https://share.google/Z4tImXHToPi9H4LmH','https://www.facebook.com/p/Ellis-Services-Group-100082926022259/']);
});
