// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { renderPage } from '../src/entry-server';

const template = readFileSync('index.html', 'utf8');
const paths = ['/', '/about', '/services', '/areas', '/news', '/faq', '/contact'];

it.each(['/zh/', '/zh/services/roof-inspections', '/zh/contact'])('prerenders Chinese noscript navigation at %s without changing contact routes', pathname => {
  const html = renderPage(pathname, template);
  const fallback = new DOMParser().parseFromString(html.match(/<noscript>([\s\S]*?)<\/noscript>/)![1], 'text/html');
  const nav = fallback.querySelector('nav')!;
  expect([...nav.querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual(['/zh/', '/zh/about', '/zh/services', '/zh/areas', '/zh/news', '/zh/faq', '/zh/contact']);
  expect(nav.getAttribute('aria-label')).toBe('无需 JavaScript 的导航');
  expect(nav.textContent).not.toMatch(/Home|About|Services|Contact/);
  expect(fallback.querySelector('p')?.textContent).toContain('在线咨询表单需要 JavaScript');
  expect(fallback.querySelector('a[href^="tel:"]')?.getAttribute('href')).toBe('tel:0405878406');
  expect(fallback.querySelector('a[href^="tel:"]')?.textContent).toContain('0405878406');
  expect(html).toContain('"email":"elliservices.group@gmail.com"');
  expect(html).toContain('"telephone":"+61405878406"');
});

it.each(['/', '/contact'])('retains the English production fallback at %s', pathname => {
  const original = template.match(/<noscript>[\s\S]*?<\/noscript>/)![0];
  const html = renderPage(pathname, template);
  expect(html.match(/<noscript>[\s\S]*?<\/noscript>/)![0]).toBe(original);
  const fallback = new DOMParser().parseFromString(original.replace(/<\/?noscript>/g, ''), 'text/html');
  expect([...fallback.querySelectorAll('nav a')].map(link => link.getAttribute('href'))).toEqual(paths);
});

it('keeps existing custom prerender templates without a noscript fallback compatible', () => {
  const custom = template.replace(/<noscript>[\s\S]*?<\/noscript>/, '');
  expect(renderPage('/zh/about', custom)).not.toContain('<noscript>');
});
