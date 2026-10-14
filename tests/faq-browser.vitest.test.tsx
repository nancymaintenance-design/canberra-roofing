// @vitest-environment jsdom
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {AppV3} from '../src/main';
import {INTENT_TOPICS,EXTRA_INTENT_TOPICS} from '../src/keyword-intent-content.js';

it('FAQ has one category directory linked to single-column question groups',()=>{
 const host=document.createElement('div');host.innerHTML=renderToStaticMarkup(<AppV3 pathname="/faq"/>);
 const nav=host.querySelector('.faqCategoryNav');expect(nav).not.toBeNull();
 const groups=[...host.querySelectorAll('.faqQuestionGroup')];expect(groups.length).toBeGreaterThan(8);
 expect(nav!.querySelectorAll('a')).toHaveLength(groups.length);
 for(const group of groups){
  expect(group.querySelector('h2')).not.toBeNull();expect(group.querySelectorAll('details').length).toBeGreaterThan(0);
  expect(nav!.querySelector(`a[href="#${group.id}"]`)).not.toBeNull();
 }
 expect(host.querySelector('.intentFaqDirectory')).toBeNull();
 expect(host.querySelector('.faqIntro h1')!.textContent).toBe('Roof repair questions');
 for(const summary of host.querySelectorAll('.faqQuestionGroup summary')) {
  expect(summary.querySelector('.faqToggleIcon[aria-hidden="true"]')).not.toBeNull();
 }
 for(const topic of [...INTENT_TOPICS,...EXTRA_INTENT_TOPICS]){
  const item=host.querySelector(`[data-question="${topic.id}"]`)!;
  expect(item.querySelector('summary')!.textContent).toBe(topic.question);
  expect(item.textContent).toContain(topic.answer);
  for(const link of topic.links)expect(item.querySelector(`a[href="${link.path}"]`)).not.toBeNull();
 }
});
