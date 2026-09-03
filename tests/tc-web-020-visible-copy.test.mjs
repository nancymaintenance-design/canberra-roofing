import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const visibleRoots = ['api', 'src', 'public'];
const staleVisibleCopy = /This candidate site is a local demonstration\. Service details and publication content require verification before release\.|Publication status: local only\. Review before release\.|\bcandidate (?:site|website|brand|settings|update)\b|\blocal (?:candidate|demonstration|demo)\b|\breview before release\b|\brequire(?:s|d)? verification before (?:public )?release\b|\bpublication status:\s*local only\b/i;

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(fullPath) : [fullPath];
  });
}

test('browser-visible application and API copy contains no pre-release demonstration wording', () => {
  const files = [path.join(root, 'index.html'), ...visibleRoots.flatMap((directory) => collectFiles(path.join(root, directory)))]
    .filter((file) => !/\.(?:png|jpe?g|webp|gif|ico)$/i.test(file));
  const matches = files.flatMap((file) => {
    const content = fs.readFileSync(file, 'utf8');
    return staleVisibleCopy.test(content) ? [path.relative(root, file).replaceAll('\\', '/')] : [];
  });
  assert.deepEqual(matches, []);
});
