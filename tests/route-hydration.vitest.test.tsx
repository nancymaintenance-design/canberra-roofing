// @vitest-environment jsdom
import React, { act } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { AppV3 } from '../src/main';
import { HeadMarkup, getRouteHead, resolvePath } from '../src/route-meta';
import routes from './fixtures/seo-routes.json';

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
