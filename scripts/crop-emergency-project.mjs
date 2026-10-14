import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const source = new URL('../public/assets/projects/confirmed-urgent-leak-1000.webp', import.meta.url);
// Pixel rectangles inspected against the authentic 1000 × 1334 collage.
// Exclude white gutters, rounded corners and the decorative stage stickers.
const panels = [
  ['before-edge', 12, 12, 466, 338],
  ['before-channel', 12, 460, 477, 330],
  ['before-junction', 12, 900, 477, 335],
  ['during-work', 525, 100, 463, 550],
  ['after-channel', 515, 684, 473, 542],
];
for (const [name, left, top, width, height] of panels) {
  await sharp(fileURLToPath(source)).extract({ left, top, width, height }).webp({ quality: 82 }).toFile(fileURLToPath(new URL(`../public/assets/projects/urgent-${name}.webp`, import.meta.url)));
}
console.log(`Extracted ${panels.length} authentic emergency project panels; original untouched.`);
