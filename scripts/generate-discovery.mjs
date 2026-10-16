import { readFile, writeFile } from 'node:fs/promises';
import editorial from '../src/i18n/content.json' with { type: 'json' };
import registry from '../src/route-meta.json' with { type: 'json' };
import { DISTRICT_PROFILES, SUBURB_PROFILES } from '../src/suburb-profiles.js';
import { SERVICE_CATALOG } from '../src/service-catalog.js';

const origin = 'https://www.canberraroofkind.com.au';
const publicPaths = [...Object.keys(registry).filter((path) => path !== '/privacy'), ...DISTRICT_PROFILES.map(({ path }) => path), ...editorial.articles.map(article=>'/news/'+article.slug)];
const zh = path => '/zh' + (path==='/'?'/':path);
const urls = publicPaths.flatMap(path=>[path,zh(path)]);
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map((url) => { const english=url.startsWith('/zh')?url.slice(3)||'/':url; return `  <url><loc>${origin}${url}</loc><xhtml:link rel="alternate" hreflang="en-AU" href="${origin}${english}"/><xhtml:link rel="alternate" hreflang="zh-CN" href="${origin}${zh(english)}"/></url>`; }).join('\n')}\n</urlset>\n`);
const config=JSON.parse(await readFile('vercel.json','utf8'));
const allPaths=[...Object.keys(registry),...DISTRICT_PROFILES.map(item=>item.path),...SUBURB_PROFILES.map(item=>item.path),...editorial.articles.map(article=>'/news/'+article.slug)];
config.rewrites=[...config.rewrites.filter(rule=>!rule.source.startsWith('/zh')),...editorial.articles.filter(article=>!config.rewrites.some(rule=>rule.source==='/news/'+article.slug)).map(article=>({source:'/news/'+article.slug,destination:'/news/'+article.slug+'.html'})),{source:'/zh',destination:'/zh/index.html'},...allPaths.map(path=>({source:zh(path),destination:path==='/'?'/zh/index.html':zh(path)+'.html'}))];
await writeFile('vercel.json',JSON.stringify(config,null,2)+'\n');
await writeFile('public/service-areas.json', JSON.stringify({ serviceAreas: SUBURB_PROFILES.map(({ suburb, district, path, servicePaths }) => ({ suburb, district, url: `${origin}${path}`, servicePaths })) }, null, 2) + '\n');
await writeFile('public/llms.txt', `# Ellis Services — Canberraroofkind\n\nCanberra roof repairs, inspections, cleaning and maintenance from Ellis Services Group. Contact the team to arrange an on-site assessment and written quote.\n\n## Contact\n- Address: 121 Marcus Clarke St, Canberra, ACT 2600, Australia\n- Phone: +61 405 878 406\n- Email: elliservices.group@gmail.com\n\n## Services\n${SERVICE_CATALOG.map(({ title, path }) => `- [${title}](${origin}${path})`).join('\n')}\n\n## Service areas\n- [Areas directory](${origin}/areas)\n- [Public service-area feed](${origin}/service-areas.json)\n- [Sitemap](${origin}/sitemap.xml)\n`);
