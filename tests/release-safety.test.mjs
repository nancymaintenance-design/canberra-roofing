import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const requiredIgnoreEntries = [
  '.env*',
  '!.env.example',
  'node_modules/',
  'dist/',
  '.vercel/',
  '.codex-backup/',
  'work/',
  'backups/',
  'logs/',
  'screenshots/',
  'coverage/',
  'browser-profile/',
  'browser-profile-*/',
  '*browser-profile*/',
  '*.log',
  '*.tsbuildinfo',
  'vite.config.js',
  'vite.config.d.ts',
  '.DS_Store',
  'Thumbs.db',
];
const approvedEnvironmentNames = [
  'CONTACT_SMTP_HOST',
  'CONTACT_SMTP_PORT',
  'CONTACT_SMTP_SECURE',
  'CONTACT_SMTP_USER',
  'CONTACT_SMTP_PASS',
  'CONTACT_SMTP_TO',
  'CONTACT_SMTP_FROM',
];

test('release candidate keeps secrets and generated artifacts outside the upload boundary', () => {
  const gitignoreUrl = new URL('.gitignore', root);
  const envExampleUrl = new URL('.env.example', root);

  assert.deepEqual(
    [fs.existsSync(gitignoreUrl), fs.existsSync(envExampleUrl)],
    [true, true],
    'the candidate must provide both .gitignore and .env.example',
  );

  const ignored = fs.readFileSync(gitignoreUrl, 'utf8').split(/\r?\n/);
  for (const entry of requiredIgnoreEntries) {
    assert.ok(ignored.includes(entry), `missing required ignore entry: ${entry}`);
  }

  const variables = fs.readFileSync(envExampleUrl, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split('=', 2));
  assert.deepEqual(variables.map(([name]) => name), approvedEnvironmentNames);
  assert.ok(variables.every(([, value]) => value === ''), '.env.example values must be empty');
});
