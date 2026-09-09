import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { navigation } from '../src/data/navigation';
import { site } from '../src/data/site';

const approvedBio = [
  'I’m a Master’s student in Artificial Intelligence & Data Science with a background in Statistics & Data Science. My current focus is data engineering, with hands-on work across data pipelines, streaming systems, and analytical architectures.',
  'Outside of engineering, I enjoy classical music. My dream is to travel the world and experience different cultures firsthand.',
];

test('three-column hero includes the exact bio, identity, index, contacts and timeline in one desktop viewport', async ({ page }) => {
  for (const viewport of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.personal-bio > p')).toHaveText(approvedBio);
    for (const selector of ['.personal-bio', '.personal-identity', '.home-index', '.career-timeline']) {
      const target = page.locator(selector);
      await expect(target).toHaveCSS('opacity', '1');
      await expect(target).toHaveCSS('transform', 'none');
      const box = (await target.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(96);
      expect(box.y + box.height, `${selector} fits at ${viewport.width}`).toBeLessThanOrEqual(viewport.height);
    }
    const left = (await page.locator('.personal-bio').boundingBox())!;
    const middle = (await page.locator('.personal-identity').boundingBox())!;
    const right = (await page.locator('.home-index').boundingBox())!;
    expect(left.x + left.width).toBeLessThan(middle.x);
    expect(middle.x + middle.width).toBeLessThan(right.x);
    expect((await page.locator('.personal-hero').boundingBox())!.height).toBeCloseTo(viewport.height, 0);
    await expect(page.locator('.menu-toggle')).toBeHidden();
    await expect(page.locator('.personal-status')).toHaveText('Master’s student');
    await expect(page.locator('.personal-title')).toHaveText('Artificial Intelligence & Data Science');
    await expect(page.locator('.personal-academic')).toHaveText(site.institution);
    await expect(page.locator('.career-current')).toContainText('Master’s');
    await expect(page.locator('.career-direction')).toContainText('Next direction');
    await expect(page.locator('.home-index-list a')).toHaveCount(4);
    await expect(page.locator('.home-index-list a[href="/"]')).toHaveCount(0);
    await expect(page.locator('.home-index-socials a').nth(0)).toHaveAttribute('href', site.github);
    await expect(page.locator('.home-index-socials a').nth(1)).toHaveAttribute('href', site.linkedin);
    await expect(page.locator('.home-index-socials a').nth(2)).toHaveAttribute('href', `mailto:${site.email}`);
    expect(await page.locator('.personal-bio .portrait').evaluate(node => getComputedStyle(node, '::before').content)).toBe('none');
    expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `.test-artifacts/home-index-${viewport.width}x${viewport.height}.png` });
  }
});

test('open index routes use Astro transitions and internal pages retain the menu', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await page.evaluate(() => Reflect.set(window, 'indexNavigationProbe', true));
  for (const item of navigation.filter(item => item.href !== '/')) {
    await page.locator(`.home-index-list a[href="${item.href}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${item.href}$`));
    await expect(page.locator('main h1')).toBeFocused();
    await expect(page.locator('.menu-toggle')).toBeVisible();
    expect(await page.evaluate(() => Reflect.get(window, 'indexNavigationProbe'))).toBe(true);
    await page.goBack();
    await expect(page.locator('html')).not.toHaveClass(/route-restoring/);
    await expect(page.locator('.home-index')).toBeVisible();
  }
});

test('tablet adapts to two columns; mobile stacks identity, bio, index and timeline', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1024 });
  await page.goto('/');
  expect(await page.locator('.hero-profile-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
  await expect(page.locator('.menu-toggle')).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveCSS('scroll-snap-type', 'none');
  const order = ['.personal-identity', '.personal-bio', '.home-index', '.career-timeline'];
  let previousBottom = 0;
  for (const selector of order) {
    const target = page.locator(selector);
    await target.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(target).toHaveCSS('opacity', '1');
    await expect(target).toHaveCSS('transform', 'none');
    const box = await target.evaluate(node => ({ y: node.getBoundingClientRect().y + scrollY, height: node.getBoundingClientRect().height }));
    expect(box.y).toBeGreaterThanOrEqual(previousBottom);
    previousBottom = box.y + box.height;
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: '.test-artifacts/home-index-mobile-375x812.png' });
  await page.locator('.personal-hero').screenshot({ path: '.test-artifacts/home-index-mobile-complete.png' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('.menu-toggle').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});
