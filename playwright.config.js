// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const FRONTEND_PORT = 1234;

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
    baseURL: `http://localhost:${FRONTEND_PORT}`,
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
  webServer: {
    command: process.platform === 'win32'
      ? 'npm.cmd run dev -- --port 1234'
      : 'npm run dev -- --port 1234',
    port: FRONTEND_PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
