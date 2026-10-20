import published from './content.json';

export type CopyEntry = { source: string; zh: string; en?: string; syncedZh?: string };
export type EditorialContent = { revision: number; entries: Record<string, CopyEntry>; articles: any[]; images?: Record<string,string>; updatedAt?: string };
let content: EditorialContent = published;
let route = '/';
let language: 'en' | 'zh' = 'en';
let editable = false;
const catalog = new Map<string, { id: string; source: string; kind: string; pages: string[] }>();
let translations: Record<string,string> = {};
export function setChineseTranslations(value: Record<string,string>) { translations=value; }
export async function loadChineseTranslations() {
  const modules=await Promise.all([import('./zh-CN.json'),import('./zh-common.json'),import('./zh-articles.json'),import('./zh-areas.json'),import('./zh-common-extra.json'),import('./zh-remediation')]);
  setChineseTranslations(Object.assign({},...modules.map(module=>module.default)));
}
export const basePath = (path: string) => path === '/zh' || path === '/zh/' ? '/' : path.startsWith('/zh/') ? path.slice(3) : path;
export const isChinese = (path: string) => path === '/zh' || path.startsWith('/zh/');
export const languagePath = (path: string, locale: 'en' | 'zh') => locale === 'zh' ? '/zh' + (basePath(path) === '/' ? '/' : basePath(path)) : basePath(path);
export function configureLocale(path: string, editing = false) { route = basePath(path); language = isChinese(path) ? 'zh' : 'en'; editable = editing; }
export const currentLanguage = () => language;
export const currentPath = () => route;
export const isEditingPreview = () => editable;
export function setEditorialContent(value: EditorialContent) { content = value; }
export const getEditorialContent = () => content;
export function copyId(text: string) { let hash = 2166136261; for (const c of text) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619); return 'c' + (hash >>> 0).toString(36); }
export const normalizeCopy = (text: string) => text.replace(/\s+/g, ' ').trim();
export const isProtectedCopy = (text: string) => /(?:0405878406|\+61405878406|elliservices\.group@gmail\.com|\b000\b|132\s*500)/i.test(text) || /^\+?[\d\s():.-]+$/.test(text.trim());
export function translate(text: string, kind = 'text', targetLanguage = language, register = true) {
  const source = normalizeCopy(text);
  if (!source || !/[A-Za-z\u3400-\u9fff]/.test(source)) return text;
  const id = copyId(source);
  if (register) {
    const existing = catalog.get(id);
    if (existing && !existing.pages.includes(route)) existing.pages.push(route);
    if (!existing) catalog.set(id, { id, source, kind, pages: [route] });
  }
  const entry = content.entries[id];
  const value = targetLanguage === 'zh' ? entry?.zh || translations[source] || source : entry?.en || source;
  return text.replace(/\S[\s\S]*\S|\S/, value);
}
export function getCatalog() { return [...catalog.values()]; }
export function localizeProps(type: any, original: any) {
  if (typeof type !== 'string' || !original || ['script', 'style', 'code', 'pre'].includes(type) || original['data-no-translate']) return original;
  const props = { ...original };
  const visit = (value: any): any => typeof value === 'string' ? translate(value) : Array.isArray(value) ? value.map(visit) : value;
  props.children = visit(props.children);
  if (type === 'option' && props.value === undefined && typeof original.children === 'string') props.value = original.children;
  for (const key of ['alt', 'title', 'aria-label', 'placeholder']) if (typeof props[key] === 'string') props[key] = translate(props[key], key);
  if (type === 'meta' && ['description', 'og:title', 'og:description', 'og:image:alt'].includes(props.name || props.property)) props.content = translate(props.content, 'metadata');
  if (type === 'a' && language === 'zh' && typeof props.href === 'string' && /^\/(?!\/|assets\/|api\/|__editor)/.test(props.href)) props.href = languagePath(props.href, 'zh');
  if (editable && typeof original.children === 'string' && normalizeCopy(original.children) && !isProtectedCopy(original.children) && !['option', 'textarea'].includes(type)) props['data-copy-id'] = copyId(normalizeCopy(original.children));
  return props;
}
