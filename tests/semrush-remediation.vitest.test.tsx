// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { getRouteHead } from '../src/route-meta';
import { SUBURB_PROFILES } from '../src/suburb-profiles.js';

function page(path: string) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path}/>);
  return host;
}
it('restores the confirmed replacement service with its own scope and booking choice', () => {
  const host = page('/services/reroof-replacement');
  expect(host.querySelector('h1')?.textContent).toBe('Roof Replacement Canberra');
  expect(host.querySelectorAll('.serviceTheme > h2')).toHaveLength(5);
  expect(host.querySelector('a[href="/contact?service=Roof%20Replacement"]')).not.toBeNull();
  expect(getRouteHead('/services/reroof-replacement').service).not.toBeNull();
  expect(page('/services').querySelector('a[href="/services/reroof-replacement"]')).not.toBeNull();
});
for (const [slug, heading] of [['roof-inspections','Roof Inspections Canberra'], ['roof-cleaning','Roof Cleaning Canberra'], ['roof-leak-repairs','Roof Leak Repairs Canberra']]) {
  it(`${slug}: aligns the service heading and metadata with the local service intent`, () => {
    const host = page('/services/'+slug);
    expect(host.querySelector('h1')?.textContent).toBe(heading);
    expect(getRouteHead('/services/'+slug).title).toContain(heading);
    expect(host.querySelectorAll('.serviceTheme > h2')).toHaveLength(5);
    expect(host.querySelectorAll('#project-photos img').length).toBeGreaterThan(0);
  });
}
it('keeps all unproven suburb pages noindex while giving historical cleaning traffic a direct relevant route', () => {
  for (const profile of SUBURB_PROFILES) expect(getRouteHead(profile.path).robots).toBe('noindex,follow');
  const host = page('/areas/belconnen/mckellar-roof-repairs');
  expect(host.querySelector('.suburbFeatured h3')?.textContent).toBe('Roof Cleaning');
  expect(host.querySelector('.suburbEvidence a[href="/areas/belconnen"]')).not.toBeNull();
});
