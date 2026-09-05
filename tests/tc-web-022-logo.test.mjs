import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = fs.readFileSync(new URL('src/main.tsx', root), 'utf8');
const css = fs.readFileSync(new URL('src/styles.css', root), 'utf8');
const activeLayout = source.match(/function LayoutV2[\s\S]*?function AdminDrawer/)?.[0] || '';

test('active global header uses the authorized Canberraroofkind logo without replacing brand navigation', () => {
  assert.match(activeLayout, /<a className="brand" href="\/">/);
  assert.match(activeLayout, /src="\/assets\/brand\/canberraroofkind-logo\.png"/);
  assert.match(activeLayout, /alt="Ellis Services Group logo"/);
  assert.match(activeLayout, /\{data\.company\}/);
  assert.match(activeLayout, /aria-label="Primary navigation"/);
  assert.match(activeLayout, /aria-label="Open main menu"/);
  assert.equal(fs.existsSync(new URL('public/assets/brand/canberraroofkind-logo.png', root)), true);
});

test('logo is contained and sized for desktop and mobile headers', () => {
  assert.match(css, /\.brandLogo\s*\{[^}]*object-fit:\s*contain[^}]*\}/s);
  assert.match(css, /\.brandLogo\s*\{[^}]*width:\s*54px[^}]*height:\s*54px[^}]*\}/s);
  assert.match(css, /@media\(max-width:640px\)[\s\S]*\.brandLogo\s*\{[^}]*width:\s*42px[^}]*height:\s*42px[^}]*\}/s);
  assert.match(css, /\.brand\s*\{[^}]*align-items:\s*center[^}]*\}/s);
});
