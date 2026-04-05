import { test, expect } from '@playwright/test';

/**
 * Smoke tests for YunoHost deployment (SSO + static + API).
 * Run: npx playwright test -c playwright.prod.config.ts e2e/production-blog.spec.ts
 */
test.describe('Production /blog', () => {
  test('API auth/me returns JSON (no browser)', async ({ request }) => {
    const base = process.env.E2E_BASE_URL || 'https://remidarocha.fr';
    const res = await request.get(`${base}/blog/api/auth/me`);
    expect(res.status(), 'auth/me HTTP status').toBe(200);
    const body = (await res.json()) as { authenticated?: boolean };
    expect(body).toHaveProperty('authenticated');
  });

  test('page loads 200, title, bundles and auth/me', async ({ page }) => {
    const failures: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') failures.push(`console: ${msg.text()}`);
    });
    page.on('pageerror', (err) => failures.push(`pageerror: ${err.message}`));

    const authMePredicate = (r: { url: () => string; status: () => number; request: () => { method: () => string } }) =>
      r.request().method() === 'GET' &&
      /\/api\/auth\/me(\?|$)/.test(new URL(r.url()).pathname) &&
      r.status() === 200;

    const authPromise = page.waitForResponse(authMePredicate, { timeout: 45_000 });
    const response = await page.goto('/blog/', { waitUntil: 'load', timeout: 45_000 });
    const authRes = await authPromise;

    expect(response?.status(), 'HTTP status for /blog/').toBe(200);
    await expect(page).toHaveTitle(/Book Review Blog/i);
    expect(authRes.status(), 'GET /blog/api/auth/me status').toBe(200);
    const authJson = (await authRes.json()) as { authenticated?: boolean };
    expect(authJson).toHaveProperty('authenticated');
    // Logged out visitors: false; SSO session: true — both are valid
    expect(typeof authJson.authenticated).toBe('boolean');

    // Angular should have bootstrapped (no fatal chunk 404)
    await expect(page.locator('body')).not.toContainText('500 Internal Server Error');
    expect(failures, `No console errors (got ${failures.length})`).toEqual([]);
  });
});
