import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { AppV3 } from './main';
import { getDocumentRoute } from './document-route';

const root = document.getElementById('root')!;
if (root.childElementCount > 0) {
  // The edge already selected this HTML. Hydrate that document, even when
  // decoding location.pathname would select a different React page.
  hydrateRoot(root, <AppV3 pathname={getDocumentRoute()} />);
} else {
  createRoot(root).render(<AppV3 pathname={window.location.pathname} />);
}
