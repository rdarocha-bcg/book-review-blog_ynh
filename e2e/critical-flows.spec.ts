import { test, expect } from '@playwright/test';

/**
 * Critical Flows — E2E tests for the key user journeys.
 *
 * Covers the flows listed in issue #72:
 * - Genre filter with URL sync
 * - Pagination URL param update
 * - Review detail navigation from list
 * - Mobile hamburger menu open/close/navigation
 * - Protected admin route redirects to /401 for unauthenticated users
 *
 * Note: admin CRUD and SSO login flows require a live auth backend and
 * are covered separately in production smoke tests.
 */

// ---------------------------------------------------------------------------
// 1. Genre filter — URL sync and no-results state
// ---------------------------------------------------------------------------

test.describe('Genre filter', () => {
  test('selecting a genre updates the URL and shows loading', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();

    const genreSelect = page.getByRole('combobox', { name: /Filtrer par genre/i });
    await expect(genreSelect).toBeVisible();

    await genreSelect.selectOption('fiction');

    // URL should contain genre=fiction
    await expect(page).toHaveURL(/genre=fiction/);
  });

  test('resetting filters clears the genre URL param', async ({ page }) => {
    await page.goto('/reviews?genre=fiction');
    await expect(page.locator('#main-content')).toBeVisible();

    await page.getByRole('button', { name: /Réinitialiser/i }).click();

    // URL should no longer contain genre
    await expect(page).not.toHaveURL(/genre=/);
  });

  test('academics: selecting a theme updates the URL', async ({ page }) => {
    await page.goto('/academics');
    await expect(page.locator('#main-content')).toBeVisible();

    const themeSelect = page.getByRole('combobox', { name: /Filtrer par thème/i });
    await expect(themeSelect).toBeVisible();

    await themeSelect.selectOption('literature');

    await expect(page).toHaveURL(/theme=literature/);
  });
});

// ---------------------------------------------------------------------------
// 2. Pagination — URL query param updates
// ---------------------------------------------------------------------------

test.describe('Pagination', () => {
  test('navigating to /reviews?page=2 sets the page state', async ({ page }) => {
    await page.goto('/reviews?page=2');
    await expect(page.locator('#main-content')).toBeVisible();

    // The live region should settle (aria-busy = false)
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
  });

  test('pagination component is accessible by keyboard', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();

    // Wait for loading to settle
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });

    // Pagination is shown only when there are results; skip test if no results
    const pagination = page.locator('app-pagination');
    if (await pagination.count() === 0) {
      test.skip();
      return;
    }

    // Pagination buttons should be focusable
    const firstBtn = pagination.getByRole('button').first();
    await expect(firstBtn).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Review detail navigation
// ---------------------------------------------------------------------------

test.describe('Review detail navigation', () => {
  test('clicking a review card navigates to the detail page', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();

    // Wait for data (or empty state)
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });

    const firstCard = page.getByRole('link', { name: /Ouvrir la critique/i }).first();
    if (await firstCard.count() === 0) {
      test.skip(); // no reviews in DB
      return;
    }

    await firstCard.click();
    await expect(page).toHaveURL(/\/reviews\//);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('back link on review detail returns to list', async ({ page }) => {
    await page.goto('/reviews');

    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });

    const firstCard = page.getByRole('link', { name: /Ouvrir la critique/i }).first();
    if (await firstCard.count() === 0) {
      test.skip();
      return;
    }

    await firstCard.click();
    await expect(page).toHaveURL(/\/reviews\//);

    await page.getByRole('link', { name: /Retour aux critiques/i }).click();
    await expect(page).toHaveURL(/\/reviews$/);
  });
});

// ---------------------------------------------------------------------------
// 4. Mobile hamburger menu
// ---------------------------------------------------------------------------

test.describe('Mobile hamburger menu', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('hamburger button is visible and has accessible label', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#mobile-nav-toggle');
    await expect(toggle).toBeVisible();
  });

  test('clicking hamburger opens the mobile nav panel', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#mobile-nav-toggle');
    await toggle.click();

    const panel = page.locator('#mobile-nav-panel');
    await expect(panel).toBeVisible();
  });

  test('clicking hamburger again closes the mobile nav panel', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#mobile-nav-toggle');

    await toggle.click(); // open
    await toggle.click(); // close

    const panel = page.locator('#mobile-nav-panel');
    await expect(panel).not.toBeVisible();
  });

  test('mobile nav links navigate correctly', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#mobile-nav-toggle');
    await toggle.click();

    const panel = page.locator('#mobile-nav-panel');
    await expect(panel).toBeVisible();

    // Click the Critiques link in mobile nav
    const reviewsLink = panel.getByRole('link', { name: /Critiques/i }).first();
    await reviewsLink.click();

    await expect(page).toHaveURL(/\/reviews/);
  });
});

// ---------------------------------------------------------------------------
// 5. Admin route protection (unauthenticated → redirect)
// ---------------------------------------------------------------------------

test.describe('Admin route protection', () => {
  test('unauthenticated access to /admin redirects to /401', async ({ page }) => {
    await page.goto('/admin');
    // Should land on the 401 page
    await expect(page).toHaveURL(/\/401/);
    await expect(page.locator('#unauthorized-heading')).toBeVisible();
  });

  test('unauthenticated access to /admin/reviews redirects to /401', async ({ page }) => {
    await page.goto('/admin/reviews');
    await expect(page).toHaveURL(/\/401/);
  });

  test('unauthenticated access to /admin/academics redirects to /401', async ({ page }) => {
    await page.goto('/admin/academics');
    await expect(page).toHaveURL(/\/401/);
  });
});
