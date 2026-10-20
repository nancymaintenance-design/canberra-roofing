import { readFile, writeFile } from 'node:fs/promises';
import editorial from '../src/i18n/content.json' with { type: 'json' };
import registry from '../src/route-meta.json' with { type: 'json' };
import { DISTRICT_PROFILES, SUBURB_PROFILES } from '../src/suburb-profiles.js';

const origin = 'https://www.canberraroofkind.com.au';
const publicPaths = [...Object.keys(registry).filter((path) => path !== '/privacy'), ...DISTRICT_PROFILES.map(({ path }) => path), ...editorial.articles.map(article=>'/news/'+article.slug)];
const zh = path => '/zh' + (path==='/'?'/':path);
const urls = publicPaths.flatMap(path=>[path,zh(path)]);
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map((url) => { const english=url.startsWith('/zh')?url.slice(3)||'/':url; return `  <url><loc>${origin}${url}</loc><xhtml:link rel="alternate" hreflang="en-AU" href="${origin}${english}"/><xhtml:link rel="alternate" hreflang="zh-CN" href="${origin}${zh(english)}"/></url>`; }).join('\n')}\n</urlset>\n`);
const config=JSON.parse(await readFile('vercel.json','utf8'));
// Retire the duplicate hub in one hop, including historical URL aliases.
const solutionAliases = ['', '/zh'].flatMap(prefix => ['', '/', '.html', '.html/'].map(suffix => ({
  source: `${prefix}/solutions${suffix}`, destination: `${prefix}/services`, statusCode: 301,
})));
const retiredSources = new Set(solutionAliases.map(rule => rule.source));
const restorationAliases = ['', '/zh'].flatMap(prefix => ['', '/', '.html', '.html/'].map(suffix => ({
  source: `${prefix}/services/roof-restoration${suffix}`, destination: `${prefix}/services/roof-renovation`, statusCode: 301,
})));
const replacementAliases = ['', '/zh'].flatMap(prefix => ['/', '.html', '.html/'].map(suffix => ({
  source: `${prefix}/services/reroof-replacement${suffix}`, destination: `${prefix}/services/reroof-replacement`, permanent: true,
})));
const recoveredSources = new Set([...restorationAliases, ...replacementAliases].map(rule => rule.source));
config.redirects = [...config.redirects.filter(rule => !retiredSources.has(rule.source) && !recoveredSources.has(rule.source)), ...solutionAliases, ...restorationAliases, ...replacementAliases];
config.rewrites = config.rewrites.filter(rule => !retiredSources.has(rule.source));
const allPaths=[...Object.keys(registry),...DISTRICT_PROFILES.map(item=>item.path),...SUBURB_PROFILES.map(item=>item.path),...editorial.articles.map(article=>'/news/'+article.slug)];
config.rewrites=[...config.rewrites.filter(rule=>!rule.source.startsWith('/zh') && rule.source!=='/services/reroof-replacement'),{source:'/services/reroof-replacement',destination:'/services/reroof-replacement.html'},...editorial.articles.filter(article=>!config.rewrites.some(rule=>rule.source==='/news/'+article.slug)).map(article=>({source:'/news/'+article.slug,destination:'/news/'+article.slug+'.html'})),{source:'/zh',destination:'/zh/index.html'},...allPaths.map(path=>({source:zh(path),destination:path==='/'?'/zh/index.html':zh(path)+'.html'}))];
await writeFile('vercel.json',JSON.stringify(config,null,2)+'\n');
await writeFile('public/service-areas.json', JSON.stringify({ serviceAreas: SUBURB_PROFILES.map(({ suburb, district, path, servicePaths }) => ({ suburb, district, url: `${origin}${path}`, servicePaths })) }, null, 2) + '\n');
