import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { IMAGE_INVENTORY, validateImageInventory } from '../scripts/image-inventory.mjs';
test('image verification resolves declared Sharp from the project installation', async () => {
  const projectSharp = (await import('sharp')).default;
  assert.equal(typeof projectSharp, 'function');
});
test('inventory prevents same-named source files from overwriting responsive outputs', () => {
  assert.throws(() => validateImageInventory(['/assets/home/roof.png', '/assets/services/roof.jpg']), /collision: roof/);
  assert.throws(() => validateImageInventory(['/assets/home/ROOF.png', '/assets/services/roof.jpg']), /collision: roof/);
  assert.doesNotThrow(() => validateImageInventory(IMAGE_INVENTORY));
});
test('responsive assets preserve original hashes and declare real output widths', async () => {
  const manifest = JSON.parse(await readFile('src/image-manifest.json', 'utf8'));
  assert.deepEqual(Object.keys(manifest).sort(), [...IMAGE_INVENTORY].sort());
  for (const [src, image] of Object.entries(manifest)) {
    const original = await readFile(`public${src}`);
    assert.equal(createHash('sha256').update(original).digest('hex'), image.sha256, src);
    for (const variant of image.variants) {
      const bytes = await readFile(`public${variant.src.split('?')[0]}`);
      const meta = await sharp(bytes).metadata();
      assert.equal(meta.format, 'webp');
      assert.equal(meta.width, variant.width);
      assert.equal(meta.height, variant.height);
      assert.ok(meta.width <= image.width, src);
      assert.ok(bytes.length < original.length, src);
    }
  }
});
