import { currentLanguage, getEditorialContent } from './runtime';
import type { NewsArticle } from '../news-articles';
export function addedArticles(): NewsArticle[] {
  return getEditorialContent().articles.filter(value=>currentLanguage()==='zh' || !!value.english).map(value => {
    const text = currentLanguage() === 'zh' ? value : value.english || value;
    return { slug:value.slug, title:text.title, summary:text.summary, description:text.summary, lead:text.lead, updated:getEditorialContent().updatedAt?.slice(0,10) || '2026-10-16', serviceTitle:'', servicePath:'', related:[], sources:[], sections:text.sections.map((section:any,index:number)=>({id:`section-${index+1}`,heading:section.heading,paragraphs:section.body.split(/\n\s*\n/).map((paragraph:string)=>paragraph.trim()).filter(Boolean)})) };
  });
}
export function addedArticle(path: string) { return addedArticles().find(article => '/news/' + article.slug === path); }
export function addedImage(slug: string) { const article=getEditorialContent().articles.find(article=>article.slug===slug); return article ? { src:article.image, alt:currentLanguage()==='en' && article.english ? article.english.title : article.title } : null; }
