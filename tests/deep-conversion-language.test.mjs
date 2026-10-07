import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const collect = dir => readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? collect(join(dir,e.name)) : e.name.endsWith('.html') ? [join(dir,e.name)] : []);
const visible = html => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();

test('rendered service and area pages describe company work and service-specific assessment',()=>{
 const bad=/Clear assessment and repair pathways for Canberra home roof enquiries|choose the closest service pathway|without being pushed into|Roof services available for enquiry|record visible roof leak signs|before (?:making|arranging) an enquiry|That depends on the visible condition|The website provides a Canberra coverage directory/i;
 assert.deepEqual(collect('dist').filter(p=>bad.test(visible(readFileSync(p,'utf8'))+' '+readFileSync(p,'utf8').match(/<meta[^>]+description[^>]+>/g)?.join(' '))),[]);
 const faq=visible(readFileSync('dist/faq.html','utf8'));
 assert.match(faq,/How quickly will someone respond\?[^?]*from as little as 30 minutes/i);
 assert.match(faq,/Can only a few tiles be replaced\?[^?]*(?:Yes|local|individual)/i);
});
test('contact offers an assessment without requiring a photo',()=>{
 const txt=visible(readFileSync('dist/contact.html','utf8'));
 assert.match(txt,/on-site|on site/i); assert.match(txt,/written quote/i);
 assert.match(txt,/photo.*optional|optional.*photo/i); assert.match(txt,/without a photo|text-only|description is enough/i);
 assert.match(txt,/JPG, PNG or WebP/); assert.match(txt,/4 MB/);
});

test('articles and service preparation do not replace service with the next conversation',()=>{
 const bad=/most relevant next conversation|starting point for the next conversation|closest service topic and use the service information to frame a considered next conversation/;
 assert.deepEqual(collect('dist').filter(p=>bad.test(visible(readFileSync(p,'utf8')))),[]);
});

