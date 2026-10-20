// Read-only, low-concurrency HTTP checks. Never invoked while serving llms.txt.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {startPreview} from './preview.mjs';
import {buildLLMS,extractLLMSPage,PRODUCTION_ORIGIN} from './generate-llms.mjs';

const args=Object.fromEntries(process.argv.slice(2).map(arg=>{const [key,...value]=arg.replace(/^--/,'').split('=');return[key,value.join('=')];}));
const live=args.origin===PRODUCTION_ORIGIN;
if(args.origin&&!live)throw new Error('Only the verified production origin is accepted; omit --origin for local preview');
const folder=args.output??'../reports/llms-2026-10-20/'+(live?'production-read-only':'local');
await mkdir(folder,{recursive:true});
const {markdown,records}=await buildLLMS();
const server=live?null:await startPreview();
const origin=server?.origin??PRODUCTION_ORIGIN;
const results={checkedAt:new Date().toISOString(),origin,mode:live?'existing production pages, candidate not deployed':'local candidate',pages:[],llms:[],policies:[],simulatedAgents:[],internalLinkIssues:[],issues:[],realBotVisitsVerified:false};
const digest=value=>createHash('sha256').update(value).digest('hex');
async function request(pathname,headers={}){
 for(let attempt=0;attempt<2;attempt++){
  try{
   const response=await fetch(origin+pathname,{headers,signal:AbortSignal.timeout(20000)});
   const bytes=new Uint8Array(await response.arrayBuffer());
   const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
   return {status:response.status,finalURL:response.url,redirected:response.redirected,contentType:response.headers.get('content-type'),xRobots:response.headers.get('x-robots-tag'),text};
  }catch(error){if(attempt===1)throw error;await new Promise(resolve=>setTimeout(resolve,350));}
 }
}
function recordError(scope,error){results.issues.push({scope,message:error.message});}
const cache=new Map();
async function localDocument(pathname){
 if(!cache.has(pathname)){
  const filename='dist'+(pathname==='/'?'/index.html':pathname==='/zh/'?'/zh/index.html':pathname+'.html');
  cache.set(pathname,new JSDOM(await readFile(filename,'utf8')));
 }
 return cache.get(pathname).window.document;
}
try{
 const targets=records.flatMap(r=>[{...r.en,selector:r.selector,paragraph:r.paragraph,counterpart:r.zh.url},{...r.zh,selector:r.selector,paragraph:r.paragraph,counterpart:r.en.url}]);
 let index=0;
 await Promise.all(Array.from({length:2},async()=>{
  while(index<targets.length){
   const page=targets[index++],pathname=new URL(page.url).pathname;
   try{
    const response=await request(pathname);
    assert.equal(response.status,200,'HTTP status');
    assert.equal(response.finalURL,origin+pathname,'must not be a redirect intermediate');
    assert.match(response.contentType??'',/text\/html/i);
    assert.doesNotMatch(response.xRobots??'',/noindex|\bnone\b/i);
    const actual=extractLLMSPage(response.text,{...page,url:page.url});
    assert.equal(actual.lang,page.lang);
    assert.equal(actual.title,page.title);
    assert.equal(actual.evidence,page.evidence,'summary evidence differs from the candidate');
    assert.equal(actual.mainText,page.mainText,'initial HTML body differs');
    assert.deepEqual(actual.alternates,page.alternates);
    const d=await localDocument(pathname);
    for(const href of [...d.querySelectorAll('main a[href]')].map(a=>a.getAttribute('href')).filter(h=>h.startsWith('/')||h.startsWith('#'))){
     const target=new URL(href,page.url);
     if(target.origin!==PRODUCTION_ORIGIN)continue;
     if(target.pathname.startsWith('/assets/'))continue;
     try{
      const targetDocument=await localDocument(target.pathname);
      if(target.hash&&!targetDocument.getElementById(decodeURIComponent(target.hash.slice(1))))results.internalLinkIssues.push({from:page.url,href,issue:'missing fragment target in built HTML'});
     }catch{results.internalLinkIssues.push({from:page.url,href,issue:'missing target document in built routes'});}
    }
    results.pages.push({url:page.url,requestedURL:origin+pathname,finalURL:response.finalURL,status:response.status,contentType:response.contentType,lang:actual.lang,role:page.role,intent:page.intent,counterpart:page.counterpart,title:actual.title,canonical:actual.canonical,robots:actual.robots||'no explicit noindex',xRobots:response.xRobots,alternates:actual.alternates,summary:page.summary,evidence:actual.evidence,sourceSelector:page.sourceSelector,initialHTMLReadable:true,internalLinksChecked:actual.internalLinks.length,included:true});
   }catch(error){recordError(page.url,error);}
   await new Promise(resolve=>setTimeout(resolve,80));
  }
 }));
 for(const file of ['robots.txt','sitemap.xml']){
  try{
   const response=await request('/'+file);assert.equal(response.status,200);assert.equal(response.redirected,false);
   const baseline=await readFile('public/'+file,'utf8');assert.equal(response.text,baseline,file+' changed');
   results.policies.push({path:'/'+file,status:response.status,contentType:response.contentType,sha256:digest(response.text),matchesUnchangedSource:true});
  }catch(error){recordError('/'+file,error);}
 }
 for(const accept of ['en-AU,en;q=0.9','zh-CN,zh;q=0.9']){
  try{
   const r=await request('/llms.txt',{'Accept-Language':accept});assert.equal(r.status,200);assert.equal(r.redirected,false);
   assert.match(r.contentType??'',/text\/plain/i);assert.match(r.contentType??'',/charset=utf-?8/i);
   assert.match(r.text,/^# /m);assert.doesNotMatch(r.text,/<html|<!doctype|security checkpoint|verify you are human/i);
   if(!live)assert.equal(r.text,markdown,'candidate must be served as actual Markdown');
   results.llms.push({acceptLanguage:accept,status:r.status,finalURL:r.finalURL,contentType:r.contentType,sha256:digest(r.text),matchesCandidate:r.text===markdown,utf8Markdown:true});
  }catch(error){recordError('/llms.txt '+accept,error);}
 }
 for(const userAgent of ['Googlebot/2.1 (+http://www.google.com/bot.html)','OAI-SearchBot/1.3; +https://openai.com/searchbot','Claude-SearchBot/1.0','PerplexityBot/1.0; +https://perplexity.ai/perplexitybot','ChatGPT-User/1.0','Claude-User/1.0','Perplexity-User/1.0']){
  for(const pathname of ['/services/roof-inspections','/zh/services/roof-inspections','/llms.txt']){
   try{
    const r=await request(pathname,{'User-Agent':userAgent});assert.equal(r.status,200);assert.equal(r.redirected,false);
    if(pathname!=='/llms.txt'){
     const expected=targets.find(page=>new URL(page.url).pathname===pathname);
     const actual=extractLLMSPage(r.text,{...expected,url:expected.url});
     assert.equal(actual.mainText,expected.mainText,'simulated-agent body differs');
     assert.equal(actual.lang,expected.lang,'simulated-agent language differs');
    }else{
     assert.match(r.contentType??'',/text\/plain/i);
     assert.equal(digest(r.text),results.llms[0]?.sha256,'simulated-agent Markdown differs');
    }
    results.simulatedAgents.push({userAgent,path:pathname,status:r.status,finalURL:r.finalURL,contentType:r.contentType,simulationOnly:true});
   }catch(error){recordError(userAgent+' '+pathname,error);}
  }
 }
 for(const pathname of ['/__editor/','/__editor/api/state','/editor/editor.js','/.local-editor/draft.json','/missing-llms-check']){
  try{const r=await request(pathname);assert.equal(r.status,404);results.policies.push({path:pathname,status:r.status,restrictionPreserved:true});}catch(error){recordError(pathname,error);}
 }
 if(results.internalLinkIssues.length)results.issues.push({scope:'HTML internal links',message:`${results.internalLinkIssues.length} unresolved built targets`});
 const pairs=records.map(r=>({path:r.path,role:r.role,intent:r.intent,en:r.en.url,zh:r.zh.url,inclusionReason:'Reviewed public content owner with readable bilingual body and matching sitemap entry'}));
 await writeFile(path.join(folder,'checks.json'),JSON.stringify({...results,pairs},null,2));
 console.log(JSON.stringify({mode:results.mode,pages:results.pages.length,languagePairs:pairs.length,llmsResponses:results.llms.length,agentRequests:results.simulatedAgents.length,internalLinkIssues:results.internalLinkIssues.length,issues:results.issues}));
 if(results.issues.length)process.exitCode=1;
}finally{for(const dom of cache.values())dom.window.close();await server?.close();}
