import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
const galleryAssets = [
  'project-case-full-roof-renewal.jpg',
  'project-case-roof-tile-maintenance.jpg',
  'project-case-chimney-flashing.jpg',
  'project-case-roof-underlay.jpg',
  'project-case-tile-restoration.jpg'
];

test('About presents the approved satisfaction statement and real project gallery', () => {
  const about = source.match(/function About[\s\S]*?function Services/)?.[0] || '';
  assert.match(about, /Roof Repair Canberra: 98% Customer Satisfaction Across Our Projects/);
  assert.match(about, /Across our roofing repair projects, 98% of customers rate our service positively\./);
  assert.doesNotMatch(about, /屋面维修客户好评率98%/);
  assert.match(about, /REAL PROJECT WORK/);
  assert.match(about, /projectCaseLead/);
  for (const asset of galleryAssets) {
    assert.match(about, new RegExp(`/assets/projects/${asset}`));
    assert.ok(existsSync(new URL(`../public/assets/projects/${asset}`, import.meta.url)));
  }
});
