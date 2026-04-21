/**
 * QA Audit — post-overhaul regression tests
 * Covers the 6 areas described in the audit brief:
 *   1. Home page sections (À la une / Travaux choisis, no old labels)
 *   2. Moderation page removal
 *   3. Academic form structure (title, dropdown, résumé counter, optional theme, no extrait)
 *   4. Academic detail page (back link, French date, hidden theme when null, single-column, Markdown, edit button)
 *   5. Admin audience page (/admin/stats title, Umami link, dashboard card label)
 *   6. Markdown editor tabs and image insert button
 */

import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared mock academic work used across detail-page and form tests
// ---------------------------------------------------------------------------
const MOCK_ACADEMIC = {
  id: 'mock-uuid-123',
  title: 'La Métaphore dans la Poésie Symboliste',
  summary: 'Une étude sur le rôle central de la métaphore dans le mouvement symboliste.',
  content: '## Introduction\n\nLa métaphore est **fondamentale** dans la poésie symboliste.',
  workType: 'Mémoire',
  context: 'Master 2 Lettres',
  year: 2024,
  theme: null,
  sourceUrl: null,
  imageUrl: null,
  publishedAt: '2026-04-21T10:00:00.000Z',
  updatedAt: '2026-04-21T10:00:00.000Z',
  createdBy: 'devuser',
  isPublished: true,
  featured: true,
};

const MOCK_ACADEMIC_WITH_THEME = {
  ...MOCK_ACADEMIC,
  id: 'mock-uuid-456',
  theme: 'literature',
};

// ---------------------------------------------------------------------------
// 1. Home page sections
// ---------------------------------------------------------------------------
test.describe('Home page — section headings', () => {
  test('displays "À la une" heading for featured reviews', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'À la une' })).toBeVisible();
  });

  test('displays "Travaux choisis" heading for featured academics', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Travaux choisis' })).toBeVisible();
  });

  test('does NOT show old "Critiques récentes" heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Critiques récentes')).not.toBeVisible();
  });

  test('loading skeletons present during reviews fetch (aria-busy on section)', async ({ page }) => {
    // Intercept API to delay response — proves skeleton markup exists
    await page.route('**/api/reviews**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.fulfill({ json: { data: [], total: 0, page: 1, limit: 6, totalPages: 0 } });
    });
    await page.goto('/');
    // The section should carry aria-busy="true" while loading
    const reviewsSection = page.locator('[aria-labelledby="reviews-heading"]');
    await expect(reviewsSection).toHaveAttribute('aria-busy', 'true');
  });

  test('loading skeletons present during academics fetch (aria-busy on section)', async ({ page }) => {
    await page.route('**/api/academics**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.fulfill({ json: { data: [], total: 0, page: 1, limit: 6, totalPages: 0 } });
    });
    await page.goto('/');
    const academicsSection = page.locator('[aria-labelledby="academics-heading"]');
    await expect(academicsSection).toHaveAttribute('aria-busy', 'true');
  });
});

// ---------------------------------------------------------------------------
// 2. Moderation page removal
// ---------------------------------------------------------------------------
test.describe('Moderation page — removed', () => {
  test('/admin/moderation routes to 404 not-found page', async ({ page }) => {
    await page.goto('/admin/moderation');
    // Angular wildcard route renders the not-found component
    await expect(page.locator('#main-content')).toBeVisible();
    // URL should stay at /admin/moderation (no redirect) or be the 404 route
    const url = page.url();
    const isNotFound =
      url.includes('/admin/moderation') || url.includes('/404');
    expect(isNotFound).toBe(true);
    // The page must NOT render the admin dashboard grid
    await expect(page.getByRole('heading', { name: 'Admin' })).not.toBeVisible();
  });

  test('admin dashboard does NOT contain a "Moderation" card', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#main-content')).toBeVisible();
    // Wait for dashboard to render (it's inline template, no async fetch)
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /moderation/i })).not.toBeVisible();
    await expect(page.getByText(/moderation/i)).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 3. Academic form (#4)
// ---------------------------------------------------------------------------
test.describe('Academic form — create mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/academics/new');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('title shows "Nouveau travail académique" in create mode', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Nouveau travail académique' })).toBeVisible();
  });

  test('type de travail dropdown has exactly 12 options (excluding placeholder)', async ({ page }) => {
    const select = page.locator('#workType');
    await expect(select).toBeVisible();
    const options = select.locator('option');
    // 12 real options + 1 placeholder = 13 total
    await expect(options).toHaveCount(13);
  });

  test('workType dropdown includes all 12 expected values', async ({ page }) => {
    const expectedOptions = [
      'Dissertation',
      'Commentaire de texte',
      'Dossier thématique',
      'Mémoire',
      'Travail de recherche',
      'Synthèse',
      'Note de lecture',
      'Compte-rendu',
      'Communication',
      'Essai',
      'Rapport',
      'Autre',
    ];
    const select = page.locator('#workType');
    for (const option of expectedOptions) {
      await expect(select.locator(`option[value="${option}"]`)).toHaveCount(1);
    }
  });

  test('résumé counter turns red and shows error after 301 characters', async ({ page }) => {
    const textarea = page.locator('#summary');
    await textarea.fill('a'.repeat(301));
    // Counter text should show "301 / 300" and be red
    const counter = page.locator('[aria-live="polite"]');
    await expect(counter).toContainText('301');
    await expect(counter).toHaveClass(/text-red/);
    // Error message
    await textarea.blur();
    await expect(page.getByText('Résumé trop long (max 300 caractères)')).toBeVisible();
  });

  test('résumé counter is NOT red at exactly 300 characters', async ({ page }) => {
    const textarea = page.locator('#summary');
    await textarea.fill('a'.repeat(300));
    const counter = page.locator('[aria-live="polite"]');
    await expect(counter).toContainText('300');
    await expect(counter).not.toHaveClass(/text-red/);
  });

  test('Thème field is optional — form is valid without it', async ({ page }) => {
    // Fill required fields only, leave theme empty
    await page.locator('#title').fill('Test titre');
    await page.locator('#summary').fill('Un résumé valide pour le test.');
    await page.locator('#workType').selectOption('Essai');
    // Theme should be present but optional (no asterisk or required attribute)
    const themeSelect = page.locator('#theme');
    await expect(themeSelect).toBeVisible();
    // The label should NOT show asterisk or "required" indicator
    const themeLabel = page.locator('label[for="theme"]');
    await expect(themeLabel).not.toContainText('*');
    // Submit button should be enabled (form valid without theme)
    const submitBtn = page.getByRole('button', { name: 'Créer' });
    await expect(submitBtn).not.toBeDisabled();
  });

  test('no "Extrait" field is visible', async ({ page }) => {
    // Check no label or input with text "Extrait" or id "excerpt"
    await expect(page.getByLabel(/extrait/i)).not.toBeVisible();
    await expect(page.locator('#excerpt')).not.toBeVisible();
    await expect(page.getByText(/extrait/i)).not.toBeVisible();
  });
});

test.describe('Academic form — edit mode', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the GET academic by ID endpoint
    await page.route('**/api/academics/mock-uuid-123', (route) => {
      route.fulfill({ json: MOCK_ACADEMIC });
    });
    await page.goto('/academics/mock-uuid-123/edit');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('title shows "Modifier le travail" in edit mode', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Modifier le travail' })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 4. Academic detail page (#8)
// ---------------------------------------------------------------------------
test.describe('Academic detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/academics/mock-uuid-123', (route) => {
      route.fulfill({ json: MOCK_ACADEMIC });
    });
    await page.goto('/academics/mock-uuid-123');
    await expect(page.locator('#main-content')).toBeVisible();
    // Wait for article to render (API mock resolves immediately)
    await expect(page.locator('article')).toBeVisible();
  });

  test('back link says "← Travaux académiques"', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Travaux académiques/ });
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText('← Travaux académiques');
  });

  test('back link navigates to /academics', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Travaux académiques/ });
    await backLink.click();
    await expect(page).toHaveURL(/\/academics$/);
  });

  test('theme row is hidden when theme is null', async ({ page }) => {
    // MOCK_ACADEMIC has theme: null
    // The ng-container for theme should not render any theme text beyond workType/year
    const metadataRow = page.locator('p.tracking-widest');
    await expect(metadataRow).toBeVisible();
    // The separator before theme should not appear (3rd dot separator)
    // We check there's no extra content beyond workType and year
    const metadataText = await metadataRow.textContent();
    expect(metadataText).toContain('Mémoire');
    expect(metadataText).toContain('2024');
    // theme is null so theme text should not appear
    expect(metadataText).not.toContain('literature');
  });

  test('theme is shown when theme is present', async ({ page }) => {
    await page.route('**/api/academics/mock-uuid-456', (route) => {
      route.fulfill({ json: MOCK_ACADEMIC_WITH_THEME });
    });
    await page.goto('/academics/mock-uuid-456');
    await expect(page.locator('article')).toBeVisible();
    const metadataRow = page.locator('p.tracking-widest');
    const text = await metadataRow.textContent();
    expect(text).toContain('literature');
  });

  test('layout is single-column narrow (no sidebar grid)', async ({ page }) => {
    // page-container--narrow class signals single-column layout
    await expect(page.locator('.page-container--narrow')).toBeVisible();
    // No aside element (sidebar)
    await expect(page.locator('aside')).not.toBeVisible();
  });

  test('content renders as Markdown (not raw text)', async ({ page }) => {
    // MOCK_ACADEMIC.content has "## Introduction" and "**fondamentale**"
    // If rendered as Markdown: h2 and strong elements exist; raw text would not
    await expect(page.locator('article h2')).toBeVisible();
    await expect(page.locator('article strong')).toBeVisible();
    // Raw markdown syntax should NOT appear as literal text
    await expect(page.locator('article').getByText('## Introduction')).not.toBeVisible();
    await expect(page.locator('article').getByText('**fondamentale**')).not.toBeVisible();
  });

  test('edit button is visible at the bottom', async ({ page }) => {
    const editBtn = page.getByRole('link', { name: /modifier/i });
    await expect(editBtn).toBeVisible();
    // It should link to the edit route
    const href = await editBtn.getAttribute('href');
    expect(href).toContain('edit');
  });
});

// ---------------------------------------------------------------------------
// 5. Admin audience page (#3)
// ---------------------------------------------------------------------------
test.describe('Admin audience page (/admin/stats)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/stats');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('page title is "Audience"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Audience', level: 1 })).toBeVisible();
  });

  test('"Ouvrir Umami" link points to https://stats.remidarocha.fr', async ({ page }) => {
    const umamiLink = page.getByRole('link', { name: 'Ouvrir Umami' });
    await expect(umamiLink).toBeVisible();
    await expect(umamiLink).toHaveAttribute('href', 'https://stats.remidarocha.fr');
  });

  test('"Ouvrir Umami" link opens in new tab (target=_blank)', async ({ page }) => {
    const umamiLink = page.getByRole('link', { name: 'Ouvrir Umami' });
    await expect(umamiLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('Admin dashboard — Audience card', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
  });

  test('dashboard has an "Audience" card (not "Statistics")', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Audience' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /statistics/i })).not.toBeVisible();
  });

  test('"Audience" card links to /admin/stats', async ({ page }) => {
    const audienceCard = page.getByRole('link').filter({ has: page.getByRole('heading', { name: 'Audience' }) });
    await expect(audienceCard).toHaveAttribute('href', /\/admin\/stats/);
  });
});

// ---------------------------------------------------------------------------
// 6. Markdown editor tabs and image button (#6)
// ---------------------------------------------------------------------------
test.describe('Academic form — Markdown editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/academics/new');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('"Éditer" tab is visible and active by default', async ({ page }) => {
    const editTab = page.getByRole('tab', { name: 'Éditer' });
    await expect(editTab).toBeVisible();
    await expect(editTab).toHaveAttribute('aria-selected', 'true');
  });

  test('"Aperçu" tab is visible', async ({ page }) => {
    const previewTab = page.getByRole('tab', { name: 'Aperçu' });
    await expect(previewTab).toBeVisible();
    await expect(previewTab).toHaveAttribute('aria-selected', 'false');
  });

  test('"Insérer une image" button is visible in Edit tab', async ({ page }) => {
    const imageBtn = page.getByRole('button', { name: /insérer une image/i });
    await expect(imageBtn).toBeVisible();
  });

  test('"Insérer une image" button is hidden in Preview tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Aperçu' }).click();
    await expect(page.getByRole('tab', { name: 'Aperçu' })).toHaveAttribute('aria-selected', 'true');
    const imageBtn = page.getByRole('button', { name: /insérer une image/i });
    await expect(imageBtn).not.toBeVisible();
  });

  test('"Aperçu" tab renders Markdown content', async ({ page }) => {
    // Type markdown in the edit tab
    const contentTextarea = page.locator('#content');
    await contentTextarea.fill('## Test heading\n\nParagraph with **bold** text.');
    // Switch to preview
    await page.getByRole('tab', { name: 'Aperçu' }).click();
    // Markdown should be rendered
    const previewPanel = page.locator('#content-preview-panel');
    await expect(previewPanel).toBeVisible();
    await expect(previewPanel.locator('h2')).toBeVisible();
    await expect(previewPanel.locator('strong')).toBeVisible();
    // Raw markdown syntax should not be visible
    await expect(previewPanel.getByText('## Test heading')).not.toBeVisible();
  });

  test('switching back to Edit tab shows textarea again', async ({ page }) => {
    await page.getByRole('tab', { name: 'Aperçu' }).click();
    await page.getByRole('tab', { name: 'Éditer' }).click();
    await expect(page.locator('#content')).toBeVisible();
    await expect(page.getByRole('button', { name: /insérer une image/i })).toBeVisible();
  });
});
