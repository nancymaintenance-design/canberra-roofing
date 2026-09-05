import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { AppV3 } from './main';

const root = document.getElementById('root')!;
const app = <AppV3 pathname={window.location.pathname} />;
if (root.childElementCount > 0) hydrateRoot(root, app);
else createRoot(root).render(app);
