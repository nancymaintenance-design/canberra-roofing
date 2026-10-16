import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { AppV3 } from './main';
import { getDocumentRoute } from './document-route';
import { initialiseAnalytics } from './analytics.js';
import { setEditorialContent, isChinese, loadChineseTranslations } from './i18n/runtime';

const root = document.getElementById('root')!;
async function start() {
if(isChinese(window.location.pathname)) await loadChineseTranslations();
if (import.meta.env.DEV && document.querySelector('meta[name="local-editor-preview"]')) {
  try { const response = await fetch('/__editor/api/preview'); if (response.ok) setEditorialContent(await response.json()); } catch { /* Preview retains published copy if the local server is unavailable. */ }
}
let application: ReturnType<typeof createRoot>;
const pathname = root.childElementCount > 0 ? getDocumentRoute() : window.location.pathname;
if (root.childElementCount > 0) {
  // The edge already selected this HTML. Hydrate that document, even when
  // decoding location.pathname would select a different React page.
  application = hydrateRoot(root, <AppV3 pathname={pathname} />);
} else {
  application = createRoot(root); application.render(<AppV3 pathname={pathname} />);
}
if (import.meta.env.DEV && window.parent !== window && document.querySelector('meta[name="local-editor-preview"]')) {
  document.addEventListener('click', event => {
    const image = (event.target as HTMLElement).closest<HTMLElement>('[data-image-source]');
    if(image) { event.preventDefault(); event.stopPropagation(); window.parent.postMessage({type:'editor-select-image',src:image.dataset.imageSource},window.location.origin); return; }
    const element = (event.target as HTMLElement).closest<HTMLElement>('[data-copy-id]');
    if (!element) return;
    event.preventDefault(); event.stopPropagation();
    window.parent.postMessage({ type: 'editor-select-copy', id: element.dataset.copyId }, window.location.origin);
  }, true);
  window.addEventListener('message', event => {
    if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== 'editor-preview-content') return;
    setEditorialContent(event.data.content); application.render(<AppV3 pathname={pathname} />);
  });
  const style = document.createElement('style');
  style.textContent = '[data-copy-id]{cursor:text}[data-copy-id]:hover{outline:2px dashed #B8441C;outline-offset:3px}';
  document.head.appendChild(style);
}
initialiseAnalytics();
}
void start();
