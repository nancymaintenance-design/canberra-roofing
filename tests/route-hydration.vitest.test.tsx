// @vitest-environment jsdom
import React, { act } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { AppV3 } from '../src/main';
import { HeadMarkup, getRouteHead, resolvePath } from '../src/route-meta';
import { getDocumentRoute } from '../src/document-route';
import routes from './fixtures/seo-routes.json';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

for (const route of routes) {
  const aliases = route.pathname === '/' ? ['/index.html', '/index.html/'] : [`${route.pathname}.html`, `${route.pathname}/`, `${route.pathname}.html/`];
  for (const alias of aliases) {
    it(`hydrates prerendered ${route.pathname} at ${alias} without losing content or canonical`, async () => {
      localStorage.clear();
      document.head.innerHTML = renderToStaticMarkup(<HeadMarkup pathname={route.pathname} />);
      document.body.innerHTML = `<div id="root">${renderToString(<AppV3 pathname={route.pathname} />)}</div>`;
      const before = document.querySelector('main')!.textContent;
      const recoverable: unknown[] = [];
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      let root: ReturnType<typeof hydrateRoot>;
      try {
        await act(async () => { root = hydrateRoot(document.getElementById('root')!, <AppV3 pathname={alias} />, { onRecoverableError: error => recoverable.push(error) }); });
        expect(document.querySelector('main')!.textContent).toBe(before);
        expect(document.querySelectorAll('head link[rel="canonical"]')).toHaveLength(1);
        expect(document.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(`https://www.canberraroofkind.com.au${route.pathname}`);
        expect(document.title).toBe(route.title);
        expect(recoverable).toEqual([]);
        expect(consoleError.mock.calls.filter(call => /hydrat|#418|didn't match/i.test(call.join(' ')))).toEqual([]);
      } finally {
        await act(async () => root?.unmount());
        consoleError.mockRestore();
      }
    });
  }
}

it.each(['/missing', '/missing/', '/missing.html', '/missing.html/', '/about//', '/about.html//', '/wrong/about.html', '/index', '/insights.html'])('does not normalize unknown path %s into a published page', pathname => {
  expect(resolvePath(pathname)).toBe(pathname);
  expect(getRouteHead(pathname).canonical).toBeNull();
  expect(renderToString(<AppV3 pathname={pathname} />)).toContain('<h1>Page not found</h1>');
});

it.each([
  ['/%61bout', '/about'],
  ['/services/r%6fof-leak-repairs', '/services/roof-leak-repairs'],
])('hydrates prerendered %s from a single safely encoded published path', async (pathname, canonicalPath) => {
  const route = routes.find(candidate => candidate.pathname === canonicalPath)!;
  document.head.innerHTML = renderToStaticMarkup(<HeadMarkup pathname={canonicalPath} />);
  document.body.innerHTML = `<div id="root">${renderToString(<AppV3 pathname={canonicalPath} />)}</div>`;
  const before = document.querySelector('main')!.textContent;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot>;
  try {
    await act(async () => { root = hydrateRoot(document.getElementById('root')!, <AppV3 pathname={pathname} />); });
    expect(resolvePath(pathname)).toBe(canonicalPath);
    expect(document.querySelector('main')!.textContent).toBe(before);
    expect(document.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(`https://www.canberraroofkind.com.au${canonicalPath}`);
    expect(document.title).toBe(route.title);
    expect(errors.mock.calls.filter(call => /hydrat|#418|didn't match/i.test(call.join(' ')))).toEqual([]);
  } finally {
    await act(async () => root?.unmount());
    errors.mockRestore();
  }
});

it.each(['/services%2Froof-leak-repairs', '/services%2froof-leak-repairs', '/services%5croof-leak-repairs', '/%2e%2e/about', '/%252e%252e%252fabout', '/%2561bout', '/about%2ehtml', '/unknown%2dpath', '/about%ZZ'])('does not decode unsafe, double-encoded, malformed, or unknown path %s into a published page', pathname => {
  expect(resolvePath(pathname)).toBe(pathname);
  expect(getRouteHead(pathname).canonical).toBeNull();
  expect(renderToString(<AppV3 pathname={pathname} />)).toContain('<h1>Page not found</h1>');
});

it.each(['/%61bout', '/services/r%6fof-leak-repairs', '/services%2froof-leak-repairs', '/services%5croof-leak-repairs', '/%25', '/%2561bout', '/%252e%252e%252fabout', '/unknown', '/about//'])('uses the server-rendered 404 marker for the edge 404 at %s', async pathname => {
  window.history.replaceState(null, '', pathname);
  document.documentElement.dataset.route = '/404';
  document.head.innerHTML = renderToStaticMarkup(<HeadMarkup pathname="/404" />);
  document.body.innerHTML = `<div id="root">${renderToString(<AppV3 pathname="/404" />)}</div>`;
  const before = document.querySelector('main')!.textContent;
  const recoverable: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot>;
  try {
    await act(async () => { root = hydrateRoot(document.getElementById('root')!, <AppV3 pathname={getDocumentRoute()} />, { onRecoverableError: error => recoverable.push(error) }); });
    expect(getDocumentRoute()).toBe('/404');
    expect(document.querySelector('main')!.textContent).toBe(before);
    expect(document.querySelector('main h1')!.textContent).toBe('Page not found');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(recoverable).toEqual([]);
  } finally {
    await act(async () => root?.unmount());
    delete document.documentElement.dataset.route;
  }
});

it('uses the server-rendered About marker when Vercel resolves encoded dot HTML to about.html', async () => {
  window.history.replaceState(null, '', '/about%2ehtml');
  document.documentElement.dataset.route = '/about';
  document.head.innerHTML = renderToStaticMarkup(<HeadMarkup pathname="/about" />);
  document.body.innerHTML = `<div id="root">${renderToString(<AppV3 pathname="/about" />)}</div>`;
  const before = document.querySelector('main')!.textContent;
  const recoverable: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot>;
  try {
    await act(async () => { root = hydrateRoot(document.getElementById('root')!, <AppV3 pathname={getDocumentRoute()} />, { onRecoverableError: error => recoverable.push(error) }); });
    expect(getDocumentRoute()).toBe('/about');
    expect(document.querySelector('main')!.textContent).toBe(before);
    expect(document.querySelector('main h1')!.textContent).toBe('Your home is precious. Its care deserves to be taken seriously.');
    expect(document.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://www.canberraroofkind.com.au/about');
    expect(recoverable).toEqual([]);
  } finally {
    await act(async () => root?.unmount());
    delete document.documentElement.dataset.route;
  }
});
