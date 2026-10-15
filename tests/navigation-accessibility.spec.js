import { test, expect } from '@playwright/test';
import { jpeg, png, webp } from './fixtures/contact-images.mjs';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const request = route.request();
    if (request.method() !== 'GET' || !request.url().startsWith('http://127.0.0.1:4194/')) return route.abort();
    return route.continue();
  });
});

async function expectFocusLoop(page, navigation) {
  const controls = navigation.locator('a[href], button:not([disabled])');
  const visible = [];
  for (const control of await controls.all()) if (await control.isVisible()) visible.push(control);
  await visible[0].focus();
  await page.keyboard.press('Shift+Tab');
  await expect(visible.at(-1)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(visible[0]).toBeFocused();
  for (let i = 1; i < visible.length; i++) {
    await page.keyboard.press('Tab');
    await expect(visible[i]).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(visible[0]).toBeFocused();
}

for (const viewport of [{ width: 390, height: 844 }, { width: 1100, height: 1000 }]) {
  test(`drawer contains keyboard focus and restores it at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Open main menu', includeHidden: true });
    const navigation = page.getByRole('navigation', { name: 'Primary navigation' });
    const close = navigation.getByRole('button', { name: 'Close main menu' });
    await trigger.click();
    await expect(close).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    await expectFocusLoop(page, navigation);
    await page.locator('main a').first().evaluate((element) => element.focus());
    await expect(close).toBeFocused();
    await navigation.getByRole('button', { name: 'Services' }).click();
    await expect(navigation.getByRole('link', { name: /Services overview/ })).toBeVisible();
    await expectFocusLoop(page, navigation);
    await page.keyboard.press('Escape');
    await expect(navigation.getByRole('button', { name: 'Services' })).toBeFocused();
    await expect(navigation.getByRole('link', { name: /Services overview/ })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await page.screenshot({ path: testInfo.outputPath('drawer-open.png') });
    await close.click();
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    await trigger.click();
    await page.locator('.navBackdrop').click({ position: { x: 4, y: 400 } });
    await expect(trigger).toBeFocused();
    await trigger.click();
    await navigation.getByRole('button', { name: 'Services' }).click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation.getByRole('button', { name: 'Services' })).toBeFocused();
    await expect(navigation.getByRole('button', { name: 'Services' })).toHaveAttribute('aria-expanded', 'false');
    await page.setViewportSize(viewport);
    await expect(navigation).toBeHidden();
    await trigger.click();
    await expect(close).toBeFocused();
    await expectFocusLoop(page, navigation);
    await close.click();
    await expect(trigger).toBeFocused();
    await page.locator('main a').first().focus();
    await expect(page.locator('main a').first()).toBeFocused();
  });
}

async function colorsAndGeometry(control) {
  return control.evaluate((element) => {
    const style = getComputedStyle(element);
    const luminance = (color) => {
      const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((n) => n / 255).map((n) => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const a = luminance(style.color), b = luminance(style.backgroundColor);
    const box = element.getBoundingClientRect();
    return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), width: box.width, height: box.height, outline: style.outlineStyle, outlineWidth: parseFloat(style.outlineWidth), outlineOffset: parseFloat(style.outlineOffset), borderRadius: style.borderRadius };
  });
}

test('ordinary solid actions retain 4.5:1 contrast and geometry in every enabled state', async ({ page }, testInfo) => {
  for (const path of ['/', '/contact', '/services/tile-roof-repairs']) {
    await page.goto(path);
    for (const control of await page.locator('.button:not(:disabled), .contactTop').all()) {
      await control.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await control.evaluate((element) => element.blur());
      const idle = await colorsAndGeometry(control);
      expect(idle.ratio, `${path} default`).toBeGreaterThanOrEqual(4.5);
      await control.hover();
      const hover = await colorsAndGeometry(control);
      expect(hover.ratio, `${path} hover`).toBeGreaterThanOrEqual(4.5);
      await page.mouse.move(0, 0);
      await control.focus();
      const focus = await colorsAndGeometry(control);
      expect(focus.ratio, `${path} focus`).toBeGreaterThanOrEqual(4.5);
      expect(focus.outline).not.toBe('none');
      expect(focus.outlineWidth).toBeGreaterThanOrEqual(3);
      expect(focus.outlineOffset).toBeGreaterThanOrEqual(3);
      expect(focus.width).toBeCloseTo(idle.width, 2);
      expect(focus.height).toBeCloseTo(idle.height, 2);
      await control.hover();
      await page.mouse.down();
      const active = await colorsAndGeometry(control);
      expect(active.ratio, `${path} active`).toBeGreaterThanOrEqual(4.5);
      expect(active.width).toBeCloseTo(idle.width, 2);
      expect(active.height).toBeCloseTo(idle.height, 2);
      await page.mouse.move(0, 0);
      await page.mouse.up();
    }
  }
  await page.screenshot({ path: testInfo.outputPath('service-actions.png'), fullPage: true });
});

test('real image suffix variants reach only the intercepted local contact endpoint', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let submissions = 0;
  await page.route('**/api/contact', async (route) => {
    expect(route.request().url()).toBe('http://127.0.0.1:4194/api/contact');
    expect(route.request().method()).toBe('POST');
    submissions++;
    await route.fulfill({ status: submissions === 1 ? 503 : 200, contentType: 'application/json', body: submissions === 1 ? JSON.stringify({ ok: false, code: 'SEND_FAILED' }) : JSON.stringify({ ok: true, code: 'ENQUIRY_SENT', message: 'Enquiry sent successfully.', requestId: '11111111-1111-4111-8111-111111111111' }) });
  });
  await page.goto('/contact');
  await page.getByLabel('Name', { exact: true }).fill('Test Example');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('Phone', { exact: true }).fill('0400 000 000');
  await page.getByLabel('Suburb / area').selectOption('Belconnen — Belconnen');
  await page.getByLabel('Service interest').selectOption('Roof Leak Repairs');
  await page.getByLabel('Message', { exact: true }).fill('Local browser test only.');
  await page.getByLabel(/I agree that Ellis Services Group/).check();
  for (const [buffer, mimeType, name] of [[jpeg, 'image/jpeg', 'roof.JPG'], [jpeg, 'image/jpeg', 'roof.JpEg'], [png, 'image/png', 'roof.PNG'], [webp, 'image/webp', 'roof.WeBp']]) {
    if (submissions > 1) {
      await page.getByLabel('Name', { exact: true }).fill('Test Example');
      await page.getByLabel('Email', { exact: true }).fill('test@example.com');
      await page.getByLabel('Phone', { exact: true }).fill('0400 000 000');
      await page.getByLabel('Suburb / area').selectOption('Belconnen — Belconnen');
      await page.getByLabel('Service interest').selectOption('Roof Leak Repairs');
      await page.getByLabel('Message', { exact: true }).fill('Local browser test only.');
      await page.getByLabel(/I agree that Ellis Services Group/).check();
    }
    await page.getByLabel('Optional photo', { exact: true }).setInputFiles({ name, mimeType, buffer });
    const expectedSubmissions = submissions + 1;
    await page.getByRole('button', { name: 'Request a roof assessment' }).click();
    await expect.poll(() => submissions).toBe(expectedSubmissions);
    if (submissions === 1) {
      await expect(page.getByRole('status').last()).toContainText(/couldn't send/);
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Test Example');
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    } else await expect(page.getByText('Enquiry sent successfully.')).toBeVisible();
  }
  expect(submissions).toBe(4);
  await page.screenshot({ path: testInfo.outputPath('contact-success.png'), fullPage: true });
});
