import routes from './route-meta.json';
import { DISTRICT_PATHS, SUBURB_PATHS } from './suburb-profiles.js';
import { addedArticle } from './i18n/editorial';
import { basePath } from './i18n/runtime';

const englishRoutes = [...Object.keys(routes), ...DISTRICT_PATHS, ...SUBURB_PATHS];
const documentRoutes = new Set([...englishRoutes, ...englishRoutes.map(path => '/zh' + (path === '/' ? '/' : path)), '/404']);

// This value is written by the prerenderer, never derived from the request URL.
export function isDocumentRoute(pathname: string) {
  return documentRoutes.has(pathname) || !!addedArticle(basePath(pathname));
}

// Missing/invalid identity must never promote a 404 via a user-controlled URL.
export function getDocumentRoute(documentRoot = document.documentElement) {
  const route = documentRoot.getAttribute('data-route');
  return route && isDocumentRoute(route) ? route : '/404';
}
