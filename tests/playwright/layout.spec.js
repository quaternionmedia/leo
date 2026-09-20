// Layout and responsive tests for Leo application
// Tests CSS and viewport handling

const { test, expect } = require('@playwright/test');

test.describe('Leo Layout Tests', () => {
  test('viewport CSS variables are set on resize', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 10000 });

    // Get initial --vh value
    const initialVh = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--vh');
    });
    expect(initialVh).toBeTruthy();

    // Resize viewport
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(200);

    // Check --vh was updated
    const newVh = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--vh');
    });
    expect(newVh).toBeTruthy();
    // Value should reflect 600px height * 0.01 = 6px
    expect(newVh.trim()).toBe('6px');
  });

  test('main UI container fills viewport', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ui', { timeout: 10000 });

    const uiBox = await page.locator('.ui').boundingBox();
    const viewportSize = page.viewportSize();

    // UI should be reasonably sized (at least half the viewport)
    expect(uiBox.width).toBeGreaterThan(viewportSize.width * 0.5);
  });
});
