# East Coast Designers Website

Static marketing website for [East Coast Designers](https://www.eastcoastdesigners.com), a Connecticut renovation and construction firm.

**Source of truth:** [East_Coast_Designers_Brief.docx](East_Coast_Designers_Brief.docx). All page copy comes from Section 4 of the brief — verbatim, no paraphrasing.
**Implementation contract:** [PRD.md](PRD.md). Read before making changes.
**Known brief defects:** [BRIEF_ERRATA.md](BRIEF_ERRATA.md).
**Launch record:** [LAUNCH_DONE.md](LAUNCH_DONE.md) — what shipped, what was deferred, what's pending.

## Stack

- **Astro 5** static site generator
- **Vanilla CSS** with brand tokens (`src/styles/tokens.css`)
- **Playwright** for end-to-end content tests
- **Cloudflare Pages** for hosting (owner-controlled account)
- **GoDaddy** registrar, **Cloudflare** nameservers
- Canonical URL: `https://www.eastcoastdesigners.com` (apex redirects to www.)

## Develop

```bash
npm install
npm run dev               # Astro dev server at http://localhost:4321
```

## Test

```bash
npm test                  # runs Playwright (auto-starts dev server if needed)
BASE_URL=https://www.eastcoastdesigners.com npm test    # run against production
```

The Playwright suite is in `tests/content.spec.ts` and covers the insurance-critical assertions: forbidden strings absent, phone link present and clickable, schema.org type correct, no emails leaked. **All assertions must pass before deploy.**

To activate the address/PII checks, edit `tests/helpers.ts` locally and populate the `FORBIDDEN_ADDRESSES` and `FORBIDDEN_PII` arrays. Do NOT paste real values into commit messages or pull requests — local edit only.

## Build

```bash
npm run build             # outputs to ./dist
npm run preview           # serves ./dist for local preview of the production build
```

## Deploy (Cloudflare Pages)

The site is configured to deploy from the `main` branch of this repository. Cloudflare Pages build settings:

- **Framework:** Astro
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 20

DNS: nameservers for `eastcoastdesigners.com` point at the owner's Cloudflare account. The Cloudflare zone has CNAME records for both apex and `www` pointing at the Pages project, plus a redirect rule sending apex → `https://www.eastcoastdesigners.com` (www. is canonical because that's the URL the insurance underwriter has).

See [PRD.md](PRD.md) Section 8 for the full cutover runbook and rollback procedure.

## Hard constraints (don't violate)

- No email addresses anywhere on the site.
- No physical address anywhere on the site.
- No references to NY, NJ, Brooklyn, Manhattan, Park Avenue, Newport, or any non-CT location.
- No "interior design," "interior architecture," "decorating," or related design-only language.
- No fabricated testimonials.
- No stock photos on the Projects page (Services and Home may use neutral architectural stock labeled neutrally, never as "ECD project in [town]").
- schema.org `@type` must be `GeneralContractor` (not `ProfessionalService` or `InteriorDesignService`); `areaServed` must be Connecticut only.

The Playwright suite enforces all of the above. If a check fails, do not bypass — fix the content.
