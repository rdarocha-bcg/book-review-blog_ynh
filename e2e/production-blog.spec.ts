import { test, expect } from '@playwright/test';

/**
 * Deployed instance smoke (baseURL from config, usually under /blog/).
 * Run: npx playwright test -c playwright.prod.config.ts
 */
const deployedApiOrigin = (process.env.E2E_BASE_URL || 'https://remidarocha.fr/blog').replace(/\/blog\/?$/, '').replace(/\/$/, '');

test.describe('Production /blog', () => {
  test('API auth/me returns JSON (no browser)', async ({ request }) => {
    const res = await request.get(`${deployedApiOrigin}/api/auth/me`);
    expect(res.status(), 'auth/me HTTP status').toBe(200);
    const body = (await res.json()) as { authenticated?: boolean };
    expect(body).toHaveProperty('authenticated');
  });

  test('page loads 200, title, and main content', async ({ page }) => {
    const failures: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') failures.push(`console: ${msg.text()}`);
    });
    page.on('pageerror', (err) => failures.push(`pageerror: ${err.message}`));

    const response = await page.goto('/', { waitUntil: 'load', timeout: 45_000 });

    expect(response?.status(), 'HTTP status for /').toBe(200);
    await expect(page).toHaveTitle(/Book Review Blog/i);
    await expect(page.locator('#main-content')).toBeVisible();

    await expect(page.locator('body')).not.toContainText('500 Internal Server Error');
    expect(failures, `No console errors (got ${failures.length})`).toEqual([]);
  });
});
