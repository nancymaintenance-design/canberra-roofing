import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContactFunction } from '../api/contact.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
const unsafeEncodedPath = /%(?:2f|5c|25|2e)/i;

// Local acceptance server for this static site's vercel.json contract.
// It is not the Vercel runtime. Preview/production must repeat HTTP acceptance.
export async function startPreview({ port = 0, directory = path.join(root, 'dist') } = {}) {
  const config = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
  const contact = createContactFunction({
    logger: () => {},
    delivery: { sendEnquiry: async () => { throw new Error('Local preview does not send enquiries.'); } },
  });
  const fileAt = async (pathname) => {
    const filename = path.resolve(directory, `.${pathname}`);
    if (!filename.startsWith(path.resolve(directory) + path.sep)) return null;
    try { return (await stat(filename)).isFile() ? filename : null; } catch { return null; }
  };
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      // URL normalizes encoded dot segments. Inspect req.url first so a request
      // such as /%2e%2e/about cannot become /about before the route guard.
      const rawPathname = req.url.split('?', 1)[0];
      const unsafePath = rawPathname.includes('//') || unsafeEncodedPath.test(rawPathname);
      const pathname = decodeURIComponent(rawPathname);
      for (const rule of config.headers ?? []) {
        if (new RegExp(`^${rule.source}$`).test(pathname)) {
          for (const { key, value } of rule.headers) res.setHeader(key, value);
        }
      }
      if (!unsafePath && pathname === '/api/contact') {
        req.headers['x-forwarded-host'] = req.headers.host;
        req.headers['x-forwarded-proto'] = 'http';
        return await contact(req, res);
      }
      for (const rule of unsafePath ? [] : config.redirects ?? []) {
        if (pathname === rule.source) {
          res.writeHead(rule.statusCode ?? (rule.permanent ? 308 : 307), { Location: rule.destination + url.search });
          return res.end();
        }
      }
      if (config.cleanUrls && pathname.endsWith('.html') && await fileAt(pathname)) {
        const destination = pathname === '/index.html' ? '/' : pathname.slice(0, -5);
        res.writeHead(308, { Location: destination + url.search });
        return res.end();
      }
      let filename = unsafePath ? null : await fileAt(pathname === '/' ? '/index.html' : pathname);
      if (!filename && !unsafePath && config.cleanUrls) filename = await fileAt(`${pathname.replace(/\/$/, '')}.html`);
      if (!filename) {
        for (const rule of unsafePath ? [] : config.rewrites ?? []) {
          if (new RegExp(`^${rule.source}$`).test(pathname)) {
            filename = await fileAt(rule.destination);
            break;
          }
        }
      }
      if (!filename) {
        res.statusCode = 404;
        filename = await fileAt('/404.html');
      }
      if (!filename) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
      res.setHeader('Content-Type', (types[path.extname(filename)] ?? 'application/octet-stream') + (['.html', '.js', '.css', '.txt', '.xml', '.json'].includes(path.extname(filename)) ? '; charset=utf-8' : ''));
      res.end(req.method === 'HEAD' ? undefined : await readFile(filename));
    } catch (error) {
      res.writeHead(error instanceof URIError ? 400 : 500, { 'Content-Type': 'text/plain' });
      res.end('Request could not be served');
    }
  });
  await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => server.close(resolve)) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { origin } = await startPreview({ port: Number(process.env.PORT ?? 4173) });
  console.log(`Local acceptance preview: ${origin}; delivery disabled`);
}
