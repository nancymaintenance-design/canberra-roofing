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
  ])('answers educational intent %s %s once in the service FAQ', (path, id) => {
    const host = page(path);
    expect(host.querySelector(`[data-topic="${id}"]`)).toBeNull();
    expect(host.querySelector(`details[data-question="${id}"] p`)?.textContent?.length).toBeGreaterThan(65);
    expect(page('/faq').querySelector(`details[data-question="${id}"]`)).not.toBeNull();
  });
  it.each([
    ['tile-roof-repairs', 'tile.local-replacement', /Can (only a few|just one or two|one or two damaged)/i, ['profile', 'weathering', 'valley', 'safe access'], '/news/cracked-slipped-missing-roof-tiles-canberra'],
    ['rebedding-repointing', 'ridge.bedding-vs-pointing', /What is (rebedding versus repointing|the difference between roof rebedding and repointing)/i, ['support', 'exposed', 'stability', 'hip'], '/news/rebedding-vs-repointing-canberra-roofs'],
    ['roof-leak-repairs', 'leak.stain-vs-entry', /(Why is a stain not below|Can water enter away|Is the water mark always below)/i, ['framing', 'weather', 'previous repairs'], '/news/after-rain-roof-leak-check-canberra'],
    ['chimney-flashing-repairs', 'chimney.flashing-function', /What does (roof )?flashing do/i, ['mortar', 'sealant', 'wind', 'flue'], '/news/chimney-flashing-water-entry-signs'],
  ])('provides one complete primary answer for %s and the global FAQ', (slug, intent, question, distinctions, guide) => {
    for (const path of [`/services/${slug}`, '/faq']) {
      const host = page(path);
      const answers = [...host.querySelectorAll('main details')].filter(item => question.test(item.querySelector('summary')?.textContent ?? ''));
      expect(answers, path).toHaveLength(1);
      expect(answers[0].getAttribute('data-intent')).toBe(intent);
      for (const detail of distinctions) expect(answers[0].textContent?.toLowerCase()).toContain(detail);
      expect(answers[0].querySelector(`a[href="${guide}"]`)).not.toBeNull();
      const paragraphs = [...host.querySelectorAll('main p')].map(item => item.textContent);
      for (const answer of answers[0].querySelectorAll('p')) expect(paragraphs.filter(text => text === answer.textContent)).toHaveLength(1);
    }
  });
  it('retains explicit legacy question markers on their canonical entry without duplicate answers', () => {
    const host = page('/faq');
    for (const [base, topic, intent] of [['base-12','5-09','tile.local-replacement'],['base-14','5-07','ridge.bedding-vs-pointing'],['base-6','5-03','leak.stain-vs-entry'],['base-16','5-08','chimney.flashing-function']]) {
      const primary = host.querySelector(`details[data-intent="${intent}"]`)!;
      expect(host.querySelector(`[data-question="${topic}"]`)?.closest('details')).toBe(primary);
      expect(host.querySelector(`[data-question="${base}"]`)?.closest('details')).toBe(primary);
    }
  });
  it.each([
    ['rebedding-repointing', 'ridge.local-scope', 'Does every crack mean all ridge caps need repointing?', 'Does every ridge line need the same work?'],
    ['roof-inspections', 'inspection.before-repair-decision', 'Can I arrange a roof inspection before deciding what to repair?', 'Can I book an inspection without choosing a repair service?'],
  ])('identifies the seed answer that owns the merged booking intent for %s', (slug, intent, primary, previous) => {
    const host = page(`/services/${slug}`);
    const answer = host.querySelector(`details[data-intent="${intent}"]`);
    expect(answer?.querySelector('summary')?.textContent).toBe(primary);
    expect([...host.querySelectorAll('#service-faq summary')].map(node=>node.textContent)).not.toContain(previous);
  });
  it.each([
    ['roof-leak-repairs', ['underlay', 'roof-space', 'wet electrical', 'dry weather', 'temporary measure', 'coating', 'framing'], ['/news/roof-leak-vs-condensation-canberra', '/news/gutters-overflowing-heavy-rain-canberra', '/services/gutter-repairs']],
    ['tile-roof-repairs', ['terracotta', 'concrete', 'profile', 'weathering', 'valley', 'do not climb'], ['/news/roof-cleaning-methods-canberra', '/news/roof-repair-vs-restoration-vs-replacement-canberra']],
    ['chimney-flashing-repairs', ['brickwork', 'mortar', 'sealant', 'flue', 'wind', 'roof pitch'], ['/news/chimney-flashing-water-entry-signs', '/services/roof-leak-repairs']],
    ['rebedding-repointing', ['support', 'exposed', 'stability', 'hip', 'per-metre', 'do not touch'], ['/news/roof-repointing-cost-canberra', '/news/rebedding-vs-repointing-canberra-roofs']],
    ['roof-inspections', ['visual', 'non-invasive', 'roof-space', 'two-storey', 'engineering', 'valuation', 'certification'], ['/news/roof-repair-cost-canberra', '/services/rental-property-roof-repairs']],
    ['metal-roof-repairs', ['sheets', 'laps', 'fasteners', 'penetrations', 'corrosion', 'garage', 'do not climb'], ['/news/roof-cleaning-methods-canberra', '/services/roof-inspections']],
    ['roof-renovation', ['preparation', 'finishes', 'replacement', 'unresolved leak', 'not a renovation result'], ['/news/roof-repair-vs-restoration-vs-replacement-canberra', '/case-studies/tile-roof-repair-canberra']],
    ['roof-cleaning', ['moss', 'lichen', 'terracotta', 'concrete', 'monier', 'non-abrasive', 'rainwater tanks', 'solar', 'do not climb'], ['/news/roof-cleaning-methods-canberra', '/services/gutter-downpipe-maintenance']],
    ['gutter-downpipe-maintenance', ['gutter fall', 'roof runoff', 'outlets', 'sagging', 'indoor water', 'ladder'], ['/services/gutter-repairs', '/news/gutters-overflowing-heavy-rain-canberra']],
    ['gutter-repairs', ['joints', 'downpipe connections', 'completion checks', 'clearing', 'material', 'indoor drip'], ['/services/gutter-downpipe-maintenance', '/services/roof-leak-repairs']],
    ['emergency-roof-repairs', ['9:00 am–9:00 pm', 'seven days a week', 'on-site quote', 'temporary measure', 'unsafe conditions', '000', '132 500'], ['tel:0405878406', 'https://esa.act.gov.au/be-emergency-ready/storms']],
    ['rental-property-roof-repairs', ['tenant', 'remote', 'interstate', 'two-storey', 'owners corporation', 'approval', 'before booking'], ['/news/roof-leak-information-for-tenants-canberra', '/services/roof-inspections']],
  ])('keeps the material, inspection and safety boundaries visible for %s', (slug, details, links) => {
    const host = page(`/services/${slug}`);
    const view = host.querySelector('.serviceView')!;
    for (const detail of details) expect(view.textContent?.toLowerCase(), `${slug}: ${detail}`).toContain(detail.toLowerCase());
    for (const link of links) expect(view.querySelector(`a[href="${link}"]`), `${slug}: ${link}`).not.toBeNull();
    expect(view.querySelector('#costs-booking')?.textContent).toContain('inspection or booking fee');
    expect(view.querySelector('#costs-booking')?.textContent).toContain('Repair pricing is confirmed after assessment and before work begins.');
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
