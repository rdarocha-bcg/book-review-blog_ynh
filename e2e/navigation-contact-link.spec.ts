import { test, expect } from '@playwright/test';

test.describe('Navigation - Contact Link - Issue #36', () => {
  test('Contact link is visible in desktop navigation', async ({ page }) => {
    await page.goto('/');

    // Desktop navigation should be visible
    const desktopNav = page.locator('nav ul').first();
    await expect(desktopNav).toBeVisible();

    // Contact link should be present and visible
    const contactLink = desktopNav.getByRole('link', { name: 'Contact' });
    await expect(contactLink).toBeVisible();
  });

  test('Contact link is in correct order (after About, before Admin)', async ({ page }) => {
    await page.goto('/');

    const navLinks = page.locator('nav ul').first().locator('li');
    const linkTexts: string[] = [];

    for (let i = 0; i < await navLinks.count(); i++) {
      const text = await navLinks.nth(i).textContent();
      linkTexts.push(text?.trim() || '');
    }

    // Should have: Accueil, Critiques, Travaux, À propos, Contact, Admin
    expect(linkTexts).toContain('À propos');
    expect(linkTexts).toContain('Contact');
    expect(linkTexts).toContain('Admin');

    // Contact should be after About and before Admin
    const aboutIndex = linkTexts.findIndex(text => text === 'À propos');
    const contactIndex = linkTexts.findIndex(text => text === 'Contact');
    const adminIndex = linkTexts.findIndex(text => text === 'Admin');

    expect(contactIndex).toBeGreaterThan(aboutIndex);
    expect(contactIndex).toBeLessThan(adminIndex);
  });

  test('Contact link navigates to /contact page', async ({ page }) => {
    await page.goto('/');

    const contactLink = page.locator('nav a[routerLink="/contact"]').first();
    await expect(contactLink).toBeVisible();
    await contactLink.click();

    await expect(page).toHaveURL('/contact');
  });

  test('Contact link is visible in mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Mobile nav button should be visible
    const mobileNavButton = page.locator('button[aria-label="Menu principal"]');
    await expect(mobileNavButton).toBeVisible();

    // Open mobile menu
    await mobileNavButton.click();

    // Contact link should be visible in mobile menu
    const mobileNav = page.locator('div[aria-label="Menu mobile"]');
    const contactLink = mobileNav.getByRole('link', { name: 'Contact' });
    await expect(contactLink).toBeVisible();
  });

  test('Mobile Contact link navigates to /contact and closes menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Open mobile menu
    const mobileNavButton = page.locator('button[aria-label="Menu principal"]');
    await mobileNavButton.click();

    // Click Contact link
    const mobileNav = page.locator('div[aria-label="Menu mobile"]');
    const contactLink = mobileNav.getByRole('link', { name: 'Contact' });
    await contactLink.click();

    // Should navigate to /contact
    await expect(page).toHaveURL('/contact');

    // Mobile menu should close
    await expect(mobileNav).not.toBeVisible();
  });

  test('Contact link has consistent styling with other nav links', async ({ page }) => {
    await page.goto('/');

    const aboutLink = page.locator('nav a[routerLink="/about"]').first();
    const contactLink = page.locator('nav a[routerLink="/contact"]').first();
    const adminLink = page.locator('nav a[routerLink="/admin"]').first();

    // All should have same classes/styling
    const contactClasses = await contactLink.getAttribute('class');
    const aboutClasses = await aboutLink.getAttribute('class');
    const adminClasses = await adminLink.getAttribute('class');

    expect(contactClasses).toBeTruthy();
    expect(contactClasses).toBe(aboutClasses); // Same styling as other links
    expect(contactClasses).toBe(adminClasses);
  });

  test('Contact link has hover state', async ({ page }) => {
    await page.goto('/');

    const contactLink = page.locator('nav a[routerLink="/contact"]').first();

    // Get computed style before hover
    const normalColor = await contactLink.evaluate(el =>
      window.getComputedStyle(el).color
    );

    // Hover and get new style
    await contactLink.hover();
    const hoverColor = await contactLink.evaluate(el =>
      window.getComputedStyle(el).color
    );

    // Hover color should change (hover:text-accent-strong)
    expect(normalColor).not.toBe(hoverColor);
  });

  test('Contact link is keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab to the Contact link
    let foundContactLink = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('href'));
      if (focused === '/contact') {
        foundContactLink = true;
        break;
      }
    }

    expect(foundContactLink).toBe(true);

    // Press Enter to navigate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/contact');
  });
});
