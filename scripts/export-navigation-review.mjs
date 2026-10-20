import {readFile,writeFile} from 'node:fs/promises';
const folder='../reports/breadcrumbs-2026-10-20';const read=async name=>JSON.parse(await readFile(folder+'/'+name+'.json','utf8'));
const before=await read('before'),after=await read('after'),rows=await read('navigation-map');
const priorities=['roof-leak-repairs','roof-inspections','roof-cleaning'];
const counts=[];
for(const locale of ['en','zh'])for(const slug of priorities){
 const old=before.metrics.find(m=>m.locale===locale&&m.target.endsWith('/'+slug)),now=after.metrics.find(m=>m.locale===locale&&m.target.endsWith('/'+slug));
 const indexed=(data,m)=>m.sources.body.filter(p=>!data.pages.find(r=>r.path===p)?.robots?.includes('noindex'));
 counts.push({locale,url:now.target,clickDistance:{before:old.homeClickDistance,after:now.homeClickDistance},primaryNavigation:{before:old.sources.navigation.length,after:now.sources.navigation.length},breadcrumbSources:{before:old.sources.breadcrumb.length,after:now.sources.breadcrumb.length},bodySources:{before:old.sources.body.length,after:now.sources.body.length},indexableBodySources:{before:indexed(before,old).length,after:indexed(after,now).length},newBodySources:now.sources.body.filter(p=>!old.sources.body.includes(p)),totalUniqueSources:{before:old.uniqueSourcePages,after:now.uniqueSourcePages}});
}
await writeFile(folder+'/priority-metrics.json',JSON.stringify({measuredFrom:'Initial built a[href] graph; each source page counted once within each channel. Channel counts overlap and must not be added. No GSC traffic or lead data.',counts},null,2));
const line=r=>`| ${r.locale} | ${r.url} | ${r.clickDistance.before} → ${r.clickDistance.after} | ${r.breadcrumbSources.before} → ${r.breadcrumbSources.after} | ${r.bodySources.before} → ${r.bodySources.after} | ${r.indexableBodySources.before} → ${r.indexableBodySources.after} |`;
await writeFile(folder+'/核心服务入口统计.md','# 核心服务入口统计\n\n统计来自修改前后初始HTML真实a href图。首页点击距离不是目录深度。每一列按不同来源页去重；同一页可在不同渠道出现，不能将各列相加。正文来源包括既有首页内容导航，不包括站点页头导航、面包屑和页脚；最后一列排除显式noindex来源。\n\n| 语言 | 服务URL | 首页点击距离 | 面包屑来源页 | 正文来源页 | 可索引正文来源页 |\n| --- | --- | --- | --- | --- | --- |\n'+counts.map(line).join('\n')+'\n\n三组优先服务均已从相应语言首页一次点击可达，本轮保留而不是虚报缩短。页头Services菜单原本在展开后生成，初始HTML中的核心服务导航来源均为0且未改；不将其当作新增可抓取入口。完整来源名单在before.json、after.json和priority-metrics.json。统计不代表自然点击、权重传递量、收录或有效询盘。\n');
await writeFile(folder+'/页面归属与双语配对.md','# 页面归属与双语配对\n\n完整机器可读映射为navigation-map.json，共'+rows.length+'个中英文文档节点；包含URL、语言、页面类型、服务组、商业承接地址、真实父级、短标签、语言对应页、索引指令和依据。下表列出服务、指南及案例；地区层级使用现有district记录，不拆分URL猜父页。\n\n| 英文页面 | 真实父级 | 中文对应页 | 类型 |\n| --- | --- | --- | --- |\n'+rows.filter(r=>r.locale==='en'&&['Service Owner','Guide','Case Study'].includes(r.page_type)).map(r=>`| ${r.url} | ${r.primary_parent_url} | ${r.alternate_url} | ${r.page_type} |`).join('\n')+'\n\n综合报价与维修／翻新／换顶比较文章保留资讯父级，未改成某个服务的子页；没有确认归属的未来编辑文章同样先使用真实资讯父级，不自动根据slug分配服务。没有建立新子服务页。77个城区的中英文文档保留noindex,follow，父级为实际地区目录，未全部放开索引。\n');
console.log('Exported priority metrics and bilingual mapping.');
