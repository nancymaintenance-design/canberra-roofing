// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { AppV3 } from '../src/main';
function page(path: string) {
 const host=document.createElement('div');
 host.innerHTML=renderToStaticMarkup(<AppV3 pathname={path}/>);
 return host;
}
describe('owner-supplied project photos on relevant services',()=>{
 it('retains the original emergency collage caption with its extracted panels',()=>{
  const gallery=page('/services/emergency-roof-repairs').querySelector('.serviceGallery[data-project]');
  expect(gallery?.textContent).toContain('Site conditions and work stages from the urgent roof leak project.');
 });
 it.each([
 ['/services/emergency-roof-repairs',4,'roof leak',0],
 ['/services/rental-property-roof-repairs',2,'equipment',0],
 ['/services/gutter-repairs',2,'cleared',3],
 ['/services/gutter-downpipe-maintenance',2,'cleared',7],
 ])('shows the matching project on %s without dropping captions or responsive media', (path,count,work,siteCount)=>{
  const host=page(path);
  const gallery=host.querySelector('.serviceGallery[data-project]');
  expect(gallery).not.toBeNull();
  expect(gallery?.textContent?.toLowerCase()).toContain(work);
  expect(gallery?.querySelectorAll('figure')).toHaveLength(count as number);
  const allProjectImages=[...host.querySelectorAll('main img[src^="/assets/projects/"]')];
  expect(host.querySelectorAll('main img[src^="/assets/projects/site-"]')).toHaveLength(siteCount as number);
  expect(allProjectImages).toHaveLength((count as number)+(siteCount as number)+(path.includes('emergency')||path.includes('rental')?1:0));
  expect(new Set(allProjectImages.map(image=>image.getAttribute('src'))).size).toBe(allProjectImages.length);
  const hero=host.querySelector('.serviceHero img')!;
  expect(gallery?.querySelector(`img[src="${hero.getAttribute('src')}"]`)).toBeNull();
  for(const img of gallery!.querySelectorAll('img')){
   expect(img.getAttribute('src')).toMatch(/^\/assets\/projects\/(confirmed-.*-1000|urgent-.*).webp$/);
   if (!path.includes('emergency')) {
    expect(img.getAttribute('srcset')).toContain('600w');
    expect(img.getAttribute('srcset')).toContain('1000w');
   }
   expect(Number(img.getAttribute('width'))).toBeGreaterThan(0);
   expect(Number(img.getAttribute('height'))).toBeGreaterThan(0);
   expect(img.getAttribute('loading')).toBe('lazy');
   expect(img.getAttribute('alt')!.length).toBeGreaterThan(10);
   expect(img.closest('figure')?.querySelector('figcaption')?.textContent).toBeTruthy();
  }
 });
 it('does not present gutter clearing as component repair or replacement',()=>{
  const gallery=page('/services/gutter-repairs').querySelector('.serviceGallery[data-project]');
  expect(gallery?.querySelector('a[href="/services/gutter-downpipe-maintenance"]')).not.toBeNull();
  expect(gallery?.textContent).not.toMatch(/replaced|new gutter|joint repair/i);
 });
 it('does not repeat the supplied duplicate photograph',()=>{
  const images=[...page('/services/gutter-repairs').querySelectorAll('.serviceGallery[data-project] img')].map(img=>img.getAttribute('src'));
  expect(new Set(images).size).toBe(2);
 });
});
