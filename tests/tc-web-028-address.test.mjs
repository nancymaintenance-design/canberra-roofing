import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');

test('public contact and footer surfaces show the verified operating address', () => {
  assert.match(source, /address:'121 Marcus Clarke St, Canberra, ACT 2600'/);
  assert.match(source, /<address[^>]*>\{data\.address\}<\/address>/);
  assert.match(source, /<span>\{data\.address\}<\/span>/);
});
