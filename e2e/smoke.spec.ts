import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with correct title and main-content landmark', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Book Review Blog/i);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('hero section is present on /', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero-heading')).toBeVisible();
  });

  test('hero contains CTA links to /reviews and /academics', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Découvrir les critiques/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Travaux académiques/i })).toBeVisible();
  });
});

test.describe('Header navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('nav link "Critiques" navigates to /reviews', async ({ page }) => {
    // Desktop nav (md:flex ul)
    await page.getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Critiques' })
      .click();
    await expect(page).toHaveURL(/\/reviews/);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('nav link "Travaux" navigates to /academics', async ({ page }) => {
    await page.getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Travaux' })
      .click();
    await expect(page).toHaveURL(/\/academics/);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('nav link "À propos" navigates to /about', async ({ page }) => {
    await page.getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'À propos' })
      .click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('logo link navigates back to / (home)', async ({ page }) => {
    await page.goto('/reviews');
    await page.getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: /home$/i })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#hero-heading')).toBeVisible();
  });
});

test.describe('Routing — direct URL access', () => {
  test('/ shows home page hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero-heading')).toBeVisible();
  });

  test('/reviews shows review list (not home page)', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.locator('#main-content')).toBeVisible();
    // Hero heading belongs only to the home page
    await expect(page.locator('#hero-heading')).not.toBeVisible();
  });

  test('/about shows about page heading', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#about-heading')).toBeVisible();
  });

  test('/contact shows contact page heading', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#contact-heading')).toBeVisible();
  });

  test('/academics shows academic list (not home page)', async ({ page }) => {
    await page.goto('/academics');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('#hero-heading')).not.toBeVisible();
  });
});
