import assert from 'node:assert/strict';
import test from 'node:test';
import { ContactConfigError, loadContactConfig } from '../api/_lib/config.js';
const baseEnv = () => ({ RESEND_API_KEY: 'synthetic-key-not-valid', CONTACT_EMAIL_TO: 'elliservices.group@gmail.com' });
test('requires server-side Resend credentials and recipient without revealing values', () => {
  for (const variable of ['RESEND_API_KEY', 'CONTACT_EMAIL_TO']) {
    for (const value of [undefined, '', ' ']) {
      assert.throws(() => loadContactConfig({ ...baseEnv(), [variable]: value }), (error) => {
        assert.ok(error instanceof ContactConfigError);
        assert.equal(error.variable, variable);
        assert.equal(error.message, 'Invalid environment variable ' + variable + '.');
        assert.ok(!JSON.stringify(error).includes('synthetic-key-not-valid'));
        return true;
      });
    }
  }
});
test('accepts either approved enquiry inbox and the existing default sender', () => {
  for (const recipient of ['elliservices.group@gmail.com', 'nancy.maintenance@gmail.com']) {
    assert.deepEqual(loadContactConfig({ ...baseEnv(), CONTACT_EMAIL_TO: recipient }), { apiKey: 'synthetic-key-not-valid', to: recipient, from: 'Canberraroofkind <onboarding@resend.dev>' });
  }
});
test('rejects arbitrary or combined recipients', () => {
  for (const recipient of ['other@example.test', 'elliservices.group@gmail.com,nancy.maintenance@gmail.com', ' elliservices.group@gmail.com']) {
    assert.throws(() => loadContactConfig({ ...baseEnv(), CONTACT_EMAIL_TO: recipient }), (error) => error instanceof ContactConfigError && error.variable === 'CONTACT_EMAIL_TO');
  }
});
test('uses a configured sender after trimming and rejects empty or newline-injected senders', () => {
  assert.equal(loadContactConfig({ ...baseEnv(), CONTACT_EMAIL_FROM: '  Test <noreply@example.test>  ' }).from, 'Test <noreply@example.test>');
  for (const sender of ['', ' ', 7, 'Test\rBcc: other@example.test', 'Test\nBcc: other@example.test']) {
    assert.throws(() => loadContactConfig({ ...baseEnv(), CONTACT_EMAIL_FROM: sender }), (error) => error instanceof ContactConfigError && error.variable === 'CONTACT_EMAIL_FROM');
  }
});
