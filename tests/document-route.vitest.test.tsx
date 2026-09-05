// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { afterEach, expect, it } from 'vitest';
import { renderPage } from '../src/entry-server';
import { getDocumentRoute } from '../src/document-route';
import routes from './fixtures/seo-routes.json';

const template = readFileSync('index.html', 'utf8');
afterEach(() => document.documentElement.removeAttribute('data-route'));

for (const route of [...routes, { pathname: '/404', h1: 'Page not found' }]) {
  it(`shared prerender identifies the actual ${route.pathname} document`, () => {
    const output = new DOMParser().parseFromString(renderPage(route.pathname, template), 'text/html');
    expect(output.documentElement.getAttribute('data-route')).toBe(route.pathname);
    expect(output.querySelector('main h1')?.textContent).toBe(route.h1);
    expect(output.querySelector('head link[rel="canonical"]')?.getAttribute('href') ?? null)
      .toBe(route.pathname === '/404' ? null : `https://www.canberraroofkind.com.au${route.pathname}`);
  });
}

it.each(['/%61bout', '/services/r%6fof-leak-repairs', '/about%2ehtml', '/about.html', '/about/', '/about//', '/unknown', '/%25', '/%252f', '/about" onload="alert(1)'])
  ('prerender refuses unregistered document identity %s', pathname => {
    expect(() => renderPage(pathname, template)).toThrow(/unregistered document route/);
  });

it('prerender refuses a template without its document marker slot', () => {
  expect(() => renderPage('/about', template.replace('<!--document-route-->', ''))).toThrow(/placeholder/);
});

it.each([null, '', '<!--document-route-->', '/%61bout', '/about.html', '/unknown', '/about//'])
  ('invalid or absent document marker %s cannot upgrade 404 using the browser URL', marker => {
    window.history.replaceState(null, '', '/%61bout?route=/about#data-route=/about');
    if (marker !== null) document.documentElement.setAttribute('data-route', marker);
    expect(getDocumentRoute()).toBe('/404');
  });

it.each(['/about', '/404', '/contact'])('registered marker %s takes precedence over request text', marker => {
  document.documentElement.setAttribute('data-route', marker);
  window.history.replaceState(null, '', '/services/r%6fof-leak-repairs');
  expect(getDocumentRoute()).toBe(marker);
});
