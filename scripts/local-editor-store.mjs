import { mkdir, readFile, writeFile, rename, readdir } from 'node:fs/promises';
import path from 'node:path';
export function validateRequest({ host, origin, token }, expectedHost, expectedToken) {
  return host === expectedHost && origin === `http://${expectedHost}` && token === expectedToken;
}
const protectedCopy = text => /0405878406|\+61405878406|elliservices\.group@gmail\.com/i.test(text);
const invalid = message => Object.assign(new Error(message), { status: 400 });
export function createEditorialStore(directory, catalog, initial = { revision: 0, entries: {}, articles: [] }) {
  const known = new Map(catalog.map(entry => [entry.id, entry.source]));
  const filename = path.join(directory, 'draft.json');
  const history = path.join(directory, 'history');
  let queue = Promise.resolve();
  const read = async () => {
    try { return JSON.parse(await readFile(filename, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return structuredClone(initial); throw error; }
  };
  const exclusive = action => { const result = queue.then(action); queue = result.catch(() => {}); return result; };
  const saveInternal = async (input, restore = false) => {
    const current = await read();
    if (input.revision !== current.revision) throw Object.assign(new Error('其他窗口已保存新版本。请复制当前文字，重新载入后再编辑。'), { status: 409 });
    if (!input.entries || typeof input.entries !== 'object' || Array.isArray(input.entries) || !Array.isArray(input.articles)) throw invalid('草稿格式不正确。');
    const entries = {};
    for (const [id, value] of Object.entries(input.entries)) {
      if (!known.has(id) || value?.source !== known.get(id)) throw invalid('出现未知文字，请重新载入页面目录。');
      if (protectedCopy(value.source)) throw invalid('联系方式已锁定，不能在后台修改。');
      if (typeof value.zh !== 'string' || !value.zh.trim() || value.zh.length > 24000) throw invalid('中文内容不能为空，且每项不超过 24000 字。');
      entries[id] = { source: value.source, zh: value.zh, ...(restore ? { en: value.en, syncedZh: value.syncedZh } : { en: current.entries[id]?.en, syncedZh: current.entries[id]?.syncedZh }) };
    }
    if (input.articles.length > 100) throw invalid('文章数量超过本地编辑器限制。');
    const slugs = new Set();
    const text = (value, limit, label) => { if (typeof value !== 'string' || !value.trim() || value.length > limit) throw invalid(`${label}不能为空或超过长度限制。`); return value; };
    const articles = input.articles.map(article => {
      const slug = text(article.slug, 100, '文章网址');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slugs.has(slug) || catalog.some(item => item.pages?.includes('/news/' + slug))) throw invalid('文章网址重复或格式不正确。');
      slugs.add(slug);
      if (typeof article.image !== 'string' || !/^\/assets\/[A-Za-z0-9_./-]+\.(?:png|webp|jpe?g)$/.test(article.image) || article.image.includes('..')) throw invalid('请选择有效的站内封面。');
      if (!Array.isArray(article.sections) || article.sections.length < 1 || article.sections.length > 20) throw invalid('文章需要 1–20 个章节。');
      const previous = current.articles.find(item => item.slug === slug);
      return { slug, image: article.image, title: text(article.title, 200, '文章标题'), summary: text(article.summary, 1000, '文章摘要'), lead: text(article.lead, 5000, '文章导语'), sections: article.sections.map(section => ({ heading: text(section.heading, 200, '章节标题'), body: text(section.body, 30000, '章节正文') })), english: restore ? article.english : previous?.english, syncedChinese: restore ? article.syncedChinese : previous?.syncedChinese };
    });
    const images={};
    for(const [from,to] of Object.entries(input.images || {})) {
      if(![from,to].every(value=>typeof value==='string' && /^\/assets\/[A-Za-z0-9_./-]+\.(?:png|webp|jpe?g)$/.test(value) && !value.includes('..') && !value.includes('/brand/'))) throw invalid('图片路径无效，品牌标识不能替换。');
      images[from]=to;
    }
    const next = { revision: current.revision + 1, updatedAt: new Date().toISOString(), entries, articles, images };
    await mkdir(history, { recursive: true });
    const writeAtomic = async (target, value) => { const temp = target + '.tmp'; await writeFile(temp, JSON.stringify(value, null, 2) + '\n'); await rename(temp, target); };
    await writeAtomic(path.join(history, `${current.revision}.json`), current);
    await writeAtomic(filename, next);
    await writeAtomic(path.join(history, `${next.revision}.json`), next);
    return next;
  };
  return {
    read,
    save: input => exclusive(() => saveInternal(input)),
    versions: async () => { try { const files = (await readdir(history)).filter(name => /^\d+\.json$/.test(name)); return Promise.all(files.sort((a,b) => Number.parseInt(b)-Number.parseInt(a)).map(async name => { const value = JSON.parse(await readFile(path.join(history, name), 'utf8')); return { revision: value.revision, updatedAt: value.updatedAt, count: Object.keys(value.entries).length, articles: value.articles.length }; })); } catch (error) { if (error.code === 'ENOENT') return []; throw error; } },
    restore: (version, revision) => exclusive(async () => { if (!Number.isSafeInteger(version) || version < 0) throw invalid('版本编号无效。'); const value = JSON.parse(await readFile(path.join(history, `${version}.json`), 'utf8')); return saveInternal({ ...value, revision }, true); }),
  };
}
