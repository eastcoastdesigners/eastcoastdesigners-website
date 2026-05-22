# Product Requirements Document
**Project:** East Coast Designers Website Rewrite
**Domain:** eastcoastdesigners.com
**Source of truth:** [East_Coast_Designers_Brief.docx](East_Coast_Designers_Brief.docx)
**Date:** May 2026
**Status:** Awaiting approval before code

---

## 1. Project Overview

Rebuild eastcoastdesigners.com as a 5-page static marketing website that accurately describes East Coast Designers as a Connecticut renovation and construction firm. The current site is AI-generated and contains factual inaccuracies — wrong services, wrong geography, exposed personal contact info, and stock photos misrepresented as real projects — which is actively causing problems with the business insurance carrier. This rebuild prioritizes factual accuracy and a defensible paper trail over visual novelty: the existing navy/gold brand identity is preserved, the copy in Section 4 of the brief is used verbatim, and the 12-item acceptance checklist in Section 8 of the brief is the binding definition of done. Whether the schema.org classification (`GeneralContractor` / `HomeAndConstructionBusiness`) matches the insurance policy is a separate conversation between the owner and her insurance agent — this PRD only commits to making the site accurately describe the actual business.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Site generator | **Astro 5** | Component model for shared header/footer/nav across 5 pages; built-in `astro:assets` image pipeline (WebP + responsive `srcset`) needed to hit Lighthouse 90+ on performance; zero JS shipped by default; first-class Cloudflare Pages adapter |
| Styling | **Plain CSS** (custom properties for the brand tokens), scoped within `.astro` components | No framework overhead, no Tailwind dependency, easy for any future developer to maintain; brand tokens from Section 3 of the brief become CSS custom properties in a single `tokens.css` file |
| Interactivity | **Vanilla JS** (mobile menu only) | The only client-side behavior is the hamburger overlay. No bundler-heavy framework needed |
| Hosting | **Cloudflare Pages** | Unlimited bandwidth on free tier (matters if insurance carrier or agent reviews the site and drives unexpected traffic); fastest TTFB; works cleanly with GoDaddy DNS via an A/CNAME record — no nameserver transfer, GoDaddy stays the registrar |
| Domain registrar | **GoDaddy (existing)** | Unchanged. Privacy/proxy and renewal settings stay where they are |
| CI / quality gates | **GitHub Actions** running **Lighthouse CI** (`@lhci/cli` 0.15.x) | Enforces the Section 8 requirement of Lighthouse 90+ across performance, accessibility, best practices, SEO as a CI failure, not a hope |
| End-to-end testing | **Playwright** + **@axe-core/playwright** | Encodes the 12-item acceptance checklist as runnable tests; axe-core catches accessibility issues Lighthouse misses |
| Fonts | **Google Fonts** — Playfair Display (headings), Inter (body), Montserrat (small caps labels) | Matches the brand pairing in Section 3 of the brief |
| Analytics | **None at launch** (GA4 optional, deferred to post-launch) | Brief says "no tracking pixels beyond basic analytics" — defer the decision until the site is stable |

**Explicitly not used:** Flask, PostgreSQL, Railway, Cloudflare R2, any auth library, any CMS, any form handler, Tailwind, React, Next.js, Vercel, Netlify, Puppeteer.

**Project frameworks (Superpowers / GSD):** Skipped at the full-ceremony level — overkill for a 5-page brochure with finalized copy. **However**, the verification-per-phase discipline is preserved manually: each of the three phases ends by committing a `PHASE_N_DONE.md` to the repo root listing what was built, what was tested, and what was deferred. This creates an audit log that can be shown to the insurance carrier if needed.

---

## 3. Core Features (Prioritized)

### Feature 1 — Truthful content + correct legal/SEO scaffolding (highest priority)
This is the actual reason the project exists.
- All copy on all 5 pages is the verbatim text from Section 4 of the brief. No paraphrasing, no "improvements."
- Schema.org JSON-LD on every page using `GeneralContractor` type with `areaServed: { "@type": "State", "name": "Connecticut" }`. Never `ProfessionalService` or `InteriorDesignService`.
- Per-page meta title and description from Section 4.
- Zero occurrences of forbidden strings anywhere in the rendered HTML: `interior design`, `interior architecture`, `decorating`, `New York`, `New Jersey`, `Brooklyn`, `Manhattan`, `Park Avenue`, `Newport`, `coastal markets`.
- Zero occurrences of any email address anywhere in rendered text or `href` attributes, detected with the regex `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/` (catches real addresses without false-positiving on stray `@` symbols).
- Zero occurrences of known historical addresses — specifically the owner's parents' home address (street + town) that previously leaked on the current site. Owner provides the exact string(s); they go into a `FORBIDDEN_ADDRESSES` constant in [tests/helpers.ts](tests/helpers.ts).
- "No postal address anywhere" in the broader sense (any future or unknown address) is a manual review item recorded in `PHASE_3_DONE.md`, since reliable address detection requires NER and is out of scope.
- Verified by `content.spec.ts` via Playwright (automated portion) plus the owner's final walk-through (manual portion).

### Feature 2 — Phone-only contact, prominent and clickable on every surface
- `(203) 228-9197` wrapped in `tel:+12032289197` appears in: desktop header (right side), desktop footer, hero CTA on Home, Contact page body, **and inside the mobile menu overlay**. The mobile menu overlay is where click-to-call matters most.
- No email address, no physical address, no contact form, no map embed, no social links anywhere on the site.
- Verified by `content.spec.ts` (presence + `tel:` href correctness) and `responsive.spec.ts` (mobile menu overlay contains the phone link at 375px).

### Feature 3 — Honest Projects page + correct logo-on-background usage
- Projects page (`/projects`) ships with the placeholder treatment from Section 4 of the brief: off-white background (`#F5F2EC`), navy monogram centered, single message `New project gallery coming soon. To request photos of recent work or discuss a project of your own, call (203) 228-9197.` **No stock interior photos labeled as ECD projects.**
- **Important distinction:** Services and Home pages **may** use neutral, generic architectural stock photography as long as nothing in the surrounding markup, alt text, or caption implies "this is our project in [town]." Captions like `Kitchen renovation` are acceptable; captions like `East Coast Designers project in Greenwich` are not. The Projects page is the only page subject to the strict placeholder treatment.
- Logo variant rules from Section 3 of the brief are enforced:
  - Navy backgrounds → `East_Cost_Designers_-_logo-03.png`
  - White/light backgrounds → `East_Cost_Designers_-_logo-09.png` or `-10.png`
  - Black backgrounds → `East_Cost_Designers_-_logo-04.png` or `-06.png`
  - Hero marbled treatment → `-14.png` or `-15.png`
  - Favicon → cropped monogram exported at 32×32 and 192×192
- Verified by `content.spec.ts` (Projects page contains placeholder text and no `<img>` tags within a `.project-grid` or similar pattern) and manual visual QA before deploy.

### Hard constraint (not a feature, but binding)
The 12-item acceptance checklist in Section 8 of the brief is the launch gate. The Playwright suite + Lighthouse CI must verify all 12 items pass before DNS is cut over. No exceptions.

---

## 4. File Structure

Standard Astro project layout. Files marked `*` are created in Phase 1; `**` in Phase 2; `***` in Phase 3.

```
eastcoastdesigners-website/
├── PRD.md                                  (this file)
├── East_Coast_Designers_Brief.docx         (source of truth, do not modify)
├── PHASE_1_DONE.md                         *  audit log: what shipped in MVP
├── PHASE_2_DONE.md                         ** audit log: what shipped in polish
├── PHASE_3_DONE.md                         *** audit log: what shipped at launch
├── README.md                               *  how to run, build, test, deploy
├── .gitignore                              *
├── package.json                            *
├── astro.config.mjs                        *
├── tsconfig.json                           *
├── playwright.config.ts                    *
├── lighthouserc.cjs                        ***
├── .github/
│   └── workflows/
│       ├── ci.yml                          ***  Lighthouse CI + Playwright on PR
│       └── deploy-staging.yml              *    auto-deploy to *.pages.dev preview
├── public/
│   ├── favicon.ico                         **
│   ├── favicon-32x32.png                   **
│   ├── favicon-192x192.png                 **
│   ├── apple-touch-icon.png                **
│   ├── robots.txt                          ***
│   └── sitemap.xml                         (auto-generated by @astrojs/sitemap)
├── src/
│   ├── assets/
│   │   ├── logos/                          *  16 logo variants from /ECD LOGO & VECTORS/
│   │   └── images/                         ** any neutral stock used on Home/Services
│   ├── styles/
│   │   ├── tokens.css                      *  brand color + type custom properties
│   │   ├── reset.css                       *  minimal reset
│   │   └── global.css                      *  base typography, link, focus styles
│   ├── components/
│   │   ├── Header.astro                    *  logo + nav + phone
│   │   ├── Footer.astro                    *  logo + phone + tagline + copyright
│   │   ├── MobileMenu.astro                ** hamburger + full-screen overlay
│   │   ├── PhoneLink.astro                 *  single source of truth for tel: link
│   │   ├── SchemaOrg.astro                 *  GeneralContractor JSON-LD
│   │   ├── MetaTags.astro                  *  title, description, OG, Twitter card
│   │   ├── GoldRule.astro                  *  1px gold horizontal divider
│   │   └── ServiceCard.astro               *  used on Home services snapshot
│   ├── layouts/
│   │   └── BaseLayout.astro                *  wraps every page: Header + slot + Footer
│   └── pages/
│       ├── index.astro                     *  Home (/)
│       ├── projects.astro                  *  Projects (/projects)  — placeholder
│       ├── services.astro                  *  Services (/services)
│       ├── about.astro                     *  About (/about)
│       └── contact.astro                   *  Contact (/contact)
└── tests/
    ├── helpers.ts                          *  exports FORBIDDEN_STRINGS, FORBIDDEN_ADDRESSES, EMAIL_REGEX + assertNoForbiddenStrings/assertNoEmails/assertNoKnownAddresses helpers
    ├── content.spec.ts                     *  Phase 1: forbidden strings, phone, schema, no mailto
    ├── accessibility.spec.ts               ** Phase 2: axe-core per page, alt text, keyboard nav
    ├── responsive.spec.ts                  ** Phase 2: mobile menu at 375px, layout at 768/1280/1920
    └── seo.spec.ts                         *** Phase 3: unique titles/metas, single H1, OG tags, areaServed
```

---

## 5. Page Routes

Five pages. Each one has the meta tags below (verbatim from Section 4 of the brief), exactly one `<h1>`, and a `GeneralContractor` JSON-LD block in the `<head>`.

| Route | File | Title | Meta description |
|---|---|---|---|
| `/` | [src/pages/index.astro](src/pages/index.astro) | `Connecticut Renovation & Construction \| East Coast Designers` | `East Coast Designers is a Connecticut renovation and construction firm. Whole-home renovations, kitchens, baths, additions, basements, and new builds — statewide CT.` |
| `/projects` | [src/pages/projects.astro](src/pages/projects.astro) | `Recent Projects \| East Coast Designers` | `Recent renovation and construction projects across Connecticut. Whole-home renovations, kitchens, baths, additions, and new builds.` |
| `/services` | [src/pages/services.astro](src/pages/services.astro) | `Renovation & Construction Services \| East Coast Designers Connecticut` | `Whole-home renovations, kitchens, bathrooms, additions, basements, historic restorations, and new construction across Connecticut.` |
| `/about` | [src/pages/about.astro](src/pages/about.astro) | `About \| East Coast Designers — Connecticut Renovation & Construction` | `A Connecticut renovation and construction firm focused on careful work, clear communication, and homes built to last.` |
| `/contact` | [src/pages/contact.astro](src/pages/contact.astro) | `Contact \| East Coast Designers — (203) 228-9197` | `Call East Coast Designers at (203) 228-9197 to discuss a renovation, addition, or new construction project in Connecticut.` |

**Schema.org JSON-LD (every page, via `SchemaOrg.astro`):**
```json
{
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "name": "East Coast Designers",
  "description": "Connecticut renovation and construction firm. Whole-home renovations, kitchens, baths, additions, basements, historic restorations, and new construction across Connecticut.",
  "telephone": "+1-203-228-9197",
  "url": "https://eastcoastdesigners.com",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "CT",
    "addressCountry": "US"
  },
  "areaServed": { "@type": "State", "name": "Connecticut" },
  "knowsAbout": [
    "Renovations", "Additions", "Kitchen Remodeling",
    "Bathroom Remodeling", "Basement Finishing",
    "Historic Restoration", "New Home Construction"
  ]
}
```

The `address` block uses `addressRegion` + `addressCountry` only — no street, no city, no postal code. That satisfies Google Rich Results recommendations without leaking a physical address, and is the truthful answer to "where do you operate" (Connecticut, US).

**Open Graph + Twitter card (every page, via `MetaTags.astro`):** uses the navy-background logo for `og:image`. Page-specific `og:title` and `og:description` mirror the meta tags above.

**301 redirects:** any old URL paths from the previous site that no longer exist need a redirect to the closest match (most likely `/`). Done in [public/_redirects](public/_redirects) at deploy time once the old URL list is gathered from the current live site.

---

## 6. Phased Roadmap

Three phases. Each phase ends with a verification step and a committed `PHASE_N_DONE.md` artifact. Do not start the next phase until the previous phase's `DONE.md` is committed.

### `PHASE_N_DONE.md` format (binding for all three phases)

Every `PHASE_N_DONE.md` must contain these sections, in this order. **The "Deferred" section is never blank by default** — if nothing is deferred, write the literal sentence `Nothing deferred. Phase complete as specified.` An empty Deferred section is not acceptable; an explicit acknowledgement is.

1. **What shipped** — bullet list of every file created or modified in this phase, with one-line purpose each.
2. **What was tested** — bullet list of every spec file run, every Lighthouse audit, and every manual check performed, with the result of each (pass / fail / skipped + reason).
3. **Deferred to next phase / post-launch** — bullet list of every item that was in scope but is being explicitly pushed to a later phase or to post-launch, with the reason. Examples: "Favicons → Phase 2 (asset generation pipeline not set up yet)", "Additional 301 redirects discovered after crawl → post-launch (only base 5 routes mapped in Phase 3)". **If nothing is deferred, write the literal sentence above.**
4. **Verification evidence** — links to test logs, screenshots, Lighthouse score JSON, or staging URLs that prove the phase's verification step actually passed. Not a summary — actual artifacts.

The audit log is only useful if it's complete and honest.

### Phase 1 — Truthful site, end-to-end, on staging (ships end of session today)

**Goal:** A factually correct version of all 5 pages is deployed to a Cloudflare Pages preview URL (`*.pages.dev`) and the most insurance-critical assertions pass. The current eastcoastdesigners.com is **not** touched yet — staging only.

**Files to create, in order:**
1. [package.json](package.json), [astro.config.mjs](astro.config.mjs), [tsconfig.json](tsconfig.json), [.gitignore](.gitignore) — Astro scaffold via `npm create astro@latest`
2. [src/styles/tokens.css](src/styles/tokens.css) — brand colors and font stacks from Section 3 as CSS custom properties
3. [src/styles/reset.css](src/styles/reset.css), [src/styles/global.css](src/styles/global.css)
4. [src/components/PhoneLink.astro](src/components/PhoneLink.astro) — single source of truth for `(203) 228-9197` → `tel:+12032289197`
5. [src/components/SchemaOrg.astro](src/components/SchemaOrg.astro) — the JSON-LD block
6. [src/components/MetaTags.astro](src/components/MetaTags.astro) — title, description, basic OG tags
7. [src/components/Header.astro](src/components/Header.astro) — logo (use white-bg variant), nav links, phone on right
8. [src/components/Footer.astro](src/components/Footer.astro) — logo, phone, tagline, copyright; no email, no address
9. [src/components/GoldRule.astro](src/components/GoldRule.astro), [src/components/ServiceCard.astro](src/components/ServiceCard.astro)
10. [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) — wraps Header + `<slot />` + Footer; injects MetaTags + SchemaOrg
11. [src/assets/logos/](src/assets/logos/) — copy in the 16 logo files provided by the owner (the silver+gold metallic variants, navy-on-light variants, on-black variants, marbled hero treatments, and the monogram). Source files are dropped manually into the repo at `assets/logos-source/` first, then the specific variants referenced by the site are copied into `src/assets/logos/` with cleaner filenames (e.g., `logo-on-navy.png`, `logo-on-light.png`, `logo-on-black.png`, `logo-marbled-hero.png`, `monogram.png`).
12. [src/pages/index.astro](src/pages/index.astro) — Home, verbatim copy from Section 4 of the brief
13. [src/pages/services.astro](src/pages/services.astro) — Services, verbatim
14. [src/pages/about.astro](src/pages/about.astro) — About, verbatim
15. [src/pages/contact.astro](src/pages/contact.astro) — Contact, verbatim
16. [src/pages/projects.astro](src/pages/projects.astro) — placeholder treatment only
17. [playwright.config.ts](playwright.config.ts)
18. [tests/helpers.ts](tests/helpers.ts) — `assertNoForbiddenStrings(page, strings: string[])` that loops and asserts one-at-a-time (works around the [Playwright `not.toContainText` array bug](https://github.com/microsoft/playwright/issues/16083))
19. [tests/content.spec.ts](tests/content.spec.ts) — forbidden strings absent, phone present & clickable on all 5 pages, schema type is `GeneralContractor`, no `mailto:` anywhere
20. [.github/workflows/deploy-staging.yml](.github/workflows/deploy-staging.yml) — auto-deploy to Cloudflare Pages preview on push
21. [README.md](README.md) — how to run, build, test, deploy
22. [deployment/old-site-sitemap.md](deployment/old-site-sitemap.md) — **capture this in Phase 1 while the old site is still live.** Crawl `eastcoastdesigners.com` (use [xml-sitemaps.com](https://www.xml-sitemaps.com/) or `wget --spider --recursive --no-verbose`) and record every URL the old site exposes. This list is the source material for the `_redirects` file in Phase 3. Also save a full-page screenshot of each old page in `deployment/old-site-screenshots/` as a defensible "before" record. The moment DNS flips, these URLs are gone for crawling — capture now.

**Verification step:**
- `npm run build` succeeds with no errors
- `npm run test` — all `content.spec.ts` assertions pass against `http://localhost:4321` (Astro dev server)
- Site deploys to `eastcoastdesigners.pages.dev` (or whatever Cloudflare assigns)
- Manual walk-through: open all 5 pages in a browser, confirm copy matches the brief, confirm phone link works on iOS Safari

**Artifact:** Commit [PHASE_1_DONE.md](PHASE_1_DONE.md) listing every file created, every test that passed, the staging URL, and anything explicitly deferred to Phase 2 or 3.

---

### Phase 2 — Polish: mobile, accessibility, imagery, favicons

**Goal:** The site is responsive across all four breakpoints, accessible to WCAG 2.1 AA, and visually finished. Still deployed only to staging.

**Files to create, in order:**
1. [src/components/MobileMenu.astro](src/components/MobileMenu.astro) — hamburger button, full-screen overlay with nav links + phone link, vanilla JS toggle. Phone link inside the overlay is non-negotiable.
2. Update [src/components/Header.astro](src/components/Header.astro) — show hamburger below 768px, show desktop nav above
3. Responsive CSS in [src/styles/global.css](src/styles/global.css) — mobile-first, with breakpoints at 768px, 1280px, 1920px per Section 7
4. [src/assets/images/](src/assets/images/) — any neutral, generic architectural stock for Home/Services (labeled neutrally, e.g., `alt="Kitchen renovation"` — never `alt="ECD project in [town]"`)
5. Optimize all images via Astro's `<Image />` component from `astro:assets` (WebP with JPG fallback per Section 7)
6. [public/favicon.ico](public/favicon.ico), [public/favicon-32x32.png](public/favicon-32x32.png), [public/favicon-192x192.png](public/favicon-192x192.png), [public/apple-touch-icon.png](public/apple-touch-icon.png) — generated from the monogram crop
7. Update [src/components/MetaTags.astro](src/components/MetaTags.astro) — full Open Graph (og:title, og:description, og:image, og:type) + Twitter card tags
8. [tests/accessibility.spec.ts](tests/accessibility.spec.ts) — `@axe-core/playwright` scan on every page, assert every `<img>` has non-empty `alt`, assert keyboard navigation reaches every interactive element and shows a visible gold focus outline
9. [tests/responsive.spec.ts](tests/responsive.spec.ts) — at 375px the hamburger is visible and opens the overlay; the phone link inside the overlay has the correct `tel:` href; layout doesn't break (no horizontal scroll) at 375/768/1280/1920

**Verification step:**
- All Phase 2 specs pass locally
- Manual: open the staging URL on a real phone (or DevTools device emulation), open the mobile menu, tap the phone link — confirm it triggers the dialer
- Manual: tab through every page with the keyboard, confirm visible focus state on every interactive element

**Artifact:** Commit [PHASE_2_DONE.md](PHASE_2_DONE.md) listing every file created/updated, every spec that passed, and any visual decisions made (e.g., which logo variant landed on which surface).

---

### Phase 3 — Launch: full acceptance checklist + DNS cutover

**Goal:** All 12 items in Section 8 of the brief verified. Lighthouse 90+ enforced in CI. DNS cut over from the current broken site to the new one.

**Files to create, in order:**
1. [lighthouserc.cjs](lighthouserc.cjs) — `staticDistDir: 'dist'`, assertions enforcing performance ≥ 0.9, accessibility ≥ 0.9, best-practices ≥ 0.9, SEO ≥ 0.9 across all 5 pages
2. [.github/workflows/ci.yml](.github/workflows/ci.yml) — on PR: install, build, run Playwright, run Lighthouse CI; all must pass to merge. Uses `fetch-depth: 20` on checkout to avoid the LHCI "could not find hash" issue.
3. [tests/seo.spec.ts](tests/seo.spec.ts) — unique `<title>` per page (matches the table in Section 5 above), unique meta description per page, exactly one `<h1>` per page, Open Graph tags present and correct, JSON-LD parses and `areaServed.name === "Connecticut"`
4. [public/_redirects](public/_redirects) — 301s from any old URLs identified by crawling the current live site
5. [public/robots.txt](public/robots.txt) — allow all, point at sitemap
6. `@astrojs/sitemap` integration → auto-generates `/sitemap.xml`
7. Validate the JSON-LD once manually at [validator.schema.org](https://validator.schema.org) and Google's [Rich Results Test](https://search.google.com/test/rich-results)

**Verification step:**
- All 12 items in the Acceptance Checklist Mapping table (Section 7 below) pass
- Lighthouse CI in GitHub Actions shows green on all 4 pillars on all 5 pages
- DNS cutover follows the runbook in Section 8 — staging is verified first, then DNS flips

**Artifact:** Commit [PHASE_3_DONE.md](PHASE_3_DONE.md) listing every spec that passed, the Lighthouse scores per page, the date/time of DNS cutover, the staging URL that was verified, and a one-line confirmation per acceptance checklist item.

---

## 7. Acceptance Checklist Mapping

Maps each of the 12 items in Section 8 of the brief to the spec file (or manual step) that verifies it. **Every row must be green before DNS cutover.**

| # | Acceptance checklist item | Verified by | Phase |
|---|---|---|---|
| 1 | No email address appears anywhere on the site | `content.spec.ts` — `assertNoEmails(page)`: assert no `mailto:` href, and assert the regex `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/` matches nothing in rendered text or `href` attributes on all 5 pages | 1 |
| 2 | No physical address appears anywhere on the site | **Automated:** `content.spec.ts` — `assertNoKnownAddresses(page)`: assert that owner-supplied historical addresses (specifically the previously-leaked parents' home address, street + town) appear nowhere on any page. **Manual:** owner confirms during final walk-through that no postal address is visible anywhere; recorded as a one-line confirmation in `PHASE_3_DONE.md` (general address detection requires NER and is out of scope) | 1 (automated) + 3 (manual) |
| 3 | No mention of NY, NJ, Brooklyn, Manhattan, Newport, or any non-CT location | `content.spec.ts` — `assertNoForbiddenStrings(page, ['New York', 'New Jersey', 'Brooklyn', 'Manhattan', 'Park Avenue', 'Newport', 'coastal markets', 'NY', 'NJ'])` on every page | 1 |
| 4 | No mention of "interior design," "interior architecture," "decorating," or related design-only services | `content.spec.ts` — `assertNoForbiddenStrings(page, ['interior design', 'interior architecture', 'decorating', 'art curation', 'furniture curation'])` on every page (case-insensitive) | 1 |
| 5 | Service area is described as Connecticut only | `seo.spec.ts` — parse JSON-LD and assert `areaServed.name === "Connecticut"` on every page | 3 |
| 6 | Schema.org type is `GeneralContractor` or `HomeAndConstructionBusiness` | `content.spec.ts` (Phase 1, basic presence) + `seo.spec.ts` (Phase 3, parsed and validated) | 1 + 3 |
| 7 | Phone number (203) 228-9197 is clickable on every page | `content.spec.ts` — assert `a[href="tel:+12032289197"]` present on every page; `responsive.spec.ts` — same assertion inside the mobile menu overlay at 375px | 1 + 2 |
| 8 | Logo renders correctly on all background colors | Manual visual QA against Section 3 logo-variant table — recorded in `PHASE_2_DONE.md` (automated visual regression is out of scope for this site) | 2 |
| 9 | Projects page does not contain stock photos misrepresented as our work | `content.spec.ts` — assert Projects page contains placeholder text and zero `<img>` tags within a project-grid pattern | 1 |
| 10 | No fabricated testimonials | `content.spec.ts` — assert no `<blockquote>` or testimonial-pattern markup on any page (placeholder pattern: no element with class `testimonial` or `quote`) | 1 |
| 11 | Mobile menu works at 375px width | `responsive.spec.ts` — set viewport to 375×667, click hamburger, assert overlay is visible and contains nav links + phone link | 2 |
| 12 | All pages pass Lighthouse with 90+ scores (performance, accessibility, best practices, SEO) | Lighthouse CI in `ci.yml` — assertions in `lighthouserc.cjs` fail the build if any pillar drops below 0.9 on any page | 3 |

---

## 8. Deployment Runbook

**Critical:** the current eastcoastdesigners.com is causing insurance problems. A half-deployed new site that's also broken would be worse than the current state. **Always verify on staging first, then flip.**

### Step 1 — Build and deploy to Cloudflare Pages staging (Phase 1)
1. Push the repo to a GitHub repository (private is fine).
2. In Cloudflare Pages dashboard → **Create a project** → **Connect to Git** → select the repo.
3. Build settings: framework = **Astro**, build command = `npm run build`, build output directory = `dist`, Node version = 20.
4. First build deploys to `<project-name>.pages.dev`. Confirm the site loads and all 5 pages render.
5. **Do not connect the custom domain yet.** The staging URL is the verification target for Phases 1 and 2.

### Step 2 — Verify staging meets the acceptance checklist (end of Phase 3)
1. Run `npx playwright test --config=playwright.config.ts` with `BASE_URL=https://<project-name>.pages.dev` — all four spec files must pass.
2. Run Lighthouse CI against the staging URL — all 5 pages must hit 90+ on all 4 pillars.
3. Manually validate the JSON-LD at [validator.schema.org](https://validator.schema.org) using the staging URL.
4. Manually open the staging URL on a real iOS device and a real Android device — confirm mobile menu, phone dialer, and rendering.
5. Have the owner do a final read-through of all 5 pages on staging. Confirm no copy was paraphrased or "improved."
6. Only after **all of the above pass**, proceed to Step 3.

### Step 3 — DNS cutover from GoDaddy to Cloudflare Pages
**Approach:** keep GoDaddy as the registrar (do not transfer the domain, do not change nameservers). Use GoDaddy's DNS panel to point the existing A/CNAME records at Cloudflare Pages.

1. In Cloudflare Pages → project → **Custom domains** → **Set up a custom domain** → enter `eastcoastdesigners.com` and `www.eastcoastdesigners.com`. Cloudflare displays the exact CNAME (or A record) target to use.
2. **Take screenshots of the current GoDaddy DNS records before changing anything.** Save them in the repo as `deployment/godaddy-dns-before.png` for rollback.
3. In the GoDaddy DNS panel:
   - For `eastcoastdesigners.com` (root): replace the existing A record with the Cloudflare-provided target (likely a CNAME flattening — Cloudflare gives the exact value)
   - For `www.eastcoastdesigners.com`: replace the existing CNAME with the Cloudflare-provided CNAME target
   - Lower TTL to 600 seconds before the change so the propagation window is short
4. Wait for propagation (5–15 minutes typically). Verify with `dig eastcoastdesigners.com` and `dig www.eastcoastdesigners.com`.
5. Cloudflare automatically issues a free SSL certificate. Wait for it to provision (usually <5 minutes after DNS resolves) — the custom-domain status in the dashboard goes from "Verifying" to "Active."
6. Open `https://eastcoastdesigners.com` in a fresh browser (no cache) and confirm the new site loads, with a valid TLS certificate.
7. Re-run the Playwright suite against the production URL: `BASE_URL=https://eastcoastdesigners.com npx playwright test`. All four spec files must still pass.
8. Restore the TTL to a normal value (3600+ seconds) in GoDaddy.

### Step 4 — Rollback procedure (if anything is wrong after cutover)
1. In GoDaddy DNS, restore the original A and CNAME records from the screenshots taken in Step 3.2. Propagation is fast because TTL was lowered.
2. The old site comes back. Investigate, fix on staging, re-verify, re-cut over.

### Step 5 — Post-launch (within 24 hours, developer-scoped)
1. Submit the new sitemap to Google Search Console.
2. Request re-indexing of the 5 main URLs in Search Console (to overwrite the old site's cached content as fast as possible).
3. Confirm GoDaddy domain privacy/proxy is still active.

**Out of developer scope (owner follow-ups):** Notifying the insurance agent that the site has been replaced is the owner's separate conversation and is not part of this build. Noted here only as a reminder to the owner, not as a deliverable.

---

## Approval

This PRD is awaiting approval. No code is written until approved. After approval:
- Phase 1 begins immediately, with the goal of a deployed staging URL by end of session today.
- Each phase ends with the verification step and a committed `PHASE_N_DONE.md` before the next phase starts.
