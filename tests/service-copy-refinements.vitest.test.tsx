// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { AppV3 } from '../src/main';
import { configureLocale } from '../src/i18n/runtime';
import { renderPage } from '../src/entry-server';

function service(slug: string) {
  configureLocale(`/services/${slug}`);
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={`/services/${slug}`} />);
  return host;
}

it('keeps inspection administration in booking while retaining the technical assessment', () => {
  const host = service('roof-inspections');
  expect(host.querySelector('.directAnswer')!.textContent).not.toMatch(/fee|photographs|written findings/i);
  const handling = host.querySelector('#how-we-handle-it')!.textContent!;
  expect(handling).toMatch(/visual, non-invasive/i);
  expect(handling).toMatch(/concealed|inaccessible/i);
  expect(handling).not.toMatch(/before booking|photographs and written findings/i);
  expect(host.querySelector('.serviceBookingGrid')!.textContent).toMatch(/inspection.*fee/i);
  expect(host.querySelector('.servicePlanning')!.textContent).toMatch(/photographs|photos/i);
  expect(host.querySelector('[data-question="5-05"]')).not.toBeNull();
});

it('explains rental coordination without repeating the records agreement throughout the page', () => {
  const host = service('rental-property-roof-repairs');
  const paragraphs = [...host.querySelectorAll('.serviceView p')];
  const recordAgreements = paragraphs.filter(p => /photos|photographs/i.test(p.textContent!) && /written findings/i.test(p.textContent!));
  expect(recordAgreements.length).toBeLessThanOrEqual(1);
  const booking = host.querySelector('.serviceBookingGrid')!.textContent!;
  expect(booking).toMatch(/approv|authoris/i);
  expect(booking).toMatch(/recipient/i);
  expect(host.querySelector('[data-question="5-20"]')).not.toBeNull();
});

it('gives cleaning material guidance once and retains leak and unsafe-access boundaries', () => {
  const host = service('roof-cleaning');
  const text = host.querySelector('.serviceView')!.textContent!;
  expect((text.match(/pressure wash/gi) ?? []).length).toBeLessThanOrEqual(1);
  expect(host.querySelector('#how-we-handle-it')!.textContent).toMatch(/coating|coated/i);
  expect(text).toMatch(/runoff/i);
  expect(text).toMatch(/Do not climb/i);
  expect(host.querySelector('[data-question="cleaning-materials"]')).not.toBeNull();
  expect([...host.querySelectorAll('summary')].some(p => p.textContent === 'Can roof cleaning fix a roof leak?')).toBe(true);
});

it('keeps urgent fees in booking and preserves emergency contacts and temporary-work scope', () => {
  const host = service('emergency-roof-repairs');
  expect(host.querySelector('.directAnswer')!.textContent).not.toMatch(/9:00|fee/i);
  const text = host.querySelector('.serviceView')!.textContent!;
  expect(text).toMatch(/temporary/i);
  expect(text).toContain('132 500');
  expect(text).toContain('000');
  expect(host.querySelector('.serviceBookingGrid')!.textContent).toContain('9:00 am–9:00 pm');
  expect(host.querySelector('.serviceBookingGrid')!.textContent).toMatch(/additional urgent-service fee/i);
  expect(host.querySelector('a[href="tel:0405878406"]')).not.toBeNull();
});

it('renders the revised Chinese service copy through the normal server dictionary', () => {
  for (const slug of ['roof-inspections', 'roof-cleaning', 'rental-property-roof-repairs', 'emergency-roof-repairs', 'roof-leak-repairs']) {
    const host = document.createElement('div');
    host.innerHTML = renderPage(`/zh/services/${slug}`, '<html lang="en-AU"><head><!--route-head--></head><body><!--document-route--><!--app-html--></body></html>');
    expect(host.querySelector('.directAnswer')!.textContent).toMatch(/[\u4e00-\u9fff]/);
    expect(host.querySelector('.directAnswer')!.textContent).not.toMatch(/\bWe\b|For an active/);
    const handling = host.querySelector('#how-we-handle-it')!.textContent!;
    expect(handling).not.toMatch(/We (check|assess|inspect|explain|distinguish)/);
    const untranslatedParagraphs = [...host.querySelectorAll('.serviceView p')]
      .map(p => p.textContent!)
      .filter(text => /[A-Za-z]{4}/.test(text) && !/[\u4e00-\u9fff]/.test(text));
    expect(untranslatedParagraphs, slug).toEqual([]);
    expect(host.querySelector('a[href="tel:0405878406"]')).not.toBeNull();
  }
});
