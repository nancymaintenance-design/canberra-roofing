// @vitest-environment jsdom
import {it,expect} from 'vitest';
import {renderPage} from '../src/entry-server';
const template='<html lang="en-AU"><head><!--route-head--></head><body><!--document-route--><div id="root"><!--app-html--></div></body></html>';
const articles=['after-rain-roof-leak-check-canberra','cracked-slipped-missing-roof-tiles-canberra','chimney-flashing-water-entry-signs','rebedding-vs-repointing-canberra-roofs','when-to-arrange-roof-inspection-canberra','roof-repair-cost-canberra','roof-repointing-cost-canberra','roof-cleaning-methods-canberra','gutters-overflowing-heavy-rain-canberra','roof-leak-vs-condensation-canberra','roof-repair-vs-restoration-vs-replacement-canberra','roof-leak-information-for-tenants-canberra'];
for(const prefix of ['', '/zh'])for(const path of [...articles.map(s=>'/news/'+s),'/services/emergency-roof-repairs','/services/roof-cleaning'])it('removes unapproved external destinations without empty panels at '+prefix+path,()=>{
 const d=document.createElement('div');d.innerHTML=renderPage(prefix+path,template);
 for(const a of d.querySelectorAll('a[href]'))expect(a.getAttribute('href')).not.toMatch(/(?:esa\.act\.gov\.au|bluescope\.com\.au|monier\.com\.au|csrassetlibrary\.com|selleys\.com\.au|colorbond\.com|yourhome\.gov\.au)/);
 expect(d.querySelector('.articleSources')).toBeNull();
 expect(d.textContent).not.toMatch(/guide links to the manufacturer references|制造商参考链接/);
 expect(d.querySelector('a[href="tel:0405878406"]')).not.toBeNull();
 expect(d.querySelector('a[href="mailto:elliservices.group@gmail.com"]')).not.toBeNull();
 if(path.startsWith('/news/')){
  expect(d.querySelectorAll('.articleSection').length).toBeGreaterThanOrEqual(3);
  expect(d.querySelectorAll('.articleRelated a').length).toBeGreaterThanOrEqual(2);
  expect(d.querySelector('.contentNextStep a[href*="/contact"]')).not.toBeNull();
 }
 if(path.endsWith('emergency-roof-repairs')){expect(d.textContent).toContain('000');expect(d.textContent).toContain('132 500');if(prefix)expect(d.querySelector('main')!.textContent).not.toContain('For an immediate threat to life');}
});
