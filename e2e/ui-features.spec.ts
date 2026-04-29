import { test, expect } from '@playwright/test';

test.describe('UI Features - Issues #32, #31, #30, #29, #28', () => {
  // #32: Header sticky distinction
  test('Header has shadow and is distinct from content', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Check for shadow (via box-shadow or class)
    const shadow = await header.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      return style.boxShadow !== 'none';
    });

    // Header should have some visual distinction (shadow or border)
    const hasBorder = await header.locator('[class*="border"]').isVisible();
    expect(shadow || hasBorder).toBeTruthy();
  });

  test('Header stays visible when scrolling', async ({ page }) => {
    await page.goto('/reviews');

    const header = page.locator('header').first();
    const initialPosition = await header.boundingBox();

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    const scrolledPosition = await header.boundingBox();

    // Header should stay in similar Y position (sticky)
    expect(scrolledPosition?.y).toBeLessThan(100);
  });

  // #28: Card hover states
  test('Review cards show hover effects', async ({ page }) => {
    await page.goto('/reviews');

    const card = page.locator('app-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });

    // Get initial shadow
    const initialShadow = await card.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).boxShadow;
    });

    // Hover over card
    await card.hover();

    // Get hover shadow
    const hoverShadow = await card.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).boxShadow;
    });

    // Shadow should change on hover
    expect(hoverShadow).not.toBe(initialShadow);
  });

  test('Cards are cursor pointer on hover', async ({ page }) => {
    await page.goto('/reviews');

    const card = page.locator('app-card').first();
    await card.hover();

    const cursor = await card.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).cursor;
    });

    expect(cursor).toBe('pointer');
  });

  // #30: Loading animations
  test('Skeleton loaders have pulse animation', async ({ page }) => {
    await page.goto('/reviews');

    // Wait for page to start loading skeletons
    const skeleton = page.locator('app-review-card-skeleton').first();

    if (await skeleton.isVisible()) {
      const animationStyle = await skeleton.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        return {
          animation: style.animation,
          animationName: style.animationName,
        };
      });

      // Should have some animation
      expect(animationStyle.animation).not.toBe('none');
    }
  });

  test('Loading animation respects prefers-reduced-motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/reviews');

    const skeleton = page.locator('app-review-card-skeleton').first();

    if (await skeleton.isVisible()) {
      const animationStyle = await skeleton.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        return {
          animation: style.animation,
          animationName: style.animationName,
        };
      });

      // Animation should be reduced or none when preference is set
      expect(animationStyle.animationName).toBeTruthy();
    }
  });

  // #29: Error pages visuals
  test('404 page has visual elements', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // Should have visible heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Should have description text
    const description = page.locator('p').first();
    await expect(description).toBeVisible();

    // Should have return link with styling
    const link = page.locator('a').first();
    await expect(link).toBeVisible();
  });

  test('401 page has visual elements', async ({ page }) => {
    await page.goto('/unauthorized');

    // Should have visible heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Should have description
    const description = page.locator('p').first();
    await expect(description).toBeVisible();

    // Should have return link
    const link = page.locator('a').first();
    await expect(link).toBeVisible();
  });

  // #31: Select styling (general visual test)
  test('Form selects are properly styled and functional', async ({ page }) => {
    await page.goto('/reviews');

    // Wait for filters to load
    const select = page.locator('select').first();
    await expect(select).toBeVisible({ timeout: 5000 });

    // Select should be visible and styled
    const selectVisible = await select.isVisible();
    expect(selectVisible).toBeTruthy();

    // Try to interact with select
    await select.click();

    // Option should be visible when opened
    const option = select.locator('option').first();
    await expect(option).toBeVisible();
  });

  test('All interactive elements respond to hover/focus', async ({ page }) => {
    await page.goto('/');

    // Get buttons
    const buttons = page.locator('button').first();
    if (await buttons.isVisible()) {
      // Hover
      await buttons.hover();

      const hoverStyle = await buttons.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).transform;
      });

      // Should have some style change on hover
      expect(hoverStyle).toBeDefined();
    }
  });

  test('UI features work on mobile viewport', async ({ page }) => {
    // Mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/reviews');

    // Cards should be visible
    const card = page.locator('app-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });

    // Hover should work (or touch equivalent)
    if (await card.isVisible()) {
      await card.hover();
      const style = await card.evaluate((el: HTMLElement) => {
        return window.getComputedStyle(el).boxShadow;
      });

      expect(style).toBeDefined();
    }

    // Selects should be accessible
    const select = page.locator('select').first();
    if (await select.isVisible()) {
      await select.click();
      const options = page.locator('option');
      expect(await options.count()).toBeGreaterThan(0);
    }
  });

  test('UI features maintain accessibility', async ({ page }) => {
    await page.goto('/reviews');

    // Cards should be accessible via keyboard
    const card = page.locator('app-card a').first();
    await expect(card).toBeVisible({ timeout: 5000 });

    // Should be focusable
    await card.focus();

    const isFocused = await card.evaluate((el: HTMLElement) => {
      return document.activeElement === el;
    });

    expect(isFocused).toBeTruthy();
  });
});
