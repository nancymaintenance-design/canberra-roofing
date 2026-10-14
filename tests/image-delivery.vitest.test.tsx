// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { existsSync, readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const page = (path: string) => {
  const root = document.createElement('div');
  root.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return root;
};
it('overrides intrinsic case image heights so the authored crop can size the image', () => {
  const style = document.createElement('style');
  style.textContent = readFileSync('src/styles.css', 'utf8');
  const root = page('/case-studies/tile-roof-repair-canberra');
  document.head.append(style);
  document.body.append(root);
  try {
    const images = [...root.querySelectorAll('.caseEvidenceGrid img')];
    expect(images.length).toBe(3);
    for (const image of images) {
      expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
      expect(getComputedStyle(image).height).toBe('auto');
      expect(getComputedStyle(image).aspectRatio).toBe('4/3');
      expect(getComputedStyle(image).objectFit).toBe('cover');
    }
  } finally { root.remove(); style.remove(); }
});
// Browser verification is explicit, like the project's separate test:browser suite.
it.runIf(process.env.RUN_IMAGE_BROWSER_TESTS === '1')('preserves the case grid crop at desktop and mobile widths with intrinsic attributes', async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const tab = await browser.newPage();
    await tab.route('**/*', route => {
      const asset = `public${new URL(route.request().url()).pathname}`;
      if (existsSync(asset)) return route.fulfill({ body: readFileSync(asset) });
      return route.abort();
    });
    for (const [width, ratio] of [[1440, 4 / 3], [390, 16 / 10]]) {
      await tab.setViewportSize({ width, height: 1000 });
      await tab.setContent(`<base href="http://image-test.local/"><style>${readFileSync('src/styles.css', 'utf8')}</style>${renderToStaticMarkup(<AppV3 pathname="/case-studies/tile-roof-repair-canberra" />)}`);
      await tab.locator('.caseEvidenceGrid img').evaluateAll(async images => {
        await Promise.all(images.map(async image => { (image as HTMLImageElement).loading = 'eager'; await (image as HTMLImageElement).decode(); }));
      });
      const sizes = await tab.locator('.caseEvidenceGrid img').evaluateAll(images => images.map(image => {
        const box = image.getBoundingClientRect();
        return { width: box.width, height: box.height, fit: getComputedStyle(image).objectFit };
      }));
      expect(sizes.length).toBe(3);
      for (const size of sizes) {
        expect(size.width / size.height).toBeCloseTo(ratio, 2);
        expect(size.fit).toBe('cover');
      }
    }
  } finally { await browser.close(); }
}, 20000);
it('avoids oversized brand PNG downloads at their small rendered sizes', () => {
  const root = page('/');
  for (const selector of ['.brandLogo', '.footerSocialLinks img[src$="instagram-gradient.png"]']) {
    const image = root.querySelector(selector)!;
    const source = image.parentElement?.querySelector('source');
    expect(source?.getAttribute('type')).toBe('image/webp');
    expect(source!.getAttribute('srcset')).toContain('.webp');
  }
});
it('serves responsive modern sources without deleting the original photos', () => {
  const root = page('/services/roof-cleaning');
  const images = [...root.querySelectorAll('.serviceGallery img')];
  expect(images.length).toBeGreaterThan(0);
  for (const image of images) {
    expect(existsSync(`public${image.getAttribute('src')}`)).toBe(true);
    expect(Number(image.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(image.getAttribute('height'))).toBeGreaterThan(0);
    const source = image.parentElement?.querySelector('source');
    expect(source?.getAttribute('type')).toBe('image/webp');
    const candidates = source!.getAttribute('srcset')!.split(', ');
    expect(candidates.length).toBe(3);
    for (const candidate of candidates) {
      const [url, width] = candidate.split(' ');
      expect(existsSync(`public${url.split('?')[0]}`)).toBe(true);
      expect(['400w', '800w', '1200w']).toContain(width);
    }
    expect(image.getAttribute('loading')).toBe('lazy');
  }
});
it('keeps first-screen feature media eager and high priority', () => {
  const image = page('/about').querySelector('.pageFeatureMedia img')!;
  expect(image.getAttribute('loading')).toBe('eager');
  expect(image.getAttribute('fetchPriority')).toBe('high');
});
it('delivers the home background through responsive modern image-set', () => {
  const css = readFileSync('src/styles.css', 'utf8');
  expect(css).toContain('au-hero-act-tile-roof-1200.webp');
  expect(css).toContain('au-hero-act-tile-roof-800.webp');
});
