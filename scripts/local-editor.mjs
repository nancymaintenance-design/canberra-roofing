import { createServer as createHttpServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { createEditorialStore, validateRequest } from './local-editor-store.mjs';
import registry from '../src/route-meta.json' with { type: 'json' };
import imageManifest from '../src/image-manifest.json' with { type: 'json' };
import { DISTRICT_PROFILES, SUBURB_PROFILES } from '../src/suburb-profiles.js';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function startLocalEditor({ port = 4198, directory = path.join(root, '.local-editor') } = {}) {
  const token = randomBytes(32).toString('hex');
  const server = createHttpServer();
  const vite = await createViteServer({ root, configFile: path.join(root, 'vite.config.ts'), server: { middlewareMode: true, hmr: {server}, fs:{ deny:['.env','.env.*','*.{crt,pem}','**/.git/**','**/.local-editor/**'] } }, appType: 'custom' });
  const catalog = JSON.parse(await readFile(path.join(root, '.local-editor/catalog.json'), 'utf8'));
  const initial = JSON.parse(await readFile(path.join(root, 'src/i18n/content.json'), 'utf8'));
  const store = createEditorialStore(directory, catalog, initial);
  const pages = [...Object.entries(registry).map(([url, value]) => ({ url, title: value.h1 })), ...[...DISTRICT_PROFILES, ...SUBURB_PROFILES].map(item => ({ url: item.path, title: item.h1 }))];
  const images = [];
  for (const folder of ['services', 'projects', 'contact', 'about', 'home', 'news', 'areas', 'case-studies']) {
    try { for (const name of await readdir(path.join(root, 'public/assets', folder))) if (/\.(?:png|webp|jpe?g)$/i.test(name) && imageManifest[`/assets/${folder}/${name}`]) images.push(`/assets/${folder}/${name}`); } catch {}
  }
  const translations = async () => {
    let result = {};
    for (const file of ['zh-CN.json', 'zh-common.json', 'zh-articles.json', 'zh-areas.json', 'zh-common-extra.json']) {
      try { result = { ...result, ...JSON.parse(await readFile(path.join(root, 'src/i18n', file), 'utf8')) }; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    return result;
  };
  let expectedHost;
  const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); res.end(JSON.stringify(value)); };
  server.on('request', async (req, res) => {
    try {
      if (req.headers.host !== expectedHost) return json(res, 403, { error: '后台只允许本机访问。' });
      const url = new URL(req.url, `http://${expectedHost}`);
      if (url.pathname.startsWith('/__editor/api/')) {
        if (req.method === 'GET' && url.pathname === '/__editor/api/preview') return json(res, 200, await store.read());
        if (!validateRequest({ host: req.headers.host, origin: req.headers.origin || `http://${expectedHost}`, token: req.headers['x-editor-token'] }, expectedHost, token)) return json(res, 403, { error: '编辑会话已失效，请刷新后台。' });
        if (req.method === 'GET' && url.pathname === '/__editor/api/state') return json(res, 200, { draft: await store.read(), catalog, pages, images, translations: await translations() });
        if (req.method === 'GET' && url.pathname === '/__editor/api/history') return json(res, 200, await store.versions());
        if (req.method !== 'POST' || !req.headers.origin) return json(res, 405, { error: '不支持的操作。' });
        let body = ''; for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 4_000_000) return json(res, 413, { error: '草稿过大，请缩短本次内容。' }); }
        const input = JSON.parse(body);
        if (url.pathname === '/__editor/api/save') {
          const sources=[...Object.keys(input.images || {}),...Object.values(input.images || {}),...(input.articles || []).map(article=>article.image)];
          if(sources.some(source=>!images.includes(source))) return json(res,400,{error:'所选图片不在站内图库，请重新选择。'});
          return json(res, 200, await store.save(input));
        }
        if (url.pathname === '/__editor/api/restore') return json(res, 200, await store.restore(input.version, input.revision));
        return json(res, 404, { error: '未找到该操作。' });
      }
      if (url.pathname === '/__editor' || url.pathname === '/__editor/') {
        let html = await readFile(path.join(root, 'editor/index.html'), 'utf8');
        html = html.replace('EDITOR_SESSION_TOKEN', token);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'same-origin' }); return res.end(html);
      }
      if (url.pathname === '/api/contact') return json(res, 503, { error: '本地编辑预览不发送咨询，请使用正式网站。' });
      if (url.pathname.startsWith('/.local-editor') || /(?:^|\/)\.env/.test(url.pathname)) return json(res, 404, { error: 'Not found' });
      const extension = path.extname(url.pathname);
      if ((!extension || extension === '.html') && !/^\/(?:@|src\/|node_modules\/|editor\/|assets\/)/.test(url.pathname)) {
        const html = await vite.transformIndexHtml(req.url, (await readFile(path.join(root, 'index.html'), 'utf8')).replace('<head>', '<head><meta name="local-editor-preview" content="true">'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(html);
      }
      vite.middlewares(req, res, () => { res.writeHead(404); res.end('Not found'); });
    } catch (error) { json(res, error.status || 500, { error: error.status ? error.message : '保存或读取失败，当前输入仍保留，请重试。' }); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  expectedHost = `127.0.0.1:${server.address().port}`;
  return { server, origin: `http://${expectedHost}`, close: async () => { await vite.close(); await new Promise(resolve => server.close(resolve)); } };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await startLocalEditor({ port: Number(process.env.EDITOR_PORT || 4198) });
  console.log(`本地编辑后台 ${result.origin}/__editor/`);
  console.log(`中文预览 ${result.origin}/zh/ · 英文预览 ${result.origin}/ · 不会发送咨询或部署`);
}
