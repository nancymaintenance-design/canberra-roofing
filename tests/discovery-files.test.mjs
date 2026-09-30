import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { SERVICE_CATALOG } from '../src/service-catalog.js';
import { DISTRICT_PROFILES, SUBURB_PROFILES } from '../src/suburb-profiles.js';

const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const serviceAreas = JSON.parse(await readFile(new URL('../public/service-areas.json', import.meta.url), 'utf8'));
const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');

test('the public service-area feed exposes every generated suburb page and its service links', () => {
  assert.equal(serviceAreas.serviceAreas.length, SUBURB_PROFILES.length);
  assert.deepEqual(serviceAreas.serviceAreas[0].servicePaths, SERVICE_CATALOG.map(({ path }) => path));
  assert.equal(serviceAreas.serviceAreas[0].url, `https://www.canberraroofkind.com.au${SUBURB_PROFILES[0].path}`);
});

test('discovery files list indexable district pages and retain suburb navigation in the public feed', () => {
  for (const profile of DISTRICT_PROFILES) assert.match(sitemap, new RegExp(profile.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const profile of SUBURB_PROFILES) assert.doesNotMatch(sitemap, new RegExp(profile.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  for (const service of SERVICE_CATALOG) assert.match(llms, new RegExp(service.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(llms, /121 Marcus Clarke St, Canberra, ACT 2600/);
});
