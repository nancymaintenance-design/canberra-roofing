import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const content=JSON.parse(await readFile(new URL('../src/i18n/content.json',import.meta.url),'utf8'));
for(const entry of Object.values(content.entries)) assert.ok(entry.en?.trim() && entry.syncedZh===entry.zh,'Reviewed content contains Chinese changes awaiting English sync. Keep these in .local-editor/draft.json.');
for(const article of content.articles) {
  assert.ok(article.english?.title?.trim(),'New article has no reviewed English translation.');
  assert.equal(article.syncedChinese,JSON.stringify({title:article.title,summary:article.summary,lead:article.lead,sections:article.sections}),'New article English sync is stale.');
}
console.log('Reviewed bilingual content passed. Local drafts are not included.');
