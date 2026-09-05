import React, { useEffect } from 'react';
import registry from './route-meta.json';

export const publishedRoutes = registry;
export const pagePaths = Object.keys(publishedRoutes);

export function resolvePath(pathname: string) {
  if (pathname === '/insights' || pathname === '/insights/') return '/faq';
  if (pathname === '/index.html' || pathname === '/index.html/') return '/';
  const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const clean = path.endsWith('.html') ? path.slice(0, -5) : path;
  // Static previews may expose published HTML before an edge redirect runs.
  // Resolve only known aliases so hydration and head metadata match that HTML;
  // leave unknown paths intact, including extra slashes and missing pages.
  return clean !== '/' && Object.hasOwn(publishedRoutes, clean) ? clean : pathname;
}

export function getRouteHead(pathname: string) {
  const path = resolvePath(pathname);
  const route = publishedRoutes[path as keyof typeof publishedRoutes];
  if (!route) return { title: 'Page not found | Canberra Roof Kind', description: 'This page could not be found. Browse roof enquiry services or contact Ellis Services Group.', canonical: null, robots: 'noindex,follow', article: null };
  return {
    title: route.title,
    description: route.description,
    canonical: route.canonical,
    robots: null,
    article: path.startsWith('/news/') ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: route.h1,
      description: route.description,
      mainEntityOfPage: route.canonical,
      publisher: { '@type': 'Organization', name: 'Ellis Services Group' },
    } : null,
  };
}

export function HeadMarkup({ pathname }: { pathname: string }) {
  const head = getRouteHead(pathname);
  return <>
    <title>{head.title}</title>
    <meta name="description" content={head.description} />
    {head.canonical && <link rel="canonical" href={head.canonical} />}
    {head.robots && <meta name="robots" content={head.robots} />}
    {head.article && <script id="news-article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(head.article).replace(/</g, '\\u003c') }} />}
  </>;
}

// The same metadata source owns server output and all client route changes.
// Reuse the server elements and remove duplicates or stale article/noindex data.
export function HeadManager({ pathname }: { pathname: string }) {
  useEffect(() => {
    const head = getRouteHead(pathname);
    const update = (selector: string, tag: string, attributes: Record<string, string>, text?: string) => {
      const [existing, ...duplicates] = Array.from(document.head.querySelectorAll(selector));
      duplicates.forEach((element) => element.remove());
      const element = existing ?? document.head.appendChild(document.createElement(tag));
      for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
      if (text !== undefined) element.textContent = text;
    };
    update('title', 'title', {}, head.title);
    update('meta[name="description"]', 'meta', { name: 'description', content: head.description });
    if (head.canonical) update('link[rel="canonical"]', 'link', { rel: 'canonical', href: head.canonical });
    else document.head.querySelectorAll('link[rel="canonical"]').forEach((element) => element.remove());
    if (head.robots) update('meta[name="robots"]', 'meta', { name: 'robots', content: head.robots });
    else document.head.querySelectorAll('meta[name="robots"]').forEach((element) => element.remove());
    if (head.article) update('#news-article-schema', 'script', { id: 'news-article-schema', type: 'application/ld+json' }, JSON.stringify(head.article));
    else document.head.querySelectorAll('#news-article-schema').forEach((element) => element.remove());
  }, [pathname]);
  return null;
}
