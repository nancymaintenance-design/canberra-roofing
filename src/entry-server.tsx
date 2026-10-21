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

const chineseNoScript = '<noscript><nav class="noScriptNav" aria-label="无需 JavaScript 的导航"><a href="/zh/">首页</a><a href="/zh/about">关于我们</a><a href="/zh/services">服务项目</a><a href="/zh/areas">服务区域</a><a href="/zh/news">资讯</a><a href="/zh/faq">常见问题</a><a href="/zh/contact">联系我们</a></nav><p class="noScriptNotice">在线咨询表单需要 JavaScript。请启用 JavaScript 或<a href="tel:0405878406">致电 0405878406</a>。</p></noscript>';

export function renderPage(pathname: string, template: string) {
  configureLocale(pathname);
  if (!isDocumentRoute(pathname)) throw new Error(`Cannot prerender an unregistered document route: ${pathname}`);
  const body = renderToString(<AppV3 pathname={pathname} />);
  const head = renderToStaticMarkup(<HeadMarkup pathname={pathname} />);
  if (!template.includes('<!--route-head-->') || !template.includes('<!--app-html-->') || !template.includes('<!--document-route-->')) throw new Error('Missing prerender template placeholders');
  const localizedTemplate = isChinese(pathname) ? template.replace(/<noscript>[\s\S]*?<\/noscript>/, () => chineseNoScript) : template;
  return localizedTemplate.replace('lang="en-AU"', isChinese(pathname) ? 'lang="zh-CN"' : 'lang="en-AU"').replace('<!--document-route-->', () => pathname).replace('<!--route-head-->', () => head).replace('<!--app-html-->', () => body);
}
