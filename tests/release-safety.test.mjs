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
const approvedEnvironmentNames = ['RESEND_API_KEY', 'CONTACT_EMAIL_TO', 'CONTACT_EMAIL_FROM'];

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

test('Vercel candidate pins Node 22, preserves API routes, and applies the approved security policy', () => {
  const packageJson = JSON.parse(fs.readFileSync(new URL('package.json', root), 'utf8'));
  const config = JSON.parse(fs.readFileSync(new URL('vercel.json', root), 'utf8'));
  assert.equal(packageJson.engines.node, '22.x');
  assert.equal(config.framework, 'vite');
  assert.equal(config.installCommand, 'pnpm install --frozen-lockfile');
  assert.equal(config.buildCommand, 'pnpm build');
  assert.equal(config.outputDirectory, 'dist');
  assert.deepEqual(config.functions, { 'api/contact.js': { maxDuration: 60 } });
  assert.doesNotMatch(JSON.stringify(config), /nodejs22\.x/);
  assert.notEqual(config.cleanUrls, true, 'existing HTML verification and fallback files keep their URLs');
  const published = JSON.parse(fs.readFileSync(new URL('src/route-meta.json', root), 'utf8'));
  assert.deepEqual(config.rewrites, Object.keys(published).filter((pathname) => pathname !== '/').map((pathname) => ({ source: pathname, destination: pathname + '.html' })));
  assert.deepEqual(config.redirects.filter(rule => !rule.permanent), [{source:'/insights',destination:'/faq',permanent:false}, {source:'/insights/',destination:'/faq',permanent:false}]);
  const headers = Object.fromEntries(config.headers[0].headers.map(({ key, value }) => [key, value]));
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
  for (const directive of ["default-src 'self'", "img-src 'self' data:", "style-src 'self'", "script-src 'self'", "connect-src 'self'", "font-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"]) assert.match(headers['Content-Security-Policy'], new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('fallback and runbooks contain the approved no-form operational contract without secrets or links', () => {
  const fallback = fs.readFileSync(new URL('public/contact-unavailable.html', root), 'utf8');
  const release = fs.readFileSync(new URL('ops/release-checklist.md', root), 'utf8');
  const rollback = fs.readFileSync(new URL('ops/rollback.md', root), 'utf8');
  assert.match(fallback, /Online enquiries are temporarily unavailable\. Please call 0405878406 or email elliservices\.group@gmail\.com\./);
  assert.doesNotMatch(fallback, /<form|<script/i);
  for (const value of ['Method POST', 'Path `/api/contact`', 'source IP', 'fixed window', '5 requests', '10 minutes', 'status 429', 'only after action-time confirmation', 'honeypot requests 1–5', 'sixth']) assert.ok(release.includes(value), `missing WAF runbook value: ${value}`);
  for (const gate of ['Candidate complete', 'Human acceptance', 'GitHub private upload', 'Preview', 'WAF publication', 'Production release', 'GoDaddy DNS', 'one authorized synthetic email', 'rollback evidence']) assert.ok(release.includes(gate), `missing release gate: ${gate}`);
  const order = ['block POST', 'show tested no-form fallback', 'remove retired Preview/Production SMTP variables', 'verify form/SMTP inactive', 'preserve redacted logs only', 'restore captured DNS', 'rotate Gmail App Password', 'Never restore the old local-storage enquiry form'];
  for (let index = 1; index < order.length; index += 1) assert.ok(rollback.indexOf(order[index - 1]) < rollback.indexOf(order[index]), `rollback order incorrect at ${order[index]}`);
  for (const content of [release, rollback]) {
    assert.doesNotMatch(content, /https?:\/\//i);
    assert.doesNotMatch(content, /CONTACT_SMTP_(?:HOST|PORT|SECURE|USER|PASS|TO|FROM)=\S+/);
  }
});

test('public candidate uses owner-supplied copy and makes the browser editor development-only', () => {
  const packageJson = JSON.parse(fs.readFileSync(new URL('package.json', root), 'utf8'));
  const source = fs.readFileSync(new URL('src/main.tsx', root), 'utf8');

  assert.equal(packageJson.name, 'canberraroofkind-website');
  assert.match(source, /Welcome to Ellis Services Group/);
  assert.match(source, /Homeowners can browse roof repair services, the Canberra areas directory and frequently asked questions, then send an enquiry with one optional photo\./);
  assert.match(source, /Scope and any fees are confirmed before work is arranged\./);
  assert.match(source, /import\.meta\.env\.DEV/);
  assert.match(source, /Company name/);
  assert.match(source, /News headline/);
  assert.match(source, /FAQ JSON/);
  assert.match(source, /servicesToggle/);
  assert.match(source, /servicesPopup/);
  for (const prohibitedPublicCopy of [
    /local demonstration/i,
    /review before release/i,
    /publication status: local only/i,
    /candidate settings/i,
    /local candidate website/i,
    /\bto be confirmed\b/i,
  ]) {
    assert.doesNotMatch(source, prohibitedPublicCopy);
  }
  assert.equal(fs.existsSync(new URL('ops/asset-authorization-ledger.md', root)), true);
  assert.equal(fs.existsSync(new URL('README.md', root)), true);
});
