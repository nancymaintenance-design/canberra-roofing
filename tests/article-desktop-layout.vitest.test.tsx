// @vitest-environment jsdom
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from '@playwright/test';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { NEWS_ARTICLES } from '../src/news-articles';

it.each(NEWS_ARTICLES)('keeps $slug complete with a separate chapter directory', article => {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={'/news/' + article.slug} />);
  const directory = host.querySelector('.articleLayout > .articleContents');
  expect(directory).not.toBeNull();
  expect(directory!.querySelectorAll('a')).toHaveLength(article.sections.length);
  for (const section of article.sections) {
    const content = host.querySelector('.articleBody #' + section.id)!;
    expect([...content.querySelectorAll('p')].map(p => p.textContent)).toEqual(section.paragraphs);
    expect(directory!.querySelector(`a[href="#${section.id}"]`)).not.toBeNull();
  }
  expect(host.querySelector('.articleRelated')!.closest('.articleBody')).not.toBeNull();
  expect(host.querySelectorAll('.articleRelated a[href^="/news/"]').length).toBeGreaterThanOrEqual(2);
});

it('uses a sticky desktop directory and compact linked case summary while phones stack', async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    await page.route('http://article-layout.test/**', route => {
      const path = new URL(route.request().url()).pathname;
      if (path.startsWith('/assets/')) return route.fulfill({body:readFileSync('public' + path),contentType:path.endsWith('.webp')?'image/webp':path.endsWith('.png')?'image/png':'image/jpeg'});
      return route.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><html><head><style>${readFileSync('src/styles.css','utf8')}</style></head><body>${renderToStaticMarkup(<AppV3 pathname={path} />)}</body></html>`});
    });
    for (const width of [320,390,768,1024,1100,1440,1920]) {
      await page.setViewportSize({width,height:1000});
      await page.goto('http://article-layout.test/news/after-rain-roof-leak-check-canberra');
      const layout = (await page.locator('.articleLayout').boundingBox())!;
      const directory = (await page.locator('.articleContents').boundingBox())!;
      const body = (await page.locator('.articleBody').boundingBox())!;
      const caseSummary = page.locator('.articleBody .relatedCase');
      expect(await caseSummary.count()).toBe(1);
      expect(await caseSummary.locator('img, .relatedCasePhotos').count()).toBe(0);
      expect(await caseSummary.locator('a[href="/case-studies/tile-roof-repair-canberra"]').count()).toBe(1);
      const summaryBox = (await caseSummary.boundingBox())!;
      expect(summaryBox.width).toBeGreaterThan(body.width - 2);
      const related = await page.locator('.articleRelated li').evaluateAll(nodes => nodes.map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
      if (width>1024) {
        expect(layout.width).toBeGreaterThan(Math.min(width-100,1100));
        expect(body.width).toBeGreaterThan(width>1200?800:600);
        expect((await page.locator('.articleSection h2').first().boundingBox())!.width).toBeGreaterThanOrEqual(body.width-1);
        expect(directory.x+directory.width).toBeLessThan(body.x);
        expect(await page.locator('.articleContents').evaluate(n=>getComputedStyle(n).position)).toBe('sticky');
        expect(Math.abs(related[0].y-related[1].y)).toBeLessThan(2);
        if(related.length===4) expect(Math.abs(related[2].y-related[3].y)).toBeLessThan(2);
        await page.evaluate(()=>scrollTo(0,1400));
        const sticky = (await page.locator('.articleContents').boundingBox())!;
        const header = (await page.locator('.siteHeader').boundingBox())!;
        expect(sticky.y).toBeGreaterThanOrEqual(header.y+header.height);
        expect(sticky.y).toBeLessThan(200);
      } else {
        expect(body.y).toBeGreaterThanOrEqual(directory.y+directory.height);
        expect(await page.locator('.articleContents').evaluate(n=>getComputedStyle(n).position)).toBe('static');
        if(width<=760) {
          expect(related[1].y).toBeGreaterThanOrEqual(related[0].y+related[0].height);
        }
      }
      await page.locator('.articleContents a').last().click();
      const heading = await page.locator('.articleSection').last().locator('h2').boundingBox();
      const header = await page.locator('.siteHeader').boundingBox();
      expect(heading!.y).toBeGreaterThanOrEqual(header!.y+header!.height-2);
      expect(heading!.y).toBeLessThan(350);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  } finally { await browser.close(); }
},60000);
