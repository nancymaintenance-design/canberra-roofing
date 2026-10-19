// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { SERVICE_CATALOG } from '../src/service-catalog.js';

for (const { path } of SERVICE_CATALOG) {
  it(`${path}: exposes complete explanations without numbered nested cards`, () => {
    const host = document.createElement('div');
    host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
    const main = host.querySelector('.serviceView')!;
    expect(main.querySelectorAll('.serviceTheme > h2')).toHaveLength(5);
    for (const id of ['what-we-repair', 'how-we-handle-it']) {
      const body = main.querySelector(`#${id} .serviceThemeContent`)!;
      expect(body.querySelectorAll(':scope > p').length).toBeGreaterThanOrEqual(2);
      expect(body.querySelector('article, .serviceThemeLead')).toBeNull();
      expect(body.textContent).not.toMatch(/0[1-4] \/ /);
    }
    for (const item of main.querySelectorAll('.serviceRelatedLinks li')) {
      expect(item.querySelector('h3 > a[href^="/"]')).not.toBeNull();
      expect(item.querySelector('p')!.textContent!.length).toBeGreaterThan(30);
    }
    expect(main.querySelectorAll('#project-photos img').length).toBeGreaterThan(0);
    expect(host.querySelector('nav a[href="/solutions"]')).toBeNull();
    expect(host.querySelector('a[href="tel:0405878406"]')).not.toBeNull();
  });
}
