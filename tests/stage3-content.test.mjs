import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const path='/news/when-to-arrange-roof-inspection-canberra';
const html=readFileSync(`dist${path}.html`,'utf8');
const doc=new JSDOM(html).window.document;
// Losing the inspection process during prerendering must fail this contract.
test('inspection guide renders purpose, checklist, repair scope and quote preparation',()=>{
  for(const heading of ['Agree the purpose and access before the visit','Follow the covering, junctions and drainage together','Turn findings into a repair scope','Plan the inspection, repair decision and follow-up']) assert.ok([...doc.querySelectorAll('h2')].some(x=>x.textContent===heading),heading);
  assert.match(doc.querySelector('.articleBody').textContent,/Roof-space access.*agreed/s);
});
test('inspection guide prioritises educational reading and is linked from its service',()=>{
  for(const target of ['/services/roof-inspections','/news/after-rain-roof-leak-check-canberra','/news/roof-repair-cost-canberra','/news/roof-repair-vs-restoration-vs-replacement-canberra']){
    assert.ok(doc.querySelector(`.articleBody a[href="${target}"]`),target);
    assert.ok(existsSync(`dist${target}.html`),target);
  }
  assert.ok(readFileSync('dist/services/roof-inspections.html','utf8').includes(`href="${path}"`));
});
test('inspection guide keeps its indexable canonical contract',()=>{
  assert.equal(doc.querySelector('link[rel="canonical"]').href,`https://www.canberraroofkind.com.au${path}`);
  assert.equal(doc.querySelectorAll('h1').length,1);
  assert.doesNotMatch(doc.querySelector('meta[name="robots"]')?.content??'',/noindex/);
});
test('inspection guide lead states the process and preparation readers can expect',()=>{
  assert.match(doc.querySelector('.articleLead').textContent,/connect your observations.*covering, junctions and drainage/);
  assert.equal(doc.querySelectorAll('.articleSection').length,4);
  assert.equal(doc.querySelectorAll('.articleSidebar').length,0);
});
