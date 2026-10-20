import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import {startPreview} from './preview.mjs';
const folder='../reports/breadcrumbs-2026-10-20';await mkdir(folder+'/screenshots',{recursive:true});
const server=await startPreview(),browser=await chromium.launch({headless:true});
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage();const checks=[];const issues=[];
const paths=['/','/services/roof-leak-repairs','/services/roof-inspections','/services/roof-cleaning','/news/after-rain-roof-leak-check-canberra','/news/roof-repair-vs-restoration-vs-replacement-canberra','/case-studies/tile-roof-repair-canberra','/areas/belconnen','/areas/belconnen/mckellar-roof-repairs','/contact'];
// Absolute canonical links remain absolute in the app. Only this test browser
// serves those destinations from the candidate, with analytics requests blocked.
await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname==='www.canberraroofkind.com.au'){const response=await context.request.get(server.origin+u.pathname+u.search);return route.fulfill({response});}if(u.origin===server.origin)return route.continue();return route.abort();});
try{
 for(const width of [360,390,768,1440])for(const locale of ['en','zh'])for(const path of paths){
  const pathname=locale==='zh'?'/zh'+(path==='/'?'/':path):path;
  try{
   await page.setViewportSize({width,height:1000});const response=await page.goto(server.origin+pathname);assert.equal(response.status(),200);
   await page.locator('h1').waitFor();await page.evaluate(()=>document.fonts.ready);
   const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(overflow.scroll<=overflow.client+1,JSON.stringify(overflow));
   if(path!=='/'){
    const nav=page.locator('.breadcrumbs');assert.equal(await nav.count(),1);
    const first=nav.locator('a').first();await first.focus();assert.equal(await first.evaluate(e=>e.matches(':focus-visible')),true);
    const outline=await first.evaluate(e=>getComputedStyle(e).outlineWidth);assert.notEqual(outline,'0px');
    const box=await nav.boundingBox();assert.ok(box.width<=width);assert.ok(box.height<220,'oversized breadcrumb');
   }
   const selector=path.startsWith('/services/')?'.serviceHeroActions .button':path.startsWith('/news/')||path.startsWith('/case-studies/')?'.contentNextStep .button':'.phoneAction';
   const action=page.locator(selector).first();assert.ok(await action.count());assert.equal(await action.isVisible(),true);
   await action.scrollIntoViewIfNeeded();assert.equal(await action.evaluate(e=>{const r=e.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return e===top||e.contains(top);}),true,'enquiry action obscured');
   const label=await action.textContent();assert.ok(label.trim());
   if([390,1440].includes(width)&&['/services/roof-inspections','/news/after-rain-roof-leak-check-canberra','/case-studies/tile-roof-repair-canberra','/areas/belconnen'].includes(path)){
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`${folder}/screenshots/${locale}-${path.split('/').at(-1)}-${width}.png`});
    if(path.startsWith('/news/')){await page.locator('.contentNextStep').scrollIntoViewIfNeeded();await page.screenshot({path:`${folder}/screenshots/${locale}-guide-enquiry-${width}.png`});}
   }
   checks.push({pathname,width,status:response.status(),noHorizontalOverflow:true,keyboardFocus:true,consultationAction:true});
  }catch(e){issues.push({pathname,width,error:e.message});}
 }
 for(const locale of ['en','zh']){
  try{
   const prefix=locale==='zh'?'/zh':'';await page.setViewportSize({width:390,height:1000});await page.goto(server.origin+prefix+'/news/after-rain-roof-leak-check-canberra');
   await page.locator(`.breadcrumbs a[href="https://www.canberraroofkind.com.au${prefix}/services/roof-leak-repairs"]`).click();await page.waitForURL('**'+prefix+'/services/roof-leak-repairs');assert.ok((await page.locator('h1').textContent()).trim());
   await page.locator('.serviceHeroActions .button').click();await page.waitForURL('**/contact?service=Roof%20Leak%20Repairs');
   await expect(page.locator('form button.button')).toBeEnabled();
   await expect(page.locator('select').last()).toHaveValue('Roof Leak Repairs');
   await page.getByLabel(locale==='zh'?'姓名':'Name',{exact:true}).fill('Synthetic preview only');
   assert.equal(await page.getByLabel(locale==='zh'?'姓名':'Name',{exact:true}).inputValue(),'Synthetic preview only');
   checks.push({locale,flow:'guide → canonical service → scoped contact form',passed:true,submitted:false});
  }catch(e){issues.push({locale,flow:'guide → service → contact',error:e.message});}
 }
 await writeFile(folder+'/browser-checks.json',JSON.stringify({checks,issues,viewports:[360,390,768,1440],externalAnalyticsBlocked:true,formsSubmitted:false},null,2));
 console.log(JSON.stringify({checks:checks.length,issues},null,2));if(issues.length)process.exitCode=1;
}finally{await context.close();await browser.close();await server.close();}
