// @vitest-environment jsdom
import React from 'react';
import { expectedRevision } from './article-revisions';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { DISTRICT_PROFILES } from '../src/suburb-profiles.js';
import { getArticleEditorial } from '../src/article-editorial';
import { publishedRoutes } from '../src/route-meta';
import { readFileSync } from 'node:fs';

function page(path: string) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host;
}
it.each(['roof-repair-cost-canberra', 'roof-repair-vs-restoration-vs-replacement-canberra', 'rebedding-vs-repointing-canberra-roofs'])('keeps %s as continuous explanatory prose', slug => {
  const host = page('/news/' + slug);
  expect(host.querySelectorAll('.articleSection')).toHaveLength(4);
  expect(host.querySelector('.guideComparison')).toBeNull();
  expect(host.querySelector('.articleSidebar')).toBeNull();
});
it.each(DISTRICT_PROFILES)('makes $district a directory with exact suburb booking selections', profile => {
  const host = page(profile.path);
  const directory = host.querySelector('.districtDirectory')!;
  expect(directory).not.toBeNull();
  expect(host.querySelector('.serviceCard')).toBeNull();
  expect(directory.querySelectorAll('tbody tr')).toHaveLength(profile.suburbs.length);
  for (const suburb of profile.suburbs) {
    const link = [...directory.querySelectorAll('a')].find(a => a.textContent === `Enquire for ${suburb}`)!;
    expect(new URL(link.href).searchParams.get('area')).toBe(`${suburb} — ${profile.district}`);
  }
  expect(host.querySelector('.districtDirectory')!.compareDocumentPosition(host.querySelector('.districtServiceChoices')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
it('dates every materially rewritten article accurately', () => {
  for (const path of Object.keys(publishedRoutes).filter(path => path.startsWith('/news/'))) {
    const host = page(path);
    expect(host.querySelector('time')?.getAttribute('datetime')).toBe(expectedRevision(path));
    expect(host.querySelector('time')?.textContent).toBe(expectedRevision(path)==='2026-10-21'?'21 October 2026':'14 October 2026');
    expect(host.querySelectorAll('.articleRelated a').length).toBeGreaterThanOrEqual(2);
  }
});
it('hands schema consumers the same visible author, revision date and image for all twelve guides', () => {
  for (const path of Object.keys(publishedRoutes).filter(path => path.startsWith('/news/'))) {
    const host = page(path);
    const editorial = getArticleEditorial(path.slice('/news/'.length))!;
    expect(editorial).not.toBeNull();
    expect(host.querySelector('time')?.getAttribute('datetime')).toBe(editorial.dateModified);
    expect(host.querySelector('.articleByline a')?.textContent).toBe(editorial.author.name);
    expect(host.querySelector('.articleByline a')?.getAttribute('href')).toBe(editorial.author.url);
    expect(host.querySelector('.articleLeadImage img')?.getAttribute('alt')).toBe(editorial.image.alt);
    expect(editorial).not.toHaveProperty('datePublished');
  }
  expect(getArticleEditorial('unknown-guide')).toBeNull();
});
it.each(['emergency-roof-repairs', 'rental-property-roof-repairs', 'gutter-downpipe-maintenance'])('organises confirmed project scope and booking on %s', slug => {
  const gallery = page('/services/' + slug).querySelector('.serviceProjectGallery')!;
  expect(gallery.querySelector('.projectWorkNotes dt')?.textContent).toBe('Roof concern');
  expect(gallery.querySelector('.projectWorkNotes')?.textContent).toContain('Work carried out');
  expect(gallery.querySelector('a[href^="/contact?service="]')).not.toBeNull();
});
