const $ = id => document.getElementById(id);
const token = document.querySelector('meta[name="editor-session"]').content;
let state, draft, saved, current = '/', language = 'zh', selected = '', dirty = false, busy = false, pendingNavigation, generation = 0, articleDirty = false;
const clone = value => structuredClone(value);
let deviceWidth=1440;
let selectedImage;
function sizePreview() { const box=$('frameViewport'); const scale=Math.min(1,box.clientWidth/deviceWidth); const frame=$('pagePreview'); frame.style.width=deviceWidth+'px'; frame.style.height=Math.max(800,box.clientHeight/scale)+'px'; frame.style.transform=`scale(${scale})`; }
new ResizeObserver(sizePreview).observe($('frameViewport'));
for(const [id,width] of [['previewDesktop',1440],['previewMobile',390]]) $(id).onclick=()=>{ deviceWidth=width; $('previewDesktop').setAttribute('aria-pressed',String(width===1440)); $('previewMobile').setAttribute('aria-pressed',String(width===390)); sizePreview(); };
const error = message => { $('editorError').textContent = message; $('editorError').hidden = !message; };
async function api(route, value) {
  let response;
  try { response = await fetch('/__editor/api/' + route, { method: value === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', 'X-Editor-Token': token }, ...(value === undefined ? {} : { body: JSON.stringify(value) }) }); } catch { throw new Error('无法连接本地服务，输入仍保留。请检查后台是否运行后重试。'); }
  const result = await response.json(); if (!response.ok) throw new Error(result.error || '本地服务暂时不可用。'); return result;
}
const pageTitle = page => state.translations[page.title] || page.title;
const pending = () => Object.values(draft.entries).filter(entry => entry.zh !== entry.syncedZh).length + draft.articles.filter(article => JSON.stringify({ title:article.title, summary:article.summary, lead:article.lead, sections:article.sections }) !== article.syncedChinese).length;
function status() { $('saveState').textContent = busy ? '正在保存…' : dirty ? '有未保存修改' : `已保存本地 · 版本 ${draft.revision}`; $('saveButton').disabled = busy || !dirty; $('pendingCount').textContent = pending() ? `${pending()} 项中文修改待同步英文` : '暂无待同步的修改'; }
function changed() { generation++; dirty = true; status(); $('pagePreview').contentWindow?.postMessage({ type:'editor-preview-content', content:draft }, location.origin); }
function grow(element) { element.style.height = 'auto'; element.style.height = Math.min(480, Math.max(120, element.scrollHeight + 4)) + 'px'; }
function renderPages() {
  const query = $('pageSearch').value.trim().toLowerCase(), group = $('pageGroup').value;
  $('clearSearch').hidden = !query;
  const pages = [...state.pages, ...draft.articles.map(article => ({ url:'/news/' + article.slug, title:article.title }))].filter(page => (group === 'all' || (group === 'main' ? !/^\/(services|news|areas|case-studies)\//.test(page.url) : page.url.startsWith('/' + group))) && (!query || (page.title + page.url + pageTitle(page)).toLowerCase().includes(query)));
  $('pageCount').textContent = `${pages.length} 个页面`;
  $('pageList').replaceChildren();
  if (!pages.length) { const p = document.createElement('p'); p.textContent = '没有匹配页面，请换个关键词。'; $('pageList').append(p); }
  for (const page of pages) { const button = document.createElement('button'); button.type='button'; button.setAttribute('aria-current', page.url === current ? 'page' : 'false'); button.textContent=pageTitle(page); const small=document.createElement('small'); small.textContent=page.url; button.append(small); button.onclick=()=>navigate(()=>openPage(page.url)); $('pageList').append(button); }
}
function fields() { return state.catalog.filter(field => field.pages.includes(current) && !/0405878406|\+61405878406|elliservices\.group@gmail\.com/.test(field.source)); }
function renderFields() {
  $('copyField').replaceChildren(new Option('请选择文字', ''));
  for (const field of fields()) { const title = draft.entries[field.id]?.zh || state.translations[field.source] || field.source; $('copyField').add(new Option(title.length > 55 ? title.slice(0,55) + '…' : title, field.id)); }
  selected=''; $('copyForm').hidden=true; $('fieldHeading').textContent='选择一段文字';
  const article=draft.articles.find(item => '/news/'+item.slug===current);
  if (article) { $('fieldScope').textContent='这是新增文章草稿。点击“编辑文章”继续修改。'; const button=document.createElement('button'); button.type='button'; button.textContent='编辑文章'; button.onclick=()=>openArticle(article); $('copyField').after(button); button.dataset.articleEdit='true'; }
  else $('fieldScope').textContent='点击预览中的文字，或从下方选择。';
}
function selectField(id) {
  const field=state.catalog.find(item=>item.id===id); if (!field || !fields().some(item=>item.id===id)) return;
  selected=id; $('copyField').value=id; $('copyForm').hidden=false; $('imageForm').hidden=true;
  $('fieldHeading').textContent = /metadata/.test(field.kind) ? '页面搜索信息' : '编辑页面文字';
  $('fieldScope').textContent=field.pages.length>1 ? `这段文字在 ${field.pages.length} 个页面共用；保存后这些位置一起更新。` : '仅用于当前页面。';
  const entry=draft.entries[id]; $('chineseCopy').value=entry?.zh || state.translations[field.source] || ''; $('englishCopy').value=entry?.en || field.source;
  $('translationState').textContent=entry && entry.zh !== entry.syncedZh ? '英文待同步：保存后，在聊天中通知助手。' : '当前中英文对照。修改中文后会标记为待同步。';
  $('copyValidation').textContent=''; grow($('chineseCopy')); grow($('englishCopy'));
}
function openPage(url) {
  current=url; selected=''; document.querySelectorAll('[data-article-edit]').forEach(node=>node.remove());
  const page=state.pages.find(page=>page.url===url) || { url, title:draft.articles.find(item=>'/news/'+item.slug===url)?.title || url };
  $('currentPageTitle').textContent=pageTitle(page); $('currentPagePath').textContent=url;
  const preview=(language==='zh'?'/zh'+(url==='/'?'/':url):url);
  $('pagePreview').src=preview+'?edit=1'; $('openPreview').href=preview;
  const params=new URLSearchParams(location.search); params.set('page',url); history.replaceState(null,'',location.pathname+'?'+params);
  renderPages(); renderFields();
}
async function save() {
  if (busy) return false;
  if (Object.values(draft.entries).some(entry=>!entry.zh.trim())) { error('中文内容不能为空，请补全后保存。'); $('chineseCopy').focus(); return false; }
  busy=true; status(); error('');
  const submittedGeneration=generation, submitted=clone(draft);
  try { const result=await api('save',submitted); saved=clone(result); if(generation===submittedGeneration) { draft=result; dirty=false; } else { draft.revision=result.revision; draft.updatedAt=result.updatedAt; dirty=true; } status(); return !dirty; }
  catch (failure) { error(failure.message); return false; }
  finally { busy=false; status(); }
}
function navigate(action) { if(busy) { error('正在保存，请完成后再切换页面。'); return; } if (!dirty) return action(); pendingNavigation=action; $('navigationDialog').showModal(); $('cancelNavigation').focus(); }
$('cancelNavigation').onclick=()=>$('navigationDialog').close();
$('discardNavigation').onclick=()=>{ draft=clone(saved); dirty=false; $('navigationDialog').close(); status(); pendingNavigation?.(); };
$('saveNavigation').onclick=async()=>{ if(await save()) { $('navigationDialog').close(); pendingNavigation?.(); } };
$('saveButton').onclick=save;
$('pageSearch').oninput=renderPages; $('pageGroup').onchange=renderPages;
$('clearSearch').onclick=()=>{ $('pageSearch').value=''; renderPages(); $('pageSearch').focus(); };
$('copyField').onchange=()=>selectField($('copyField').value);
$('chineseCopy').oninput=()=>{ if (!selected) return; const field=state.catalog.find(item=>item.id===selected); draft.entries[selected]={ ...draft.entries[selected], source:field.source, zh:$('chineseCopy').value }; grow($('chineseCopy')); $('chineseCopy').setAttribute('aria-invalid',String(!$('chineseCopy').value.trim())); $('copyValidation').textContent=$('chineseCopy').value.trim()?'':'请输入中文内容。'; $('translationState').textContent='英文待同步：保存后，在聊天中通知助手。'; changed(); };
for (const [id,locale] of [['previewChinese','zh'],['previewEnglish','en']]) $(id).onclick=()=>{ language=locale; $('previewChinese').setAttribute('aria-pressed',String(language==='zh')); $('previewEnglish').setAttribute('aria-pressed',String(language==='en')); $('pagePreview').src=(language==='zh'?'/zh'+(current==='/'?'/':current):current)+'?edit=1'; $('openPreview').href=language==='zh'?'/zh'+(current==='/'?'/':current):current; };
$('pagePreview').onload=()=>{ if(state) $('pagePreview').contentWindow.postMessage({type:'editor-preview-content',content:draft},location.origin); };
window.addEventListener('message',event=>{ if(event.origin===location.origin && event.source===$('pagePreview').contentWindow && event.data?.type==='editor-select-copy') selectField(event.data.id); });
window.addEventListener('message',event=>{ if(event.origin!==location.origin || event.source!==$('pagePreview').contentWindow || event.data?.type!=='editor-select-image') return; selectedImage=event.data.src; if(!selectedImage.startsWith('/assets/')||selectedImage.includes('/brand/')) return; $('copyForm').hidden=true; $('imageForm').hidden=false; $('fieldHeading').textContent='替换页面图片'; $('fieldScope').textContent=selectedImage.split('/').pop(); $('replaceImage').replaceChildren(...state.images.map(image=>new Option(image.split('/').pop(),image))); $('replaceImage').value=draft.images?.[selectedImage]||selectedImage; $('replaceImagePreview').src=draft.images?.[selectedImage]||selectedImage; });
$('replaceImage').onchange=()=>{ draft.images={...draft.images,[selectedImage]:$('replaceImage').value}; $('replaceImagePreview').src=$('replaceImage').value; changed(); };
window.addEventListener('beforeunload',event=>{ if(dirty || articleDirty) { event.preventDefault(); event.returnValue=''; } });
$('closeHistory').onclick=()=>$('historyDialog').close();
$('historyButton').onclick=()=>navigate(async()=>{
  $('historyDialog').showModal(); $('historyStatus').textContent='正在读取历史版本…'; $('historyList').replaceChildren();
  try { const versions=await api('history'); $('historyStatus').textContent=versions.length?'':'尚无历史版本。首次保存后会在这里显示。';
    for(const version of versions) { const row=document.createElement('div'); row.className='historyRow'; const copy=document.createElement('div'); copy.textContent=`版本 ${version.revision}`; const small=document.createElement('small'); small.textContent=`${version.updatedAt?new Date(version.updatedAt).toLocaleString('zh-CN'):'初始版本'} · ${version.count} 项文字 · ${version.articles} 篇新文章`; copy.append(small); const button=document.createElement('button'); button.type='button'; button.textContent=version.revision===draft.revision?'当前版本':'恢复此版本'; button.disabled=version.revision===draft.revision; button.onclick=async()=>{ button.disabled=true; try { draft=await api('restore',{ version:version.revision, revision:draft.revision }); saved=clone(draft); dirty=false; $('historyDialog').close(); status(); openPage(current); } catch(failure) { $('historyStatus').textContent=failure.message; button.disabled=false; } }; row.append(copy,button); $('historyList').append(row); }
  } catch(failure) { $('historyStatus').textContent=failure.message; }
});
let editingSlug;
function addSection(section={heading:'',body:''}) { const box=document.createElement('div'); box.className='articleSectionEditor'; const index=$('articleSections').children.length+1; const label=document.createElement('label'); label.htmlFor='sectionHeading'+index; label.textContent='章节标题 '+index; const heading=document.createElement('input'); heading.id=label.htmlFor; heading.value=section.heading; heading.dataset.heading='true'; const bodyLabel=document.createElement('label'); bodyLabel.htmlFor='sectionBody'+index; bodyLabel.textContent='正文（空行分段）'; const body=document.createElement('textarea'); body.style.resize='none'; body.id=bodyLabel.htmlFor; body.rows=7; body.value=section.body; body.dataset.body='true'; body.oninput=()=>grow(body); box.append(label,heading,bodyLabel,body); $('articleSections').append(box); }
function openArticle(article) { articleDirty=false; editingSlug=article?.slug; $('articleForm').reset(); $('articleSlug').readOnly=!!article; for(const [id,key] of [['articleSlug','slug'],['articleName','title'],['articleSummary','summary'],['articleLead','lead']]) $(id).value=article?.[key]||''; $('articleImage').replaceChildren(...state.images.map(image=>new Option(image.split('/').pop(),image))); if(article) $('articleImage').value=article.image; $('articleImagePreview').src=$('articleImage').value; $('articleSections').replaceChildren(); for(const section of article?.sections||[{heading:'',body:''}]) addSection(section); $('articleError').textContent=''; $('articleDialog').showModal(); $('articleName').focus(); }
function closeArticle() { if(articleDirty) { $('articleDiscardDialog').showModal(); $('keepArticle').focus(); } else $('articleDialog').close(); }
$('newArticle').onclick=()=>navigate(()=>openArticle()); $('closeArticle').onclick=closeArticle; $('addSection').onclick=()=>{addSection();articleDirty=true;}; $('articleImage').onchange=()=>{ articleDirty=true; $('articleImagePreview').src=$('articleImage').value; };
$('articleForm').addEventListener('input',()=>{articleDirty=true;});
$('articleDialog').addEventListener('cancel',event=>{event.preventDefault();closeArticle();});
$('keepArticle').onclick=()=>$('articleDiscardDialog').close();
$('discardArticle').onclick=()=>{articleDirty=false;$('articleDiscardDialog').close();$('articleDialog').close();};
$('articleForm').onsubmit=async event=>{ event.preventDefault(); const article={slug:$('articleSlug').value.trim(),title:$('articleName').value.trim(),summary:$('articleSummary').value.trim(),lead:$('articleLead').value.trim(),image:$('articleImage').value,sections:[...$('articleSections').children].map(box=>({ heading:box.querySelector('[data-heading]').value.trim(), body:box.querySelector('[data-body]').value.trim() }))};
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)||!article.title||!article.summary||!article.lead||article.sections.some(section=>!section.heading||!section.body)) { $('articleError').textContent='请填写标题、摘要、导语和完整章节；网址只用小写英文、数字和连字符。'; return; }
  if(busy) return;
  const before=clone(draft), wasDirty=dirty; if(editingSlug) draft.articles=draft.articles.map(item=>item.slug===editingSlug?{...item,...article}:item); else draft.articles.push(article); dirty=true; const controls=[...$('articleForm').querySelectorAll('input,textarea,select,button')]; controls.forEach(control=>{control.disabled=true;}); if(await save()) { articleDirty=false; $('articleDialog').close(); openPage('/news/'+article.slug); } else { draft=before; dirty=wasDirty; status(); $('articleError').textContent=$('editorError').textContent; } controls.forEach(control=>{control.disabled=false;});
};
try { state=await api('state'); draft=state.draft; saved=clone(draft); status(); const requested=new URLSearchParams(location.search).get('page'); openPage(state.pages.some(page=>page.url===requested)?requested:'/'); } catch(failure) { error(failure.message); $('saveState').textContent='未连接本地后台，请刷新重试'; }
