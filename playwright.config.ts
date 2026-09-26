import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'https://posqa.artisanscloud.com.my',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Runs first: logs in once and saves the session
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // All real tests start already logged in
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});