import { test, expect } from '@playwright/test';

test.describe('Error Pages - 401/404 - Issue #37', () => {
  test('404 Not Found page displays correct French aria-labels', async ({ page }) => {
    // Navigate to non-existent route to trigger 404
    await page.goto('/nonexistent-page-xyz');

    // Check heading with aria-labelledby
    const section = page.locator('section[aria-labelledby="not-found-heading"]');
    await expect(section).toBeVisible();

    // Check h1 with id
    const heading = page.locator('h1#not-found-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('404');

    // Check h2 title
    const title = page.locator('h2');
    await expect(title).toHaveText('Page introuvable');

    // Check description
    const description = page.locator('p');
    await expect(description).toContainText('Désolé, la page que vous cherchez n\'existe pas');

    // Check link with correct French aria-label
    const homeLink = page.locator('a[aria-label="Retourner à l\'accueil"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveText('Retour à l\'accueil');
  });

  test('401 Unauthorized page displays correct French aria-labels', async ({ page }) => {
    // Navigate to 401 page
    await page.goto('/unauthorized');

    // Check section with aria-labelledby
    const section = page.locator('section[aria-labelledby="unauthorized-heading"]');
    await expect(section).toBeVisible();

    // Check h1 with id
    const heading = page.locator('h1#unauthorized-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('401');

    // Check h2 title in French
    const title = page.locator('h2');
    await expect(title).toHaveText('Non autorisé');

    // Check description in French
    const description = page.locator('p');
    await expect(description).toContainText('Connectez-vous depuis le portail utilisateur');

    // Check link with correct French aria-label
    const homeLink = page.locator('a[aria-label="Retourner à l\'accueil"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveText('Accueil');
  });

  test('404 link navigates to home page', async ({ page }) => {
    await page.goto('/nonexistent-page');

    const homeLink = page.locator('a[aria-label="Retourner à l\'accueil"]');
    await homeLink.click();

    await expect(page).toHaveURL('/');
  });

  test('401 link navigates to home page', async ({ page }) => {
    await page.goto('/unauthorized');

    const homeLink = page.locator('a[aria-label="Retourner à l\'accueil"]');
    await homeLink.click();

    await expect(page).toHaveURL('/');
  });

  test('404 page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/nonexistent-page');

    // All elements should be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('p')).toBeVisible();
    await expect(page.locator('a')).toBeVisible();

    // Link should be clickable
    const homeLink = page.locator('a[aria-label="Retourner à l\'accueil"]');
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('401 page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/unauthorized');

    // All elements should be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('p')).toBeVisible();
    await expect(page.locator('a')).toBeVisible();

    // Link should be clickable
    const homeLink = page.locator('a[aria-label="Retourner à l\'accueil"]');
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('404 page is accessible with screen reader (aria-labelledby)', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Verify aria-labelledby is properly connected
    const section = page.locator('section[aria-labelledby="not-found-heading"]');
    const headingId = await section.getAttribute('aria-labelledby');
    const heading = page.locator(`#${headingId}`);

    await expect(heading).toBeVisible();
  });

  test('401 page is accessible with screen reader (aria-labelledby)', async ({ page }) => {
    await page.goto('/unauthorized');

    // Verify aria-labelledby is properly connected
    const section = page.locator('section[aria-labelledby="unauthorized-heading"]');
    const headingId = await section.getAttribute('aria-labelledby');
    const heading = page.locator(`#${headingId}`);

    await expect(heading).toBeVisible();
  });

  test('Error page links are keyboard accessible', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Tab to the link
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));

    expect(focusedElement).toBe('Retourner à l\'accueil');

    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/');
  });

  test('404 and 401 pages have proper semantic HTML structure', async ({ page }) => {
    for (const route of ['/nonexistent-page', '/unauthorized']) {
      await page.goto(route);

      // Should have section with semantic landmark
      const section = page.locator('section');
      await expect(section).toBeVisible();

      // Should have h1 and h2 in correct order
      const h1 = page.locator('h1');
      const h2 = page.locator('h2');
      await expect(h1).toBeVisible();
      await expect(h2).toBeVisible();

      // Should have at least one paragraph
      const p = page.locator('p');
      await expect(p).toBeVisible();

      // Should have at least one link
      const a = page.locator('a');
      await expect(a).toBeVisible();
    }
  });
});
