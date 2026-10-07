import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
const path='/news/when-to-arrange-roof-inspection-canberra';
const html=readFileSync(`dist${path}.html`,'utf8');
const doc=new JSDOM(html).window.document;
// Losing the inspection process during prerendering must fail this contract.
test('inspection guide renders purpose, checklist, repair scope and quote preparation',()=>{
  for(const heading of ['Confirm the purpose and access before the visit','What the inspection checks','Turn findings into a repair scope','Prepare an inspection and repair enquiry']) assert.ok([...doc.querySelectorAll('h2')].some(x=>x.textContent===heading),heading);
  assert.match(doc.querySelector('.articleBody').textContent,/roof-space access.*agreed/s);
});
test('inspection guide links to five current local routes and is linked from its service',()=>{
  for(const target of ['/services/roof-inspections','/news/after-rain-roof-leak-check-canberra','/services/tile-roof-repairs','/services/chimney-flashing-repairs','/contact']){
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
  assert.equal(doc.querySelector('.articleLead').textContent,'Roof inspection in Canberra: what Ellis checks, how findings shape a repair scope and what to prepare before booking.');
});
