import React, {useEffect, useRef, useState} from 'react';
import {INTENT_TOPICS, EXTRA_INTENT_TOPICS} from './keyword-intent-content.js';

const categories = [
  {id:'getting-started',label:'Booking & service areas',groups:['Getting started','Next steps']},
  {id:'roof-leaks',label:'Roof leaks',groups:['Roof leaks']},
  {id:'tiles',label:'Tile roof repairs',groups:['Tiles']},
  {id:'ridges',label:'Ridge capping & pointing',groups:['Ridges']},
  {id:'chimneys',label:'Chimneys & flashing',groups:['Chimneys']},
  {id:'metal-roofing',label:'Metal & Colorbond roofing',groups:['Metal roofing']},
  {id:'inspections',label:'Inspections & property access',groups:['Inspections','Property access']},
  {id:'renovation',label:'Repair or renovation',groups:['Renovation']},
  {id:'maintenance',label:'Cleaning & gutter maintenance',groups:['Maintenance']},
  {id:'costs',label:'Costs & quotes',groups:['Costs']},
  {id:'urgent',label:'Timing, storms & urgent help',groups:['Timing','Storm or hail']},
];

export function FaqBrowser({faqs}:{faqs:{q:string;a:string}[]}) {
  const entries=[
    ...faqs.map((item,index)=>({id:`base-${index}`,group:item.q.split(' / ')[0],question:item.q.split(' / ').slice(1).join(' / ')||item.q,answer:item.a,links:[] as {path:string;label:string}[]})),
    ...[...INTENT_TOPICS,...EXTRA_INTENT_TOPICS].map(item=>({id:item.id,group:item.group,question:item.question,answer:item.answer,links:item.links})),
  ];
  const knownGroups=new Set(categories.flatMap(category=>category.groups));
  const sections=categories.map(category=>({...category,entries:entries.filter(item=>category.groups.includes(item.group)||(category.id==='getting-started'&&!knownGroups.has(item.group)))})).filter(category=>category.entries.length);
  const [active,setActive]=useState(sections[0]?.id);
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const nav=root.current?.querySelector('.faqCategoryNav');
    const track=nav?.querySelector('div');
    const link=nav?.querySelector<HTMLElement>('a[aria-current="location"]');
    if(!track||!link)return;
    const bounds=track.getBoundingClientRect(),item=link.getBoundingClientRect();
    if(window.innerWidth<=760){
      if(item.left<bounds.left)track.scrollLeft+=item.left-bounds.left-4;
      else if(item.right>bounds.right)track.scrollLeft+=item.right-bounds.right+4;
    }else if(nav){
      const box=nav.getBoundingClientRect();
      if(item.top<box.top)nav.scrollTop+=item.top-box.top-8;
      else if(item.bottom>box.bottom)nav.scrollTop+=item.bottom-box.bottom+8;
    }
  },[active]);
  useEffect(()=>{
    const container=root.current;
    if(!container)return;
    let frame=0;
    const update=()=>{
      const headerBottom=document.querySelector('header')?.getBoundingClientRect().bottom||0;
      const navigation=container.querySelector('.faqCategoryNav')!.getBoundingClientRect();
      container.style.setProperty('--faq-sticky-top',`${headerBottom+12}px`);
      container.style.setProperty('--faq-nav-height',`${navigation.height}px`);
      const offset=window.innerWidth<=760?headerBottom+12+navigation.height+40:headerBottom+48;
      const groups=[...container.querySelectorAll<HTMLElement>('.faqQuestionGroup')];
      let current=groups[0]?.dataset.category;
      for(const group of groups){if(group.getBoundingClientRect().top<=offset)current=group.dataset.category;}
      if(current)setActive(current);
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
    const keepFocusVisible=(event:FocusEvent)=>{
      if(!(event.target instanceof HTMLElement)||event.target.tagName!=='SUMMARY')return;
      const header=document.querySelector('header')?.getBoundingClientRect().bottom||0;
      const nav=container.querySelector('.faqCategoryNav')!.getBoundingClientRect();
      const top=window.innerWidth<=760?Math.max(header,nav.bottom):header;
      if(event.target.getBoundingClientRect().top<top+8)event.target.scrollIntoView({block:'start'});
    };
    schedule();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    container.addEventListener('toggle',schedule,true);
    container.addEventListener('focusin',keepFocusVisible);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);container.removeEventListener('toggle',schedule,true);container.removeEventListener('focusin',keepFocusVisible);};
  },[]);
  return <div className="faqBrowser" ref={root}>
    <nav className="faqCategoryNav" aria-label="FAQ categories">
      <p className="eyebrow">BROWSE QUESTIONS</p>
      <div>{sections.map(category=><a key={category.id} href={`#faq-${category.id}`} aria-current={active===category.id?'location':undefined} onClick={()=>setActive(category.id)}>{category.label}<span aria-hidden="true">{category.entries.length}</span></a>)}</div>
    </nav>
    <div className="faqQuestions">{sections.map(category=><section className="faqQuestionGroup" id={`faq-${category.id}`} data-category={category.id} key={category.id} aria-labelledby={`faq-${category.id}-title`}>
      <h2 id={`faq-${category.id}-title`}>{category.label}</h2>
      {category.entries.map(item=><details key={item.id} data-question={item.id}><summary><span>{item.question}</span><span className="faqToggleIcon" aria-hidden="true" /></summary><p>{item.answer}</p>{item.links.map(link=><p key={link.path}><a href={link.path}>{link.label}</a>.</p>)}</details>)}
    </section>)}</div>
  </div>;
}
