/**
 * Comprehensive production E2E test suite
 * Target: https://remidarocha.fr/blog/
 *
 * Covers:
 *   1. Navigation & routing (including /blog/ base href)
 *   2. Public pages — French UI, empty states, structure
 *   3. Auth guard — /reviews/new, /academics/new → /401
 *   4. Admin panel access
 *   5. UI/UX quality — no console errors, loading states, empty states
 *   6. API integration — auth/me, 404 error handling
 *   7. Edge cases — nonexistent resources, search with no results
 *   8. Responsive design — 375px, 768px
 *   9. Accessibility — ARIA, headings, focus management
 *
 * Run: npx playwright test -c playwright.prod.config.ts --grep "comprehensive"
 * Or:  npx playwright test -c playwright.prod.config.ts e2e/comprehensive-prod.spec.ts
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect console errors during a page visit */
function collectConsoleErrors(page: import('@playwright/test').Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

// ---------------------------------------------------------------------------
// 1. Navigation & Routing
// ---------------------------------------------------------------------------

test.describe('Navigation & Routing', () => {
  test('home page loads at /blog/ with 200 status', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    const response = await page.goto('/', { waitUntil: 'load', timeout: 45_000 });
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Book Review Blog/i);
    await expect(page.locator('#main-content')).toBeVisible();
    // Critical: no JS errors on initial load
    const critical = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('net::ERR_ABORTED'),
    );
    expect(critical, `Console errors on home: ${critical.join(', ')}`).toHaveLength(0);
  });

  test('nav: Critiques → /blog/reviews', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Critiques' })
      .click();
    await expect(page).toHaveURL(/\/reviews/);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('nav: Travaux → /blog/academics', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Travaux' })
      .click();
    await expect(page).toHaveURL(/\/academics/);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('nav: À propos → /blog/about', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'À propos' })
      .click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('logo navigates back to home', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: /home$/i })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#hero-heading')).toBeVisible();
  });

  test('invalid route → 404 page in French', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-at-all');
    await expect(page.locator('#main-content')).toBeVisible();
    // The not-found component renders "Page introuvable" in French
    await expect(page.getByRole('heading', { name: /Page introuvable/i })).toBeVisible();
    // The heading id is #not-found-heading
    await expect(page.locator('#not-found-heading')).toBeVisible();
  });

  test('direct URL access: /blog/reviews renders review list', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#hero-heading')).not.toBeVisible();
    // Page title heading
    await expect(page.getByRole('heading', { name: 'Critiques' })).toBeVisible();
  });

  test('direct URL access: /blog/academics renders academic list', async ({ page }) => {
    await page.goto('/academics');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#hero-heading')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Travaux Académiques' })).toBeVisible();
  });

  test('direct URL access: /blog/about renders about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#about-heading')).toBeVisible();
  });

  test('direct URL access: /blog/contact renders contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#contact-heading')).toBeVisible();
  });

  test('/blog/401 page renders Unauthorized content', async ({ page }) => {
    await page.goto('/401');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#unauthorized-heading')).toBeVisible();
    // Contains the 401 heading text
    await expect(page.getByRole('heading', { name: '401' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Home Page — French UI & Empty States
// ---------------------------------------------------------------------------

test.describe('Home Page — French UI & structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('hero section present with correct French heading', async ({ page }) => {
    await expect(page.locator('#hero-heading')).toBeVisible();
    await expect(page.locator('#hero-heading')).toContainText('Book Review Blog');
  });

  test('hero subtitle in French', async ({ page }) => {
    await expect(page.getByText(/Critiques littéraires/i)).toBeVisible();
  });

  test('CTA button "Découvrir les critiques" present', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /Découvrir les critiques/i }),
    ).toBeVisible();
  });

  test('CTA button "Travaux académiques" present', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /Travaux académiques/i }),
    ).toBeVisible();
  });

  test('"À la une" section heading present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'À la une' })).toBeVisible();
  });

  test('"Travaux choisis" section heading present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Travaux choisis' })).toBeVisible();
  });

  test('empty state: reviews section shows French empty message when no data', async ({ page }) => {
    // DB is empty — wait for loading to finish then check empty state message
    // Wait until aria-busy on reviews section is gone
    const reviewsSection = page.locator('[aria-labelledby="reviews-heading"]');
    await expect(reviewsSection).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    await expect(
      page.getByText(/Aucune critique disponible pour le moment/i),
    ).toBeVisible();
  });

  test('empty state: academics section shows French empty message when no data', async ({ page }) => {
    const academicsSection = page.locator('[aria-labelledby="academics-heading"]');
    await expect(academicsSection).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    await expect(
      page.getByText(/Aucun travail académique mis en avant/i),
    ).toBeVisible();
  });

  test('old "Critiques récentes" label is NOT present', async ({ page }) => {
    await expect(page.getByText('Critiques récentes')).not.toBeVisible();
  });

  test('"Voir tout →" links are present for both sections', async ({ page }) => {
    const seeAllLinks = page.getByRole('link', { name: /Voir tout →/i });
    await expect(seeAllLinks).toHaveCount(2);
  });
});

// ---------------------------------------------------------------------------
// 3. Reviews List Page
// ---------------------------------------------------------------------------

test.describe('Reviews List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('page heading "Critiques" in French', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Critiques', level: 1 })).toBeVisible();
  });

  test('search & filters panel present', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Recherche & filtres/i })).toBeVisible();
  });

  test('search input has correct French placeholder', async ({ page }) => {
    await expect(
      page.getByPlaceholder(/Rechercher une critique/i),
    ).toBeVisible();
  });

  test('genre filter has French options', async ({ page }) => {
    const genreSelect = page.getByRole('combobox', { name: /Filtrer par genre/i });
    await expect(genreSelect).toBeVisible();
    await expect(genreSelect.locator('option', { hasText: 'Tous les genres' })).toHaveCount(1);
    await expect(genreSelect.locator('option', { hasText: 'Policier' })).toHaveCount(1);
  });

  test('sort filter has French options', async ({ page }) => {
    const sortSelect = page.getByRole('combobox', { name: /Trier les critiques/i });
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect.locator('option', { hasText: 'Plus récents' })).toHaveCount(1);
  });

  test('"Réinitialiser" button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Réinitialiser/i })).toBeVisible();
  });

  test('empty state: shows French no-results message when DB is empty', async ({ page }) => {
    // Wait for loading to complete
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    await expect(
      page.getByText(/Aucune critique trouvée/i),
    ).toBeVisible();
  });

  test('search then reset returns to empty state message', async ({ page }) => {
    const liveRegion = page.locator('[aria-live="polite"]');
    // Wait for initial load to finish
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });

    const searchInput = page.getByPlaceholder(/Rechercher une critique/i);
    await searchInput.fill('nonexistent search query xyz');
    // The debounce is 350ms — wait for it to fire and load to finish
    // Don't try to catch the brief aria-busy=true window as it's sub-second
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    await expect(page.getByText(/Aucune critique trouvée/i)).toBeVisible();

    // Reset filters
    await page.getByRole('button', { name: /Réinitialiser/i }).click();
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    // With empty DB, still shows no-results after reset
    await expect(page.getByText(/Aucune critique trouvée/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Academics List Page
// ---------------------------------------------------------------------------

test.describe('Academics List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/academics');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('page heading "Travaux Académiques" in French', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Travaux Académiques', level: 1 }),
    ).toBeVisible();
  });

  test('search input has correct French placeholder', async ({ page }) => {
    await expect(
      page.getByPlaceholder(/Rechercher un travail académique/i),
    ).toBeVisible();
  });

  test('theme filter has French options', async ({ page }) => {
    const themeSelect = page.getByRole('combobox', { name: /Filtrer par thème/i });
    await expect(themeSelect).toBeVisible();
    await expect(themeSelect.locator('option', { hasText: 'Tous les thèmes' })).toHaveCount(1);
    await expect(themeSelect.locator('option', { hasText: 'Littérature' })).toHaveCount(1);
    await expect(themeSelect.locator('option', { hasText: 'Philosophie' })).toHaveCount(1);
  });

  test('empty state: shows French no-results message when DB is empty', async ({ page }) => {
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    await expect(
      page.getByText(/Aucun travail académique trouvé/i),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 5. Auth Guard — Protection of creation routes
// ---------------------------------------------------------------------------

test.describe('Auth Guard — creation routes require login', () => {
  test('/blog/reviews/new redirects to /blog/401 for unauthenticated users', async ({ page }) => {
    await page.goto('/reviews/new');
    await expect(page.locator('#main-content')).toBeVisible();
    // Should land on the 401 unauthorized page
    await expect(page).toHaveURL(/401/);
    await expect(page.locator('#unauthorized-heading')).toBeVisible();
  });

  test('/blog/academics/new redirects to /blog/401 for unauthenticated users', async ({ page }) => {
    await page.goto('/academics/new');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page).toHaveURL(/401/);
    await expect(page.locator('#unauthorized-heading')).toBeVisible();
  });

  test('401 page has "Go to home page" link', async ({ page }) => {
    await page.goto('/401');
    await expect(page.locator('#main-content')).toBeVisible();
    // The 401 component renders a button-styled link with aria-label="Go to home page"
    const homeLink = page.getByRole('link', { name: 'Go to home page' });
    await expect(homeLink).toBeVisible();
  });

  test('401 "Go to home page" link navigates back to home', async ({ page }) => {
    await page.goto('/401');
    await expect(page.locator('#main-content')).toBeVisible();
    await page.getByRole('link', { name: 'Go to home page' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#hero-heading')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 6. Nonexistent Resources — Error States
// ---------------------------------------------------------------------------

test.describe('Error states — nonexistent resources', () => {
  test('/blog/reviews/999999 shows French not-found error message', async ({ page }) => {
    await page.goto('/reviews/999999');
    await expect(page.locator('#main-content')).toBeVisible();
    // Wait for loading to finish (spinner disappears)
    await expect(page.locator('app-loading-spinner')).not.toBeVisible({ timeout: 20_000 });
    // The error panel should appear
    await expect(
      page.getByText(/Cette critique n'existe pas/i),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/L'identifiant demandé ne correspond à aucune critique/i),
    ).toBeVisible();
  });

  test('/blog/reviews/999999 error state has back link to /reviews', async ({ page }) => {
    await page.goto('/reviews/999999');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('app-loading-spinner')).not.toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Cette critique n'existe pas/i)).toBeVisible({ timeout: 20_000 });
    // Scope to the error alert which contains its own back link (distinct from the nav back link)
    const errorAlert = page.locator('[role="alert"]');
    const backLink = errorAlert.getByRole('link', { name: /Retour aux critiques/i });
    await expect(backLink).toBeVisible();
  });

  test('/blog/academics/999999 shows French not-found error message', async ({ page }) => {
    await page.goto('/academics/999999');
    await expect(page.locator('#main-content')).toBeVisible();
    // Wait for loading
    const loadingSkeleton = page.locator('[aria-busy="true"][aria-label="Chargement en cours"]');
    await expect(loadingSkeleton).not.toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/Ce travail académique n'existe pas/i),
    ).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/L'identifiant demandé ne correspond à aucun travail/i),
    ).toBeVisible();
  });

  test('/blog/academics/999999 error state has back link to /academics', async ({ page }) => {
    await page.goto('/academics/999999');
    await expect(page.locator('#main-content')).toBeVisible();
    const loadingSkeleton = page.locator('[aria-busy="true"][aria-label="Chargement en cours"]');
    await expect(loadingSkeleton).not.toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Ce travail académique n'existe pas/i)).toBeVisible({ timeout: 20_000 });
    const backLink = page.getByRole('link', { name: /Retour aux travaux/i });
    await expect(backLink).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 7. API Integration
// ---------------------------------------------------------------------------

test.describe('API Integration', () => {
  test('GET /blog/api/auth/me returns JSON with authenticated property', async ({ request }) => {
    const res = await request.get('https://remidarocha.fr/blog/api/auth/me');
    expect(res.status(), 'auth/me HTTP status').toBe(200);
    const body = await res.json() as { authenticated?: boolean };
    expect(body).toHaveProperty('authenticated');
  });

  test('GET /blog/api/reviews returns paginated JSON', async ({ request }) => {
    const res = await request.get('https://remidarocha.fr/blog/api/reviews');
    expect(res.status()).toBe(200);
    const body = await res.json() as { data?: unknown[]; total?: number };
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /blog/api/academics returns paginated JSON', async ({ request }) => {
    const res = await request.get('https://remidarocha.fr/blog/api/academics');
    expect(res.status()).toBe(200);
    const body = await res.json() as { data?: unknown[]; total?: number };
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /blog/api/reviews/nonexistent-id returns 404', async ({ request }) => {
    const res = await request.get('https://remidarocha.fr/blog/api/reviews/nonexistent-id-999999');
    expect(res.status()).toBe(404);
  });

  test('GET /blog/api/academics/nonexistent-id returns 404', async ({ request }) => {
    const res = await request.get('https://remidarocha.fr/blog/api/academics/nonexistent-id-999999');
    expect(res.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// 8. No Console Errors on Navigation
// ---------------------------------------------------------------------------

test.describe('No console errors on key pages', () => {
  const routes = [
    { path: '/blog/', name: 'home' },
    { path: '/blog/reviews', name: 'reviews list' },
    { path: '/blog/academics', name: 'academics list' },
    { path: '/blog/about', name: 'about' },
    { path: '/blog/contact', name: 'contact' },
    { path: '/blog/401', name: '401 page' },
  ];

  for (const { path, name } of routes) {
    test(`no console errors on ${name} (${path})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignore known browser-level noise
          if (text.includes('favicon') || text.includes('net::ERR_ABORTED')) return;
          errors.push(text);
        }
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

      await page.goto(path, { waitUntil: 'load', timeout: 45_000 });
      await expect(page.locator('#main-content')).toBeVisible();

      // Wait a moment to catch deferred errors (e.g. NG animation errors)
      await page.waitForTimeout(2000);

      expect(errors, `Errors on ${name}: ${errors.join('\n')}`).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. Responsive Design
// ---------------------------------------------------------------------------

test.describe('Responsive Design', () => {
  test('home page layout at 375px (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#hero-heading')).toBeVisible();
    // Check that CTA buttons are visible and not cut off
    await expect(page.getByRole('link', { name: /Découvrir les critiques/i })).toBeVisible();
  });

  test('home page layout at 768px (tablet)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#hero-heading')).toBeVisible();
  });

  test('reviews page search panel renders at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.getByPlaceholder(/Rechercher une critique/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 10. Accessibility — ARIA and headings
// ---------------------------------------------------------------------------

test.describe('Accessibility', () => {
  test('home page has a single h1 (#hero-heading)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
  });

  test('reviews list page has a single h1', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
  });

  test('academics list page has a single h1', async ({ page }) => {
    await page.goto('/academics');
    await expect(page.locator('#main-content')).toBeVisible();
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
  });

  test('main navigation has accessible name', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav).toBeVisible();
  });

  test('skip-to-main or #main-content landmark present on home', async ({ page }) => {
    await page.goto('/');
    // The app uses id="main-content" as the main landmark target
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('404 page heading has correct id (not-found-heading)', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await expect(page.locator('#not-found-heading')).toBeVisible();
  });

  test('401 page heading has correct id (unauthorized-heading)', async ({ page }) => {
    await page.goto('/401');
    await expect(page.locator('#unauthorized-heading')).toBeVisible();
  });

  test('review list search input has aria-label', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Rechercher une critique/i })).toBeVisible();
  });

  test('academic list search input has aria-label', async ({ page }) => {
    await page.goto('/academics');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: /Rechercher un travail académique/i }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 11. Admin Panel (unauthenticated access)
// ---------------------------------------------------------------------------

test.describe('Admin Panel — unauthenticated access', () => {
  test('/blog/admin loads or redirects — does not 500', async ({ page }) => {
    const response = await page.goto('/admin', { waitUntil: 'load', timeout: 45_000 });
    // Admin may redirect to SSO (3xx) or render the page — it must not 500
    // After redirects, check page is not an error page
    await expect(page.locator('body')).not.toContainText('500 Internal Server Error');
    await expect(page.locator('body')).not.toContainText('502 Bad Gateway');
  });
});

// ---------------------------------------------------------------------------
// 12. Loading States
// ---------------------------------------------------------------------------

test.describe('Loading States', () => {
  test('reviews list shows skeleton placeholders while loading', async ({ page }) => {
    // Slow down the API to catch the loading state
    await page.route('**/blog/api/reviews**', async (route) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 2500));
      await route.fulfill({
        json: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      });
    });
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();
    // Skeleton components should be visible during load
    await expect(page.locator('app-review-card-skeleton').first()).toBeVisible({ timeout: 5_000 });
  });

  test('academics list shows skeleton placeholders while loading', async ({ page }) => {
    await page.route('**/blog/api/academics**', async (route) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 2500));
      await route.fulfill({
        json: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      });
    });
    await page.goto('/academics');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('app-review-card-skeleton').first()).toBeVisible({ timeout: 5_000 });
  });

  test('home reviews section shows aria-busy=true during load', async ({ page }) => {
    await page.route('**/blog/api/reviews**', async (route) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 2500));
      await route.fulfill({
        json: { data: [], total: 0, page: 1, limit: 6, totalPages: 0 },
      });
    });
    await page.goto('/');
    const reviewsSection = page.locator('[aria-labelledby="reviews-heading"]');
    await expect(reviewsSection).toHaveAttribute('aria-busy', 'true', { timeout: 5_000 });
  });
});

// ---------------------------------------------------------------------------
// 13. Edge Cases — Filter Combinations
// ---------------------------------------------------------------------------

test.describe('Edge Cases — Filter Combinations', () => {
  test('applying all filters on empty DB still shows no-results message', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();

    // Apply genre filter
    await page.getByRole('combobox', { name: /Filtrer par genre/i }).selectOption('fiction');
    // Apply rating filter
    await page.getByRole('combobox', { name: /Filtrer par note/i }).selectOption('5');
    // Apply sort
    await page.getByRole('combobox', { name: /Trier les critiques/i }).selectOption('newest');

    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    await expect(page.getByText(/Aucune critique trouvée/i)).toBeVisible();
  });

  test('academics: applying theme filter on empty DB shows no-results message', async ({ page }) => {
    await page.goto('/academics');
    await expect(page.locator('#main-content')).toBeVisible();
    await page.getByRole('combobox', { name: /Filtrer par thème/i }).selectOption('literature');
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toHaveAttribute('aria-busy', 'false', { timeout: 20_000 });
    await expect(page.getByText(/Aucun travail académique trouvé/i)).toBeVisible();
  });
});
