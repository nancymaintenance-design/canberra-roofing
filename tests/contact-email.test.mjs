import assert from 'node:assert/strict';
import test from 'node:test';
import { ContactDeliveryError, createContactEmailService } from '../api/_lib/contact-email.js';
const config = { apiKey: 'synthetic-key-not-valid', to: 'elliservices.group@gmail.com', from: 'Synthetic <sender@example.test>' };
const enquiry = { fields: { name: '<Ellis & Co>', email: 'customer@example.test', phone: '0400000000', address: '', area: 'Belconnen — Belconnen\r\nBcc: hidden@example.test', service: 'Roof Leak Repairs\r\nBcc: hidden@example.test', message: '<script>alert("x")</script> & enquiry' }, requestId: '550e8400-e29b-41d4-a716-446655440000' };
function fakeService(response = { ok: true, json: async () => ({ id: 'synthetic-email-id' }) }) {
  const calls = [];
  const service = createContactEmailService({ config, now: () => new Date('2026-09-03T01:02:03.000Z'), fetchImpl: async (url, options) => {
    calls.push({ url, options, mail: JSON.parse(options.body) });
    if (response instanceof Error) throw response;
    return response;
  } });
  return { service, calls };
}
test('posts one Resend request with fixed recipient/sender and server-only authorization', async () => {
  const { service, calls } = fakeService();
  assert.deepEqual(await service.sendEnquiry(enquiry), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].options.method, 'POST');
  assert.deepEqual(calls[0].options.headers, { Authorization: 'Bearer synthetic-key-not-valid', 'Content-Type': 'application/json' });
  assert.equal(calls[0].mail.to, config.to);
  assert.equal(calls[0].mail.from, config.from);
  assert.equal(calls[0].mail.reply_to, enquiry.fields.email);
});
test('renders escaped HTML, useful text, and CR/LF-safe headers', async () => {
  const { service, calls } = fakeService();
  await service.sendEnquiry(enquiry);
  const mail = calls[0].mail;
  assert.equal(mail.subject, 'Website enquiry: Roof Leak Repairs Bcc: hidden@example.test - Belconnen — Belconnen Bcc: hidden@example.test');
  assert.match(mail.text, /<script>alert\("x"\)<\/script> & enquiry/);
  assert.match(mail.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; enquiry/);
  assert.doesNotMatch(mail.html, /<script>/);
  assert.match(mail.text, /Not provided/);
  assert.match(mail.text, /2026-09-03T01:02:03.000Z/);
  assert.ok(mail.text.includes(enquiry.requestId));
});
test('encodes only the optional validated in-memory image and its safe filename/MIME', async () => {
  const { service, calls } = fakeService();
  await service.sendEnquiry({ ...enquiry, photo: { buffer: Buffer.from([0xff, 0xd8, 0xff]), filename: 'safe-name.jpg', mimetype: 'image/jpeg' } });
  assert.deepEqual(calls[0].mail.attachments, [{ filename: 'safe-name.jpg', content: '/9j/', content_type: 'image/jpeg' }]);
  await service.sendEnquiry(enquiry);
  assert.equal(calls[1].mail.attachments, undefined);
});
test('maps HTTP, malformed JSON, absent delivery id and network failures without retry or data exposure', async () => {
  for (const outcome of [{ ok: false, status: 403 }, { ok: false, status: 503 }, { ok: true, json: async () => { throw new Error('raw provider message'); } }, { ok: true, json: async () => ({}) }, new Error('network failure')]) {
    const { service, calls } = fakeService(outcome);
    await assert.rejects(() => service.sendEnquiry(enquiry), (error) => {
      assert.ok(error instanceof ContactDeliveryError);
      assert.equal(error.message, 'Delivery unavailable.');
      assert.ok(!JSON.stringify(error).includes(config.apiKey));
      assert.ok(!JSON.stringify(error).includes(enquiry.fields.message));
      return true;
    });
    assert.equal(calls.length, 1);
  }
});
