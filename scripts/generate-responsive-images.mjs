import sharp from 'sharp';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { IMAGE_INVENTORY, validateImageInventory } from './image-inventory.mjs';
const urls = IMAGE_INVENTORY;
validateImageInventory(urls);
const manifest = {};
await mkdir('public/assets/responsive', { recursive: true });
for (const original of [...urls].sort()) {
  const file = `public${original}`;
  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  const hash = createHash('sha256').update(input).digest('hex').slice(0, 10);
  const stem = path.basename(original, path.extname(original));
  const targets = original.includes('instagram-gradient') ? [24, 48] : original.includes('canberraroofkind-logo') ? [100, 200] : [400, 800, 1200];
  const widths = [...new Set(targets.map(w => Math.min(w, meta.width)))];
  const variants = [];
  for (const width of widths) {
    const url = `/assets/responsive/${stem}-${width}.webp`;
    const out = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 6 }).toBuffer();
    await writeFile(`public${url}`, out);
    const dimensions = await sharp(out).metadata();
    variants.push({ src: `${url}?v=${hash}`, width: dimensions.width, height: dimensions.height, bytes: out.length });
  }
  manifest[original] = { width: meta.width, height: meta.height, originalBytes: (await stat(file)).size, sha256: createHash('sha256').update(input).digest('hex'), variants };
}
await writeFile('src/image-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated ${Object.keys(manifest).length} photo mappings and ${Object.values(manifest).reduce((n, f) => n + f.variants.length, 0)} WebP variants`);
