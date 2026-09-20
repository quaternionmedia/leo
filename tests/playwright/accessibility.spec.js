// Accessibility tests for Leo application
// Tests basic accessibility requirements

const { test, expect } = require('@playwright/test');

test.describe('Leo Accessibility Tests', () => {
  test('buttons have accessible text or titles', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ui', { timeout: 10000 });

    // Check metronome toggle has a title
    const metronomeToggle = page.locator('.metronome-toggle');
    const toggleTitle = await metronomeToggle.getAttribute('title');
    expect(toggleTitle).toBeTruthy();

    // Check play/pause has a title
    const playPause = page.locator('.metronome-play-pause');
    const playTitle = await playPause.getAttribute('title');
    expect(playTitle).toBeTruthy();
  });

  test('page has proper title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Leo');
  });

  test('inputs have proper types', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.ui', { timeout: 10000 });

    // Check search input type
    const searchInput = page.locator('.setlist__header__search__input');
    const inputType = await searchInput.getAttribute('type');
    expect(inputType).toBe('text');

    // Check it has a placeholder
    const placeholder = await searchInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
  });
});
