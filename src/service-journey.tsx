import React from 'react';
import { SERVICE_CATALOG } from './service-catalog.js';
import { SITE_ORIGIN, getNavigationMap, serviceResources } from './navigation-map';
import { basePath, currentLanguage, translate } from './i18n/runtime';
import { NEWS_ARTICLES } from './news-articles';

export function ServiceResources({ servicePath }: { servicePath:string }) {
 const resources=serviceResources(servicePath);
 if(!resources.length)return null;
 return <section className="serviceGuideLink serviceResources" aria-label="Related guides and repair examples"><ul>{resources.map(item=>{const guide=NEWS_ARTICLES.find(a=>'/news/'+a.slug===item.path);return <li key={item.path}><h3><a href={basePath(item.path)}>{translate(item.breadcrumb_label)}</a></h3>{guide&&<p>{guide.summary}</p>}</li>;})}</ul></section>;
}

export function ServiceNextStep({ pagePath }: { pagePath:string }) {
 const row=getNavigationMap().find(p=>p.path===basePath(pagePath));
 if(!row)return null;
 const service=row.commercial_owner_url&&SERVICE_CATALOG.find(s=>SITE_ORIGIN+s.path===row.commercial_owner_url);
 const zh=currentLanguage()==='zh';
 const options=service?[service]:pagePath.includes('roof-repair-vs-restoration')?SERVICE_CATALOG.filter(s=>['roof-inspections','roof-renovation','reroof-replacement'].includes(s.slug)):SERVICE_CATALOG.filter(s=>['roof-inspections','roof-leak-repairs'].includes(s.slug));
 return <aside className="contentNextStep" aria-label={zh?'服务与咨询':'Services and enquiries'}>
  <div><p>{zh?'需要安排屋顶施工？我们会检查现场情况，说明适合的工作和书面报价。':'Need work on your roof? We inspect the property and explain the appropriate work and written quote.'}</p><ul>{options.map(s=><li key={s.path}><a href={s.path}>{translate(s.shortLabel)}</a></li>)}</ul></div>
  <a className="button" href={service?`/contact?service=${encodeURIComponent(service.title)}`:'/contact'}>{zh?'申请屋顶评估':'Request a roof assessment'}</a>
 </aside>;
}
