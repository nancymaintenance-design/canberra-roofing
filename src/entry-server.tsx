import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { AppV3 } from './main';
import { HeadMarkup, pagePaths } from './route-meta';
import { isDocumentRoute } from './document-route';

export { pagePaths };
export function renderPage(pathname: string, template: string) {
  if (!isDocumentRoute(pathname)) throw new Error(`Cannot prerender an unregistered document route: ${pathname}`);
  const body = renderToString(<AppV3 pathname={pathname} />);
  const head = renderToStaticMarkup(<HeadMarkup pathname={pathname} />);
  if (!template.includes('<!--route-head-->') || !template.includes('<!--app-html-->') || !template.includes('<!--document-route-->')) throw new Error('Missing prerender template placeholders');
  return template.replace('<!--document-route-->', () => pathname).replace('<!--route-head-->', () => head).replace('<!--app-html-->', () => body);
}
