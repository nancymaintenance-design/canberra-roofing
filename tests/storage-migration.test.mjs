import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateStoredData } from '../src/storage.js';

const services = [{ slug: 'roof-inspections', title: 'Roof Inspections' }];
const faqs = [{ q: 'Inspection records?', a: 'Agree the scope before booking.' }];
const defaults = {
  company: 'Ellis Services Group', phone: '0405878406', email: 'elliservices.group@gmail.com',
  address: '121 Marcus Clarke St, Canberra, ACT 2600', tagline: 'Roof repairs and inspections',
  newsTitle: 'Roof leaks, inspections and maintenance', newsCopy: 'Roof care guides.',
  services, faqs, media: ['default-image'], leads: [],
};
for (const schemaVersion of [undefined, 5, 8, 99]) {
  test(`saved schema ${schemaVersion} cannot restore unapproved public copy or obsolete services`, () => {
    const saved = {
      schemaVersion, company: 'Unverified identity', phone: '0000', email: 'old@example.test',
      address: 'Unverified address', tagline: '98% satisfaction', newsTitle: 'Old slogan',
      newsCopy: '15 years, 1,000 customers', media: ['saved-image'], panelPreference: 'open',
      services: [{ slug: 'old-service' }], faqs: [{ q: 'Old promise', a: '30 minutes' }],
      leads: [{ name: 'Old lead' }],
    };
    const result = migrateStoredData(defaults, services, faqs, saved);
    for (const key of ['company', 'phone', 'email', 'address', 'tagline', 'newsTitle', 'newsCopy']) {
      assert.equal(result[key], defaults[key], key);
    }
    assert.deepEqual(result.services, [{ slug: 'roof-inspections', title: 'Roof Inspections' }]);
    assert.deepEqual(result.faqs, [{ q: 'Inspection records?', a: 'Agree the scope before booking.' }]);
    assert.deepEqual(result.media, ['saved-image']);
    assert.equal(result.panelPreference, 'open');
    assert.equal('leads' in result, false);
    assert.equal(result.schemaVersion, 8);
    assert.deepEqual(migrateStoredData(defaults, services, faqs, result), result);
    assert.equal(saved.company, 'Unverified identity', 'migration must not mutate its input');
  });
}
test('controlled fields follow new source defaults without a second fact source', () => {
  const next = { ...defaults, company: 'Source-managed revised identity' };
  assert.equal(migrateStoredData(next, services, faqs, defaults).company, 'Source-managed revised identity');
});
