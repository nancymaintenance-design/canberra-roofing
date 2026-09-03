import assert from 'node:assert/strict';
import fs from 'node:fs';
import { migrateStoredData } from '../src/storage.js';

const canonicalServices = [
  { slug: 'roof-leak-repairs', title: 'Roof Leak Repairs' },
  { slug: 'tile-roof-repairs', title: 'Tile Roof Repairs' },
  { slug: 'chimney-flashing-repairs', title: 'Chimney Flashing Repairs' },
  { slug: 'rebedding-repointing', title: 'Rebedding & Repointing' },
  { slug: 'roof-inspections', title: 'Roof Inspections' }
];
const canonicalFaqs = [{ q: 'New FAQ one', a: 'New answer one' }, { q: 'New FAQ two', a: 'New answer two' }];
const defaults = { schemaVersion: 2, company: 'Ellis Canberra Service', phone: 'Phone: to be confirmed', email: 'Email: to be confirmed', newsTitle: 'Candidate', newsCopy: 'Review', services: canonicalServices, faqs: canonicalFaqs, leads: [] };
const oldStoredValue = { company: 'Saved Co', phone: 'Saved phone', email: 'Saved email', newsTitle: 'Saved news', newsCopy: 'Saved copy', media: ['saved-media'], leads: [{ name: 'Saved lead' }], faqs: [{ q: 'Old FAQ', a: 'Old answer' }], services: [{ slug: 'roof-repairs', title: 'Roof repairs' }, { slug: 'roof-maintenance', title: 'Roof maintenance' }, { slug: 'gutter-drainage', title: 'Gutter & drainage' }, { slug: 'roof-restoration', title: 'Roof restoration' }, { slug: 'roof-inspections', title: 'Roof inspections' }] };
const result = migrateStoredData(defaults, canonicalServices, canonicalFaqs, oldStoredValue);
assert.equal(result.company, 'Canberraroofkind');
assert.equal(result.phone, '0405878406');
assert.equal(result.email, 'elliservices.group@gmail.com');
assert.equal(result.newsTitle, 'Saved news');
assert.equal(result.media[0], 'saved-media');
assert.equal(result.leads[0].name, 'Saved lead');
assert.deepEqual(result.services.map(s => [s.slug, s.title]), canonicalServices.map(s => [s.slug, s.title]));
assert.deepEqual(result.faqs, canonicalFaqs);
assert.equal(result.schemaVersion, 5);
const edited = migrateStoredData(defaults, canonicalServices, canonicalFaqs, { ...oldStoredValue, schemaVersion: 4, company: 'Edited brand', phone: 'Edited phone', email: 'edited@example.test' });
assert.equal(edited.company, 'Edited brand');
assert.equal(edited.phone, 'Edited phone');
assert.equal(edited.email, 'edited@example.test');
const appSource = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
assert.match(appSource, /const save=.*schemaVersion:5/);
const adminSaved = { ...edited, schemaVersion: 5, company: 'Admin edited brand', phone: 'Admin edited phone', email: 'admin-edited@example.test' };
const reloaded = migrateStoredData(defaults, canonicalServices, canonicalFaqs, adminSaved);
assert.equal(reloaded.schemaVersion, 5);
assert.equal(reloaded.company, 'Admin edited brand');
assert.equal(reloaded.phone, 'Admin edited phone');
assert.equal(reloaded.email, 'admin-edited@example.test');

const legacyNews = migrateStoredData(defaults, canonicalServices, canonicalFaqs, {
  schemaVersion: 4,
  company: 'Canberraroofkind',
  phone: '0405878406',
  email: 'elliservices.group@gmail.com',
  newsTitle: 'Ellis Canberra Service local candidate is ready for review.',
  newsCopy: 'This candidate site is a local demonstration. Service details and publication content require verification before release.'
});
assert.equal(legacyNews.newsTitle, 'Canberraroofkind local candidate is ready for review.');
assert.equal(legacyNews.newsCopy, 'This candidate site is a local demonstration. Service details and publication content require verification before release.');
assert.equal(legacyNews.schemaVersion, 5);

const customNewsInput = {
  schemaVersion: 4,
  company: 'Canberraroofkind',
  phone: '0405878406',
  email: 'elliservices.group@gmail.com',
  newsTitle: 'Ellis Canberra Service — my custom retained title',
  newsCopy: 'Custom Ellis Canberra Service body copy must remain byte-for-byte.'
};
const customNews = migrateStoredData(defaults, canonicalServices, canonicalFaqs, customNewsInput);
assert.equal(customNews.newsTitle, customNewsInput.newsTitle);
assert.equal(customNews.newsCopy, customNewsInput.newsCopy);
const rerun = migrateStoredData(defaults, canonicalServices, canonicalFaqs, customNews);
assert.deepEqual(rerun, customNews);
console.log('storage migration regression test passed');
