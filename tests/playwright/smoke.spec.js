// Smoke tests for Leo application
// Quick tests to verify basic functionality

const { test, expect } = require('@playwright/test');

test.describe('Leo Smoke Tests', () => {
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('no console.error on fresh page load', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#app', { timeout: 10000 });

    // Filter out expected errors (favicon, etc.)
    const unexpectedErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404')
    );

    expect(unexpectedErrors).toEqual([]);
  });
});
