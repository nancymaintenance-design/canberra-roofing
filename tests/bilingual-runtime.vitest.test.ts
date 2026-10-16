import { describe, expect, it, afterEach } from 'vitest';
import { configureLocale, localizeProps, translate, copyId, setEditorialContent, languagePath } from '../src/i18n/runtime';
afterEach(() => { setEditorialContent({ revision: 0, entries: {}, articles: [] }); configureLocale('/'); });
describe('bilingual display boundary', () => {
  it('translates text without changing form values or contact targets', () => {
    setEditorialContent({ revision: 1, entries: { [copyId('Name')]: { source: 'Name', zh: '姓名', en: 'Name' } }, articles: [] });
    configureLocale('/zh/contact');
    expect(translate(' Name ')).toBe(' 姓名 ');
    expect(localizeProps('option', { children: 'Name' })).toEqual({ children: '姓名', value: 'Name' });
    expect(localizeProps('a', { href: 'tel:0405878406', children: '0405878406' }).href).toBe('tel:0405878406');
    expect(localizeProps('a', { href: 'mailto:elliservices.group@gmail.com' }).href).toBe('mailto:elliservices.group@gmail.com');
    expect(localizeProps('input', { name: 'name', value: 'Name' }).value).toBe('Name');
  });
  it('retains root, fragment, queries and assets in language links', () => {
    configureLocale('/zh/news');
    expect(languagePath('/news?x=1#section', 'zh')).toBe('/zh/news?x=1#section');
    expect(localizeProps('a', { href: '/assets/photo.webp' }).href).toBe('/assets/photo.webp');
    expect(localizeProps('a', { href: '#section' }).href).toBe('#section');
    expect(languagePath('/zh/', 'en')).toBe('/');
  });
  it('keeps English published copy when only Chinese was edited', () => {
    setEditorialContent({ revision: 1, entries: { [copyId('Name')]: { source: 'Name', zh: '您的姓名' } }, articles: [] });
    configureLocale('/contact'); expect(translate('Name')).toBe('Name');
  });
});
