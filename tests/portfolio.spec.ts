import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects, projectUrl } from '../src/data/projects';
import { navigation } from '../src/data/navigation';

const routes = [...navigation.map(item => item.href), ...projects.map(projectUrl), '/404.html'];

async function revealSections(page: Page) {
  // Keep the selector stable when the observer removes the pending class.
  for (const section of await page.locator('.section-reveal').all()) {
    await section.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(section).toHaveCSS('opacity', '1');
    await expect(section).toHaveCSS('transform', 'none');
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}

test('all pages, internal destinations, assets, and accessible structure', async ({ page, request }) => {
  const destinations = new Set<string>();
  const assetFailures: string[] = [];
  const runtimeErrors: string[] = [];
  page.on('response', response => { if (response.status() >= 400 && response.url().includes('/_astro/')) assetFailures.push(response.url()); });
  page.on('pageerror', error => runtimeErrors.push(error.message));
  for (const route of routes) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Youssef Khaloufi/);
    await revealSections(page);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations, `Accessibility on ${route}`).toEqual([]);
    const links = await page.locator('a[href]').evaluateAll(anchors => anchors.map(anchor => (anchor as HTMLAnchorElement).href));
    for (const link of links) if (new URL(link).origin === 'http://127.0.0.1:4322') destinations.add(link);
    const images = await page.locator('img').evaluateAll(nodes => nodes.every(node => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0));
    expect(images).toBe(true);
  }
  for (const destination of destinations) {
    const url = new URL(destination);
    const response = await request.get(url.pathname);
    expect(response.ok(), destination).toBe(true);
    if (url.hash) {
      const html = await response.text();
      expect(html, destination).toContain(`id="${decodeURIComponent(url.hash.slice(1))}"`);
    }
  }
  for (const asset of ['/favicon.svg', '/images/social-card.png', '/robots.txt', '/sitemap.xml']) expect((await request.get(asset)).ok(), asset).toBe(true);
  expect(assetFailures).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test('mobile to large desktop: no overflow and readable navigation', async ({ page }) => {
  for (const width of [320, 375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      expect(fits, `${route} at ${width}px`).toBe(true);
      if (route === '/' && width > 1100) await expect(page.getByRole('navigation', { name: 'Index', exact: true })).toBeVisible();
      else await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible();
    }
    if (width === 375 || width === 1440) {
      await page.goto('/');
      await page.screenshot({ path: `.test-artifacts/home-${width}.png`, fullPage: true });
      await page.goto(projectUrl(projects[0]));
      await page.screenshot({ path: `.test-artifacts/mobility-${width}.png`, fullPage: true });
    }
  }
});

test('keyboard skip link, reduced motion, and project navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.getByRole('link', { name: 'View my work', exact: true }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await page.getByRole('link', { name: 'Read case study: Mobility Control Tower' }).click();
  await expect(page.locator('h1')).toContainText('Mobility Control Tower');
});

test('content remains accessible with JavaScript disabled', async ({ browser }) => {
  test.setTimeout(30_000);
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeHidden();
  await page.getByRole('link', { name: 'Explore ↓' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#site-navigation$/);
  await page.getByRole('navigation', { name: 'Footer navigation' }).getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await page.getByRole('link', { name: 'Read case study: Mobility Control Tower' }).click();
  await expect(page.locator('h1')).toContainText('Mobility Control Tower');
  await expect(page.getByText('Current scope', { exact: true }).last()).toBeVisible();
  await context.close();
});

test('menu traps focus, locks scroll, closes with Escape and restores focus and position', async ({ page }) => {
  await page.goto('/work/');
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  const trigger = page.getByRole('button', { name: 'Menu', exact: true });
  // Focus without scrolling: exercise an opening from a nonzero document position.
  await trigger.evaluate(button => (button as HTMLButtonElement).focus({ preventScroll: true }));
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  const close = dialog.getByRole('button', { name: 'Close', exact: true });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(close).toBeFocused();
  expect(await page.locator('body').evaluate(body => getComputedStyle(body).position)).toBe('fixed');
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link', { name: 'Email', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => scrollY)).toBe(500);
  expect(await page.locator('body').evaluate(body => getComputedStyle(body).position)).not.toBe('fixed');
});

test('menu close controls, outside click, and reduced-motion entry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/work/');
  const trigger = page.getByRole('button', { name: 'Menu', exact: true });
  const dialog = page.getByRole('dialog');
  await trigger.click();
  expect(await dialog.locator('.menu-link').first().evaluate(link => getComputedStyle(link).animationName)).toBe('none');
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(3, 220);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('active areas, menu links, page history, and research return path', async ({ page }) => {
  for (const item of navigation.filter(item => item.href !== '/')) {
    await page.goto(item.href);
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.locator('.menu-link[aria-current="page"]')).toHaveAttribute('href', item.href);
    await page.getByRole('dialog').getByRole('link', { name: /02 Work/ }).click();
    await expect(page).toHaveURL(/\/work\/$/);
    await expect(page.getByRole('dialog')).toBeHidden();
  }
  await page.goto('/projects/bayesian-networks-pfe/');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.locator('.menu-link[aria-current="location"]')).toHaveAttribute('href', '/research/');
  await page.getByRole('dialog').getByRole('link', { name: /03 Research/ }).click();
  await expect(page.locator('h1')).toContainText('Understand the method');
  await page.goBack();
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await page.locator('html').evaluate(element => element.classList.contains('menu-open'))).toBe(false);
  await page.locator('.back-link').click();
  await expect(page).toHaveURL(/\/research\/$/);
});

test('menu accessibility and touch layout across desktop, tablet and short mobile', async ({ page }) => {
  for (const viewport of [{width:1440,height:900},{width:768,height:1024},{width:375,height:812},{width:320,height:480},{width:812,height:375}]) {
    await page.setViewportSize(viewport);
    await page.goto('/work/');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations, `Menu at ${viewport.width}×${viewport.height}`).toEqual([]);
    expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    for (const link of await dialog.locator('a').all()) {
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeInViewport();
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await dialog.evaluate(node => node.scrollTop = 0);
    await page.screenshot({ path: `.test-artifacts/v2-menu-${viewport.width}x${viewport.height}.png` });
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  }
});

test('curated homepage and major-page visual review captures', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main .project-card')).toHaveCount(3);
  await expect(page.locator('main .research-preview-card')).toHaveCount(2);
  await expect(page.locator('main .education-list, main .skills-grid, main .languages')).toHaveCount(0);
  await expect(page.locator('main img')).toHaveCount(1);
  const majorRoutes = [...navigation.map(item => item.href), projectUrl(projects[0]), projectUrl(projects[1])];
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({width,height:900});
    for (const route of majorRoutes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const filename = route === '/' ? 'home' : route.split('/').filter(Boolean).at(-1);
      // Let offscreen content reveal through real scrolling before full-page captures.
      await revealSections(page);
      await page.screenshot({path:`.test-artifacts/v2-${filename}-${width}.png`,fullPage:true});
      if (route === '/' && width === 1440) expect(await page.locator('body').evaluate(body => body.scrollHeight)).toBeLessThan(3700);
    }
  }
  await page.goto('/about/');
  await expect(page.getByRole('img', {name:'Youssef Khaloufi',exact:true})).toBeVisible();
});
