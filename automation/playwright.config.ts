import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // per-test timeout (e.g. 30 minutes)
  timeout: 30 * 60 * 1000,
  // maximum time for the whole test run (optional)
  globalTimeout: 2 * 60 * 60 * 1000, // 2 hours
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  outputDir: 'test-results',

  expect: { timeout: 30 * 60 * 1000 }, // expect() timeout

  use: {
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30 * 60 * 1000, // 30 minutes
    navigationTimeout: 30 * 60 * 1000, // 30 minutes
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
