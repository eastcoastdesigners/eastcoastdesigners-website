import { type Page, expect } from '@playwright/test';

/**
 * Page routes after the June 2026 dual-service expansion. Home rewritten as founder bio;
 * /construction and /interior-design replace the old single /services page. /about folded
 * into Home. /projects remains as unlisted placeholder (not in primary nav).
 */
export const PAGES = ['/', '/construction', '/interior-design', '/contact', '/projects', '/journal', '/our-work'] as const;

/**
 * Phone number in tel: format. Single source of truth for assertions.
 */
export const PHONE_TEL_HREF = 'tel:+12032289197';
export const PHONE_DISPLAY = '(203) 228-9197';

/**
 * Forbidden strings — case-insensitive. These must never appear anywhere in the rendered
 * HTML on any page. They map to the brief's Section 5 "things to remove or avoid" plus
 * the insurance-related geographic and service-area misrepresentations.
 */
export const FORBIDDEN_STRINGS: readonly string[] = [
  // 2026-06-16 second waiver: geographic forbids (NY, NJ, Brooklyn, Manhattan, Park
  // Avenue, Newport, "coastal markets") were REMOVED. Owner declared the practice
  // works the tri-state area and select projects nationwide, layering a second
  // insurance-coverage waiver on top of the first (see chat log). Geographic
  // strings the original carrier flagged are now legitimate scope claims.
  //
  // These three remain forbidden because they were specific fabrications on the
  // original LeadConnector site (curation services that were never offered, an
  // "HOA coordination" line that didn't exist):
  'art curation',
  'furniture curation',
  'landmark & hoa coordination',
];

/**
 * FORBIDDEN_ADDRESSES — street + town strings that must never appear in rendered HTML.
 *
 * Populated locally by the owner. Do NOT paste real addresses into commit messages,
 * pull requests, or chat. Edit this array in your local checkout, then commit the edit
 * as a single-line change with a generic message like `chore: populate forbidden list`.
 *
 * Empty array makes assertNoKnownAddresses() pass trivially — and that's fine, because
 * the owner walk-through is the real check until the array is populated.
 */
export const FORBIDDEN_ADDRESSES: string[] = [];

/**
 * FORBIDDEN_PII — full names that must never appear in rendered HTML.
 *
 * Populate locally with the owner's full name and her parents' full names — the original
 * site exposed personal info beyond just the address, and names are part of the same risk
 * surface. Same handling as FORBIDDEN_ADDRESSES: local edit only, never in chat/commits.
 */
export const FORBIDDEN_PII: string[] = [];

/**
 * Email-address regex. Catches real addresses without false-positiving on stray '@'
 * characters (e.g., Twitter handles, "Q&A" headings, attribute syntax). Anchored to
 * actual email syntax: local-part @ domain . tld(>=2).
 */
export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/**
 * Loop-and-assert one string at a time. Works around the documented Playwright bug where
 * not.toContainText(array) passes if any one element is absent rather than requiring all.
 * https://github.com/microsoft/playwright/issues/16083
 */
export async function assertNoForbiddenStrings(
  page: Page,
  strings: readonly string[] = FORBIDDEN_STRINGS,
): Promise<void> {
  const body = page.locator('body');
  const text = (await body.innerText()).toLowerCase();
  const html = (await page.content()).toLowerCase();
  for (const forbidden of strings) {
    const needle = forbidden.toLowerCase();
    expect(text, `forbidden string in rendered text: "${forbidden}"`).not.toContain(needle);
    // Also check raw HTML for attributes, alt text, meta tags, JSON-LD.
    expect(html, `forbidden string in raw HTML (attribute/meta/script): "${forbidden}"`)
      .not.toContain(needle);
  }
}

/**
 * No email addresses anywhere — checks rendered text + every href attribute + raw HTML
 * (to catch addresses in JSON-LD, OG tags, comments). Also confirms no mailto: hrefs.
 */
export async function assertNoEmails(page: Page): Promise<void> {
  const text = await page.locator('body').innerText();
  const html = await page.content();

  const textMatch = text.match(EMAIL_REGEX);
  expect(textMatch, `email leaked into rendered text: ${textMatch?.[0]}`).toBeNull();

  const htmlMatch = html.match(EMAIL_REGEX);
  expect(htmlMatch, `email leaked into raw HTML: ${htmlMatch?.[0]}`).toBeNull();

  const mailtoCount = await page.locator('a[href^="mailto:"]').count();
  expect(mailtoCount, 'mailto: links must not exist anywhere').toBe(0);
}

export async function assertNoKnownAddresses(page: Page): Promise<void> {
  if (FORBIDDEN_ADDRESSES.length === 0) return;
  await assertNoForbiddenStrings(page, FORBIDDEN_ADDRESSES);
}

export async function assertNoKnownPII(page: Page): Promise<void> {
  if (FORBIDDEN_PII.length === 0) return;
  await assertNoForbiddenStrings(page, FORBIDDEN_PII);
}

/**
 * Asserts the phone link is present and points at tel:+12032289197.
 */
export async function assertPhoneLinkPresent(page: Page): Promise<void> {
  const phoneLinks = page.locator(`a[href="${PHONE_TEL_HREF}"]`);
  const count = await phoneLinks.count();
  expect(count, `expected at least one tel: link to ${PHONE_TEL_HREF}`).toBeGreaterThan(0);
}

/**
 * Parses the JSON-LD script tag, returns the schema object. Throws if missing or invalid.
 */
export async function getSchemaOrg(page: Page): Promise<Record<string, unknown>> {
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(jsonLd, 'JSON-LD script tag must exist on every page').not.toBeNull();
  return JSON.parse(jsonLd!) as Record<string, unknown>;
}
