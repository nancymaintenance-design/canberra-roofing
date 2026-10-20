import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {startPreview} from '../scripts/preview.mjs';
const bytes=await readFile(new URL('../public/llms.txt',import.meta.url));
const markdown=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
const links=[...markdown.matchAll(/^- \[([^\n]+)\]\((https:\/\/[^\s)]+)\): (.+)$/gm)];
test('llms navigation is UTF-8 Markdown with one site heading and a bilingual introduction',()=>{
 assert.equal((markdown.match(/^# /gm)||[]).length,1);
 assert.match(markdown,/^> .*Ellis Services Group.*Canberra/m);
 assert.match(markdown,/简体中文/);
 assert.doesNotMatch(markdown,/<html|<!doctype|captcha|AI must recommend/i);
});
test('GET serves the same real bilingual Markdown for English and Chinese Accept-Language without cookies or JavaScript',async()=>{
 const server=await startPreview();
 try{
  for(const accept of ['en-AU,en;q=0.9','zh-CN,zh;q=0.9']){
   const response=await fetch(server.origin+'/llms.txt',{headers:{'Accept-Language':accept},redirect:'manual'});
   assert.equal(response.status,200);assert.equal(response.headers.get('location'),null);
   assert.match(response.headers.get('content-type'),/text\/plain; charset=utf-8/i);
   const text=new TextDecoder('utf-8',{fatal:true}).decode(await response.arrayBuffer());
   assert.equal(text,markdown);
   assert.match(text,/\]\(https:\/\/www\.canberraroofkind\.com\.au\/zh\/services\/roof-inspections\): /);
   assert.doesNotMatch(text,/<html|<!doctype|security checkpoint/i);
  }
 }finally{await server.close();}
});
test('every curated navigation link has a description and its independently addressable language pair',()=>{
 const bullets=markdown.split('\n').filter(line=>line.startsWith('- '));
 assert.equal(links.length,bullets.length,'all bullets are described public HTML links');
 const urls=new Set(links.map(item=>item[2]));
 assert.equal(urls.size,links.length,'no duplicate URLs');
 for(const path of ['/','/services','/areas','/about','/contact','/services/roof-inspections','/services/roof-cleaning','/services/roof-leak-repairs','/case-studies/tile-roof-repair-canberra']){
  assert.ok(urls.has('https://www.canberraroofkind.com.au'+path),path);
  assert.ok(urls.has('https://www.canberraroofkind.com.au/zh'+(path==='/'?'/':path)),path+' Chinese');
 }
 for(const [,label,url,summary]of links){
  const parsed=new URL(url);assert.equal(parsed.origin,'https://www.canberraroofkind.com.au');
  assert.equal(parsed.search,'');assert.equal(parsed.hash,'');
  assert.doesNotMatch(parsed.pathname,/^\/(?:zh\/)?(?:__editor|api|solutions)|\.json$|\/areas\/.+\//);
  assert.ok(label.length>2&&summary.length>12);
 }
});
