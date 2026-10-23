import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import registry from '../src/route-meta.json' with { type: 'json' };
import editorial from '../src/i18n/content.json' with { type: 'json' };
import { DISTRICT_PATHS, SUBURB_PATHS } from '../src/suburb-profiles.js';
import { startPreview } from '../scripts/preview.mjs';

test('discovery creates only published Chinese aliases, preserves exceptions, and is stable on regeneration', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'roof-kind-discovery-'));
  const baseline = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const generator = fileURLToPath(new URL('../scripts/generate-discovery.mjs', import.meta.url));
  try {
    await mkdir(join(directory, 'public'));
    await writeFile(join(directory, 'vercel.json'), JSON.stringify(baseline));
    execFileSync(process.execPath, [generator], { cwd: directory });
    const first = await readFile(join(directory, 'vercel.json'), 'utf8');
    const config = JSON.parse(first);
    const rules = new Map(config.redirects.map(rule => [rule.source, rule]));
    const english = [...Object.keys(registry), ...DISTRICT_PATHS, ...SUBURB_PATHS, ...editorial.articles.map(article => '/news/' + article.slug)];
    const canonical = [...new Set(english)].map(path => path === '/' ? '/zh/' : '/zh' + path);
    assert.equal(canonical.length, 121);
    for (const destination of canonical) {
      const aliases = destination === '/zh/' ? ['/zh', '/zh/index.html', '/zh/index.html/'] : ['/', '.html', '.html/'].map(suffix => destination + suffix);
      assert.equal(rules.has(destination), false, `canonical must not redirect: ${destination}`);
      for (const source of aliases) {
        assert.deepEqual(rules.get(source), { source, destination, permanent: true });
        assert.equal(rules.has(destination), false, 'alias destination terminates in one hop');
      }
    }
    for (const source of ['/zh/missing/', '/zh/news/missing.html', '/zh/about//', '/zh/index', '/zh.html', '/zh/areas/unknown.html/']) assert.equal(rules.has(source), false);
    assert.equal(new Set(config.redirects.map(rule => rule.source)).size, config.redirects.length);
    assert.ok(config.redirects.every(rule => !rule.source.includes(':') && !rule.destination.includes('?')), 'explicit paths leave normal query forwarding intact');
    for (const prefix of ['', '/zh']) for (const suffix of ['', '/', '.html', '.html/']) {
      assert.deepEqual(rules.get(prefix + '/solutions' + suffix), { source: prefix + '/solutions' + suffix, destination: prefix + '/services', statusCode: 301 });
      assert.deepEqual(rules.get(prefix + '/services/roof-restoration' + suffix), { source: prefix + '/services/roof-restoration' + suffix, destination: prefix + '/services/roof-renovation', statusCode: 301 });
    }
    for (const [key, value] of Object.entries(baseline)) if (key !== 'redirects') assert.deepEqual(config[key], value, `${key} stays unchanged`);
    for (const rule of baseline.redirects.filter(rule => !rule.source.startsWith('/zh'))) assert.deepEqual(rules.get(rule.source), rule);
    execFileSync(process.execPath, [generator], { cwd: directory });
    assert.equal(await readFile(join(directory, 'vercel.json'), 'utf8'), first);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('all Chinese aliases preserve query in one local HTTP hop and unknown Chinese paths remain 404', async () => {
  const preview = await startPreview();
  const query = '?utm_source=history&tag=one&tag=two&encoded=%2F%2520%2b&space=a+b';
  const paths = [...new Set([...Object.keys(registry), ...DISTRICT_PATHS, ...SUBURB_PATHS, ...editorial.articles.map(article => '/news/' + article.slug)])];
  try {
    for (const path of paths) {
      const destination = path === '/' ? '/zh/' : '/zh' + path;
      const aliases = path === '/' ? ['/zh', '/zh/index.html', '/zh/index.html/'] : ['/', '.html', '.html/'].map(suffix => destination + suffix);
      for (const source of aliases) {
        const response = await fetch(preview.origin + source + query, { redirect: 'manual' });
        assert.equal(response.status, 308, source);
        assert.equal(response.headers.get('location'), destination + query, source);
        await response.arrayBuffer();
      }
      const final = await fetch(preview.origin + destination + query, { redirect: 'manual' });
      assert.equal(final.status, 200, destination);
      assert.equal(final.headers.get('location'), null);
      const html = await final.text();
      assert.ok(html.includes(`rel="canonical" href="https://www.canberraroofkind.com.au${destination}"`));
      if (SUBURB_PATHS.includes(path)) assert.match(html, /name="robots" content="noindex,follow"/);
    }
    for (const source of ['/zh/missing/', '/zh/news/missing.html', '/zh/about//', '/zh/index', '/zh.html', '/zh/areas/unknown.html/']) {
      const response = await fetch(preview.origin + source + query, { redirect: 'manual' });
      assert.equal(response.status, 404, source);
      assert.equal(response.headers.get('location'), null);
      await response.arrayBuffer();
    }
    for (const [source, destination] of [['/zh', '/zh/'], ['/zh/about.html/', '/zh/about'], ['/zh/services/roof-inspections/', '/zh/services/roof-inspections']]) {
      const response = await fetch(preview.origin + source + query, { method: 'HEAD', redirect: 'manual' });
      assert.equal(response.status, 308);
      assert.equal(response.headers.get('location'), destination + query);
    }
  } finally { await preview.close(); }
});
