// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { renderPage } from '../src/entry-server';
import { getNavigationMap } from '../src/navigation-map';

const template = '<html lang="en-AU"><head><!--route-head--></head><body><!--document-route--><div id="root"><!--app-html--></div></body></html>';
const casePath = '/case-studies/roof-gutter-clearing';
function page(path: string) { const host = document.createElement('div'); host.innerHTML = renderPage(path, template); return host; }

it.each(['', '/zh'])('renders the selected clearing case and preserves its complete photo sequence %s', prefix => {
  const host = page(prefix + casePath);
  expect(host.querySelector('h1')!.textContent).toBe(prefix ? '屋面边缘与檐沟清理现场记录' : 'Roof-edge and gutter clearing, in photos');
  const images = [...host.querySelectorAll('main img')];
  expect(images).toHaveLength(8);
  expect(new Set(images.map(img => img.getAttribute('src'))).size).toBe(8);
  for (const image of images) {
    expect(image.closest('figure')!.querySelector('figcaption')!.textContent!.trim().length).toBeGreaterThan(10);
    expect(image.getAttribute('width')).toBeTruthy();
    expect(image.getAttribute('alt')).toMatch(prefix ? /[\u3400-\u9fff]/ : /[A-Za-z]/);
  }
  expect(host.querySelector('.contentNextStep .button')!.getAttribute('href')).toBe(prefix + '/contact?service=Gutter%20%26%20Downpipe%20Cleaning%20and%20Maintenance');
  expect(host.querySelectorAll('a.serviceGalleryOriginal')).toHaveLength(0);
  expect(host.textContent).not.toMatch(/guaranteed|pressure.wash|维修已完成|保证不漏水/i);
});

it.each(['', '/zh'])('makes the clearing case reachable from home and both related services %s', prefix => {
  for (const path of ['/', '/services/roof-cleaning', '/services/gutter-downpipe-maintenance']) {
    expect(page(prefix + path).querySelector(`main a[href="${prefix}${casePath}"]`)).not.toBeNull();
  }
  const host = page(prefix + '/');
  expect(host.querySelectorAll('.homeCleaningCase img')).toHaveLength(1);
});

it.each(['', '/zh'])('places documentary pictures inside the relevant guide chapters %s', prefix => {
  for (const [slug, section] of [['roof-cleaning-methods-canberra', 'water-route'], ['gutters-overflowing-heavy-rain-canberra', 'drainage']]) {
    const host = page(`${prefix}/news/${slug}`);
    expect(host.querySelectorAll(`#${section} .articleSitePhotos img`)).toHaveLength(2);
    expect(host.querySelector(`#${section} a[href="${prefix}${casePath}"]`)).not.toBeNull();
    expect(host.querySelectorAll('.articleSection')).toHaveLength(4);
  }
});

it('gives the new case a gutter-maintenance parent without reassigning the tile case', () => {
  const rows = getNavigationMap();
  expect(rows.find(row => row.path === casePath)?.commercial_owner_url).toBe('https://www.canberraroofkind.com.au/services/gutter-downpipe-maintenance');
  expect(rows.find(row => row.path === '/case-studies/tile-roof-repair-canberra')?.commercial_owner_url).toBe('https://www.canberraroofkind.com.au/services/tile-roof-repairs');
});
