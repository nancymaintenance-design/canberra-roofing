// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { getRouteHead, publishedRoutes } from '../src/route-meta';
import { NEWS_ARTICLES } from '../src/news-articles';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

function page(path: string) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host;
}
it('gives the News hero and all twelve article covers distinct image content', () => {
  const host = page('/news');
  const images = [...host.querySelectorAll<HTMLImageElement>('.newsIndexHeader img, .newsCard img')];
  expect(images).toHaveLength(13);
  const sources = images.map(image => image.getAttribute('src')!);
  expect(new Set(sources).size).toBe(13);
  const hashes = sources.map(src => createHash('sha256').update(readFileSync(new URL('../public' + src, import.meta.url))).digest('hex'));
  expect(new Set(hashes).size).toBe(13);
});
it('uses the verified current manufacturer pointing references instead of retired media links', () => {
  const product = 'https://www.selleys.com.au/products/glues-adhesives/construction-adhesives/point-works/';
  const detail = 'https://www.csrassetlibrary.com/celum/87064_yConnect_Document_250813-Ridge%20and%20Hip%20Capping%20Details.pdf';
  for (const slug of ['rebedding-vs-repointing-canberra-roofs', 'roof-repair-cost-canberra', 'roof-repointing-cost-canberra']) {
    const host = page('/news/' + slug);
    expect(host.querySelector(`.articleSources a[href="${product}"]`)).not.toBeNull();
    expect(host.querySelector(`.articleSources a[href="${detail}"]`)).not.toBeNull();
  }
  // Deliberately offline: live GET status and source excerpts are recorded in the editorial report.
  for (const article of NEWS_ARTICLES) for (const source of article.sources) {
    expect(source.url).not.toMatch(/monier\.com\.au\/(?:-|~)\/media\//i);
    expect(source.url).not.toContain('flexible-pointing-technical-data-sheet-v05fp');
  }
});
it('presents twelve illustrated reading choices without service CTAs', () => {
  const host = page('/news');
  expect(host.querySelectorAll('.newsCard')).toHaveLength(12);
  expect(host.querySelectorAll('.newsCard img')).toHaveLength(12);
  expect(host.querySelectorAll('.newsCard a[href^="/news/"]')).toHaveLength(12);
  expect(host.querySelectorAll('.newsCard a[href^="/services/"]')).toHaveLength(0);
});
it.each(Object.keys(publishedRoutes).filter(p => p.startsWith('/news/')))('makes %s a coherent sourced article', path => {
  const host = page(path);
  const sections = host.querySelectorAll('.articleSection');
  expect(sections.length).toBeGreaterThanOrEqual(3);
  expect(sections.length).toBeLessThanOrEqual(4);
  for (const section of sections) {
    expect(section.querySelectorAll('p').length).toBeGreaterThanOrEqual(3);
    expect(section.textContent!.split(/\s+/).length).toBeGreaterThan(110);
  }
  expect(host.querySelector('.articleLead')!.textContent!.length).toBeGreaterThan(160);
  expect(host.querySelector('main h1')!.textContent).not.toContain('Canberra');
  expect(host.querySelector('.articleSidebar')).toBeNull();
  expect(host.querySelectorAll('.articleRelated a[href^="/news/"]').length).toBeGreaterThanOrEqual(2);
  expect(host.querySelector(`.articleRelated a[href="${path}"]`)).toBeNull();
  expect(host.querySelectorAll('.articleSources a[href^="https://"]').length).toBeGreaterThanOrEqual(1);
  const expectedServices=path==='/news/roof-repair-cost-canberra'?['/services/roof-leak-repairs','/services/roof-inspections']:path==='/news/roof-repair-vs-restoration-vs-replacement-canberra'?['/services/roof-inspections','/services/roof-renovation','/services/reroof-replacement']:[NEWS_ARTICLES.find(a=>'/news/'+a.slug===path)!.servicePath];
  expect([...host.querySelectorAll('.contentNextStep a[href^="/services/"]')].map(a=>a.getAttribute('href'))).toEqual(expectedServices);
  expect(host.querySelectorAll('.contentNextStep a[href^="/contact"]')).toHaveLength(1);
  expect(host.querySelector('time')!.getAttribute('datetime')).toBe('2026-10-14');
  const head = getRouteHead(path);
  expect(head.article!.headline).toBe(host.querySelector('main h1')!.textContent);
  expect(head.article!.dateModified).toBe('2026-10-14');
  expect(head.canonical).toBe('https://www.canberraroofkind.com.au' + path);
});
