// @vitest-environment jsdom
import React from 'react';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';

it('advertises equal image slots within each gallery row', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage();
    for (const [slug, expected] of [
      ['rental-property-roof-repairs', [680, 680]],
      ['emergency-roof-repairs', [680, 680, 680, 680]],
    ] as const) {
      await page.setContent(renderToStaticMarkup(<AppV3 pathname={`/services/${slug}`} />));
      const hints = await page.locator('.serviceProjectGallery figure').evaluateAll(figures => figures.map(figure => figure.querySelector('source[sizes], img[srcset]')?.getAttribute('sizes') ?? null));
      expect(hints).toHaveLength(expected.length);
      expected.forEach((slot, index) => {
        // Single-resource crops have no resource-selection hint; responsive rows must match their slots.
        if (hints[index] !== null) expect(hints[index]).toBe(`(max-width: 760px) calc(100vw - 3rem), (max-width: 1440px) ${slot === 680 ? '45' : '30'}vw, ${slot}px`);
      });
      if (slug.startsWith('rental')) expect(hints.every(Boolean)).toBe(true);
    }
  } finally { await browser.close(); }
}, 30000);

it('keeps advice and guide blocks aligned with the continuous desktop reading region', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.setContent(`<style>${readFileSync('src/styles.css', 'utf8')}</style>${renderToStaticMarkup(<AppV3 pathname="/services/tile-roof-repairs" />)}`);
    const blocks = page.locator('#how-we-handle-it .serviceThemeContent > .contentGuidance, #how-we-handle-it .serviceThemeContent > .serviceGuideLink');
    expect(await blocks.count()).toBeGreaterThan(1);
    for (const block of await blocks.all()) {
      const geometry = await block.evaluate(node => {
        const bounds = node.getBoundingClientRect();
        const parent = node.parentElement!.getBoundingClientRect();
        return { centreOffset: Math.abs(bounds.x + bounds.width / 2 - parent.x - parent.width / 2), width: bounds.width, parentWidth: parent.width };
      });
      expect(geometry.width).toBeCloseTo(geometry.parentWidth, 0);
      expect(geometry.centreOffset).toBeLessThanOrEqual(1);
    }
  } finally {
    await browser.close();
  }
}, 30000);

it('uses a continuous desktop reading flow with legible image rows and stacks images on phones', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    await page.setContent(`<style>${readFileSync('src/styles.css', 'utf8')}</style>${renderToStaticMarkup(<AppV3 pathname="/services/tile-roof-repairs" />)}`);
    // A portrait fixture exposes parent clipping that object-fit alone cannot detect.
    const portrait = page.locator('.serviceGallery:not(.serviceProjectGallery) figure:first-child img');
    await portrait.evaluate(async (image: HTMLImageElement) => {
      image.closest('picture')?.querySelectorAll('source').forEach(source => source.remove());
      image.removeAttribute('srcset');
      image.removeAttribute('width');
      image.removeAttribute('height');
      // The off-screen production photo is lazy; the synthetic decode fixture must load eagerly.
      image.loading = 'eager';
      image.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="gray"/></svg>');
      await image.decode();
    });
    const box = async (selector: string) => (await page.locator(selector).first().boundingBox())!;
    const expectCompactPortrait = async () => {
      const frame = await box('.serviceGallery:not(.serviceProjectGallery) figure:first-child');
      const photo = (await portrait.boundingBox())!;
      expect(frame.height).toBeGreaterThanOrEqual(photo.height - 1);
      expect(photo.height).toBeGreaterThanOrEqual(220);
      expect(photo.height).toBeLessThanOrEqual(420);
      expect(await portrait.evaluate(image => getComputedStyle(image).objectFit)).toBe('cover');
    };
    await expectCompactPortrait();
    expect((await box('.serviceView')).width).toBeGreaterThanOrEqual(1050);
    const signs = await box('#what-we-repair .serviceThemeContent > p:first-child');
    const causes = await box('#what-we-repair .serviceThemeContent > p:nth-child(2)');
    expect(causes.y).toBeGreaterThanOrEqual(signs.y + signs.height);
    expect(causes.x).toBe(signs.x);
    const first = await box('.serviceGallery:not(.serviceProjectGallery) figure:first-child');
    const second = await box('.serviceGallery:not(.serviceProjectGallery) figure:nth-child(2)');
    expect(first.width).toBeCloseTo(second.width, 0);
    expect(first.y).toBe(second.y);
    expect(await page.locator('#project-photos img').evaluateAll(images => images.every(image => getComputedStyle(image).objectFit === 'cover'))).toBe(true);
    const scope = await box('.serviceBookingScope');
    const appointment = await box('.serviceBookingAppointment');
    expect(appointment.y).toBeGreaterThanOrEqual(scope.y + scope.height);
    expect(appointment.x).toBe(scope.x);
    expect(await page.locator('#service-faq details').first().evaluate(node => getComputedStyle(node.parentElement!).display)).toBe('block');
    await page.setViewportSize({ width: 390, height: 844 });
    await expectCompactPortrait();
    expect((await box('#what-we-repair .serviceThemeContent > p:nth-child(2)')).y).toBeGreaterThan((await box('#what-we-repair .serviceThemeContent > p:first-child')).y);
    expect((await box('.serviceBookingAppointment')).y).toBeGreaterThan((await box('.serviceBookingScope')).y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  } finally {
    await browser.close();
  }
}, 30000);
