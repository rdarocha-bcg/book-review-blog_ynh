import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Book Review Blog/i);
  await expect(page.locator('#main-content')).toBeVisible();
});

