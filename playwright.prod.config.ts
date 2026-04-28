import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against a deployed instance (no local ng serve).
 * Usage: npx playwright test -c playwright.prod.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /(production-blog|comprehensive-prod)\.spec\.ts$/,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://remidarocha.fr',
    trace: 'on-first-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
