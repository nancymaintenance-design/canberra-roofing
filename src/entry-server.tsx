import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { AppV3 } from './main';
import { HeadMarkup, pagePaths } from './route-meta';

export { pagePaths };
export function renderPage(pathname: string, template: string) {
  const body = renderToString(<AppV3 pathname={pathname} />);
  const head = renderToStaticMarkup(<HeadMarkup pathname={pathname} />);
  if (!template.includes('<!--route-head-->') || !template.includes('<!--app-html-->')) throw new Error('Missing prerender template placeholders');
  return template.replace('<!--route-head-->', () => head).replace('<!--app-html-->', () => body);
}
