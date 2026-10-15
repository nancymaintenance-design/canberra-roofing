// @vitest-environment jsdom
import React from 'react';
import { readFileSync, existsSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';

it('keeps portrait project rows compact and puts notes above emergency photographs', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage();
    for (const width of [1600, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const slug of ['rental-property-roof-repairs', 'emergency-roof-repairs']) {
        await page.setContent(`<style>${readFileSync('src/styles.css', 'utf8')}</style>${renderToStaticMarkup(<AppV3 pathname={`/services/${slug}`} />)}`);
        const gallery = page.locator('.serviceProjectGallery');
        const intro = (await gallery.locator('.serviceGalleryIntro').boundingBox())!;
        const grid = (await gallery.locator('.serviceGalleryGrid').boundingBox())!;
        expect(grid.y).toBeGreaterThanOrEqual(intro.y + intro.height);
        const photos = await gallery.locator('img').all();
        expect(photos.length).toBe(slug.startsWith('emergency') ? 5 : 3);
        for (const photo of photos) {
          const bounds = (await photo.boundingBox())!;
          expect(bounds.height).toBeGreaterThanOrEqual(220);
          expect(bounds.height).toBeLessThanOrEqual(width < 760 ? 300 : 420);
        }
        if (width < 760) {
          let previousBottom = grid.y - 1;
          for (const figure of await gallery.locator('figure').all()) {
            const card = (await figure.boundingBox())!;
            const photo = (await figure.locator('img').boundingBox())!;
            expect(photo.width).toBeCloseTo(grid.width, 0);
            expect(card.y).toBeGreaterThan(previousBottom);
            previousBottom = card.y + card.height;
            for (const caption of await figure.locator('figcaption').all()) {
              const captionBox = (await caption.boundingBox())!;
              expect(captionBox.width).toBeGreaterThan(0);
              expect(captionBox.height).toBeGreaterThan(0);
              expect(captionBox.x).toBeGreaterThanOrEqual(card.x);
              expect(captionBox.x + captionBox.width).toBeLessThanOrEqual(card.x + card.width + 1);
            }
          }
        }
        if (width > 760 && slug.startsWith('rental')) {
          const boxes = await Promise.all(photos.map(photo => photo.boundingBox()));
          expect(boxes[0]!.y).toBe(boxes[2]!.y);
          expect(boxes[0]!.width).toBeCloseTo(boxes[2]!.width, 0);
        }
        const originals = await gallery.locator('.serviceGalleryOriginal').evaluateAll(links => links.map(link => link.getAttribute('href')!));
        expect(originals.length).toBeGreaterThan(0);
        for (const original of originals) expect(existsSync(`public${original}`)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    }
  } finally { await browser.close(); }
}, 30000);
