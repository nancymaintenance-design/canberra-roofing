// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {renderPage} from '../src/entry-server';
const template='<html lang="en-AU"><head><!--route-head--></head><body><!--document-route--><div id="root"><!--app-html--></div></body></html>';
function page(path:string){const host=document.createElement('div');host.innerHTML=renderPage(path,template);return host;}
it.each(['','/zh'])('explains our replacement quote without implying everything is included %s',prefix=>{
 const host=page(prefix+'/services/reroof-replacement');
 const faq=[...host.querySelectorAll('details')].find(e=>/What should a roof replacement quote include|换顶报价应包含哪些内容/.test(e.querySelector('summary')!.textContent!))!;
 expect(faq.textContent).toMatch(prefix?/我们的换顶报价/:/Our replacement quote/);
 expect(faq.textContent).toMatch(prefix?/另行|不包含/:/excluded|separate/);
 expect(host.querySelectorAll('.serviceTheme')).toHaveLength(5);
});
it.each(['','/zh'])('introduces suburb repairs in our voice and retains enquiry routes %s',prefix=>{
 const host=page(prefix+'/areas/belconnen/aranda-roof-repairs');
 expect(host.querySelector('.directAnswer')!.textContent).toMatch(prefix?/^我们/:/^We /);
 expect(host.querySelector('form')!.getAttribute('action')).toBe('/api/contact');
 expect(host.querySelector('meta[name=robots]')!.getAttribute('content')).toContain('noindex');
});
it.each(['','/zh'])('states gutter drainage boundaries without asking clients to guess inclusions %s',prefix=>{
 const host=page(prefix+'/faq');
 const faq=[...host.querySelectorAll('details')].find(e=>/Does gutter maintenance include a blocked underground|檐沟维护是否包括堵塞的地下/.test(e.querySelector('summary')!.textContent!))!;
 expect(faq.textContent).toMatch(prefix?/我们会列明/:/We identify/);
 expect(faq.textContent).toMatch(prefix?/专业|另行/:/specialist|separate/);
});
