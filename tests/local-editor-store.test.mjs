import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createEditorialStore, validateRequest } from '../scripts/local-editor-store.mjs';
test('save survives reopening, conflicts reject, restoration creates a new revision', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'roof-editor-'));
  try {
    const catalog = [{ id: 'name', source: 'Name' }];
    const store = createEditorialStore(directory, catalog);
    const value = await store.save({ revision: 0, entries: { name: { source: 'Name', zh: '姓名' } }, articles: [] });
    assert.equal(value.revision, 1);
    assert.equal((await createEditorialStore(directory, catalog).read()).entries.name.zh, '姓名');
    await assert.rejects(store.save({ revision: 0, entries: {}, articles: [] }), /其他窗口/);
    const results = await Promise.allSettled([store.save({ ...value, entries: {} }), store.save(value)]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal((await store.restore(1, 2)).revision, 3);
    assert.equal((await store.read()).entries.name.zh, '姓名');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('copy protection, payload validation and origin/token guard', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'roof-editor-'));
  try {
    const store = createEditorialStore(directory, [{ id: 'phone', source: '0405878406' }, { id: 'email', source: 'elliservices.group@gmail.com' }]);
    await assert.rejects(store.save({ revision: 0, entries: { phone: { source: '0405878406', zh: '1300000000' } }, articles: [] }), /联系方式/);
    await assert.rejects(store.save({ revision: 0, entries: { bad: { source: 'Name', zh: '姓名' } }, articles: [] }), /未知/);
    assert.equal(validateRequest({ host: '127.0.0.1:4198', origin: 'https://evil.test', token: 'ok' }, '127.0.0.1:4198', 'ok'), false);
    assert.equal(validateRequest({ host: '127.0.0.1:4198', origin: 'http://127.0.0.1:4198', token: 'ok' }, '127.0.0.1:4198', 'ok'), true);
    assert.equal(validateRequest({ host: 'evil.test', origin: 'http://evil.test', token: 'ok' }, '127.0.0.1:4198', 'ok'), false);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
