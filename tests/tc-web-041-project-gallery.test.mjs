import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
const aboutGalleryAssets = [
  'ellis-brand-team-briefing.png',
  'ellis-brand-vehicle-tools.png',
  'ellis-brand-service-van.png',
  'ellis-brand-site-preparation.png',
  'ellis-brand-roof-planning.png',
];

test('About presents verifiable business details and an on-site preparation gallery', () => {
  const about = source.match(/function About[\s\S]*?function Services/)?.[0] || '';
  assert.match(about, /BUSINESS DETAILS/);
  assert.match(about, /121 Marcus Clarke St, Canberra, ACT 2600/);
  assert.match(about, /elliservices\.group@gmail\.com/);
  assert.match(about, /https:\/\/abr\.business\.gov\.au\/ABN\/View\?id=645821745/);
  assert.match(about, /ON-SITE PREPARATION/);
  assert.doesNotMatch(about, /98% Customer Satisfaction Across Our Projects/);
  for (const asset of aboutGalleryAssets) {
    assert.match(about, new RegExp(`/assets/about/${asset}`));
    assert.ok(existsSync(new URL(`../public/assets/about/${asset}`, import.meta.url)));
  }
});

test('the verified 98% satisfaction statement remains scoped to the published case study', () => {
  const caseStudy = source.match(/function CaseStudyView[\s\S]*?function AppV3/)?.[0] || '';
  assert.match(caseStudy, /98% customer satisfaction/i);
  assert.match(caseStudy, /tile roof repair/i);
});
