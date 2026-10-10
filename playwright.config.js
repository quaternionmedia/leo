// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// LEO_PORT runs the suite beside a dev server already holding 1234.
const FRONTEND_PORT = Number(process.env.LEO_PORT) || 1234;
// LEO_BASE_URL points the suite at a dev server somebody else started -- `leo
// check` sets it -- and then no server is started here.
const ATTACHED = process.env.LEO_BASE_URL;

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig({
  testDir: './tests/playwright',
  /* Maximum time one test can run */
  timeout: 30000,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    /* Base URL for navigation */
    baseURL: ATTACHED || `http://localhost:${FRONTEND_PORT}`,
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Run the frontend dev server before starting the tests */
  webServer: ATTACHED ? undefined : {
    command: `${process.platform === 'win32' ? 'npm.cmd' : 'npm'} run dev -- --port ${FRONTEND_PORT}`,
    port: FRONTEND_PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
