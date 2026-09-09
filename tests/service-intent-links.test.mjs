import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8');

test('the three Canberra roof service pathways cross-link by observable intent', () => {
  for (const [from, to, phrase] of [
    ['roof-leak-repairs', '/services/roof-inspections', 'If the entry point is unclear'],
    ['roof-leak-repairs', '/services/rebedding-repointing', 'ridge or hip lines'],
    ['rebedding-repointing', '/services/roof-leak-repairs', 'interior water signs'],
    ['rebedding-repointing', '/services/roof-inspections', 'condition is unclear'],
    ['roof-inspections', '/services/roof-leak-repairs', 'water entry signs'],
    ['roof-inspections', '/services/rebedding-repointing', 'ridge caps or hip lines'],
  ]) {
    const start = source.indexOf(`serviceBySlug['${from}'].related`);
    assert.ok(start >= 0, `service seed exists: ${from}`);
    const end = source.indexOf('];', start);
    const block = source.slice(start, end);
    assert.match(block, new RegExp(to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(block, new RegExp(phrase, 'i'));
  }
});
