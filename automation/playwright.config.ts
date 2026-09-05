/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./loginManager'),
  fullyParallel: true,

  // per-test timeout (e.g. 2 minutes)
  timeout: 2 * 60 * 1000,

  // maximum time for the whole test run (optional)

  globalTimeout: 2 * 60 * 1000, // 2 minutes
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  outputDir: 'test-results',

  expect: { timeout: 60 * 1000 }, // expect() timeout

  webServer: {
    command: 'cd ../next-cashbook && npm run dev -- --hostname 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 60 * 1000, // 1 minutes
    navigationTimeout: 60 * 1000, // 1 minutes
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
