import assert from 'node:assert/strict';
import test from 'node:test';

import { ContactConfigError, REQUIRED_CONTACT_ENV, loadContactConfig } from '../api/_lib/config.js';

const baseEnv = () => ({
  CONTACT_SMTP_HOST: 'smtp.gmail.com',
  CONTACT_SMTP_PORT: '465',
  CONTACT_SMTP_SECURE: 'true',
  CONTACT_SMTP_USER: 'mailbox@example.test',
  CONTACT_SMTP_PASS: 'app-password-not-for-production',
  CONTACT_SMTP_TO: 'elliservices.group@gmail.com',
  CONTACT_SMTP_FROM: 'mailbox@example.test',
});

function expectConfigError(env, variable) {
  assert.throws(() => loadContactConfig(env), (error) => {
    assert.ok(error instanceof ContactConfigError);
    assert.equal(error.variable, variable);
    assert.match(error.message, new RegExp(variable));
    for (const value of Object.values(env)) assert.doesNotMatch(error.message, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    return true;
  });
}

test('requires exactly the seven server-only SMTP variables without revealing values', () => {
  assert.deepEqual(REQUIRED_CONTACT_ENV, [
    'CONTACT_SMTP_HOST', 'CONTACT_SMTP_PORT', 'CONTACT_SMTP_SECURE', 'CONTACT_SMTP_USER', 'CONTACT_SMTP_PASS', 'CONTACT_SMTP_TO', 'CONTACT_SMTP_FROM',
  ]);
  for (const variable of REQUIRED_CONTACT_ENV) {
    const env = baseEnv();
    delete env[variable];
    expectConfigError(env, variable);
  }
});

test('accepts only supported SMTP port and secure pairs', () => {
  assert.deepEqual(loadContactConfig(baseEnv()), { host: 'smtp.gmail.com', port: 465, secure: true, user: 'mailbox@example.test', pass: 'app-password-not-for-production', to: 'elliservices.group@gmail.com', from: 'mailbox@example.test' });
  const submission = baseEnv(); submission.CONTACT_SMTP_PORT = '587'; submission.CONTACT_SMTP_SECURE = 'false';
  assert.equal(loadContactConfig(submission).port, 587);
  for (const [port, secure] of [['465', 'false'], ['587', 'true'], ['25', 'false'], ['465', 'TRUE']]) {
    const env = baseEnv(); env.CONTACT_SMTP_PORT = port; env.CONTACT_SMTP_SECURE = secure;
    expectConfigError(env, port === '25' ? 'CONTACT_SMTP_PORT' : 'CONTACT_SMTP_SECURE');
  }
});

test('permits the original Ellis recipient while preserving sender equality', () => {
  assert.equal(loadContactConfig(baseEnv()).to, 'elliservices.group@gmail.com');
  const wrongFrom = baseEnv(); wrongFrom.CONTACT_SMTP_FROM = 'other@example.test';
  expectConfigError(wrongFrom, 'CONTACT_SMTP_FROM');
});

test('permits Nancy as the configured recipient without changing SMTP sender rules', () => {
  const nancyRecipient = baseEnv(); nancyRecipient.CONTACT_SMTP_TO = 'nancy.maintenance@gmail.com';
  assert.equal(loadContactConfig(nancyRecipient).to, 'nancy.maintenance@gmail.com');
});

test('rejects unapproved recipients while redacting host and credential values', () => {
  const wrongRecipient = baseEnv(); wrongRecipient.CONTACT_SMTP_TO = 'other@example.test';
  expectConfigError(wrongRecipient, 'CONTACT_SMTP_TO');
  const wrongHost = baseEnv(); wrongHost.CONTACT_SMTP_HOST = 'private.smtp.example.test';
  expectConfigError(wrongHost, 'CONTACT_SMTP_HOST');
});
