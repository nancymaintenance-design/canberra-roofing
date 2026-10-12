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
 it.each([
 ['/services/emergency-roof-repairs',1,'roof leak'],
 ['/services/rental-property-roof-repairs',3,'equipment'],
 ['/services/gutter-repairs',2,'cleared'],
 ['/services/gutter-downpipe-maintenance',2,'cleared'],
 ])('shows the matching project on %s without dropping captions or responsive media', (path,count,work)=>{
  const gallery=page(path).querySelector('.serviceGallery[data-project]');
  expect(gallery).not.toBeNull();
  expect(gallery?.textContent?.toLowerCase()).toContain(work);
  expect(gallery?.querySelectorAll('figure')).toHaveLength(count as number);
  for(const img of gallery!.querySelectorAll('img')){
   expect(img.getAttribute('src')).toMatch(/^\/assets\/projects\/confirmed-.*-1000.webp$/);
   expect(img.getAttribute('srcset')).toContain('600w');
   expect(img.getAttribute('srcset')).toContain('1000w');
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
