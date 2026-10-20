// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { initialiseAnalytics } from '../src/analytics.js';
it('records one sanitized navigation event after repeated initialization, never a lead',()=>{
 const runtime={location:{hostname:'www.canberraroofkind.com.au',origin:'https://www.canberraroofkind.com.au'},gtag:vi.fn()};
 initialiseAnalytics(runtime,document);initialiseAnalytics(runtime,document);
 const nav=document.createElement('nav');nav.className='breadcrumbs';nav.dataset.sourcePath='/zh/news/when-to-arrange-roof-inspection-canberra';nav.dataset.ownerId='/zh/services/roof-inspections';
 nav.innerHTML='<a data-breadcrumb-position="2" href="https://www.canberraroofkind.com.au/zh/services/roof-inspections?email=private#fragment"><span>屋顶检查</span></a>';
 nav.addEventListener('click',event=>event.preventDefault());document.body.append(nav);nav.querySelector('span').dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
 const events=runtime.gtag.mock.calls.filter(c=>c[0]==='event');
 expect(events).toEqual([['event','breadcrumb_click',{source_path:'/zh/news/when-to-arrange-roof-inspection-canberra',target_path:'/zh/services/roof-inspections',locale:'zh',position:2,owner_id:'/zh/services/roof-inspections'}]]);
 expect(JSON.stringify(events)).not.toContain('private');nav.remove();
});
