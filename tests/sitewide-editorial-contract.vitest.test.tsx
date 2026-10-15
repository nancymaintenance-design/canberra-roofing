// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { publishedRoutes, getRouteHead } from '../src/route-meta';

const unsupported = /98\s*%|1,000\+? customers|15 years|30 minutes|established in 2011/i;
const generic = /^(Roof questions, clearly explained|Roof repair solutions|Your enquiry details, handled with care\.|Find us in the city\.|Choose the closest visible concern\.|Continue with a focused guide\.|Established service|Experience that matters|Integrity first|How we help you move forward|Conditions that matter|Before, during and after\.|Visible tiled-roof work, recorded clearly\.)$/;
function page(path: string) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host;
}
afterEach(() => { cleanup(); localStorage.clear(); });

it('keeps unsupported business statistics and generic headings out of every public route', () => {
  expect(Object.keys(publishedRoutes)).toHaveLength(120);
  for (const path of Object.keys(publishedRoutes)) {
    const host = page(path);
    expect(host.querySelector('main')?.textContent, path).not.toMatch(unsupported);
    for (const heading of host.querySelectorAll('main h1,main h2,main h3')) {
      expect(heading.textContent?.trim(), path).not.toMatch(generic);
    }
    expect(getRouteHead(path).title, path).not.toMatch(unsupported);
  }
}, 15000);

it.each([
  ['/', 'Roof Repairs Canberra'],
  ['/news', 'Roof leaks, inspections and maintenance'],
  ['/solutions', 'Roof repair options by visible problem'],
  ['/about', 'About Ellis Services Group'],
  ['/privacy', 'How Ellis Services Group handles enquiry information'],
])('keeps the visible topic and route metadata aligned on %s', (path, heading) => {
  expect(page(path).querySelector('main h1')?.textContent).toBe(heading);
  expect((publishedRoutes as Record<string, { h1: string }>)[path].h1).toBe(heading);
  expect(getRouteHead(path).title).toContain(path === '/' ? 'Roof Repairs Canberra' : heading);
});

it.each([5, 8, 99])('rejects stale controlled copy from persisted schema %i on a real reload', (schemaVersion) => {
  localStorage.setItem('canberraroofkind-content-v7', JSON.stringify({
    schemaVersion, company: 'Unverified Company', phone: '0000000000', email: 'wrong@example.test',
    address: 'Invented branch', tagline: '98% customer satisfaction',
    newsTitle: 'Roof questions, clearly explained', newsCopy: '15 years and 1,000+ customers',
    faqs: [{ q: 'Unsupported guarantee', a: 'Response in 30 minutes' }],
  }));
  const { container, unmount } = render(<AppV3 pathname="/news" />);
  expect(container.querySelector('main h1')?.textContent).toBe('Roof leaks, inspections and maintenance');
  expect(container.textContent).not.toMatch(/Unverified Company|Invented branch|wrong@example|0000000000|98%|15 years|1,000/);
  expect(container.querySelector('a[href="tel:0405878406"]')).not.toBeNull();
  unmount();
  const reloaded = render(<AppV3 pathname="/faq" />);
  expect(reloaded.container.textContent).not.toMatch(/Unsupported guarantee|30 minutes/);
  expect(reloaded.container.textContent).toMatch(/agree.*photographs or written notes before booking/i);
});

it('labels contextual service imagery separately from owner-confirmed project records', () => {
  const chimney = page('/services/chimney-flashing-repairs');
  expect(chimney.querySelector('#project-photos h2')?.textContent).not.toMatch(/project photos/i);
  expect(chimney.querySelector('.serviceGallery')?.textContent).not.toMatch(/Images from Ellis Services Group project work/);
  expect(chimney.querySelector('.serviceGallery')?.textContent).toMatch(/context/i);
  const urgent = page('/services/emergency-roof-repairs');
  expect(urgent.querySelector('.serviceGallery[data-project]')).not.toBeNull();
  expect(urgent.querySelector('a[href="/assets/projects/confirmed-urgent-leak-1000.webp"]')).not.toBeNull();
});

it('makes inspection records subject to booking scope while preserving rental coordination and hours', () => {
  for (const path of ['/services/roof-inspections', '/services/rental-property-roof-repairs', '/faq']) {
    const text = page(path).textContent!;
    expect(text, path).not.toMatch(/provide (?:the )?(?:inspection )?photos and a written explanation|provide photos, written findings/);
    expect(text, path).toMatch(/agree|confirm/i);
  }
  const rental = page('/services/rental-property-roof-repairs').textContent;
  expect(rental).toMatch(/remote landlords|interstate landlords/);
  const urgent = page('/services/emergency-roof-repairs').textContent;
  expect(urgent).toContain('9:00 am–9:00 pm');
  expect(urgent).toContain('seven days a week');
  expect(urgent).toContain('additional urgent-service fee');
  expect(urgent).toContain('on-site quote');
});

it.each([
  ['roof-leak-repairs', 'roof-leak-interior-water-mark', /ceiling|water mark/i],
  ['roof-leak-repairs', 'roof-leak-flashing-repair', /flashing|vent/i],
  ['tile-roof-repairs', 'tile-roof-damaged-tiles', /damaged.*tiles/i],
  ['tile-roof-repairs', 'tile-roof-repair-work', /handling tiles/i],
  ['rebedding-repointing', 'ridge-capping-repair-process', /ridge line/i],
  ['roof-inspections', 'roof-inspection-team-review', /tiles.*chimney/i],
  ['roof-inspections', 'roof-inspection-solar-roof-review', /tile.*solar.panel/i],
  ['metal-roof-repairs', 'metal-roof-repair-team-work', /metal roof/i],
  ['metal-roof-repairs', 'metal-roof-secure-fixing', /fixings/i],
  ['roof-cleaning', 'roof-cleaning-controlled-wash', /cleaning|spraying/i],
])('describes pending %s image %s without certifying work conditions', (slug, asset, visibleSubject) => {
  const host = page(`/services/${slug}`);
  const gallery = host.querySelector('.serviceGallery')!;
  const image = gallery.querySelector(`img[src*="${asset}"]`);
  expect(image, asset).not.toBeNull();
  expect(gallery.querySelector(`a[href="/assets/services/${asset}.png"]`)).not.toBeNull();
  expect(image?.getAttribute('alt')).toMatch(visibleSubject);
  const safetyJudgment = /\bcontrolled\b|\bsafe\b|fall protection|tethered position/i;
  expect(gallery.textContent).not.toMatch(safetyJudgment);
  for (const img of host.querySelectorAll(`img[src*="${asset}"]`)) {
    expect(img.getAttribute('alt'), asset).not.toMatch(safetyJudgment);
  }
  // The boundary applies to claims about the image, not useful safety guidance.
  expect(host.querySelector('main')?.textContent).toMatch(/safe|safely|Do not climb/);
});

it.each(['/news', '/news/cracked-slipped-missing-roof-tiles-canberra'])('keeps pending tile-cover descriptions observational on %s', (path) => {
  const host = page(path);
  const cover = host.querySelector('img[src*="damaged-tile-record"]');
  expect(cover).not.toBeNull();
  expect(cover?.getAttribute('alt')).toMatch(/damaged roof tiles/i);
  expect(cover?.getAttribute('alt')).not.toMatch(/\bcontrolled\b|\bsafe\b/);
  if (path !== '/news') {
    expect(host.querySelector('main')?.textContent).toMatch(/Do not (?:climb|walk|access)|safe ground/i);
  }
});
