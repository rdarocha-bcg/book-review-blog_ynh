import { test, expect } from '@playwright/test';

test.describe('API Error Handling - Issue #35', () => {
  test('Reviews page shows error message when API is unavailable', async ({ page }) => {
    // Abort all API requests to simulate network failure
    await page.route('**/api/reviews*', route => route.abort());

    await page.goto('/reviews');

    // Wait for error message to appear
    const errorAlert = page.locator('role=alert');
    await expect(errorAlert).toBeVisible();

    // Check error message text
    await expect(page.locator('role=alert')).toContainText('Erreur lors du chargement des critiques');

    // Check retry button is present
    const retryButton = page.locator('button:has-text("Réessayer")');
    await expect(retryButton).toBeVisible();
  });

  test('Academics page shows error message when API is unavailable', async ({ page }) => {
    // Abort all API requests to simulate network failure
    await page.route('**/api/academics*', route => route.abort());

    await page.goto('/academics');

    // Wait for error message to appear
    const errorAlert = page.locator('role=alert');
    await expect(errorAlert).toBeVisible();

    // Check error message text
    await expect(page.locator('role=alert')).toContainText('Erreur lors du chargement des travaux académiques');

    // Check retry button is present
    const retryButton = page.locator('button:has-text("Réessayer")');
    await expect(retryButton).toBeVisible();
  });

  test('Reviews - Retry button re-fetches data after reconnection', async ({ page }) => {
    let requestCount = 0;

    // First, abort all requests
    await page.route('**/api/reviews*', route => {
      requestCount++;
      if (requestCount === 1) {
        // First request fails
        route.abort();
      } else {
        // Second request (after retry) succeeds
        route.continue();
      }
    });

    await page.goto('/reviews');

    // Error should be visible
    await expect(page.locator('role=alert')).toBeVisible();

    // Click retry button
    await page.locator('button:has-text("Réessayer")').click();

    // Error should disappear and reviews should load
    await expect(page.locator('role=alert')).not.toBeVisible();
    // Wait for reviews to load
    await page.waitForTimeout(500);
    // Verify reviews container is showing (no error)
    const reviewsList = page.locator('div:has(app-card)').first();
    await expect(reviewsList).toBeVisible();
  });

  test('Reviews - Network error does not show empty list', async ({ page }) => {
    // Abort API requests
    await page.route('**/api/reviews*', route => route.abort());

    await page.goto('/reviews');

    // Error alert should be visible
    await expect(page.locator('role=alert')).toBeVisible();

    // "No Results" message should NOT appear
    await expect(page.locator('text=Aucune critique trouvée')).not.toBeVisible();

    // Reviews list should be empty/not shown
    const reviewsContainer = page.locator('div.columns-1');
    // If visible, it should have no cards
    const cards = page.locator('app-card');
    await expect(cards).toHaveCount(0);
  });

  test('Reviews - Filter change with API error shows error message', async ({ page }) => {
    // Start with working API
    await page.goto('/reviews');

    // Wait for initial load
    await expect(page.locator('app-card').first()).toBeVisible({ timeout: 5000 });

    // Now abort API for subsequent requests
    await page.route('**/api/reviews*', route => route.abort());

    // Change filter (this will trigger new API call)
    const genreSelect = page.locator('select[aria-label="Filtrer par genre"]');
    await genreSelect.selectOption('fiction');

    // Wait for error to appear
    await expect(page.locator('role=alert')).toBeVisible();

    // Error message should be shown
    await expect(page.locator('role=alert')).toContainText('Erreur lors du chargement');
  });

  test('Academics - Network error does not show empty list', async ({ page }) => {
    // Abort API requests
    await page.route('**/api/academics*', route => route.abort());

    await page.goto('/academics');

    // Error alert should be visible
    await expect(page.locator('role=alert')).toBeVisible();

    // "No Results" message should NOT appear
    await expect(page.locator('text=Aucun travail académique trouvé')).not.toBeVisible();

    // Academics list should be empty/not shown
    const cards = page.locator('app-card');
    await expect(cards).toHaveCount(0);
  });
});
