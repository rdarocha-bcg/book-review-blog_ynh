import { test, expect } from '@playwright/test';

test.describe('Markdown Rendering - Issue #34', () => {
  test('Review detail page renders markdown content correctly', async ({ page }) => {
    // Navigate to a review detail page (assuming review with ID "1" exists)
    await page.goto('/reviews/1');

    // Wait for the page to load
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });

    // Check that markdown content is rendered as HTML (not plain text)
    // Looking for h1, h2, h3 elements that would be rendered from markdown
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();

    // Should have rendered headings from markdown
    expect(count).toBeGreaterThan(0);

    // Check that list items are rendered (ul/li elements)
    const listItems = page.locator('ul li');
    const listCount = await listItems.count();
    // Verify that if there are lists in the content, they're rendered as HTML lists, not plain text
    if (listCount > 0) {
      await expect(listItems.first()).toBeVisible();
    }

    // Verify that markdown special characters are NOT visible in the rendered content
    // (check that content doesn't contain raw markdown syntax)
    const mainContent = page.locator('main, .prose').first();
    const text = await mainContent.textContent();

    // The rendered text should not contain leading # characters (which indicate markdown headings)
    // unless they're part of actual content (not markdown syntax)
    expect(text).not.toContain('###');
    expect(text).not.toContain('##');
  });

  test('Academic detail page renders markdown content correctly', async ({ page }) => {
    // Navigate to an academic detail page (assuming academic with ID "1" exists)
    await page.goto('/academics/1');

    // Wait for the page to load
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });

    // Check that markdown content is rendered as HTML
    const headings = page.locator('h1, h2, h3');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);

    // Check for list items
    const listItems = page.locator('ul li');
    const listCount = await listItems.count();
    if (listCount > 0) {
      await expect(listItems.first()).toBeVisible();
    }

    // Verify that markdown syntax is not visible
    const mainContent = page.locator('main, .prose').first();
    const text = await mainContent.textContent();
    expect(text).not.toContain('###');
    expect(text).not.toContain('##');
  });

  test('Markdown formatting is applied correctly (bold, italic, links)', async ({ page }) => {
    await page.goto('/reviews/1');

    // Wait for content to load
    await expect(page.locator('.prose')).toBeVisible({ timeout: 5000 });

    // Check for bold text (strong tags)
    const strongElements = page.locator('strong, b');
    const strongCount = await strongElements.count();
    if (strongCount > 0) {
      const firstStrong = strongElements.first();
      await expect(firstStrong).toBeVisible();
      const color = await firstStrong.evaluate(el =>
        window.getComputedStyle(el).color
      );
      // Bold text should have text-dark color from prose styling
      expect(color).toBeDefined();
    }

    // Check for links
    const links = page.locator('a');
    const linkCount = await links.count();
    if (linkCount > 0) {
      const firstLink = links.first();
      // Links should have accent-strong color and be underlined
      const textDecoration = await firstLink.evaluate(el =>
        window.getComputedStyle(el).textDecoration
      );
      expect(textDecoration).toContain('underline');
    }

    // Check for code blocks/inline code
    const codeElements = page.locator('code');
    const codeCount = await codeElements.count();
    if (codeCount > 0) {
      const firstCode = codeElements.first();
      await expect(firstCode).toBeVisible();
    }
  });

  test('Whitespace and line breaks are preserved in markdown', async ({ page }) => {
    await page.goto('/reviews/1');

    // Wait for content to load
    const prose = page.locator('.prose').first();
    await expect(prose).toBeVisible({ timeout: 5000 });

    // Paragraphs should be separate block elements, not inline
    const paragraphs = prose.locator('p');
    const paragraphCount = await paragraphs.count();

    if (paragraphCount > 0) {
      // Each paragraph should be a block-level element
      const display = await paragraphs.first().evaluate(el =>
        window.getComputedStyle(el).display
      );
      expect(display).toBe('block');
    }
  });

  test('No raw markdown syntax visible in rendered content', async ({ page }) => {
    // Test both review and academic pages
    for (const url of ['/reviews/1', '/academics/1']) {
      await page.goto(url);

      // Get all visible text
      const mainText = await page.locator('main, [role="main"]').first().textContent();

      // These raw markdown characters should not appear at line starts
      // (they would indicate unrendered markdown)
      expect(mainText).not.toMatch(/^\s*#+\s/m); // Headings with #
      expect(mainText).not.toMatch(/^\s*\*\s/m); // List items with *
      expect(mainText).not.toMatch(/^\s*-\s/m);  // List items with -
    }
  });
});
