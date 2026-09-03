import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { ContactDeliveryError, createContactEmailService } from '../api/_lib/contact-email.js';

const config = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  user: 'mailbox@example.test',
  pass: 'not-a-real-password',
  to: 'elliservices.group@gmail.com',
  from: 'mailbox@example.test',
};
const requestId = '550e8400-e29b-41d4-a716-446655440000';
const enquiry = {
  fields: {
    name: '<Ellis & Co>',
    email: 'customer@example.test',
    phone: '0400 000 000',
    address: '',
    area: 'Belconnen — Belconnen\r\nBcc: hidden@example.test',
    service: 'Roof Leak Repairs\r\nBcc: hidden@example.test',
    message: '<script>alert("x")</script> & enquiry',
  },
  requestId,
};

function fakeService(result) {
  let transportOptions;
  let calls = 0;
  let sent;
  const transport = {
    sendMail: async (mail) => {
      calls += 1;
      sent = mail;
      if (result instanceof Error) throw result;
      return result;
    },
  };
  const service = createContactEmailService({
    config,
    createTransport: (options) => { transportOptions = options; return transport; },
    now: () => new Date('2026-09-03T01:02:03.000Z'),
  });
  return { service, get: () => ({ transportOptions, calls, sent }) };
}

async function expectDeliveryFailure(run) {
  await assert.rejects(run, (error) => {
    assert.ok(error instanceof ContactDeliveryError);
    assert.equal(error.message, 'Delivery unavailable.');
    const exposed = JSON.stringify(error);
    for (const value of [config.host, config.pass, enquiry.fields.message, 'unsafe-name.jpg', 'smtp response']) assert.doesNotMatch(exposed, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
}

test('creates the transport with validated TLS and timeout configuration only', () => {
  const { get } = fakeService({ accepted: [config.to], rejected: [] });
  assert.deepEqual(get().transportOptions, {
    host: config.host,
    port: 465,
    secure: true,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
});

test('renders escaped HTML, useful plain text, and CR/LF-safe fixed headers', async () => {
  const { service, get } = fakeService({ accepted: [config.to.toUpperCase()], rejected: [] });
  assert.deepEqual(await service.sendEnquiry(enquiry), { ok: true });
  const mail = get().sent;
  assert.equal(mail.to, config.to);
  assert.equal(mail.from, config.from);
  assert.equal(mail.replyTo, enquiry.fields.email);
  assert.equal(mail.subject, 'Website enquiry: Roof Leak Repairs Bcc: hidden@example.test - Belconnen — Belconnen Bcc: hidden@example.test');
  assert.match(mail.text, /<script>alert\("x"\)<\/script> & enquiry/);
  assert.match(mail.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; enquiry/);
  assert.doesNotMatch(mail.html, /<script>/);
  assert.match(mail.text, /Not provided/);
  assert.match(mail.text, /2026-09-03T01:02:03.000Z/);
  assert.match(mail.text, new RegExp(requestId));
});

test('adds only the validated in-memory attachment with its safe filename and MIME', async () => {
  const buffer = Buffer.from([0xff, 0xd8, 0xff]);
  const { service, get } = fakeService({ accepted: [config.to], rejected: [] });
  await service.sendEnquiry({ ...enquiry, photo: { buffer, filename: 'safe-name.jpg', mimetype: 'image/jpeg', size: buffer.length } });
  assert.deepEqual(get().sent.attachments, [{ filename: 'safe-name.jpg', content: buffer, contentType: 'image/jpeg' }]);
  const noPhoto = fakeService({ accepted: [config.to], rejected: [] });
  await noPhoto.service.sendEnquiry(enquiry);
  assert.equal(noPhoto.get().sent.attachments, undefined);
});

test('requires one accepted fixed recipient and no rejected recipients with exactly one sendMail call', async () => {
  for (const result of [
    { accepted: [], rejected: [] },
    { accepted: [config.to], rejected: ['other@example.test'] },
    { accepted: ['other@example.test'], rejected: [] },
    new Error('smtp response'),
  ]) {
    const fake = fakeService(result);
    await expectDeliveryFailure(() => fake.service.sendEnquiry({ ...enquiry, photo: { buffer: Buffer.from('x'), filename: 'unsafe-name.jpg', mimetype: 'image/jpeg' } }));
    assert.equal(fake.get().calls, 1);
  }
});

test('treats a timeout as a generic one-attempt delivery failure', async () => {
  const timeout = new Error('socket timeout smtp response');
  const fake = fakeService(timeout);
  await expectDeliveryFailure(() => fake.service.sendEnquiry(enquiry));
  assert.equal(fake.get().calls, 1);
});

test('mail service source has no environment access, logging, verification, or retry scheduling', async () => {
  const source = await readFile(new URL('../api/_lib/contact-email.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /process\.env|console\.|\.verify\(|setTimeout|setInterval/);
});
