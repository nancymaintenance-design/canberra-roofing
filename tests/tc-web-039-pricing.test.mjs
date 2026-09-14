import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('src/main.tsx', root), 'utf8');
const routes = JSON.parse(await readFile(new URL('src/route-meta.json', root), 'utf8'));
const sitemap = await readFile(new URL('public/sitemap.xml', root), 'utf8');
const vercel = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));

const newServices = [
  ['metal-colorbond-roof-repairs', 'Metal & Colorbond Roof Repairs'],
  ['roof-restoration', 'Roof Restoration'],
  ['reroof-replacement', 'Re-roofing & Roof Replacement'],
  ['gutter-fascia-repairs', 'Gutter & Fascia Repairs'],
];

test('TC-WEB-039 publishes four scoped pricing service routes and their service cards', () => {
  for (const [slug, title] of newServices) {
    assert.match(source, new RegExp(`slug:'${slug}'`), `${slug} is a service`);
    assert.match(source, new RegExp(`title:'${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`), `${slug} keeps its page title`);
    assert.ok(routes[`/services/${slug}`], `${slug} has route metadata`);
    assert.match(sitemap, new RegExp(`/services/${slug}`), `${slug} is in the sitemap`);
    assert.ok(vercel.rewrites.some((rule) => rule.source === `/services/${slug}` && rule.destination === `/services/${slug}.html`), `${slug} has a production rewrite`);
    const relatedStart = source.indexOf(`serviceBySlug['${slug}'].related`);
    assert.ok(relatedStart >= 0, `${slug} has related service cards`);
  }
});

test('TC-WEB-039 adds transparent indicative pricing copy without unsupported claims', () => {
  assert.match(source, /Indicative pricing in AUD\. Your itemised written quote confirms the final price before work begins\./);
  assert.match(source, /We do not add undisclosed charges within the approved written scope\./);
  assert.match(source, /extra work is identified or the scope changes, we explain it and obtain your approval before proceeding/i);
  for (const unsupported of ['free', 'from', 'lowest', '24-7', 'guaranteed', 'insurance']) {
    assert.doesNotMatch(source, new RegExp(`Indicative Pricing[\\s\\S]{0,1500}${unsupported}`, 'i'), `pricing component does not promise ${unsupported}`);
  }
});

test('TC-WEB-039 gives each of the nine service pages a related-pathway card and uses nine-service copy', () => {
  const allServiceSlugs = [
    'roof-leak-repairs',
    'tile-roof-repairs',
    'chimney-flashing-repairs',
    'rebedding-repointing',
    'roof-inspections',
    ...newServices.map(([slug]) => slug),
  ];

  for (const slug of allServiceSlugs) {
    const related = source.match(new RegExp(`serviceBySlug\\['${slug}'\\]\\.related=\\[([\\s\\S]*?)\\];`));
    assert.ok(related, `${slug} defines related pathways`);
    assert.match(related[1], /path:'\/services\//, `${slug} has at least one related service card`);
  }

  assert.doesNotMatch(source, /Five focused enquiry pathways\./);
  assert.match(source, /Nine service pathways for Canberra roof concerns\./);
});

test('TC-PRICE-040 provides the audited Canberra market guides with scoped units on every service page', () => {
  assert.match(source, /Indicative pricing in AUD\. Your itemised written quote confirms the final price before work begins\./);
  const expectedGuides = [
    ['roof-leak-repairs', 'AUD 275–880 per job', 'minor roof-leak repair'],
    ['tile-roof-repairs', 'AUD 330–1,100 per job', 'small/localised tile-replacement repair'],
    ['chimney-flashing-repairs', 'AUD 400–1,200 per penetration', 'single accessible flashing junction'],
    ['rebedding-repointing', 'AUD 440–1,325 per job', 'repointing only; rebedding/wider scope assessment'],
    ['roof-inspections', 'AUD 220–550 per visit', 'visual inspection/report, excludes invasive/certification'],
    ['metal-colorbond-roof-repairs', 'AUD 275–880 per job', 'minor localised repair reference, large corrosion/sheet replacement assessment'],
    ['roof-restoration', 'AUD 2,750–6,600 per project', 'standard restoration guide; broader repair assessment'],
    ['reroof-replacement', 'AUD 88–200/m² Colorbond', 'AUD 110–240/m² tile'],
    ['gutter-fascia-repairs', 'Gutter replacement AUD 44–120 per linear metre', 'Fascia work is assessed and quoted separately.'],
  ];

  for (const [slug, price, qualifier] of expectedGuides) {
    const record = source.match(new RegExp(`slug:'${slug}'([\\s\\S]*?)(?=\\{slug:|\\];\\nconst|$)`));
    assert.ok(record, `${slug} service record is present`);
    assert.ok(source.includes(price), `${slug} has its specified price unit`);
    assert.ok(source.includes(qualifier), `${slug} qualifies its displayed range`);
  }
  assert.match(source, /AUD 11,000–44,000 full-home market guide/);
  assert.match(source, /approved written scope[\s\S]{0,240}explain[\s\S]{0,240}approval/i);
  for (const unsupported of ['free', 'from', 'lowest', 'guaranteed', '24-7', 'insurance']) {
    assert.doesNotMatch(source, new RegExp(`Indicative pricing in AUD[\\s\\S]{0,2200}${unsupported}`, 'i'));
  }
});
