// @vitest-environment jsdom
import React from 'react';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
it('home retains every destination in a compact directory while fuller facts remain in the overview', () => {
 const home=document.createElement('div'), services=document.createElement('div');
 home.innerHTML=renderToStaticMarkup(<AppV3 pathname="/"/>);
 services.innerHTML=renderToStaticMarkup(<AppV3 pathname="/services"/>);
 const links=[...home.querySelectorAll('.homeServiceDirectory a')];
 expect(links).toHaveLength(13);
 expect(new Set(links.map(a=>a.getAttribute('href'))).size).toBe(13);
 expect(home.querySelector('.homeServices .serviceCardFacts')).toBeNull();
 for(const link of links) expect(services.querySelector(`.serviceCard a[href="${link.getAttribute('href')}"]`)).not.toBeNull();
 expect(services.querySelectorAll('.serviceCardFacts')).toHaveLength(13);
});
it('consolidates contact preparation beside the form instead of repeating it below', () => {
 const root=document.createElement('div');
 root.innerHTML=renderToStaticMarkup(<AppV3 pathname="/contact"/>);
 expect(root.querySelector('.contactPreparation')).toBeNull();
 const notes=root.querySelector('.contactSideDetails .contactEnquiryNotes');
 expect(notes).not.toBeNull();
 expect(notes!.querySelectorAll('li')).toHaveLength(3);
 expect(notes!.textContent).toMatch(/do not climb onto the roof/i);
 expect(notes!.textContent).toMatch(/fees.*scope.*exclusions/s);
 expect(notes!.querySelector('a[href="/news/when-to-arrange-roof-inspection-canberra"]')).not.toBeNull();
 expect(root.querySelectorAll('.contact form')).toHaveLength(1);
});
it('keeps long articles and contact preparation out of empty side columns', async () => {
 const browser = await chromium.launch({headless:true,channel:'msedge'});
 try {
  const page=await browser.newPage({viewport:{width:1600,height:1000}});
  await page.route('**/*', route => route.abort());
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
  await load('/contact');
  const form=await box('.contact form'), photo=await box('.contactFeatureMedia');
  const intro=await box('.contactIntro');
  expect(form.y).toBeGreaterThanOrEqual(intro.y+intro.height);
  expect(photo.x+photo.width).toBeLessThan(form.x);
  expect(photo.y).toBeCloseTo(form.y, 0);
  expect(form.width).toBeGreaterThan(500);
  expect(form.width).toBeLessThanOrEqual(720);
  const hours=await box('.contact .operatingHours');
  const phone=await box('.contact input[name="phone"]'), address=await box('.contact input[name="address"]');
  expect(phone.height).toBeCloseTo(address.height, 0);
  expect(phone.y).toBeCloseTo(address.y, 0);
  expect(hours.x+hours.width).toBeLessThan(form.x);
  expect(hours.y).toBeGreaterThan(photo.y+photo.height);
  await load('/services');
  const rows=await page.locator('.serviceCard').all();
  expect(rows).toHaveLength(13);
  let previousBottom=0;
  for(const row of rows){
   const bounds=(await row.boundingBox())!;
   expect(bounds.y).toBeGreaterThanOrEqual(previousBottom);
   expect(bounds.width).toBeGreaterThan(1200);
   const summary=(await row.locator('.serviceCardSummary').boundingBox())!;
   const facts=(await row.locator('.serviceCardFacts').boundingBox())!;
   expect(facts.x).toBeGreaterThan(summary.x+summary.width);
   previousBottom=bounds.y+bounds.height;
  }
  for (const width of [390,320]) {
   await page.setViewportSize({width,height:844});
   for (const [path, first, next] of [
    ['/contact','.contactFeatureMedia','.contact form'],
    ['/news/when-to-arrange-roof-inspection-canberra','#findings','.articleRelated'],
    ['/privacy','.privacyBody','.privacySidebar'],
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
