// Core end-to-end tests for Leo application
// Tests basic app initialization and routing

const { test, expect } = require('@playwright/test');

test.describe('Leo Core E2E Tests', () => {
  test.describe.configure({ mode: 'serial' });

  // Collect console logs for each test
  let consoleLogs = [];
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    consoleErrors = [];

    // Listen to console events
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else {
        consoleLogs.push({ type: msg.type(), text });
      }
    });

    // Listen to page errors (uncaught exceptions)
    page.on('pageerror', (error) => {
      consoleErrors.push(`PageError: ${error.message}`);
    });
  });

  test('frontend loads without JavaScript errors', async ({ page }) => {
    // Navigate to the frontend
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for the app to initialize
    await page.waitForSelector('#app', { timeout: 10000 });

    // Check that the app div has content (Mithril rendered something)
    const appContent = await page.locator('#app').innerHTML();
    expect(appContent.length).toBeGreaterThan(0);

    // Verify no critical JavaScript errors
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('404') &&
        !err.includes('net::ERR') &&
        !err.includes('Failed to load resource')
    );

    // Log errors for debugging
    if (criticalErrors.length > 0) {
      console.log('Critical console errors:', criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
  });

  test('page title is correct', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Leo');
  });

  test('UI container renders', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for the main UI container
    await page.waitForSelector('.ui', { timeout: 10000 });

    const uiContainer = page.locator('.ui');
    await expect(uiContainer).toBeVisible();
  });

  test('app initializes and logs startup message', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for app to initialize
    await page.waitForSelector('#app', { timeout: 10000 });

    // Give the app time to log
    await page.waitForTimeout(500);

    // Check for the "sup!" message from index.ts
    const hasInitMessage = consoleLogs.some((log) => log.text.includes('sup!'));

    console.log(
      'Console logs:',
      consoleLogs.map((l) => `[${l.type}] ${l.text}`)
    );

    expect(hasInitMessage).toBe(true);
  });

  test('mithril routing initializes correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for initial route to be set
    await page.waitForSelector('#app', { timeout: 10000 });

    // Check for route initialization log
    const hasRouteInit = consoleLogs.some((log) => log.text.includes('init route'));

    console.log('Checking for route initialization...');
    expect(hasRouteInit).toBe(true);
  });

  test('tracer div exists for debugging', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const tracer = page.locator('#tracer');
    await expect(tracer).toBeAttached();
  });

  test('no excessive console errors during interaction', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Perform some interactions
    await page.waitForSelector('#app', { timeout: 10000 });

    // Wait for any async operations
    await page.waitForTimeout(2000);

    // Filter out expected non-critical errors
    const realErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('Failed to load resource') &&
        !err.includes('net::ERR')
    );

    console.log(`Console errors: ${realErrors.length}`);
    if (realErrors.length > 0) {
      console.log('Errors:', realErrors);
    }

    // Should not have excessive errors
    expect(realErrors.length).toBeLessThan(5);
  });

  test('CSS viewport variables are set', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait for app to set CSS variables
    await page.waitForSelector('#app', { timeout: 10000 });

    // Check that --vh CSS variable is set (from adjustForURLBar)
    const vhValue = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--vh');
    });

    expect(vhValue).toBeTruthy();
    expect(vhValue.length).toBeGreaterThan(0);
  });

  test('window.cells is exposed for debugging', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.waitForSelector('#app', { timeout: 10000 });

    // Check that cells is exposed globally
    const hasCells = await page.evaluate(() => {
      return typeof window.cells !== 'undefined';
    });

    expect(hasCells).toBe(true);
  });

  test('window.m (mithril) is exposed globally', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.waitForSelector('#app', { timeout: 10000 });

    // Check that mithril is exposed globally
    const hasMithril = await page.evaluate(() => {
      return typeof window.m !== 'undefined' && typeof window.m.redraw === 'function';
    });

    expect(hasMithril).toBe(true);
  });
});
