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
  '/': 'Connecticut Renovation & Construction | East Coast Designers',
  '/services': 'Renovation & Construction Services | East Coast Designers Connecticut',
  '/about': 'About | East Coast Designers — Connecticut Renovation & Construction',
  '/contact': 'Contact | East Coast Designers — (203) 228-9197',
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

    test('schema.org is GeneralContractor with Connecticut areaServed', async ({ page }) => {
      const schema = await getSchemaOrg(page);
      expect(schema['@type']).toBe('GeneralContractor');
      const areaServed = schema['areaServed'] as { name?: string } | undefined;
      expect(areaServed?.name).toBe('Connecticut');
      expect(schema['telephone']).toBe('+1-203-228-9197');
    });

    test('schema.org is not a forbidden type', async ({ page }) => {
      const schema = await getSchemaOrg(page);
      const forbiddenTypes = ['InteriorDesignService', 'ProfessionalService'];
      expect(forbiddenTypes).not.toContain(schema['@type']);
    });
  });
}

// Note: /projects was removed pre-launch. public/_redirects sends /projects → /
// (301). That redirect is honored by Cloudflare Pages in production, not by the
// local Astro dev server, so no automated assertion here. Verify manually against
// the deployed *.pages.dev URL after each build.

test('no testimonials, blockquotes, or fabricated quote markup anywhere', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const testimonialCount = await page.locator('.testimonial, .quote, blockquote').count();
    expect(testimonialCount, `${path} must not contain testimonial/quote markup`).toBe(0);
  }
});
