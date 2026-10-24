// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderPage } from "../src/entry-server";
const template='<html lang="en-AU"><head><!--route-head--></head><body><!--document-route--><main><!--app-html--></main></body></html>';
const page=(path:string)=>{const host=document.createElement('div');host.innerHTML=renderPage(path,template);return host;};
describe('About FAQ consolidation and gallery',()=>{
  for(const prefix of ['', '/zh']) it('keeps a compact localized FAQ entry and six unlinked images: '+prefix,()=>{
    const about=page(prefix+'/about');
    expect(about.querySelectorAll('.aboutPage details')).toHaveLength(0);
    expect(about.querySelector('.aboutContactActions a.textAction')?.getAttribute('href')).toBe(prefix+'/faq#faq-getting-started');
    expect(about.querySelectorAll('.aboutContactBand')).toHaveLength(1);
    expect(about.querySelector('.aboutFaqEntry')).toBeNull();
    expect(about.querySelector('.caseStudyRail')).toBeNull();
    expect(about.querySelector('.aboutContactActions a.button')?.getAttribute('href')).toBe(prefix+'/contact');
    const service=page(prefix+'/services/tile-roof-repairs');
    expect(service.querySelector('a[href="'+prefix+'/case-studies/tile-roof-repair-canberra"]')).not.toBeNull();
    const images=[...about.querySelectorAll('.aboutBrandGalleryGrid img')];
    expect(images).toHaveLength(6);
    expect(new Set(images.map(img=>img.getAttribute('src'))).size).toBe(6);
    expect(about.querySelector('.aboutBrandGalleryGrid a')).toBeNull();
    expect(about.querySelector('.aboutBrandGalleryGrid .galleryFeature')).toBeNull();
    expect(about.querySelector('.aboutContactBand')?.textContent).toContain(prefix?'查看全部常见问题':'Browse all questions');
  });
  it('retains the four distinct About answers in the main FAQ without duplicating existing topics',()=>{
    const faq=page('/faq');const questions=[...faq.querySelectorAll('.faqQuestions summary')].map(x=>x.textContent);
    for(const question of [
      'Do I need to know the exact roof problem before I contact you?',
      'Can you help if I am unsure whether the roof is tile or metal?',
      'What happens if weather makes an assessment unsafe?',
      'Do I need to be at the property for an assessment?',
      'Can I add photos?', 'What is the safe first step?',
      'Is an inspection or quote free?', 'Which photos and details help with a roof repair enquiry?',
    ]) expect(questions.filter(q=>q===question)).toHaveLength(1);
    expect(faq.querySelector('#faq-inspections')?.textContent).toContain('gates, pets, tenants');
    expect(page('/zh/faq').textContent).toContain('评估时我需要在物业现场吗？');
  });
});
