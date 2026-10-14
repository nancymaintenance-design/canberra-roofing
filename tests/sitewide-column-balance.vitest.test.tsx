// @vitest-environment jsdom
import React from 'react';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
it('keeps long articles, contact preparation and about FAQ out of empty side columns', async () => {
 const browser = await chromium.launch({headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1600,height:1000}});
  const load=async(path:string)=>page.setContent(`<style>${readFileSync('src/styles.css','utf8')}</style>${renderToStaticMarkup(<AppV3 pathname={path}/> )}`);
  const box=async(selector:string)=>(await page.locator(selector).first().boundingBox())!;
  await load('/news/when-to-arrange-roof-inspection-canberra');
  const body=await box('.articleBody'), related=await box('.articleRelated'), finalSection=await box('.articleSection#next-step');
  expect(related.y).toBeGreaterThan(finalSection.y);
  const directory=await box('.articleContents'), articleLayout=await box('.articleLayout');
  expect(directory.x+directory.width).toBeLessThan(body.x);
  expect(Math.abs(articleLayout.x+articleLayout.width/2-800)).toBeLessThanOrEqual(1);
  expect(body.width).toBeGreaterThan(800);
  await load('/privacy');
  const privacy=await box('.privacyBody'), privacyAction=await box('.privacySidebar');
  expect(privacyAction.y).toBeGreaterThanOrEqual(privacy.y+privacy.height);
  expect(Math.abs(privacy.x+privacy.width/2-800)).toBeLessThanOrEqual(1);
  expect(privacy.width).toBeLessThanOrEqual(800);
  await load('/about');
  const heading=await box('.aboutFaq > div:first-child'), faq=await box('.aboutFaqList');
  expect(faq.y).toBeGreaterThanOrEqual(heading.y+heading.height);
  await load('/contact');
  const form=await box('.contact form'), photo=await box('.contactFeatureMedia');
  expect(photo.y).toBeGreaterThanOrEqual(form.y+form.height);
  for (const width of [390,320]) {
   await page.setViewportSize({width,height:844});
   for (const [path, first, next] of [
    ['/contact','.contact form','.contactFeatureMedia'],
    ['/news/when-to-arrange-roof-inspection-canberra','.articleSources','.articleRelated'],
    ['/privacy','.privacyBody','.privacySidebar'],
    ['/about','.aboutFaq > div:first-child','.aboutFaqList'],
   ]) {
    await load(path);
    const top=await box(first), bottom=await box(next);
    expect(bottom.y).toBeGreaterThanOrEqual(top.y+top.height);
    expect(bottom.width).toBeGreaterThan(200);
    expect(bottom.x).toBeGreaterThanOrEqual(0);
    expect(bottom.x+bottom.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
   }
  }
 } finally { await browser.close(); }
},30000);
