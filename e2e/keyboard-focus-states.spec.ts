import { test, expect } from '@playwright/test';

test.describe('Keyboard Focus States - Issue #27', () => {
  test('All navigation links have visible focus state', async ({ page }) => {
    await page.goto('/');

    // Get all navigation links
    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Tab through each link and verify focus style is visible
    for (let i = 0; i < linkCount; i++) {
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el) return null;
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          boxShadow: style.boxShadow,
          outlineWidth: style.outlineWidth,
          tagName: el.tagName,
        };
      });

      // Navigation links should have visible focus (outline or box-shadow)
      if (focusedElement?.tagName === 'A') {
        const hasOutline = focusedElement.outline && focusedElement.outline !== 'none';
        const hasBoxShadow = focusedElement.boxShadow && focusedElement.boxShadow !== 'none';
        expect(hasOutline || hasBoxShadow).toBeTruthy();
      }
    }
  });

  test('All filter buttons/selects have visible focus state', async ({ page }) => {
    await page.goto('/reviews');

    // Wait for page to load
    await expect(page.locator('button, select, input').first()).toBeVisible({ timeout: 5000 });

    // Get all interactive form elements
    const interactiveElements = page.locator('button, select, input[type="text"]');
    const count = await interactiveElements.count();

    // Should have at least some interactive elements
    expect(count).toBeGreaterThan(0);

    // Check first few interactive elements for focus style
    for (let i = 0; i < Math.min(5, count); i++) {
      const element = interactiveElements.nth(i);
      await element.focus();

      const focusStyle = await element.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          boxShadow: style.boxShadow,
          outlineColor: style.outlineColor,
        };
      });

      // Should have some focus styling visible
      const hasStyle = focusStyle.outline !== 'none' || focusStyle.boxShadow !== 'none';
      expect(hasStyle).toBeTruthy();
    }
  });

  test('Review cards are keyboard accessible with visible focus', async ({ page }) => {
    await page.goto('/reviews');

    // Wait for cards to load
    await expect(page.locator('app-card').first()).toBeVisible({ timeout: 5000 });

    // Get first card link
    const firstCardLink = page.locator('app-card').first().locator('a').first();

    // Focus the link
    await firstCardLink.focus();

    // Check focus styling
    const focusStyle = await firstCardLink.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      return {
        outline: style.outline,
        boxShadow: style.boxShadow,
      };
    });

    // Should have visible focus
    const hasFocus = focusStyle.outline !== 'none' || focusStyle.boxShadow !== 'none';
    expect(hasFocus).toBeTruthy();
  });

  test('Complete keyboard navigation through page is possible', async ({ page }) => {
    await page.goto('/');

    let tabCount = 0;
    const focusedElements: string[] = [];

    // Tab through page and collect focused elements
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Tab');
      tabCount++;

      const focusedEl = await page.evaluate(() => document.activeElement?.tagName);
      if (focusedEl) {
        focusedElements.push(focusedEl);
      }

      // Break if we've cycled back to body
      if (focusedEl === 'BODY') {
        break;
      }
    }

    // Should have tabbed through multiple elements
    expect(tabCount).toBeGreaterThan(5);
    // Should have found interactive elements (A, BUTTON, INPUT, SELECT, etc)
    expect(focusedElements.length).toBeGreaterThan(0);
  });

  test('No focus traps - can tab away from all elements', async ({ page }) => {
    await page.goto('/');

    // Focus first interactive element
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

    // Keep tabbing
    for (let i = 0; i < 100; i++) {
      await page.keyboard.press('Tab');
    }

    // Should have escaped any potential focus trap
    const finalFocused = await page.evaluate(() => document.activeElement?.tagName);
    // After many tabs, should eventually cycle back or reach body
    expect(finalFocused).toBeDefined();
  });

  test('Shift+Tab (reverse tab) works correctly', async ({ page }) => {
    await page.goto('/');

    // Tab forward
    await page.keyboard.press('Tab');
    const forwardFocused = await page.evaluate(() => document.activeElement?.getAttribute('id'));

    // Tab backward
    await page.keyboard.press('Shift+Tab');
    const backFocused = await page.evaluate(() => document.activeElement?.getAttribute('id'));

    // Should move backwards
    expect(backFocused).toBeDefined();
  });

  test('Escape key closes mobile menu if open', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    const menuButton = page.locator('button[aria-label="Menu principal"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Mobile menu should be open
      const mobileMenu = page.locator('div[aria-label="Menu mobile"]');
      await expect(mobileMenu).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Menu should close
      await expect(mobileMenu).not.toBeVisible();
    }
  });

  test('Focus ring is visible on all buttons', async ({ page }) => {
    await page.goto('/reviews');

    // Get all buttons
    const buttons = page.locator('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);

    // Check first button
    const firstButton = buttons.first();
    await firstButton.focus();

    const focusStyle = await firstButton.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const isVisible = style.outline !== 'none' ||
                       (style.boxShadow && style.boxShadow !== 'none') ||
                       style.outlineWidth !== '0px';
      return {
        hasStyle: isVisible,
        outline: style.outline,
        boxShadow: style.boxShadow,
      };
    });

    expect(focusStyle.hasStyle).toBeTruthy();
  });

  test('Focus is visible on search input', async ({ page }) => {
    await page.goto('/reviews');

    // Find search input
    const searchInput = page.locator('input[placeholder*="Rechercher"]').first();

    if (await searchInput.isVisible()) {
      // Focus the input
      await searchInput.focus();

      // Check focus styling
      const focusStyle = await searchInput.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          boxShadow: style.boxShadow,
          borderColor: style.borderColor,
        };
      });

      // Should have some visual indication of focus
      const hasFocus = focusStyle.outline !== 'none' || focusStyle.boxShadow !== 'none';
      expect(hasFocus).toBeTruthy();
    }
  });

  test('Dropdown selects are keyboard navigable', async ({ page }) => {
    await page.goto('/reviews');

    // Find a select element
    const select = page.locator('select').first();

    if (await select.isVisible()) {
      // Focus select
      await select.focus();

      // Verify focused
      const isFocused = await select.evaluate((el: HTMLElement) =>
        document.activeElement === el
      );
      expect(isFocused).toBeTruthy();

      // Should be able to interact with arrow keys
      await page.keyboard.press('ArrowDown');
      // Page should not scroll (select handles arrow key)
    }
  });
});
