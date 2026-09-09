import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { currentArea } from '../src/data/navigation';

async function openMenu(page: Page) {
  await expect(page.getByRole('dialog')).toBeHidden();
  const trigger = page.getByRole('button', { name: 'Menu', exact: true });
  await trigger.evaluate(node => (node as HTMLElement).focus({ preventScroll: true }));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.menu-shell')).toHaveCSS('opacity', '1');
}
async function menuTo(page: Page, destination: string) {
  if (await page.locator('.menu-toggle').isVisible()) {
    await openMenu(page);
    await page.locator(`.menu-link[href="${destination}"]`).click();
  } else {
    // The desktop Home index is part of the page, so it needs no modal.
    const link = page.locator(`.home-index-list a[href="${destination}"]`);
    await link.evaluate(node => (node as HTMLElement).focus({ preventScroll: true }));
    await page.keyboard.press('Enter');
  }
  await expect(page).toHaveURL(new RegExp(`${destination}$`));
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('html')).not.toHaveClass(/route-restoring/);
  await expect(page.locator('main h1')).toBeFocused();
}

test('compact desktop menu: keyboard, Escape, close, outside click, active area and accessibility', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/work/');
  await openMenu(page);
  await expect(page.locator('.menu-link[aria-current="page"]')).toHaveAttribute('href', '/work/');
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('dialog').getByRole('link', { name: 'Email', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await page.getByRole('dialog').evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await page.getByRole('button', { name: 'Close', exact: true }).focus();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: '.test-artifacts/navigation-desktop-menu.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('.menu-toggle')).toBeFocused();
  await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  await openMenu(page);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await openMenu(page);
  await page.mouse.click(3, 200);
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('menu handoff uses View Transitions; route and history navigation preserve scroll and focus', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/research/');
  await page.evaluate(() => {
    Reflect.set(window, 'navigationProbe', 'same-document');
    const native = document.startViewTransition.bind(document);
    document.startViewTransition = callback => {
      const menu = document.querySelector<HTMLDialogElement>('#site-menu');
      Reflect.set(window, 'menuInSnapshot', menu?.open && menu.classList.contains('is-navigating'));
      return native(callback);
    };
  });
  await menuTo(page, '/work/');
  expect(await page.evaluate(() => Reflect.get(window, 'navigationProbe'))).toBe('same-document');
  expect(await page.evaluate(() => Reflect.get(window, 'menuInSnapshot'))).toBe(true);
  await page.screenshot({ path: '.test-artifacts/navigation-destination-work.png' });
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
  await menuTo(page, '/about/');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(page.locator('html')).not.toHaveClass(/route-restoring/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(600);
  await page.goForward();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.locator('html')).not.toHaveClass(/route-restoring/);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await menuTo(page, '/work/');
  await page.getByRole('link', { name: 'Read case study: Mobility Control Tower' }).click();
  await expect(page).toHaveURL(/\/projects\/mobility-control-tower\/$/);
  await expect(page.locator('main h1')).toBeFocused();
  await openMenu(page);
  await expect(page.locator('.menu-link[aria-current="location"]')).toHaveAttribute('href', '/work/');
  await page.keyboard.press('Escape');
  await menuTo(page, '/research/');
  await menuTo(page, '/about/');
  await menuTo(page, '/background/');
  expect(await page.evaluate(() => Reflect.get(window, 'navigationProbe'))).toBe('same-document');
  expect(errors).toEqual([]);
  for (const path of ['/work','/work/','/projects/new-case-study/']) expect(currentArea(path)?.href).toBe('/work/');
  for (const path of ['/research/experiment/','/projects/bayesian-networks-pfe/','/projects/discrete-ana-tsp/']) expect(currentArea(path)?.href).toBe('/research/');
});

test('Home wheel and anchors survive route changes and history; mobile menu remains reachable', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/work/');
  await menuTo(page, '/');
  await page.mouse.move(1250, 400);
  await page.mouse.wheel(0, 420);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(768);
  await menuTo(page, '/about/');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).not.toHaveClass(/route-restoring/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(768);
  await page.mouse.wheel(0, 420);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(1536);
  await page.locator('.footer-bottom a[href="#top"]').click();
  await expect(page).toHaveURL(/#top$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('html')).toHaveCSS('scroll-snap-type', 'none');
  await openMenu(page);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: '.test-artifacts/navigation-mobile-menu.png' });
  await page.locator('.menu-link[href="/work/"]').click();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(page.locator('html')).not.toHaveClass(/route-restoring/);
  await page.setViewportSize({ width: 320, height: 480 });
  await openMenu(page);
  for (const link of await page.getByRole('dialog').locator('a').all()) {
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeInViewport();
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('reduced motion and no-JavaScript navigation remain usable', async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  await openMenu(page);
  await expect(page.locator('.menu-shell')).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('Escape');
  await expect(page.locator('.menu-toggle')).toBeFocused();
  await menuTo(page, '/work/');
  await expect(page.locator('.reveal-pending')).toHaveCount(0);
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const noScript = await context.newPage();
  await noScript.goto('http://127.0.0.1:4322/');
  await expect(noScript.locator('.menu-toggle')).toBeHidden();
  await noScript.getByRole('link', { name: 'Explore ↓' }).click();
  await noScript.locator('#site-navigation a[href="/work/"]').click();
  await expect(noScript).toHaveURL(/\/work\/$/);
  await context.close();
});

test('Astro fallback synchronizes menu navigation without browser View Transition support', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(document, 'startViewTransition', { value: undefined }));
  await page.goto('/');
  await menuTo(page, '/work/');
  await menuTo(page, '/about/');
  await expect(page.locator('body')).toHaveCSS('opacity', '1');
  await expect(page.locator('html')).not.toHaveAttribute('data-astro-transition-fallback');
});
