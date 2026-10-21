// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {renderPage} from '../src/entry-server';
import {SERVICE_CATALOG} from '../src/service-catalog.js';
const template='<html lang="en-AU"><head><!--route-head--></head><body><!--document-route--><div id="root"><!--app-html--></div></body></html>';
function page(path:string){const host=document.createElement('div');host.innerHTML=renderPage(path,template);return host;}
function identity(img:Element){return img.getAttribute('src')!.split('?')[0].replace(/-\d+\.(?:webp|avif)$/,'');}
it('uses Chinese time notation throughout the urgent service FAQ',()=>{
 const text=page('/zh/services/emergency-roof-repairs').querySelector('main')!.textContent!;
 expect(text).not.toMatch(/9:00 am|9:00 pm/);expect(text).toContain('上午9:00–晚上9:00');
});
it.each([['/zh/services/emergency-roof-repairs','紧急屋顶维修'],['/zh/services/rental-property-roof-repairs','出租房屋顶维修'],['/zh/news/roof-leak-information-for-tenants-canberra','出租房屋顶维修']])('localizes short service breadcrumb at %s',(path,label)=>{
 const host=page(path);expect(host.querySelector('.breadcrumbs')!.textContent).toContain(label);
 expect(host.querySelector('.breadcrumbs')!.textContent).not.toMatch(/Urgent Roof Repairs|Rental Property Roof Repairs/);
 const schema=JSON.parse(host.querySelector('#breadcrumb-schema')!.textContent!);expect(schema.itemListElement.map((n:any)=>n.name)).toContain(label);
});
it.each(SERVICE_CATALOG.map(s=>s.path))('keeps each image content once in %s',path=>{
 const images=[...page(path).querySelectorAll('main img')];const names=images.map(identity);expect(new Set(names).size).toBe(names.length);
});
it.each(['','/zh'])('keeps a single full tile sequence on the case and compact related entries %s',prefix=>{
 const host=page(prefix+'/case-studies/tile-roof-repair-canberra');
 expect(host.querySelectorAll('.caseEvidenceGrid img')).toHaveLength(3);
 expect(host.querySelectorAll('main img')).toHaveLength(3);
 expect(host.textContent).not.toMatch(/Evidence scope|no measured customer outcome|证据范围/);
 for(const path of ['/services/roof-leak-repairs','/news/after-rain-roof-leak-check-canberra']){
  const related=page(prefix+path).querySelector('.relatedCase')!;expect(related).not.toBeNull();
  expect(related.querySelectorAll('img')).toHaveLength(0);
  expect(related.querySelector(`a[href="${prefix}/case-studies/tile-roof-repair-canberra"]`)).not.toBeNull();
 }
});
it.each(['','/zh'])('labels responsive district cells without removing suburb enquiry links %s',prefix=>{
 const host=page(prefix+'/areas/belconnen');const rows=host.querySelectorAll('.districtDirectory tbody tr');expect(rows).toHaveLength(9);
 for(const row of rows){expect(row.querySelectorAll('td .tableCellLabel')).toHaveLength(2);expect(row.querySelectorAll('a')).toHaveLength(2);}
 expect(host.querySelector('.districtServiceChoices')!.textContent).not.toContain('For two-storey properties or a remote owner');
 expect(host.querySelector('#local-enquiry form')).not.toBeNull();
});
