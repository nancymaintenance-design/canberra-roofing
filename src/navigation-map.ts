import registry from './route-meta.json';
import { SERVICE_CATALOG } from './service-catalog.js';
import { DISTRICT_PROFILES, SUBURB_PROFILES } from './suburb-profiles.js';
import { NEWS_ARTICLES } from './news-articles';
import { addedArticles } from './i18n/editorial';
import { basePath, languagePath, translate } from './i18n/runtime';

export const SITE_ORIGIN = registry['/'].canonical.replace(/\/$/, '');
export type NavigationPage = {
 page_id: string; path: string; url: string; locale: 'en'|'zh'; page_type: string;
 service_group: string; commercial_owner_url: string|null; primary_parent_url: string|null;
 breadcrumb_label: string; alternate_url: string|null; robots: string; reason: string;
};
// Explicit semantic relationships. A broad comparison is not a child of one trade.
const comprehensiveGuides = new Set(['roof-repair-cost-canberra','roof-repair-vs-restoration-vs-replacement-canberra']);
const fixedLabels:Record<string,string> = {'/':'Home','/about':'About','/services':'Services','/areas':'Service areas','/news':'Roof repair guides','/faq':'FAQs','/contact':'Contact','/privacy':'Privacy policy','/case-studies/tile-roof-repair-canberra':'Tile roof repair case study'};
export function getNavigationMap(locale:'en'|'zh'='en'): NavigationPage[] {
 const rows=new Map<string,{label:string;type:string;parent:string|null;owner:string|null;group:string;reason:string;noindex?:boolean}>();
 for(const [path,route] of Object.entries(registry)) rows.set(path,{label:fixedLabels[path]??route.h1,type:path==='/'?'Homepage':'Company',parent:path==='/'?null:'/',owner:'/',group:'roof-repairs',reason:'Existing published company or navigation destination'});
 for(const service of SERVICE_CATALOG) rows.set(service.path,{label:service.shortLabel,type:'Service Owner',parent:'/',owner:service.path,group:service.slug,reason:'Existing service catalogue and confirmed commercial destination; URL retained'});
 for(const article of NEWS_ARTICLES){
  const owner=comprehensiveGuides.has(article.slug)?null:SERVICE_CATALOG.find(s=>s.path===article.servicePath)?.path??null;
  rows.set('/news/'+article.slug,{label:article.title,type:'Guide',parent:owner??'/news',owner,group:owner?.slice('/services/'.length)??'roof-work-comparison',reason:owner?'Article body and existing servicePath identify a single service':'Broad quote/scope comparison retains the journal hierarchy; related services remain contextual'});
 }
 const casePath='/case-studies/tile-roof-repair-canberra';
 rows.set(casePath,{label:fixedLabels[casePath],type:'Case Study',parent:'/services/tile-roof-repairs',owner:'/services/tile-roof-repairs',group:'tile-roof-repairs',reason:'Existing case documents visible tile work and already names tile repairs as its service'});
 for(const district of DISTRICT_PROFILES) rows.set(district.path,{label:district.district,type:'Location',parent:'/areas',owner:'/',group:'roof-repairs',reason:'Actual district directory and published coverage'});
 for(const suburb of SUBURB_PROFILES){
  const district=DISTRICT_PROFILES.find(d=>d.district===suburb.district);
  if(!district)throw new Error('Missing real district for '+suburb.path);
  rows.set(suburb.path,{label:suburb.suburb,type:'Location',parent:district.path,owner:'/',group:'roof-repairs',noindex:true,reason:'Existing suburb coverage; intentional noindex retained; not a fabricated single-service page'});
 }
 for(const article of addedArticles()) rows.set('/news/'+article.slug,{label:article.title,type:'Guide',parent:'/news',owner:null,group:'unassigned',reason:'Published editor article without confirmed commercial owner; uses real same-language journal ancestor'});
 return [...rows].map(([path,row])=>{
  const localPath=languagePath(path,locale), local=(p:string)=>SITE_ORIGIN+languagePath(p,locale);
  // Enumeration is read-only: only text actually rendered belongs in the editor catalogue.
  return {page_id:locale+':'+path,path:localPath,url:local(path),locale,page_type:row.type,service_group:row.group,commercial_owner_url:row.owner?local(row.owner):null,primary_parent_url:row.parent?local(row.parent):null,breadcrumb_label:translate(row.label,'text',locale,false),alternate_url:SITE_ORIGIN+languagePath(path,locale==='en'?'zh':'en'),robots:row.noindex?'noindex,follow':'index,follow',reason:row.reason};
 });
}
export function navigationTrail(pathname:string){
 const locale=pathname==='/zh'||pathname.startsWith('/zh/')?'zh':'en';
 const map=getNavigationMap(locale),byURL=new Map(map.map(p=>[p.url,p]));
 let current=byURL.get(SITE_ORIGIN+languagePath(basePath(pathname),locale));
 if(!current||current.page_type==='Homepage')return [];
 const result:NavigationPage[]=[];const seen=new Set<string>();
 while(current){
  if(seen.has(current.url))throw new Error('Navigation parent cycle at '+current.url);
  seen.add(current.url);result.unshift(current);
  if(!current.primary_parent_url)break;
  const parent=byURL.get(current.primary_parent_url);
  if(!parent)throw new Error('Missing navigation parent '+current.primary_parent_url);
  current=parent;
 }
 return result;
}
export function serviceResources(servicePath:string){
 return getNavigationMap().filter(p=>p.primary_parent_url===SITE_ORIGIN+servicePath && ['Guide','Case Study'].includes(p.page_type));
}
