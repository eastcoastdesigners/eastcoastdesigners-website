import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const useLocalServer = !process.env.BASE_URL;

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/deployment/old-site-pages/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(useLocalServer && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:4321',
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  }),
});
