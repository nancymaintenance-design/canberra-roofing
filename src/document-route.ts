import routes from './route-meta.json';
import { DISTRICT_PATHS, SUBURB_PATHS } from './suburb-profiles.js';

const documentRoutes = new Set([...Object.keys(routes), ...DISTRICT_PATHS, ...SUBURB_PATHS, '/404']);

// This value is written by the prerenderer, never derived from the request URL.
export function isDocumentRoute(pathname: string) {
  return documentRoutes.has(pathname);
}

// Missing/invalid identity must never promote a 404 via a user-controlled URL.
export function getDocumentRoute(documentRoot = document.documentElement) {
  const route = documentRoot.getAttribute('data-route');
  return route && isDocumentRoute(route) ? route : '/404';
}
