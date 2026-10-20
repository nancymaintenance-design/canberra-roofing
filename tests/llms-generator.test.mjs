import assert from 'node:assert/strict';
import test from 'node:test';
import {extractLLMSPage,buildLLMS} from '../scripts/generate-llms.mjs';
const url='https://www.canberraroofkind.com.au/services/roof-inspections';
const fixture=(extra='',canonical=url,lang='en-AU')=>`<html lang="${lang}"><head><link rel="canonical" href="${canonical}">${extra}</head><body><main><h1>Roof inspections</h1><p class="directAnswer">Assess accessible roof details. Agree the findings before booking.</p></main></body></html>`;
for(const extra of ['<meta name="robots" content="noindex,follow">','<meta name="googlebot" content="none">']){
 test('refuses a selected page that explicitly excludes indexing: '+extra,()=>{
  assert.throws(()=>extractLLMSPage(fixture(extra),{url,selector:'.directAnswer'}),/noindex/i);
 });
}
test('refuses a page whose canonical belongs to a different owner URL',()=>{
 assert.throws(()=>extractLLMSPage(fixture('','https://www.canberraroofkind.com.au/'),{url,selector:'.directAnswer'}),/canonical/i);
});
test('refuses an English shell substituted for a Chinese counterpart',()=>{
 const zh='https://www.canberraroofkind.com.au/zh/services/roof-inspections';
 assert.throws(()=>extractLLMSPage(fixture('',zh),{url:zh,selector:'.directAnswer'}),/language/i);
});
test('refuses missing body evidence rather than guessing from the URL',()=>{
 assert.throws(()=>extractLLMSPage('<main><h1>Roof inspections</h1></main>',{url,selector:'.directAnswer'}),/summary source/i);
});
test('the same built content generates identical navigation and keeps summary evidence',async()=>{
 const a=await buildLLMS(),b=await buildLLMS();assert.equal(a.markdown,b.markdown);
 for(const r of a.records)for(const page of [r.en,r.zh]){
  for(const sentence of [...new Intl.Segmenter(page.lang,{granularity:'sentence'}).segment(page.summary)])assert.ok(page.evidence.includes(sentence.segment.trim()));
 }
});
test('the urgent service summary retains its applicable after-hours fee qualification',async()=>{
 const {records}=await buildLLMS();const urgent=records.find(r=>r.path==='/services/emergency-roof-repairs');
 assert.match(urgent.en.summary,/additional urgent-service fee/);
 assert.match(urgent.zh.summary,/额外.*加急服务费/);
});
