import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';

import { ContactApiError, buildContactFormData, sendContactEnquiry } from '../src/contact-api.js';

const requestId = '550e8400-e29b-41d4-a716-446655440000';
const genericFailure = "We couldn't send your enquiry. Please try again or call 0405878406.";

function createForm() {
  const dom = new JSDOM(`<form>
    <input name="name" value="Ellis" />
    <input name="email" value="ellis@example.com" />
    <input name="phone" value="0400 000 000" />
    <input name="address" value="1 Example Street" />
    <input name="area" value="Belconnen — Belconnen" />
    <input name="service" value="Roof Leak Repairs" />
    <textarea name="message">Please arrange an inspection.</textarea>
    <input name="privacy" type="checkbox" checked />
    <input name="website" value="" />
    <input name="photo" type="file" />
  </form>`);
  return dom.window.document.querySelector('form');
}

function entries(formData) {
  return [...formData.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : { name: value.name, type: value.type, size: value.size }]);
}

function response(status, body) {
  return { status, json: async () => body };
}

async function expectError(run, expected) {
  await assert.rejects(run, (error) => {
    assert.ok(error instanceof ContactApiError);
    assert.deepEqual(
      { status: error.status, code: error.code, fieldErrors: error.fieldErrors, requestId: error.requestId, message: error.message },
      expected,
    );
    return true;
  });
}

test('buildContactFormData creates exact normalized same-origin multipart entries without an empty photo', () => {
  const form = createForm();
  const formData = buildContactFormData(form);

  assert.ok(formData instanceof form.ownerDocument.defaultView.FormData);
  assert.deepEqual(entries(formData), [
    ['name', 'Ellis'],
    ['email', 'ellis@example.com'],
    ['phone', '0400 000 000'],
    ['address', '1 Example Street'],
    ['area', 'Belconnen — Belconnen'],
    ['service', 'Roof Leak Repairs'],
    ['message', 'Please arrange an inspection.'],
    ['privacy', 'true'],
    ['website', ''],
  ]);
});

test('adds a selected photo but omits an empty chooser', () => {
  const form = createForm();
  const photoInput = form.elements.namedItem('photo');
  const file = new form.ownerDocument.defaultView.File(['roof'], 'roof.jpg', { type: 'image/jpeg' });
  Object.defineProperty(photoInput, 'files', { configurable: true, value: [file] });

  assert.deepEqual(entries(buildContactFormData(form)).at(-1), ['photo', { name: 'roof.jpg', type: 'image/jpeg', size: 4 }]);
});

test('posts only the required request configuration and returns the strict success contract', async () => {
  const form = createForm();
  let captured;
  const result = await sendContactEnquiry(form, async (url, options) => {
    captured = { url, options };
    return response(200, { ok: true, code: 'ENQUIRY_SENT', message: 'Enquiry sent successfully.', requestId });
  });

  assert.deepEqual(result, { ok: true, code: 'ENQUIRY_SENT', message: 'Enquiry sent successfully.', requestId });
  assert.equal(captured.url, '/api/contact');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.credentials, 'omit');
  assert.deepEqual(captured.options.headers, { Accept: 'application/json' });
  assert.equal(Object.keys(captured.options.headers).some((name) => name.toLowerCase() === 'content-type'), false);
  assert.ok(captured.options.body instanceof form.ownerDocument.defaultView.FormData);
  assert.equal(form.elements.namedItem('name').value, 'Ellis', 'adapter never resets the form');
});

test('preserves safe 400 validation errors and request IDs', async () => {
  await expectError(
    () => sendContactEnquiry(createForm(), async () => response(400, {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Check the highlighted fields and try again.',
      fieldErrors: { email: 'Enter a valid email address.' },
      requestId,
    })),
    { status: 400, code: 'VALIDATION_ERROR', fieldErrors: { email: 'Enter a valid email address.' }, requestId, message: 'Check the highlighted fields and try again.' },
  );
});

test('preserves only approved structured messages for known 403, 413, 415, and 429 errors', async () => {
  for (const [status, code, message] of [
    [403, 'ORIGIN_REJECTED', 'This form must be submitted from the Canberraroofkind website.'],
    [413, 'PHOTO_TOO_LARGE', 'Photo must be 4 MB or smaller.'],
    [415, 'UNSUPPORTED_PHOTO_TYPE', 'Choose a JPG, PNG or WebP photo.'],
    [429, 'RATE_LIMITED', 'Too many attempts. Please wait 10 minutes and try again.'],
  ]) {
    await expectError(
      () => sendContactEnquiry(createForm(), async () => response(status, { ok: false, code, message, requestId })),
      { status, code, fieldErrors: undefined, requestId, message },
    );
  }
});

test('maps unsafe or malformed delivery outcomes to the generic failure without retrying', async () => {
  const cases = [
    async () => ({ status: 500, json: async () => { throw new SyntaxError('not json'); } }),
    async () => ({ status: 200, json: async () => ({ ok: true, code: 'WRONG', message: 'raw failure', requestId }) }),
    async () => ({ status: 200, json: async () => ({ ok: false, code: 'VALIDATION_ERROR', message: 'unapproved raw text', requestId }) }),
    async () => response(403, { ok: false, code: 'UNKNOWN_CODE', message: 'This form must be submitted from the Canberraroofkind website.', requestId }),
    async () => response(418, { ok: false, code: 'ORIGIN_REJECTED', message: 'This form must be submitted from the Canberraroofkind website.', requestId }),
    async () => response(403, { ok: false, code: 'ORIGIN_REJECTED', message: 'untrusted raw text', requestId }),
    async () => { throw new TypeError('network offline'); },
  ];
  for (const fetchImpl of cases) {
    let calls = 0;
    await expectError(
      () => sendContactEnquiry(createForm(), (...args) => { calls += 1; return fetchImpl(...args); }),
      { status: undefined, code: undefined, fieldErrors: undefined, requestId: undefined, message: genericFailure },
    );
    assert.equal(calls, 1);
  }
});

test('adapter source has no logging, retry, storage, or customer-data serialization side effects', async () => {
  const source = await readFile(new URL('../src/contact-api.js', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /console\./);
  assert.doesNotMatch(source, /localStorage|sessionStorage|JSON\.stringify/);
  assert.doesNotMatch(source, /retry|setTimeout/);
});
