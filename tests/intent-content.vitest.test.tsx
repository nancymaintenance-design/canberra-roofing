// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { getRouteHead } from '../src/route-meta';

function page(path: string) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host;
}
describe('keyword-map intent answers and confirmed operating hours', () => {
  it('serves urgent enquiries with the real hours, fee boundary and call/booking paths', () => {
    const host = page('/services/emergency-roof-repairs');
    expect(host.querySelector('main h1')?.textContent).toBe('Emergency & Urgent Roof Repairs');
    expect(host.querySelector('main')?.textContent).toContain('9:00 am–9:00 pm');
    expect(host.querySelector('main')?.textContent).toContain('additional urgent-service fee');
    expect(host.querySelector('main a[href="tel:0405878406"]')).not.toBeNull();
    expect(host.querySelector('main a[href="/contact?service=Emergency%20%26%20Urgent%20Roof%20Repairs"]')).not.toBeNull();
    expect(getRouteHead('/services/emergency-roof-repairs').canonical).toBe('https://www.canberraroofkind.com.au/services/emergency-roof-repairs');
  });
  it.each(['/contact', '/faq'])('keeps the hours and after-hours fee readable on %s', path => {
    expect(page(path).querySelector('main')?.textContent).toContain('9:00 am–9:00 pm');
    expect(page(path).querySelector('main')?.textContent).toContain('additional urgent-service fee');
  });
  it.each([
    ['/services/roof-leak-repairs', '5-01'], ['/services/roof-leak-repairs', '5-02'],
    ['/services/roof-leak-repairs', '5-03'], ['/services/roof-leak-repairs', '5-12'],
    ['/services/roof-leak-repairs', '5-13'], ['/services/roof-inspections', '5-05'],
    ['/services/roof-inspections', '5-06'], ['/services/rebedding-repointing', '5-07'],
    ['/services/chimney-flashing-repairs', '5-08'], ['/services/tile-roof-repairs', '5-09'],
    ['/services/tile-roof-repairs', '5-10'], ['/services/roof-renovation', '5-11'],
    ['/services/roof-leak-repairs', '5-04'], ['/services/roof-inspections', '5-18'],
  ])('answers educational intent %s %s in service prose and FAQ', (path, id) => {
    const host = page(path);
    expect(host.querySelector(`[data-topic="${id}"] p`)?.textContent?.length).toBeGreaterThan(65);
    expect(host.querySelector(`details[data-question="${id}"] p`)?.textContent?.length).toBeGreaterThan(65);
    expect(page('/faq').querySelector(`details[data-question="${id}"]`)).not.toBeNull();
  });
  it('makes the urgent page discoverable from service selection, leak care and contact', () => {
    for (const path of ['/services', '/services/roof-leak-repairs', '/contact']) {
      expect(page(path).querySelector('main a[href="/services/emergency-roof-repairs"]')).not.toBeNull();
    }
    expect(page('/contact').querySelector('option[value="Emergency & Urgent Roof Repairs"]')).not.toBeNull();
  });
  it('supports remote owners and managers with a real booking path and report guidance', () => {
    const host = page('/services/rental-property-roof-repairs');
    expect(host.querySelector('main h1')?.textContent).toBe('Roof Repairs for Rental Properties');
    expect(host.querySelector('main')?.textContent).toContain('agree any inspection photos and written findings before booking');
    expect(host.querySelector('main')?.textContent).toContain('coordinate access with your nominated contact');
    expect(host.querySelector('main a[href="/contact?service=Rental%20%26%20Property%20Manager%20Roof%20Repairs"]')).not.toBeNull();
    expect(page('/contact').querySelector('option[value="Rental & Property Manager Roof Repairs"]')).not.toBeNull();
  });
  it('gives tenants a readable reporting guide without substituting for repair authorisation', () => {
    const host = page('/news/roof-leak-information-for-tenants-canberra');
    expect(host.querySelector('main h1')?.textContent).toBe('What should you report when a rental property has a roof leak?');
    expect(host.querySelectorAll('.articleContents a')).toHaveLength(4);
    expect(host.querySelector('.articleBody a[href="/services/rental-property-roof-repairs"]')).not.toBeNull();
  });
});
