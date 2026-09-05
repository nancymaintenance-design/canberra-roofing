import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const routes = JSON.parse(await readFile(new URL('./fixtures/seo-routes.json', import.meta.url), 'utf8'));
const normal = (text) => text.replace(/\s+/g, ' ').trim();
const domain = 'https://www.canberraroofkind.com.au';

test.beforeEach(async ({ context }) => {
  // Keep analytics and other external traffic out of deterministic local tests.
  await context.route('**/*', (route) => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
});

for (const route of routes) {
  test(`hydrate preserves raw body and head: ${route.pathname}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route.pathname);
    await expect(page.locator('main h1')).toHaveText(route.h1);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('head title')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', route.description);
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', domain + route.pathname);
    expect(normal(await page.locator('main').textContent())).toBe(route.mainText);
    expect(await page.locator('main h1').count()).toBe(1);
    expect(errors).toEqual([]);
  });
}

test('no-JS pages retain complete content and real links, including mobile navigation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto('http://127.0.0.1:4175' + route.pathname);
    await expect(page.locator('main h1')).toHaveText(route.h1);
    expect(normal(await page.locator('main').textContent())).toBe(route.mainText);
  }
  await page.goto('http://127.0.0.1:4175/contact');
  await expect(page.getByRole('button', { name: 'Send enquiry', exact: true })).toBeDisabled();
  await expect(page.locator('.noScriptNotice')).toContainText('The online enquiry form requires JavaScript.');
  await expect(page.locator('.noScriptNotice a[href="tel:0405878406"]')).toBeVisible();
  await page.locator('input[name="name"]').fill('Synthetic QA');
  await page.locator('input[name="name"]').press('Enter');
  await expect(page).toHaveURL('http://127.0.0.1:4175/contact');
  await page.goto('http://127.0.0.1:4175/');
  await page.locator('noscript a[href="/services"]').click();
  await expect(page).toHaveURL(/\/services$/);
  await page.locator('main a[href="/services/roof-leak-repairs"]').first().click();
  await expect(page.locator('main h1')).toHaveText('Roof Leak Repairs');
  await expect(page.locator('a[href="tel:0405878406"]').first()).toBeVisible();
  await context.close();
});

test('Contact parameters stay selected through hydration and refresh while canonical stays clean', async ({ page }) => {
  for (const [query, area, service] of [
    ['?service=Roof%20Leak%20Repairs', '', 'Roof Leak Repairs'],
    ['?area=Belconnen%20%E2%80%94%20Belconnen', 'Belconnen — Belconnen', ''],
    ['?area=Belconnen%20%E2%80%94%20Belconnen&service=Rebedding%20%26%20Repointing&utm_source=seo#form', 'Belconnen — Belconnen', 'Rebedding & Repointing'],
  ]) {
    await page.goto('/contact' + query);
    await expect(page.locator('select[name="area"]')).toHaveValue(area);
    await expect(page.locator('select[name="service"]')).toHaveValue(service);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', domain + '/contact');
    expect(new URL(page.url()).search).not.toBe('');
    await page.reload();
    await expect(page.locator('select[name="area"]')).toHaveValue(area);
    await expect(page.locator('select[name="service"]')).toHaveValue(service);
  }
});

test('area and service links, browser back/forward, and article exit keep the correct head', async ({ page }) => {
  await page.goto('/areas');
  await page.locator('main a').filter({ hasText: /^Belconnen$/ }).click();
  await expect(page.locator('select[name="area"]')).toHaveValue('Belconnen — Belconnen');
  await page.goto('/news/after-rain-roof-leak-check-canberra');
  await expect(page.locator('#news-article-schema')).toHaveCount(1);
  await page.locator('main a[href="/services/roof-leak-repairs"]').click();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', domain + '/services/roof-leak-repairs');
  await expect(page.locator('#news-article-schema')).toHaveCount(0);
  await page.goBack();
  await expect(page.locator('#news-article-schema')).toHaveCount(1);
  await page.goForward();
  await expect(page.locator('#news-article-schema')).toHaveCount(0);
  await page.locator('main a[href^="/contact?service="]').click();
  await expect(page.locator('select[name="service"]')).toHaveValue('Roof Leak Repairs');
});

test('unknown page remains a real 404 after JavaScript loads', async ({ page }) => {
  for (const pathname of ['/not-published', '/services/not-published', '/news/not-published']) {
    expect((await page.goto(pathname)).status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('Page not found');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  }
});

test('mobile pages, menu, FAQ and photos retain their interactions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of routes) {
    await page.goto(route.pathname);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const image of await page.locator('img').all()) await expect.poll(() => image.evaluate((n) => n.complete && n.naturalWidth > 0)).toBe(true);
  }
  await page.goto('/faq');
  await page.getByRole('button', { name: 'Open main menu', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await page.getByRole('button', { name: 'Services', exact: true }).click();
  await expect(page.locator('#services-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#services-menu')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open main menu', exact: true })).toBeFocused();
  await page.locator('main details summary').first().click();
  await expect(page.locator('main details').first()).toHaveAttribute('open', '');
});

test('Contact validation, optional photo, consent, controlled success and error retain the payload contract', async ({ page }) => {
  let submissions = 0;
  let fail = false;
  await page.route('**/api/contact', async (route) => {
    submissions++;
    const request = route.request();
    expect(request.method()).toBe('POST');
    expect(request.headers()['content-type']).toContain('multipart/form-data');
    expect(request.postDataBuffer().toString()).toContain('name="privacy"');
    await route.fulfill({ status: fail ? 503 : 200, contentType: 'application/json', body: JSON.stringify(fail ? { ok: false, code: 'DELIVERY_UNAVAILABLE', message: "We couldn't send your enquiry. Please try again or call 0405878406.", requestId: '550e8400-e29b-41d4-a716-446655440000' } : { ok: true, code: 'ENQUIRY_SENT', message: 'Enquiry sent successfully.', requestId: '550e8400-e29b-41d4-a716-446655440000' }) });
  });
  await page.goto('/contact?service=Roof%20Leak%20Repairs&area=Belconnen%20%E2%80%94%20Belconnen');
  await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await expect(page.locator('input[name="name"]')).toBeFocused();
  expect(submissions).toBe(0);
  await page.locator('input[type="file"]').setInputFiles({ name: 'roof.png', mimeType: 'image/png', buffer: Buffer.from('synthetic fixture') });
  await expect(page.getByText('roof.png', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove photo' }).click();
  await expect(page.getByText('No photo selected')).toBeVisible();
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.locator('input[name="name"]').fill('Synthetic QA');
    await page.locator('input[name="email"]').fill('qa@example.test');
    await page.locator('input[name="phone"]').fill('0400000000');
    await page.locator('select[name="area"]').selectOption('Belconnen — Belconnen');
    await page.locator('select[name="service"]').selectOption('Roof Leak Repairs');
    await page.locator('textarea[name="message"]').fill('Synthetic local test, never delivered.');
    await page.locator('input[name="privacy"]').check();
    await page.getByRole('button', { name: 'Send enquiry', exact: true }).click();
    await expect(page.locator('.contactStatus')).toHaveText(fail ? "We couldn't send your enquiry. Please try again or call 0405878406." : 'Enquiry sent successfully.');
    if (fail) await expect(page.locator('input[name="name"]')).toHaveValue('Synthetic QA');
    else await expect(page.locator('input[name="name"]')).toHaveValue('');
    fail = true;
  }
  expect(submissions).toBe(2);
});
