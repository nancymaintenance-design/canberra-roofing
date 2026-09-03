import assert from 'node:assert/strict';
import test from 'node:test';

import { FIELD_LIMITS, PHOTO_LIMIT_BYTES } from '../src/contact-options.js';
import { sanitizeAttachmentFilename, validateContactSubmission } from '../api/_lib/contact-validation.js';
import { executable, gif, jpeg, pdf, png, svg, unknown, webp } from './fixtures/contact-images.mjs';

const validFields = () => ({ name: ' Ellis ', email: ' ellis@example.com ', phone: ' 0400 000 000 ', address: ' 1 Example Street ', area: ' Belconnen — Belconnen ', service: ' Roof Leak Repairs ', message: ' Please arrange an inspection. ', privacy: 'true', website: '' });
const validInput = (overrides = {}) => ({ fields: validFields(), files: [], ...overrides });

function expectFailure(result, status, code) {
  assert.equal(result.ok, false);
  assert.equal(result.status, status);
  assert.equal(result.code, code);
}

test('normalizes trimmed required and optional Contact fields without a photo', async () => {
  const result = await validateContactSubmission(validInput());
  assert.deepEqual(result, { ok: true, fields: { name: 'Ellis', email: 'ellis@example.com', phone: '0400 000 000', address: '1 Example Street', area: 'Belconnen — Belconnen', service: 'Roof Leak Repairs', message: 'Please arrange an inspection.', privacy: 'true', website: '' }, photo: undefined });
});

test('rejects required, invalid email, non-canonical, privacy, and honeypot input', async () => {
  for (const field of ['name', 'email', 'phone', 'area', 'service', 'message']) {
    const result = await validateContactSubmission(validInput({ fields: { ...validFields(), [field]: ' ' } }));
    expectFailure(result, 400, 'VALIDATION_ERROR');
    assert.ok(result.fieldErrors[field]);
  }
  for (const fields of [{ ...validFields(), email: 'not-an-email' }, { ...validFields(), area: 'Other place' }, { ...validFields(), service: 'Other service' }, { ...validFields(), privacy: 'TRUE' }]) {
    expectFailure(await validateContactSubmission(validInput({ fields })), 400, 'VALIDATION_ERROR');
  }
  expectFailure(await validateContactSubmission(validInput({ fields: { ...validFields(), website: 'bot value' } })), 400, 'BOT_REJECTED');
});

test('enforces exact character and byte limits plus duplicate, extra, and oversized metadata', async () => {
  for (const [field, limit, value] of [['name', FIELD_LIMITS.name, 'n'], ['email', FIELD_LIMITS.email, 'e'], ['phone', FIELD_LIMITS.phone, '0'], ['address', FIELD_LIMITS.address, 'a'], ['message', FIELD_LIMITS.message, 'm']]) {
    const atLimit = field === 'email' ? `${value.repeat(limit - 5)}@x.co` : value.repeat(limit);
    assert.equal((await validateContactSubmission(validInput({ fields: { ...validFields(), [field]: atLimit } }))).ok, true);
    expectFailure(await validateContactSubmission(validInput({ fields: { ...validFields(), [field]: `${atLimit}${value}` } })), 400, 'VALIDATION_ERROR');
  }
  const entries = Object.entries(validFields());
  expectFailure(await validateContactSubmission({ fields: validFields(), fieldEntries: [...entries, ['name', 'duplicate']], files: [] }), 400, 'INVALID_REQUEST');
  expectFailure(await validateContactSubmission({ fields: { ...validFields(), extra: 'x' }, files: [] }), 400, 'INVALID_REQUEST');
  expectFailure(await validateContactSubmission({ fields: validFields(), fieldEntries: [...entries.slice(0, -1), ['x'.repeat(FIELD_LIMITS.fieldNameBytes + 1), 'x'], entries.at(-1)], files: [] }), 400, 'INVALID_REQUEST');
  expectFailure(await validateContactSubmission(validInput({ fields: { ...validFields(), message: 'é'.repeat(FIELD_LIMITS.textFieldBytes) } })), 400, 'INVALID_REQUEST');
});

test('accepts synthetic JPEG, PNG, and WebP signatures with safe normalized filenames', async () => {
  for (const [buffer, mimetype, originalname, filename] of [[jpeg, 'image/jpeg', '../../roof\r\n repair.jpg', 'roof_repair.jpg'], [png, 'image/png', 'roof.png', 'roof.png'], [webp, 'image/webp', 'roof.webp', 'roof.webp']]) {
    const result = await validateContactSubmission(validInput({ files: [{ fieldname: 'photo', buffer, mimetype, originalname, size: buffer.length }] }));
    assert.equal(result.ok, true);
    assert.equal(result.photo.filename, filename);
  }
  assert.equal(sanitizeAttachmentFilename('../very unsafe\r\n name.jpeg', '.jpeg'), 'very_unsafe_name.jpeg');
});

test('rejects file-count, size, empty, forbidden, unknown, and mismatched attachments without echoing input', async () => {
  expectFailure(await validateContactSubmission(validInput({ files: [{ fieldname: 'photo', buffer: jpeg, mimetype: 'image/jpeg', originalname: 'one.jpg' }, { fieldname: 'photo', buffer: jpeg, mimetype: 'image/jpeg', originalname: 'two.jpg' }] })), 400, 'INVALID_REQUEST');
  const large = Buffer.alloc(PHOTO_LIMIT_BYTES); large.set(jpeg); const exact = await validateContactSubmission(validInput({ files: [{ fieldname: 'photo', buffer: large, mimetype: 'image/jpeg', originalname: 'exact.jpg', size: large.length }] })); assert.equal(exact.ok, true);
  const tooLarge = Buffer.alloc(PHOTO_LIMIT_BYTES + 1); tooLarge.set(jpeg); expectFailure(await validateContactSubmission(validInput({ files: [{ fieldname: 'photo', buffer: tooLarge, mimetype: 'image/jpeg', originalname: 'private-name.jpg', size: tooLarge.length }] })), 413, 'PHOTO_TOO_LARGE');
  for (const [buffer, mimetype, originalname] of [[Buffer.alloc(0), 'image/jpeg', 'private-name.jpg'], [gif, 'image/gif', 'private-name.gif'], [pdf, 'application/pdf', 'private-name.pdf'], [executable, 'application/octet-stream', 'private-name.exe'], [svg, 'image/svg+xml', 'private-name.svg'], [unknown, 'image/jpeg', 'private-name.jpg'], [jpeg, 'image/png', 'private-name.png'], [jpeg, 'image/jpeg', 'private-name.JPG']]) {
    const result = await validateContactSubmission(validInput({ files: [{ fieldname: 'photo', buffer, mimetype, originalname, size: buffer.length }] }));
    expectFailure(result, 415, 'UNSUPPORTED_PHOTO_TYPE');
    assert.doesNotMatch(JSON.stringify(result), /private-name|password|smtp/i);
  }
});
