import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  AREA_OPTIONS,
  FIELD_LIMITS,
  PHOTO_ALLOWED_TYPES,
  PHOTO_EXTENSIONS,
  PHOTO_LIMIT_BYTES,
  SERVICE_TITLES,
} from '../src/contact-options.js';
import { validateEnquiry } from '../src/enquiry-validation.js';

const validEnquiry = () => ({
  name: 'Ellis',
  email: 'ellis@example.com',
  phone: '0400 000 000',
  address: '',
  area: AREA_OPTIONS[0],
  service: SERVICE_TITLES[0],
  message: 'Please arrange an inspection.',
  privacy: true,
});

test('all app-owned enquiry fields report linked validation errors when blank', () => {
  const errors = validateEnquiry({
    name: '',
    email: '',
    phone: '',
    area: '',
    service: '',
    message: '',
    privacy: false,
  });

  assert.deepEqual(Object.keys(errors), [
    'name',
    'email',
    'phone',
    'area',
    'service',
    'message',
    'privacy',
  ]);
});

test('email must look valid and surrounding whitespace is ignored', () => {
  const invalid = validateEnquiry({
    name: 'Ellis',
    email: 'not-an-email',
    phone: '0400 000 000',
    area: AREA_OPTIONS[0],
    service: SERVICE_TITLES[0],
    message: 'Please arrange an inspection.',
    privacy: true,
  });
  assert.equal(invalid.email, 'Enter a valid email address.');

  const valid = validateEnquiry({
    name: '  Ellis  ',
    email: '  ellis@example.com  ',
    phone: '  0400 000 000  ',
    area: `  ${AREA_OPTIONS[0]}  `,
    service: `  ${SERVICE_TITLES[0]}  `,
    message: '  Please arrange an inspection.  ',
    privacy: true,
  });
  assert.deepEqual(valid, {});
});

test('contact form owns accessible error presentation and submission control', async () => {
  const source = await readFile(new URL('../src/contact-form.jsx', import.meta.url), 'utf8');

  assert.match(source, /<form ref=\{formRef\} onSubmit=\{submit\}[^>]*noValidate>/);
  for (const field of ['name', 'email', 'phone', 'area', 'service', 'message', 'privacy']) {
    assert.match(source, new RegExp(`aria-describedby=\\{errors\\.${field} \\? '${field}-error' : undefined\\}`));
  }
  assert.match(source, /if \(firstInvalid\) \{/);
  assert.ok(source.indexOf('if (firstInvalid)') < source.indexOf('await submitEnquiry'), 'invalid submission exits before send');
  assert.ok(source.indexOf('if (firstInvalid)') < source.indexOf('form.reset()'), 'invalid submission exits before reset');
  assert.doesNotMatch(source, /localStorage|save\(\{leads/);
});

test('canonical area membership and service titles preserve their approved order', () => {
  assert.deepEqual(AREA_OPTIONS, [
    'Aranda — Belconnen', 'Belconnen — Belconnen', 'Bruce — Belconnen', 'Cook — Belconnen', 'Hawker — Belconnen', 'Macquarie — Belconnen', 'McKellar — Belconnen', 'Scullin — Belconnen', 'Weetangera — Belconnen',
    'Campbell — East Canberra', 'Duntroon — East Canberra', 'Harman — East Canberra', 'Kowen — East Canberra', 'Majura — East Canberra', 'Pialligo — East Canberra', 'Queanbeyan fringe — East Canberra',
    'Amaroo — Gungahlin', 'Bonner — Gungahlin', 'Casey — Gungahlin', 'Crace — Gungahlin', 'Forde — Gungahlin', 'Franklin — Gungahlin', 'Gungahlin — Gungahlin', 'Harrison — Gungahlin', 'Nicholls — Gungahlin', 'Ngunnawal — Gungahlin',
    'Acton — Inner North & City', 'Ainslie — Inner North & City', 'Braddon — Inner North & City', 'City — Inner North & City', 'Dickson — Inner North & City', 'Downer — Inner North & City', 'Lyneham — Inner North & City', 'O’Connor — Inner North & City', 'Turner — Inner North & City', 'Watson — Inner North & City',
    'Barton — Inner South', 'Deakin — Inner South', 'Forrest — Inner South', 'Griffith — Inner South', 'Kingston — Inner South', 'Manuka — Inner South', 'Narrabundah — Inner South', 'Red Hill — Inner South', 'Yarralumla — Inner South',
    'Coombs — Molonglo Valley', 'Denman Prospect — Molonglo Valley', 'Molonglo — Molonglo Valley', 'Wright — Molonglo Valley',
    'Calwell — Tuggeranong', 'Conder — Tuggeranong', 'Erindale — Tuggeranong', 'Fadden — Tuggeranong', 'Gordon — Tuggeranong', 'Kambah — Tuggeranong', 'Lanyon — Tuggeranong', 'Tuggeranong — Tuggeranong', 'Wanniassa — Tuggeranong',
    'Chapman — Weston Creek', 'Duffy — Weston Creek', 'Fisher — Weston Creek', 'Holder — Weston Creek', 'Rivett — Weston Creek', 'Stirling — Weston Creek', 'Warambanga — Weston Creek', 'Weston — Weston Creek',
    'Chifley — Woden', 'Curtin — Woden', 'Farrer — Woden', 'Garran — Woden', 'Hughes — Woden', 'Isaacs — Woden', 'Mawson — Woden', 'O’Malley — Woden', 'Pearce — Woden', 'Phillip — Woden', 'Torrens — Woden',
  ]);
  assert.deepEqual(SERVICE_TITLES, [
    'Roof Leak Repairs',
    'Tile Roof Repairs',
    'Chimney Flashing Repairs',
    'Rebedding & Repointing',
    'Roof Inspections',
  ]);
});

test('trims required values and rejects non-canonical selections or non-boolean privacy', () => {
  const blank = validateEnquiry({ ...validEnquiry(), name: ' ', email: ' ', phone: ' ', area: ' ', service: ' ', message: ' ', privacy: 'true' });
  assert.deepEqual(Object.keys(blank), ['name', 'email', 'phone', 'area', 'service', 'message', 'privacy']);
  assert.equal(validateEnquiry({ ...validEnquiry(), area: 'Belconnen' }).area, 'Choose a Canberra suburb or area.');
  assert.equal(validateEnquiry({ ...validEnquiry(), service: 'Roof inspection' }).service, 'Choose a service interest.');
  assert.equal(validateEnquiry({ ...validEnquiry(), privacy: 1 }).privacy, 'Agree to the privacy notice to continue.');
});

test('accepts each text field at its limit and rejects the next character', () => {
  const cases = [
    ['name', FIELD_LIMITS.name, (size) => 'n'.repeat(size)],
    ['email', FIELD_LIMITS.email, (size) => `${'e'.repeat(size - 5)}@x.co`],
    ['phone', FIELD_LIMITS.phone, (size) => '0'.repeat(size)],
    ['address', FIELD_LIMITS.address, (size) => 'a'.repeat(size)],
    ['message', FIELD_LIMITS.message, (size) => 'm'.repeat(size)],
  ];
  for (const [field, limit, makeValue] of cases) {
    assert.equal(validateEnquiry({ ...validEnquiry(), [field]: makeValue(limit) })[field], undefined, `${field} accepts its maximum`);
    assert.equal(validateEnquiry({ ...validEnquiry(), [field]: makeValue(limit + 1) })[field], `${field[0].toUpperCase()}${field.slice(1)} must be ${limit} characters or fewer.`);
  }
});

test('photo preflight permits optional valid photos and rejects invalid declarations or size', () => {
  assert.deepEqual(validateEnquiry(validEnquiry()), {});
  for (const photo of [
    { name: 'roof.jpg', type: 'image/jpeg', size: PHOTO_LIMIT_BYTES },
    { name: 'roof.jpeg', type: 'image/jpeg', size: PHOTO_LIMIT_BYTES },
    { name: 'roof.png', type: 'image/png', size: PHOTO_LIMIT_BYTES },
    { name: 'roof.webp', type: 'image/webp', size: PHOTO_LIMIT_BYTES },
  ]) {
    assert.deepEqual(validateEnquiry({ ...validEnquiry(), photo }), {});
  }
  assert.deepEqual(PHOTO_ALLOWED_TYPES, ['image/jpeg', 'image/png', 'image/webp']);
  assert.deepEqual(PHOTO_EXTENSIONS, ['.jpg', '.jpeg', '.png', '.webp']);
  assert.equal(validateEnquiry({ ...validEnquiry(), photo: { name: 'roof.gif', type: 'image/gif', size: 1 } }).photo, 'Choose a JPG, PNG or WebP photo.');
  assert.equal(validateEnquiry({ ...validEnquiry(), photo: { name: 'roof.gif', type: 'image/jpeg', size: 1 } }).photo, 'Choose a JPG, PNG or WebP photo.');
  assert.equal(validateEnquiry({ ...validEnquiry(), photo: { name: 'roof.JPG', type: 'image/jpeg', size: 1 } }).photo, 'Choose a JPG, PNG or WebP photo.');
  assert.equal(validateEnquiry({ ...validEnquiry(), photo: { name: 'roof.jpg', type: 'image/jpeg', size: PHOTO_LIMIT_BYTES + 1 } }).photo, 'Photo must be 4 MB or smaller.');
});

test('Contact and Areas consume canonical exports while serviceSeed retains its page copy', async () => {
  const source = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');
  const contactSource = await readFile(new URL('../src/contact-form.jsx', import.meta.url), 'utf8');

  assert.match(source, /from '\.\/contact-options\.js'/);
  assert.match(source, /<ContactForm/);
  assert.match(contactSource, /AREA_OPTIONS\.map\(\(area\)/);
  assert.match(contactSource, /SERVICE_TITLES\.map\(\(service\)/);
  assert.match(source, /AREA_GROUPS/);
  assert.doesNotMatch(source, /const areas\s*=/);
  assert.match(source, /const serviceSeed:Service\[\]=/);
  assert.match(source, /Water can travel along roof elements or ceilings/);
});
