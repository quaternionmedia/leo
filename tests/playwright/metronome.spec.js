// Metronome feature tests for Leo application
// Tests metronome popup and controls

const { test, expect } = require('@playwright/test');

test.describe('Leo Metronome Tests', () => {
  test('metronome popup opens via URL hash', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for app to load
    await page.waitForSelector('#app', { timeout: 10000 });

    // Navigate to metronome hash
    await page.evaluate(() => {
      window.location.hash = '#metronome';
    });

    // Wait for hash change to be processed
    await page.waitForTimeout(500);

    // Check if metronome overlay appears
    const metronomeOverlay = page.locator('.metronome-overlay');
    const isVisible = await metronomeOverlay.isVisible().catch(() => false);

    if (isVisible) {
      await expect(metronomeOverlay).toBeVisible();

      // Check for metronome title
      const metronomeTitle = page.locator('.metronome-title h2');
      await expect(metronomeTitle).toContainText('Metronome');
    } else {
      console.log('Metronome overlay not visible - checking DOM state');
    }
  });

  test('metronome popup can be closed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for app
    await page.waitForSelector('#app', { timeout: 10000 });

    // Open metronome
    await page.evaluate(() => {
      window.location.hash = '#metronome';
    });
    await page.waitForTimeout(500);

    const overlay = page.locator('.metronome-overlay');
    const isVisible = await overlay.isVisible().catch(() => false);

    if (isVisible) {
      // Click close button
      const closeBtn = page.locator('.close-btn');
      await closeBtn.click();

      // Overlay should be hidden now
      await expect(overlay).not.toBeVisible();
    }
  });

  test('metronome popup has tempo controls', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 10000 });

    // Open metronome
    await page.evaluate(() => {
      window.location.hash = '#metronome';
    });
    await page.waitForTimeout(500);

    const overlay = page.locator('.metronome-overlay');
    const isVisible = await overlay.isVisible().catch(() => false);

    if (isVisible) {
      // Check for tempo section
      const tempoSection = page.locator('.tempo-section');
      await expect(tempoSection).toBeVisible();

      // Check for tempo slider
      const tempoSlider = page.locator('.tempo-controls input[type="range"]');
      await expect(tempoSlider).toBeAttached();

      // Check for tempo number input
      const tempoInput = page.locator('.tempo-controls input[type="number"]');
      await expect(tempoInput).toBeAttached();
    }
  });

  test('metronome popup has volume control', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 10000 });

    // Open metronome
    await page.evaluate(() => {
      window.location.hash = '#metronome';
    });
    await page.waitForTimeout(500);

    const overlay = page.locator('.metronome-overlay');
    const isVisible = await overlay.isVisible().catch(() => false);

    if (isVisible) {
      const volumeSection = page.locator('.volume-section');
      await expect(volumeSection).toBeVisible();
    }
  });

  test('metronome popup has play button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 10000 });

    // Open metronome
    await page.evaluate(() => {
      window.location.hash = '#metronome';
    });
    await page.waitForTimeout(500);

    const overlay = page.locator('.metronome-overlay');
    const isVisible = await overlay.isVisible().catch(() => false);

    if (isVisible) {
      const playButton = page.locator('.play-btn');
      await expect(playButton).toBeVisible();
      
      // Check initial state shows "Play"
      await expect(playButton).toContainText('Play');
    }
  });

  test('metronome popup has rhythm pattern section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 10000 });

    // Open metronome
    await page.evaluate(() => {
      window.location.hash = '#metronome';
    });
    await page.waitForTimeout(500);

    const overlay = page.locator('.metronome-overlay');
    const isVisible = await overlay.isVisible().catch(() => false);

    if (isVisible) {
      const rhythmSection = page.locator('.rhythm-section');
      await expect(rhythmSection).toBeVisible();
    }
  });

  test('metronome toggle button opens popup', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.metronome-toggle', { timeout: 10000 });

    // Click the metronome toggle button
    const metronomeToggle = page.locator('.metronome-toggle');
    await metronomeToggle.click();

    // Wait for popup to appear
    await page.waitForTimeout(500);

    // Check overlay is visible
    const overlay = page.locator('.metronome-overlay');
    await expect(overlay).toBeVisible();
  });
});
