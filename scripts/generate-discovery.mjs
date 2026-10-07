import { writeFile } from 'node:fs/promises';
import registry from '../src/route-meta.json' with { type: 'json' };
import { DISTRICT_PROFILES, SUBURB_PROFILES } from '../src/suburb-profiles.js';
import { SERVICE_CATALOG } from '../src/service-catalog.js';

const origin = 'https://www.canberraroofkind.com.au';
const publicPaths = [...Object.keys(registry).filter((path) => path !== '/privacy'), ...DISTRICT_PROFILES.map(({ path }) => path)];
const urls = publicPaths.map((path) => `${origin}${path}`);
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile('public/service-areas.json', JSON.stringify({ serviceAreas: SUBURB_PROFILES.map(({ suburb, district, path, servicePaths }) => ({ suburb, district, url: `${origin}${path}`, servicePaths })) }, null, 2) + '\n');
await writeFile('public/llms.txt', `# Ellis Services — Canberraroofkind\n\nCanberra roof repairs, inspections, cleaning and maintenance from Ellis Services Group. Contact the team to arrange an on-site assessment and written quote.\n\n## Contact\n- Address: 121 Marcus Clarke St, Canberra, ACT 2600, Australia\n- Phone: +61 405 878 406\n- Email: elliservices.group@gmail.com\n\n## Services\n${SERVICE_CATALOG.map(({ title, path }) => `- [${title}](${origin}${path})`).join('\n')}\n\n## Service areas\n- [Areas directory](${origin}/areas)\n- [Public service-area feed](${origin}/service-areas.json)\n- [Sitemap](${origin}/sitemap.xml)\n`);
