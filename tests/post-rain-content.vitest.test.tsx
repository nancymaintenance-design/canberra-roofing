// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {renderPage} from '../src/entry-server';
const template='<html lang="en-AU"><head><!--route-head--></head><body><!--document-route--><div id="root"><!--app-html--></div></body></html>';
function page(path:string){const host=document.createElement('div');host.innerHTML=renderPage(path,template);return host;}
it.each(['','/zh'])('renders additional rain questions once in the directory and relevant service %s',prefix=>{
 for(const [id,slug] of [['rain-gutter-after-clean','gutter-downpipe-maintenance'],['rain-downstream-boundary','gutter-repairs'],['rain-ceiling-sequence','roof-leak-repairs'],['rain-musty-source','roof-inspections'],['rain-records-insurer','roof-inspections']]){
  for(const path of ['/faq','/services/'+slug]){
   const host=page(prefix+path),answer=host.querySelectorAll(`details[data-question="${id}"]`);expect(answer,path).toHaveLength(1);
   expect(answer[0].querySelector('p')!.textContent!.length).toBeGreaterThan(65);
   expect(answer[0].querySelector(`a[href^="${prefix}/news/"]`)).not.toBeNull();
   if(prefix)expect(answer[0].querySelector('summary')!.textContent).toMatch(/[\u3400-\u9fff]/);
  }
 }
});
it('keeps existing service H1s while explaining gutter investigation rather than merely clearing',()=>{
 const host=page('/services/gutter-downpipe-maintenance');
 expect(host.querySelector('h1')!.textContent).toBe('Gutter & Downpipe Cleaning');
 expect(host.querySelector('#what-we-repair-title')!.textContent).toContain('after cleaning');
 expect(host.querySelector('#how-we-handle-it')!.textContent).toMatch(/gutter fall|downstream|outlet/);
});
it.each(['','/zh'])('updates substantive existing guides without losing sections or inquiry paths %s',prefix=>{
 for(const slug of ['after-rain-roof-leak-check-canberra','gutters-overflowing-heavy-rain-canberra','roof-leak-vs-condensation-canberra','when-to-arrange-roof-inspection-canberra','roof-repair-cost-canberra','roof-leak-information-for-tenants-canberra']){
  const host=page(prefix+'/news/'+slug);expect(host.querySelector('time[datetime="2026-10-21"]')).not.toBeNull();
  expect(host.querySelectorAll('.articleSection')).toHaveLength(4);
  expect(host.querySelector('.contentNextStep a[href*="contact"]')).not.toBeNull();
  expect(host.querySelector('main')!.textContent).not.toMatch(/Brisbane|Queensland|Gold Coast|AI 高频|搜索量/);
  if(prefix)for(const p of host.querySelectorAll('.articleSection p'))expect(p.textContent).toMatch(/[\u3400-\u9fff]/);
 }
});
