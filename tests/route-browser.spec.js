import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.setTimeout(60000);

const routes = JSON.parse(await readFile(new URL('./fixtures/seo-routes.json', import.meta.url), 'utf8'));
const domain = 'https://www.canberraroofkind.com.au';
const query = '?service=Rebedding%20%26%20Repointing&area=Belconnen%20%E2%80%94%20Belconnen&utm_source=fix&tag=one&tag=two';
const normal = text => text.replace(/\s+/g, ' ').trim();

async function settled(page) {
  // Exercise a React event, then read the hydrated DOM, rather than racing SSR HTML.
  const mobile = page.getByRole('button', { name: 'Open main menu', exact: true });
  if (await mobile.isVisible()) await mobile.click();
  const services = page.getByRole('button', { name: 'Services', exact: true });
  await services.click();
  await expect(page.locator('#services-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  if (await mobile.isVisible()) await page.keyboard.press('Escape');
}

async function checkPage(page, route) {
  await settled(page);
  await expect(page.locator('main h1')).toHaveText(route.h1);
  expect(normal(await page.locator('main').textContent())).toBe(route.mainText);
  await expect(page).toHaveTitle(route.title);
  await expect(page.locator('head title')).toHaveCount(1);
  await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
  await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', route.description);
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', domain + route.pathname);
  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('#news-article-schema')).toHaveCount(route.pathname.startsWith('/news/') ? 1 : 0);
  if (route.pathname === '/contact') {
    await expect(page.locator('select[name="service"]')).toHaveValue('Rebedding & Repointing');
    await expect(page.locator('select[name="area"]')).toHaveValue('Belconnen — Belconnen');
  }
}

for (const [device, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
  test.describe(device, () => {
    test.use({ viewport, isMobile: device === 'mobile', hasTouch: device === 'mobile' });
    let errors;
    let context;
    let page;
    // These GET-only route walks need fresh documents, not a new Edge context
    // per URL. Reuse one device context to avoid Windows context-startup stalls.
    test.beforeAll(async ({ browser }) => {
      context = await browser.newContext({ viewport, isMobile: device === 'mobile', hasTouch: device === 'mobile' });
      page = await context.newPage();
      errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', msg => { if (msg.type() === 'error' && /react|hydrat|#418|didn't match/i.test(msg.text())) errors.push(msg.text()); });
      await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' && route.request().method() === 'GET' ? route.continue() : route.abort());
    });
    test.beforeEach(() => { errors = []; });
    test.afterEach(async () => {
      await page.unrouteAll({ behavior: 'wait' });
      expect(errors).toEqual([]);
    });
    test.afterAll(async () => { await context?.close(); });

    for (const route of routes) {
      const aliases = route.pathname === '/' ? ['/index.html', '/index.html/'] : [`${route.pathname}.html`, `${route.pathname}/`, `${route.pathname}.html/`];
      test(`canonical and one-hop aliases ${route.pathname}`, async () => {
        for (const source of [route.pathname, ...aliases]) {
          const response = await page.goto(source + query);
          expect(response.status()).toBe(200);
          const previous = response.request().redirectedFrom();
          if (source === route.pathname) expect(previous).toBeNull();
          else {
            expect(previous).not.toBeNull();
            expect((await previous.response()).status()).toBe(308);
            expect(previous.redirectedFrom()).toBeNull();
          }
          expect(new URL(page.url()).pathname).toBe(route.pathname);
          expect(new URL(page.url()).search).toBe(query);
          await checkPage(page, route);
        }
      });

      test(`static alias fallback hydrates ${route.pathname}`, async () => {
        // Emulate an ordinary static server exposing the already-rendered file at
        // an alias, with no redirect; load the actual production client bundle.
        const filename = route.pathname === '/' ? 'index.html' : `${route.pathname.slice(1)}.html`;
        const html = await readFile(new URL(`../dist/${filename}`, import.meta.url), 'utf8');
        await page.route('**/*', request => request.request().isNavigationRequest() ? request.fulfill({ status: 200, contentType: 'text/html', body: html }) : request.fallback());
        for (const alias of aliases) {
          expect((await page.goto(alias + query)).status()).toBe(200);
          expect(new URL(page.url()).pathname).toBe(alias);
          expect(new URL(page.url()).search).toBe(query);
          await checkPage(page, route);
        }
      });
    }

    test('unknown variants remain 404 after hydration', async () => {
      for (const pathname of ['/missing', '/missing/', '/missing.html', '/missing.html/', '/services/missing/', '/news/missing.html', '/about//', '/wrong/about.html', '/index', '/insights.html']) {
        const response = await page.goto(pathname + query);
        expect(response.status()).toBe(404);
        expect(response.request().redirectedFrom()).toBeNull();
        await settled(page);
        await expect(page.locator('main h1')).toHaveText('Page not found');
        await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
        await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
      }
    });
  });
}
