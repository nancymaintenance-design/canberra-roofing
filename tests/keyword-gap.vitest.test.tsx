// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { publishedRoutes, getRouteHead } from '../src/route-meta';

const additions = [
  '/services/gutter-repairs',
  '/news/roof-repair-cost-canberra',
  '/news/roof-repointing-cost-canberra',
  '/news/roof-cleaning-methods-canberra',
  '/news/gutters-overflowing-heavy-rain-canberra',
  '/news/roof-leak-vs-condensation-canberra',
  '/news/roof-repair-vs-restoration-vs-replacement-canberra',
];
const renderPage = (path: string) => {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host;
};

describe('approved keyword-gap routes and content navigation', () => {
  it.each(additions)('renders %s as a discoverable page rather than a not-found response', path => {
    const host = renderPage(path);
    expect(host.querySelector('main h1')?.textContent).not.toBe('Page not found');
    expect(getRouteHead(path).canonical).toBe('https://www.canberraroofkind.com.au' + path);
    expect(getRouteHead(path).robots ?? '').not.toContain('noindex');
    expect(host.querySelector('main a[href="/services"]')).not.toBeNull();
    expect(host.querySelector('main a[href^="/contact"]')).not.toBeNull();
  });

  it('keeps cleaning and repair as different, mutually navigable gutter services', () => {
    const cleaning = renderPage('/services/gutter-downpipe-maintenance');
    const repair = renderPage('/services/gutter-repairs');
    expect(cleaning.querySelector('main a[href="/services/gutter-repairs"]')).not.toBeNull();
    expect(repair.querySelector('main a[href="/services/gutter-downpipe-maintenance"]')).not.toBeNull();
    expect(repair.querySelectorAll('.pageFaq details').length).toBeGreaterThanOrEqual(3);
    expect(renderPage('/services').querySelector('main a[href="/services/gutter-repairs"]')).not.toBeNull();
    expect(renderPage('/contact').querySelector('option[value="Gutter Repairs"]')).not.toBeNull();
  });

  it.each(additions.slice(1))('provides usable contents, answers and source attribution on %s', path => {
    const host = renderPage(path);
    const toc = host.querySelector('nav[aria-label="On this page"]');
    expect(toc).not.toBeNull();
    for (const link of toc!.querySelectorAll('a')) {
      expect(host.querySelector(link.getAttribute('href')!)).not.toBeNull();
    }
    expect(host.querySelectorAll('.articleBody h2').length).toBeGreaterThanOrEqual(6);
    expect(host.querySelectorAll('.articleBody details').length).toBeGreaterThanOrEqual(2);
    expect(host.querySelector('time[datetime="2026-10-12"]')).not.toBeNull();
    expect(host.querySelector('.articleByline')?.textContent).toContain('Ellis Services Group');
  });

  it('gives each addition at least three incoming main-content links from published pages', () => {
    const incoming = new Map(additions.map(path => [path, new Set<string>()]));
    for (const path of Object.keys(publishedRoutes)) {
      for (const link of renderPage(path).querySelectorAll('main a[href^="/"]')) {
        const target = link.getAttribute('href')!.split(/[?#]/)[0];
        if (target !== path) incoming.get(target)?.add(path);
      }
    }
    for (const [path, sources] of incoming) expect(sources.size, path).toBeGreaterThanOrEqual(3);
  }, 20000);

  it('connects material and moisture guidance to primary sources without tracking links', () => {
    expect(renderPage('/news/roof-cleaning-methods-canberra').querySelector('.articleBody a[href^="https://colorbond.com/"]')).not.toBeNull();
    expect(renderPage('/news/roof-leak-vs-condensation-canberra').querySelector('.articleBody a[href="https://www.yourhome.gov.au/passive-design/condensation"]')).not.toBeNull();
  });
});
