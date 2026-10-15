import React, { useEffect } from 'react';
import registry from './route-meta.json';
import { getArticleEditorial } from './article-editorial';
import imageManifest from './image-manifest.json';
import { SERVICE_CATALOG } from './service-catalog.js';
import { DISTRICT_PROFILES, SUBURB_PROFILES, getSuburbProfile } from './suburb-profiles.js';
import { getSocialImage } from './social-images';

const districtRoutes = Object.fromEntries(DISTRICT_PROFILES.map((profile) => [profile.path, profile]));
const suburbRoutes = Object.fromEntries(SUBURB_PROFILES.map((profile) => [profile.path, profile]));
export const publishedRoutes = { ...registry, ...districtRoutes, ...suburbRoutes };
export const pagePaths = Object.keys(publishedRoutes);
const organizationId = 'https://www.canberraroofkind.com.au/#organization';
const origin = 'https://www.canberraroofkind.com.au';
const absolute = (path: string) => new URL(path, origin).href;
const breadcrumbLabels: Record<string, string> = { '/about': 'About', '/services': 'Services', '/solutions': 'Solutions', '/areas': 'Service areas', '/news': 'Roof repair guides', '/faq': 'FAQs', '/contact': 'Contact', '/privacy': 'Privacy policy' };

export function getBreadcrumbs(pathname: string): { path: string; name: string }[] {
  const path = resolvePath(pathname);
  const route = publishedRoutes[path as keyof typeof publishedRoutes] as any;
  if (!route || path === '/') return [];
  const parents: string[] = [];
  if (path.startsWith('/news/')) parents.push('/news');
  else if (path.startsWith('/services/')) parents.push('/services');
  else if (path.startsWith('/areas/')) {
    parents.push('/areas');
    const districtPath = path.split('/').slice(0, 3).join('/');
    if (districtPath !== path && Object.hasOwn(publishedRoutes, districtPath)) parents.push(districtPath);
  }
  return ['/', ...parents, path].map(p => ({ path: p, name: p === '/' ? 'Home' : breadcrumbLabels[p] ?? (publishedRoutes[p as keyof typeof publishedRoutes] as any).h1 }));
}

export function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs = getBreadcrumbs(pathname);
  if (!crumbs.length) return null;
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{crumbs.map((crumb, index) => <li key={crumb.path}>{index === crumbs.length - 1 ? <span aria-current="page">{crumb.name}</span> : <a href={crumb.path}>{crumb.name}</a>}</li>)}</ol></nav>;
}

// Match the acceptance server: never turn encoded separators, percent signs or
// dot segments into route syntax. That prevents a second decode or traversal.
const unsafeEncodedPath = /%(?:2f|5c|25|2e)/i;

export function resolvePath(pathname: string) {
  if (pathname.includes('//') || unsafeEncodedPath.test(pathname)) return pathname;
  let decoded: string;
  try { decoded = decodeURIComponent(pathname); } catch { return pathname; }
  if (decoded === '/insights' || decoded === '/insights/') return '/faq';
  if (decoded === '/index.html' || decoded === '/index.html/') return '/';
  const path = decoded.endsWith('/') ? decoded.slice(0, -1) : decoded;
  const clean = path.endsWith('.html') ? path.slice(0, -5) : path;
  // Static previews may expose published HTML before an edge redirect runs.
  // Resolve only known aliases so hydration and head metadata match that HTML;
  // leave unknown paths intact, including extra slashes and missing pages.
  return clean !== '/' && Object.hasOwn(publishedRoutes, clean) ? clean : pathname;
}

export function getRouteHead(pathname: string) {
  const path = resolvePath(pathname);
  const route = publishedRoutes[path as keyof typeof publishedRoutes] as any;
  if (!route) return { title: 'Page not found | Canberra Roof Kind', description: 'This page could not be found. Browse roof repair services or contact Ellis Services Group.', canonical: null, robots: 'noindex,follow', article: null, breadcrumb: null, service: null, serviceAreaSchema: null, socialImage: null };
  const editorial = path.startsWith('/news/') ? getArticleEditorial(path.slice(6)) : null;
  const image = editorial ? (imageManifest as Record<string, { variants: { src: string; width: number }[] }>)[editorial.image.src]?.variants : null;
  const service = SERVICE_CATALOG.find(item => item.path === path);
  const crumbs = getBreadcrumbs(path);
  return {
    title: route.title,
    description: route.description,
    canonical: route.canonical,
    socialImage: getSocialImage(path),
    robots: getSuburbProfile(path) ? 'noindex,follow' : null,
    breadcrumb: crumbs.length ? {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', '@id': route.canonical + '#breadcrumb',
      itemListElement: crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, name: crumb.name, item: absolute(crumb.path) })),
    } : null,
    service: service ? {
      '@context': 'https://schema.org', '@type': 'Service', '@id': route.canonical + '#service',
      name: service.title, description: route.description, url: route.canonical,
      provider: { '@id': organizationId }, areaServed: { '@type': 'City', name: 'Canberra' },
    } : null,
    article: editorial ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': route.canonical + '#article',
      headline: route.h1,
      description: route.description,
      mainEntityOfPage: route.canonical,
      author: { '@type': editorial.author.type, '@id': organizationId, name: editorial.author.name, url: absolute(editorial.author.url) },
      dateModified: editorial.dateModified,
      image: absolute(image?.slice().sort((a, b) => b.width - a.width)[0]?.src ?? editorial.image.src),
      publisher: { '@id': organizationId, '@type': 'Organization', name: 'Ellis Services Group' },
    } : null,
    serviceAreaSchema: getSuburbProfile(path) ? {
      '@context': 'https://schema.org', '@type': 'WebPage', name: route.h1,
      description: route.description, url: route.canonical,
      mainEntity: { '@type': 'Service', name: 'Roof repair services', provider: { '@id': organizationId, '@type': 'Organization', name: 'Ellis Services Group' } },
    } : null,
  };
}

export function HeadMarkup({ pathname }: { pathname: string }) {
  const head = getRouteHead(pathname);
  return <>
    <title>{head.title}</title>
    <meta name="description" content={head.description} />
    {head.canonical && <link rel="canonical" href={head.canonical} />}
    {head.canonical && <>
      <meta property="og:title" content={head.title} />
      <meta property="og:description" content={head.description} />
      <meta property="og:url" content={head.canonical} />
      <meta property="og:type" content={head.article ? 'article' : 'website'} />
      <meta property="og:image" content={head.socialImage!.url} />
      <meta property="og:image:width" content={String(head.socialImage!.width)} />
      <meta property="og:image:height" content={String(head.socialImage!.height)} />
      <meta property="og:image:type" content={head.socialImage!.type} />
      <meta property="og:image:alt" content={head.socialImage!.alt} />
      <meta name="twitter:card" content="summary" />
    </>}
    {head.robots && <meta name="robots" content={head.robots} />}
    {head.article && <script id="news-article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(head.article).replace(/</g, '\\u003c') }} />}
    {head.breadcrumb && <script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(head.breadcrumb).replace(/</g, '\\u003c') }} />}
    {head.service && <script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(head.service).replace(/</g, '\\u003c') }} />}
    {head.serviceAreaSchema && <script id="service-area-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(head.serviceAreaSchema).replace(/</g, '\\u003c') }} />}
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
    if (head.canonical) {
      update('link[rel="canonical"]', 'link', { rel: 'canonical', href: head.canonical });
      update('meta[property="og:title"]', 'meta', { property: 'og:title', content: head.title });
      update('meta[property="og:description"]', 'meta', { property: 'og:description', content: head.description });
      update('meta[property="og:url"]', 'meta', { property: 'og:url', content: head.canonical });
      update('meta[property="og:type"]', 'meta', { property: 'og:type', content: head.article ? 'article' : 'website' });
      for (const [property, content] of Object.entries({ 'og:image': head.socialImage!.url, 'og:image:width': String(head.socialImage!.width), 'og:image:height': String(head.socialImage!.height), 'og:image:type': head.socialImage!.type, 'og:image:alt': head.socialImage!.alt })) {
        update(`meta[property="${property}"]`, 'meta', { property, content });
      }
      update('meta[name="twitter:card"]', 'meta', { name: 'twitter:card', content: 'summary' });
    }
    else document.head.querySelectorAll('link[rel="canonical"], meta[property^="og:"], meta[name="twitter:card"]').forEach((element) => element.remove());
    if (head.robots) update('meta[name="robots"]', 'meta', { name: 'robots', content: head.robots });
    else document.head.querySelectorAll('meta[name="robots"]').forEach((element) => element.remove());
    if (head.article) update('#news-article-schema', 'script', { id: 'news-article-schema', type: 'application/ld+json' }, JSON.stringify(head.article));
    else document.head.querySelectorAll('#news-article-schema').forEach((element) => element.remove());
    if (head.serviceAreaSchema) update('#service-area-schema', 'script', { id: 'service-area-schema', type: 'application/ld+json' }, JSON.stringify(head.serviceAreaSchema));
    else document.head.querySelectorAll('#service-area-schema').forEach((element) => element.remove());
    for (const [id, schema] of [['breadcrumb-schema', head.breadcrumb], ['service-schema', head.service]] as const) {
      if (schema) update('#' + id, 'script', { id, type: 'application/ld+json' }, JSON.stringify(schema));
      else document.head.querySelectorAll('#' + id).forEach(element => element.remove());
    }
  }, [pathname]);
  return null;
}
