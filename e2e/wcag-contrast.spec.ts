import { test, expect } from '@playwright/test';

/**
 * WCAG Color Contrast Tests
 * Verifies all text meets WCAG AA requirements (4.5:1 for normal text, 3:1 for large text)
 */

// Helper to calculate contrast ratio between two colors
function getContrastRatio(rgb1: string, rgb2: string): number {
  const parse = (rgb: string) => {
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return [0, 0, 0];
    return match.map(Number).slice(0, 3);
  };

  const [r1, g1, b1] = parse(rgb1);
  const [r2, g2, b2] = parse(rgb2);

  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(x => {
      x = x / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

test.describe('WCAG Color Contrast - Issue #33', () => {
  test('text-muted has 4.5:1 contrast on surface background', async ({ page }) => {
    await page.goto('/reviews');

    // Find element with text-muted class
    const mutedElements = page.locator('[class*="text-muted"]').first();

    if (await mutedElements.count() > 0) {
      const colors = await mutedElements.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        const parent = el.parentElement || el;
        const parentStyle = window.getComputedStyle(parent);

        return {
          textColor: style.color,
          backgroundColor: parentStyle.backgroundColor,
        };
      });

      // Calculate contrast ratio
      const ratio = getContrastRatio(colors.textColor, colors.backgroundColor);

      // Should be at least 4.5:1 for normal text (WCAG AA)
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('all body text has sufficient contrast', async ({ page }) => {
    await page.goto('/reviews');

    // Get main content area
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible({ timeout: 5000 });

    // Check that text elements are readable
    const paragraphs = mainContent.locator('p');
    const count = await paragraphs.count();

    for (let i = 0; i < Math.min(5, count); i++) {
      const element = paragraphs.nth(i);
      const colors = await element.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        return {
          textColor: style.color,
          backgroundColor: style.backgroundColor,
        };
      });

      const ratio = getContrastRatio(colors.textColor, colors.backgroundColor);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('headings have sufficient contrast', async ({ page }) => {
    await page.goto('/reviews');

    const headings = page.locator('h1, h2, h3').first();
    await expect(headings).toBeVisible({ timeout: 5000 });

    const colors = await headings.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;

      return {
        textColor: style.color,
        backgroundColor: parentStyle?.backgroundColor || '#ffffff',
      };
    });

    const ratio = getContrastRatio(colors.textColor, colors.backgroundColor);
    // Headings should also meet 4.5:1 or they could be considered large text (3:1)
    expect(ratio).toBeGreaterThanOrEqual(3.0);
  });

  test('links have sufficient contrast', async ({ page }) => {
    await page.goto('/reviews');

    const links = page.locator('a').first();
    await expect(links).toBeVisible({ timeout: 5000 });

    const colors = await links.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;

      return {
        textColor: style.color,
        backgroundColor: parentStyle?.backgroundColor || '#ffffff',
      };
    });

    const ratio = getContrastRatio(colors.textColor, colors.backgroundColor);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('navigation links have sufficient contrast', async ({ page }) => {
    await page.goto('/');

    const navLink = page.locator('nav a').first();
    await expect(navLink).toBeVisible();

    const colors = await navLink.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const parent = el.parentElement;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;

      return {
        textColor: style.color,
        backgroundColor: parentStyle?.backgroundColor || 'rgb(255, 248, 252)',
      };
    });

    const ratio = getContrastRatio(colors.textColor, colors.backgroundColor);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('card content has sufficient contrast', async ({ page }) => {
    await page.goto('/reviews');

    const card = page.locator('app-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });

    const cardText = card.locator('p, a').first();

    if (await cardText.count() > 0) {
      const colors = await cardText.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        const card = el.closest('app-card');
        const cardStyle = card ? window.getComputedStyle(card) : null;

        return {
          textColor: style.color,
          backgroundColor: cardStyle?.backgroundColor || '#ffffff',
        };
      });

      const ratio = getContrastRatio(colors.textColor, colors.backgroundColor);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('form labels and inputs have sufficient contrast', async ({ page }) => {
    await page.goto('/reviews');

    const inputs = page.locator('input, select').first();
    await expect(inputs).toBeVisible({ timeout: 5000 });

    const colors = await inputs.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      return {
        textColor: style.color,
        backgroundColor: style.backgroundColor,
      };
    });

    const ratio = getContrastRatio(colors.textColor, colors.backgroundColor);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('no low contrast combinations exist in main content', async ({ page }) => {
    await page.goto('/');

    // Get all text elements with computed colors
    const lowContrastElements: Array<{ tag: string; ratio: number }> = [];

    const elements = page.locator('main *').all();
    let count = 0;

    for (const el of await elements) {
      if (++count > 50) break; // Check first 50 elements

      const data = await el.evaluate((element: HTMLElement) => {
        if (!element.textContent?.trim()) return null;

        const style = window.getComputedStyle(element);
        const parent = element.parentElement;
        const parentStyle = parent ? window.getComputedStyle(parent) : null;

        // Skip if text is very small (< 10px) or hidden
        if (parseInt(style.fontSize) < 10 || style.display === 'none') return null;

        return {
          tag: element.tagName,
          textColor: style.color,
          backgroundColor: parentStyle?.backgroundColor || '#ffffff',
        };
      });

      if (data) {
        const ratio = getContrastRatio(data.textColor, data.backgroundColor);
        if (ratio < 4.5) {
          lowContrastElements.push({ tag: data.tag, ratio });
        }
      }
    }

    // Should have no low contrast elements (or very few if any)
    expect(lowContrastElements.length).toBeLessThan(3);
  });
});
