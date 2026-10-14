import { ARTICLE_IMAGES } from './article-images';
import { NEWS_ARTICLES } from './news-articles';
// Revision dates change only for guides materially edited on that date.
export const REVISED_GUIDES = new Set(NEWS_ARTICLES.map(article => article.slug));
export function articleModifiedDate(slug: string, existing?: string) {
  return NEWS_ARTICLES.find(article => article.slug === slug)?.updated ?? existing ?? '2026-10-12';
}
export function articleVisibleDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(isoDate + 'T00:00:00Z'));
}
export const ARTICLE_AUTHOR = { name: 'Ellis Services Group', url: '/about', type: 'Organization' } as const;
export function getArticleEditorial(slug: string) {
  if (!ARTICLE_IMAGES[slug]) return null;
  return { author: ARTICLE_AUTHOR, dateModified: articleModifiedDate(slug), image: ARTICLE_IMAGES[slug] };
}
