import { test, expect } from '@playwright/test';
import {
  PAGES,
  PHONE_TEL_HREF,
  PHONE_DISPLAY,
  assertNoForbiddenStrings,
  assertNoEmails,
  assertNoKnownAddresses,
  assertNoKnownPII,
  assertPhoneLinkPresent,
  getSchemaOrg,
} from './helpers';

/**
 * content.spec.ts — the insurance-critical assertions.
 *
 * Verifies for every page:
 *  - No forbidden geography (NY/NJ/etc.) or services (interior design/etc.)
 *  - No email addresses anywhere
 *  - No known historical addresses (owner-populated; empty by default)
 *  - No known PII names (owner-populated; empty by default)
 *  - Phone link present and pointed at tel:+12032289197
 *  - schema.org JSON-LD has @type GeneralContractor with areaServed Connecticut
 *  - Page-specific titles match the brief Section 4 verbatim
 */

const expectedTitles: Record<string, string> = {
  '/': 'Design + Build, Connecticut | East Coast Designers',
  '/construction': 'Construction — Additions, New Builds, Residential & Commercial | East Coast Designers',
  '/interior-design': 'Interior Design — Renderings, Sourcing, Full Service | East Coast Designers',
  '/contact': 'Contact | East Coast Designers — (203) 228-9197',
  '/projects': 'Recent Projects | East Coast Designers',
};

for (const path of PAGES) {
  test.describe(`page ${path}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test('has the exact title from the brief', async ({ page }) => {
      await expect(page).toHaveTitle(expectedTitles[path]);
    });

    test('contains no forbidden geographic or service strings', async ({ page }) => {
      await assertNoForbiddenStrings(page);
    });

    test('contains no email addresses', async ({ page }) => {
      await assertNoEmails(page);
    });

    test('contains no owner-supplied historical addresses', async ({ page }) => {
      await assertNoKnownAddresses(page);
    });

    test('contains no owner-supplied PII names', async ({ page }) => {
      await assertNoKnownPII(page);
    });

    test('has clickable phone link to (203) 228-9197', async ({ page }) => {
      await assertPhoneLinkPresent(page);
      // Also verify display text appears at least once
      const displayMatches = await page.getByText(PHONE_DISPLAY).count();
      expect(displayMatches, `expected "${PHONE_DISPLAY}" to appear in rendered text`).toBeGreaterThan(0);
    });

    test('has exactly one h1 in main content', async ({ page }) => {
      // Scoped to <main> so Astro's dev toolbar (or any future widget) can't false-positive.
      const h1Count = await page.locator('main h1').count();
      expect(h1Count, 'pages must have exactly one h1 inside <main>').toBe(1);
    });

    test('schema.org includes GeneralContractor + InteriorDesignService with Connecticut areaServed', async ({ page }) => {
      const schema = await getSchemaOrg(page);
      const type = schema['@type'];
      const types = Array.isArray(type) ? type : [type];
      expect(types, 'schema must declare GeneralContractor').toContain('GeneralContractor');
      expect(types, 'schema must declare InteriorDesignService').toContain('InteriorDesignService');
      const areaServed = schema['areaServed'] as { name?: string } | undefined;
      expect(areaServed?.name).toBe('Connecticut');
      expect(schema['telephone']).toBe('+1-203-228-9197');
    });

    test('schema.org does not declare ProfessionalService (carrier-flagged classification)', async ({ page }) => {
      const schema = await getSchemaOrg(page);
      const type = schema['@type'];
      const types = Array.isArray(type) ? type : [type];
      expect(types, 'schema must not use ProfessionalService').not.toContain('ProfessionalService');
    });
  });
}

test('projects page renders the placeholder, not a stock-photo grid', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.getByText(/New project gallery coming soon/i)).toBeVisible();

  // No img tags inside any element that looks like a project grid/gallery
  const galleryImgs = await page.locator('.project-grid img, .gallery img, [data-projects] img').count();
  expect(galleryImgs, 'projects page must not contain a project image grid').toBe(0);
});

test('no testimonials, blockquotes, or fabricated quote markup anywhere', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const testimonialCount = await page.locator('.testimonial, .quote, blockquote').count();
    expect(testimonialCount, `${path} must not contain testimonial/quote markup`).toBe(0);
  }
});
