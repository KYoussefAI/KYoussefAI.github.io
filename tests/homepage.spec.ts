import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

test('source is valid UTF-8 without corrupted punctuation', () => {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const inspect = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) inspect(path);
      else {
        const source = decoder.decode(readFileSync(path));
        expect(source, path).not.toMatch(/\uFFFD|\u00C2|\u00C3|\u00E2[\u0080-\u00BF\u20AC]|\u00F0\u0178/);
      }
    }
  };
  inspect('src');
});

test('personal hero, work composition and About fit the requested laptop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('h1')).toHaveText('Youssef Khaloufi');
  await expect(page.locator('.personal-identity')).toHaveCSS('opacity', '1');
  await expect(page.locator('.career-timeline')).toHaveCSS('opacity', '1');
  await expect(page.locator('.layer-visual, .home-introduction')).toHaveCount(0);
  expect(await page.locator('main').innerText()).not.toContain('Progress through practice');
  await expect(page.locator('.career-timeline li')).toHaveCount(3);
  await expect(page.locator('.personal-status')).toHaveText('Master’s student');
  await expect(page.locator('.personal-title')).toHaveText('Artificial Intelligence & Data Science');
  await expect(page.locator('.career-timeline [aria-current="step"]')).toContainText('Master’s');
  await expect(page.locator('.career-direction')).toContainText('Next direction');
  expect(await page.locator('h1').evaluate(node => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThan(
    2 * await page.locator('.personal-title').evaluate(node => parseFloat(getComputedStyle(node).fontSize)));
  expect((await page.locator('.career-timeline').boundingBox())!.y + (await page.locator('.career-timeline').boundingBox())!.height).toBeLessThanOrEqual(768);
  await expect(page.locator('.personal-bio')).toHaveCSS('opacity', '1');
  const bio = (await page.locator('.personal-bio').boundingBox())!;
  const identity = (await page.locator('.personal-identity').boundingBox())!;
  expect(bio.x + bio.width).toBeLessThan(identity.x);
  await page.screenshot({ path: '.test-artifacts/slides-home-1366x768.png' });

  await page.locator('#selected-work').evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(page.locator('#selected-work > div')).toHaveCSS('opacity', '1');
  for (const card of await page.locator('#selected-work .project-card').all()) {
    const box = (await card.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(768);
  }
  await page.screenshot({ path: '.test-artifacts/slides-work-1366x768.png' });

  await page.goto('/about/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.about-page-grid')).toHaveCSS('opacity', '1');
  await expect(page.locator('.about-intro')).toHaveCSS('opacity', '1');
  for (const selector of ['.portrait-wrap', '.about-copy']) {
    const box = (await page.locator(selector).boundingBox())!;
    expect(box.y + box.height, selector).toBeLessThanOrEqual(768);
  }
  await page.screenshot({ path: '.test-artifacts/acceptance-about-1366x768.png' });

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.personal-identity')).toHaveCSS('opacity', '1');
  await expect(page.locator('.career-timeline')).toHaveCSS('opacity', '1');
  await expect(page.locator('.personal-bio')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: '.test-artifacts/slides-home-1920x1080.png' });
});

for (const viewport of [{ width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
  test(`desktop wheel gestures settle on all four Home slides at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    expect(await page.evaluate(() => document.scrollingElement === document.documentElement)).toBe(true);
    await expect(page.locator('html')).toHaveCSS('scroll-snap-type', 'y mandatory');
    const slides = page.locator('.personal-hero, .home-screen');
    await expect(slides).toHaveCount(4);
    for (const slide of await slides.all()) expect((await slide.boundingBox())!.height).toBeCloseTo(viewport.height, 0);
    await page.mouse.move(viewport.width - 80, viewport.height / 2);
    for (let index = 1; index <= 3; index++) {
      await page.mouse.wheel(0, 420);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(index * viewport.height, 0);
      const slide = slides.nth(index);
      await expect(slide.locator('[data-reveal]').first()).toHaveCSS('opacity', '1');
      await expect(slide.locator('[data-reveal]').first()).toHaveCSS('transform', 'none');
      const box = (await slide.boundingBox())!;
      expect(box.y).toBeCloseTo(0, 0);
      await page.screenshot({ path: `.test-artifacts/slides-screen-${index + 1}-${viewport.width}x${viewport.height}.png` });
    }
    const footer = (await page.locator('.footer-bottom').boundingBox())!;
    expect(footer.y + footer.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeHidden();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(3 * viewport.height, 0);
    await page.mouse.wheel(0, -420);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(2 * viewport.height, 0);
  });
}

test('mobile and editorial routes keep ordinary scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveCSS('scroll-snap-type', 'none');
  await expect(page.locator('.personal-identity')).toHaveCSS('opacity', '1');
  await expect(page.locator('.personal-bio')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: '.test-artifacts/slides-home-mobile-375x812.png' });
  for (const target of await page.locator('[data-reveal]').all()) {
    await target.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(target).toHaveCSS('opacity', '1');
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: '.test-artifacts/slides-home-mobile-full.png', fullPage: true });
  await page.setViewportSize({ width: 1366, height: 768 });
  for (const route of ['/work/', '/research/', '/about/', '/background/', '/projects/mobility-control-tower/']) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveCSS('scroll-snap-type', 'none');
  }
});

test('section reveals on scroll, and stays readable when reduced motion changes', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  const research = page.locator('.home-research > div');
  await expect(research).toHaveCSS('opacity', '0');
  await research.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(research).toHaveCSS('opacity', '1');
  await expect(research).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.reveal-pending')).toHaveCount(0);
  await page.goto('/');
  await expect(page.locator('.reveal-pending')).toHaveCount(0);
  await expect(research).toHaveCSS('opacity', '1');
});
