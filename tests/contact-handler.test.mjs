import assert from 'node:assert/strict';
import test from 'node:test';

import request from 'supertest';

import { createContactFunction } from '../api/contact.js';
import { gif, jpeg, png, webp } from './fixtures/contact-images.mjs';

const requestId = '11111111-1111-4111-8111-111111111111';
const originHeaders = {
  Origin: 'https://canberraroofkind.example',
  'x-forwarded-proto': 'https',
  'x-forwarded-host': 'canberraroofkind.example',
};
const validFields = {
  name: 'Ellis Example',
  email: 'ellis@example.com',
  phone: '0400 000 000',
  address: '1 Example Street',
  area: 'Belconnen — Belconnen',
  service: 'Roof Leak Repairs',
  message: 'Please arrange an inspection.',
  privacy: 'true',
  website: '',
};

function createRoute(options = {}) {
  const logs = [];
  const sent = [];
  const delivery = options.delivery ?? {
    async sendEnquiry(enquiry) {
      sent.push(enquiry);
      return { ok: true };
    },
  };
  return {
    app: createContactFunction({
      delivery,
      logger: (entry) => logs.push(entry),
      requestIdFactory: () => requestId,
      now: () => 1_700_000_000_000,
      ...options,
    }),
    logs,
    sent,
  };
}

function validPost(app, overrides = {}) {
  let call = request(app).post('/api/contact').set(originHeaders);
  for (const [name, value] of Object.entries({ ...validFields, ...overrides })) call = call.field(name, value);
  return call;
}

function assertPublic(response, status, code, message) {
  assert.equal(response.status, status);
  assert.match(response.headers['content-type'], /^application\/json/);
  assert.deepEqual(response.body, { ok: status === 200, code, message, requestId });
}

test('returns only POST JSON contract and logs one redacted completion', async () => {
  const { app, logs } = createRoute();
  const response = await request(app).get('/api/contact');
  assertPublic(response, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
  assert.equal(response.headers.allow, 'POST');
  assert.equal(logs.length, 1);
  assert.deepEqual(Object.keys(logs[0]).sort(), ['durationMs', 'outcome', 'photoBytes', 'photoPresent', 'requestId', 'route', 'status', 'time']);
});

test('rejects non-multipart and ambiguous or mismatched forwarded origin headers before sending', async () => {
  const { app, sent, logs } = createRoute();
  const nonMultipart = await request(app).post('/api/contact').set(originHeaders).send({ name: 'private name' });
  assertPublic(nonMultipart, 400, 'INVALID_REQUEST', "We couldn't read this enquiry. Check the form and try again.");
  const missingOrigin = await validPost(app).unset('Origin');
  assertPublic(missingOrigin, 403, 'ORIGIN_REJECTED', 'This form must be submitted from the Canberraroofkind website.');
  const ambiguousForward = await validPost(app).set('x-forwarded-host', 'canberraroofkind.example, attacker.example');
  assertPublic(ambiguousForward, 403, 'ORIGIN_REJECTED', 'This form must be submitted from the Canberraroofkind website.');
  const mismatch = await validPost(app).set('Origin', 'https://attacker.example');
  assertPublic(mismatch, 403, 'ORIGIN_REJECTED', 'This form must be submitted from the Canberraroofkind website.');
  assert.equal(sent.length, 0);
  assert.equal(logs.length, 4);
});

test('accepts text-only and each supported signed image once without echoing customer data', async () => {
  for (const [buffer, filename, contentType] of [[undefined, undefined, undefined], [jpeg, 'private-roof.jpg', 'image/jpeg'], [png, 'private-roof.png', 'image/png'], [webp, 'private-roof.webp', 'image/webp']]) {
    const { app, sent } = createRoute();
    let call = validPost(app);
    if (buffer) call = call.attach('photo', buffer, { filename, contentType });
    const response = await call;
    assertPublic(response, 200, 'ENQUIRY_SENT', 'Enquiry sent successfully.');
    assert.equal(sent.length, 1);
    assert.doesNotMatch(JSON.stringify(response.body), /Ellis Example|private-roof/);
  }
});

test('maps duplicate, extra, malformed, oversized, and unsupported multipart input without delivery', async () => {
  const { app, sent } = createRoute();
  const duplicate = await validPost(app).field('name', 'Second Name');
  assertPublic(duplicate, 400, 'INVALID_REQUEST', "We couldn't read this enquiry. Check the form and try again.");
  const extra = await validPost(app).field('unexpected', 'value');
  assertPublic(extra, 400, 'INVALID_REQUEST', "We couldn't read this enquiry. Check the form and try again.");
  const multi = await validPost(app).attach('photo', jpeg, { filename: 'one.jpg', contentType: 'image/jpeg' }).attach('photo', jpeg, { filename: 'two.jpg', contentType: 'image/jpeg' });
  assertPublic(multi, 400, 'INVALID_REQUEST', "We couldn't read this enquiry. Check the form and try again.");
  const unknownFile = await validPost(app).attach('other', jpeg, { filename: 'other.jpg', contentType: 'image/jpeg' });
  assertPublic(unknownFile, 400, 'INVALID_REQUEST', "We couldn't read this enquiry. Check the form and try again.");
  const tooLarge = Buffer.alloc(4 * 1024 * 1024 + 1); tooLarge.set(jpeg);
  const large = await validPost(app).attach('photo', tooLarge, { filename: 'private.jpg', contentType: 'image/jpeg' });
  assertPublic(large, 413, 'PHOTO_TOO_LARGE', 'Photo must be 4 MB or smaller.');
  const unsupported = await validPost(app).attach('photo', gif, { filename: 'private.gif', contentType: 'image/gif' });
  assertPublic(unsupported, 415, 'UNSUPPORTED_PHOTO_TYPE', 'Choose a JPG, PNG or WebP photo.');
  const malformed = await request(app).post('/api/contact').set(originHeaders).set('Content-Type', 'multipart/form-data; boundary=missing').send('--missing\r\nContent-Disposition: form-data; name="name"\r\n\r\nEllis');
  assertPublic(malformed, 400, 'INVALID_REQUEST', "We couldn't read this enquiry. Check the form and try again.");
  assert.equal(sent.length, 0);
});

test('maps validation and honeypot rejections with zero delivery calls', async () => {
  const { app, sent } = createRoute();
  const validation = await validPost(app, { email: 'not-an-email' });
  assert.equal(validation.status, 400);
  assert.equal(validation.body.code, 'VALIDATION_ERROR');
  assert.equal(validation.body.message, 'Check the highlighted fields and try again.');
  assert.deepEqual(validation.body.fieldErrors, { email: 'Enter a valid email address.' });
  assert.equal(validation.body.requestId, requestId);
  const bot = await validPost(app, { website: 'bot value' });
  assertPublic(bot, 400, 'BOT_REJECTED', "We couldn't read this enquiry. Check the form and try again.");
  assert.equal(sent.length, 0);
});

test('maps rejected, failed, and timed-out delivery to one generic retry-safe response', async () => {
  for (const delivery of [
    { async sendEnquiry() { return { ok: false }; } },
    { async sendEnquiry() { throw new Error('smtp private failure'); } },
  ]) {
    const { app } = createRoute({ delivery });
    const response = await validPost(app);
    assertPublic(response, 503, 'DELIVERY_UNAVAILABLE', "We couldn't send your enquiry. Please try again or call 0405878406.");
  }
});

test('waits for a deferred delivery success instead of returning a handler timeout', async () => {
  let resolveDelivery;
  let signalDeliveryStart;
  let sends = 0;
  let settled = false;
  const deliveryStarted = new Promise((resolve) => { signalDeliveryStart = resolve; });
  const delivery = {
    sendEnquiry() {
      sends += 1;
      signalDeliveryStart();
      return new Promise((resolve) => { resolveDelivery = resolve; });
    },
  };
  const { app } = createRoute({ delivery, deliveryTimeoutMs: 5 });
  const responsePromise = validPost(app).then((response) => { settled = true; return response; });
  await deliveryStarted;
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(settled, false, 'the HTTP response must wait for Task 6 delivery');
  resolveDelivery({ ok: true });
  const response = await responsePromise;
  assertPublic(response, 200, 'ENQUIRY_SENT', 'Enquiry sent successfully.');
  assert.equal(sends, 1);
});

test('waits for a deferred delivery rejection and maps it after one send', async () => {
  let rejectDelivery;
  let signalDeliveryStart;
  let sends = 0;
  let settled = false;
  const deliveryStarted = new Promise((resolve) => { signalDeliveryStart = resolve; });
  const delivery = {
    sendEnquiry() {
      sends += 1;
      signalDeliveryStart();
      return new Promise((_, reject) => { rejectDelivery = reject; });
    },
  };
  const { app } = createRoute({ delivery, deliveryTimeoutMs: 5 });
  const responsePromise = validPost(app).then((response) => { settled = true; return response; });
  await deliveryStarted;
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(settled, false, 'the HTTP response must wait for Task 6 delivery');
  rejectDelivery(new Error('private transport failure'));
  const response = await responsePromise;
  assertPublic(response, 503, 'DELIVERY_UNAVAILABLE', "We couldn't send your enquiry. Please try again or call 0405878406.");
  assert.equal(sends, 1);
});

test('clears request-held photo references and emits only one redacted log after delivery', async () => {
  let captured;
  const { app, logs } = createRoute({ delivery: { async sendEnquiry(enquiry) { captured = enquiry; throw new Error('private smtp reply'); } } });
  const response = await validPost(app).attach('photo', jpeg, { filename: 'private-customer-photo.jpg', contentType: 'image/jpeg' });
  assertPublic(response, 503, 'DELIVERY_UNAVAILABLE', "We couldn't send your enquiry. Please try again or call 0405878406.");
  assert.equal(captured.photo.buffer, undefined);
  assert.equal(logs.length, 1);
  const serialized = JSON.stringify(logs[0]);
  assert.doesNotMatch(serialized, /private|ellis@example|0400|Example Street|filename|buffer|origin|header|smtp\.gmail|password/i);
  assert.equal(logs[0].smtpAccepted, false);
});

test('caches injected config and delivery construction without SMTP work per enquiry', async () => {
  let configLoads = 0;
  let serviceBuilds = 0;
  let sends = 0;
  const { app } = createRoute({
    delivery: undefined,
    configLoader: () => { configLoads += 1; return { host: 'smtp.gmail.com' }; },
    createEmailService: () => {
      serviceBuilds += 1;
      return { async sendEnquiry() { sends += 1; return { ok: true }; } };
    },
  });
  assertPublic(await validPost(app), 200, 'ENQUIRY_SENT', 'Enquiry sent successfully.');
  assertPublic(await validPost(app), 200, 'ENQUIRY_SENT', 'Enquiry sent successfully.');
  assert.deepEqual({ configLoads, serviceBuilds, sends }, { configLoads: 1, serviceBuilds: 1, sends: 2 });
});
