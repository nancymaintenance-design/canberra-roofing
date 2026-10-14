// @vitest-environment jsdom
import React from 'react';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { SERVICE_CATALOG } from '../src/service-catalog.js';
import { getRouteHead } from '../src/route-meta';

it('pairs meaningful first-screen media and keeps article anchors visible at every breakpoint', async () => {
 const browser = await chromium.launch({headless:true});
 try {
  const page = await browser.newPage();
  await page.route('http://editorial.test/**', async route => {
   const path=new URL(route.request().url()).pathname;
   if(path.startsWith('/assets/')) return route.fulfill({body:readFileSync('public'+path),contentType:path.endsWith('.webp')?'image/webp':path.endsWith('.png')?'image/png':'image/jpeg'});
   return route.fulfill({contentType:'text/html; charset=utf-8',body:`<!doctype html><html><head><meta charset="utf-8"><style>${readFileSync('src/styles.css','utf8')}</style></head><body>${renderToStaticMarkup(<AppV3 pathname={path}/>)}</body></html>`});
  });
  const load = async(path:string) => { await page.goto('http://editorial.test'+path); await page.evaluate(()=>Promise.all([...document.images].filter(img=>img.loading!=='lazy').map(img=>img.decode().catch(()=>{})))); };
  for (const width of [320,390,768,1024,1440,1920]) {
   await page.setViewportSize({width,height:1000});
   for (const [path, selector] of [
    ['/services/tile-roof-repairs','.serviceHero'],
    ['/case-studies/tile-roof-repair-canberra','.caseStudyHeader'],
    ['/news','.newsIndexHeader'],
    ['/news/when-to-arrange-roof-inspection-canberra','.articleHeader'],
   ]) {
    await load(path);
    expect(await page.locator(selector+' img').count()).toBe(1);
    const media=(await page.locator(selector+' img').boundingBox())!;
    const title=(await page.locator(selector+' h1').boundingBox())!;
    expect(media.width).toBeGreaterThan(width>1024?350:200);
    expect(media.height).toBeGreaterThan(180);
    expect(media.height).toBeLessThanOrEqual(420);
    if(width>1024) expect(media.x).toBeGreaterThan(title.x+title.width);
    else expect(media.y).toBeGreaterThan(title.y+title.height);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await page.locator(selector+' img').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
    if(process.env.EDITORIAL_SCREENSHOTS && [390,1440,1920].includes(width)) await page.screenshot({path:`../reports/news-editorial-refresh-2026-10-14/task-2-${width}-${selector.slice(1)}.png`});
    if(path.startsWith('/news/')) {
     await page.locator('.articleContents a').last().click();
     await expect.poll(async () => (await page.locator('.articleSection').last().boundingBox())!.y).toBeLessThan(350);
     const heading=(await page.locator('.articleSection').last().boundingBox())!;
     const header=(await page.locator('.siteHeader').boundingBox());
     expect(heading.y).toBeGreaterThanOrEqual(header ? header.y+header.height : 80);
     expect(heading.y).toBeLessThan(350);
    }
   }
   await load('/news');
   const card=(await page.locator('.newsCard').first().boundingBox())!;
   const cover=(await page.locator('.newsCardImage img').first().boundingBox())!;
   expect(cover.width).toBeGreaterThan(card.width*.75);
   expect(cover.height).toBeLessThanOrEqual(280);
   const columns=await page.locator('.newsGrid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
   expect(columns).toBe(width>1200?3:width>760?2:1);
  }
 } finally { await browser.close(); }
},60000);

it('gives all twelve services relevant hero media and keeps documentary cases in relevant contexts', () => {
 for(const service of SERVICE_CATALOG) {
  const host=document.createElement('div');
  host.innerHTML=renderToStaticMarkup(<AppV3 pathname={service.path}/>);
  expect(host.querySelector('.serviceHero img')).not.toBeNull();
  expect(host.querySelectorAll('.serviceTheme')).toHaveLength(5);
  const photos=host.querySelectorAll('.relatedCase img');
  expect(photos.length).toBe(['tile-roof-repairs','roof-inspections','roof-leak-repairs','roof-renovation'].includes(service.slug)?3:0);
  expect(host.querySelector('main h1')!.textContent).not.toContain('Canberra');
  expect(getRouteHead(service.path).title).not.toMatch(/Canberra/);
 }
});
