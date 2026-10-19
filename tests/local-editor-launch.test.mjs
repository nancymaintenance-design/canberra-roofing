import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { startLocalEditor } from '../scripts/local-editor.mjs';

test('editor skips a port occupied by another preview without stopping that preview', {timeout:30000}, async () => {
  const occupied = createServer((req,res) => {res.writeHead(404);res.end('Not found');});
  await new Promise(resolve => occupied.listen(0,'127.0.0.1',resolve));
  const port = occupied.address().port;
  let editor;
  try {
    editor = await startLocalEditor({port,allowPortFallback:true});
    assert.notEqual(editor.origin,`http://127.0.0.1:${port}`);
    const page = await fetch(editor.origin+'/__editor/');
    assert.equal(page.status,200);
    assert.match(await page.text(),/id="pagePreview"/);
    const original = await fetch(`http://127.0.0.1:${port}/__editor/`);
    assert.equal(original.status,404);
    assert.equal(await original.text(),'Not found');
  } finally {
    await editor?.close();
    await new Promise(resolve => occupied.close(resolve));
  }
});
