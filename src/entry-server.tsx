import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { AppV3 } from './main';
import { HeadMarkup, bilingualPagePaths as pagePaths } from './route-meta';
import { isDocumentRoute } from './document-route';
import { configureLocale, isChinese, getCatalog, setChineseTranslations } from './i18n/runtime';
import common from './i18n/zh-common.json';
import articles from './i18n/zh-articles.json';
import areas from './i18n/zh-areas.json';
import extra from './i18n/zh-common-extra.json';
import feedback from './i18n/zh-CN.json';
import remediation from './i18n/zh-remediation';
setChineseTranslations({...common,...articles,...areas,...extra,...feedback,...remediation});
export { getCatalog };

export { pagePaths };
export { getNavigationMap } from './navigation-map';
export function renderPage(pathname: string, template: string) {
  configureLocale(pathname);
  if (!isDocumentRoute(pathname)) throw new Error(`Cannot prerender an unregistered document route: ${pathname}`);
  const body = renderToString(<AppV3 pathname={pathname} />);
  const head = renderToStaticMarkup(<HeadMarkup pathname={pathname} />);
  if (!template.includes('<!--route-head-->') || !template.includes('<!--app-html-->') || !template.includes('<!--document-route-->')) throw new Error('Missing prerender template placeholders');
  return template.replace('lang="en-AU"', isChinese(pathname) ? 'lang="zh-CN"' : 'lang="en-AU"').replace('<!--document-route-->', () => pathname).replace('<!--route-head-->', () => head).replace('<!--app-html-->', () => body);
}
