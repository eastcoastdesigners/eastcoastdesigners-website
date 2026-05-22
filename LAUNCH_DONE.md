# Launch Done

**Build date:** 2026-05-22
**Status:** Local build complete, all tests green, ready for owner-driven cutover
**Compressed from:** PRD's original three-phase plan (Phase 1 / 2 / 3 + `PHASE_N_DONE.md`s) → single ship pass per owner's revised priority (workers comp underwriter going directly to `https://www.eastcoastdesigners.com`).

---

## What shipped

### Site (all 5 pages, copy verbatim from brief Section 4)

| File | Purpose |
|---|---|
| [src/pages/index.astro](src/pages/index.astro) | Home — hero, services snapshot, 3-step process, navy closing band |
| [src/pages/services.astro](src/pages/services.astro) | All 7 service blocks (whole-home renovations, kitchens, bathrooms, additions, basements, historic restorations, new construction) |
| [src/pages/about.astro](src/pages/about.astro) | "A Connecticut builder." + 3 principles + service-area statement |
| [src/pages/contact.astro](src/pages/contact.astro) | Phone-only contact; service area; hours |
| [src/pages/projects.astro](src/pages/projects.astro) | Placeholder treatment (off-white, navy monogram, brief's placeholder text — no stock photos) |

### Layout, components, styles

| File | Purpose |
|---|---|
| [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) | Wraps every page; injects Header, Footer, MetaTags, SchemaOrg, fonts, skip link |
| [src/components/Header.astro](src/components/Header.astro) | Navy header with logo (`-03`), nav, phone-on-right. Mobile wraps nav to second row at <720px (no hamburger — see Deferred). |
| [src/components/Footer.astro](src/components/Footer.astro) | Navy footer with logo, tagline, phone, copyright. No email, no address. |
| [src/components/PhoneLink.astro](src/components/PhoneLink.astro) | Single source of truth for `tel:+12032289197`. Every phone link on the site routes through this component. |
| [src/components/SchemaOrg.astro](src/components/SchemaOrg.astro) | JSON-LD: `GeneralContractor`, `addressRegion: CT`, `addressCountry: US`, `areaServed: Connecticut`, full `knowsAbout` list. `url` set to `https://www.eastcoastdesigners.com` (www. canonical). |
| [src/components/MetaTags.astro](src/components/MetaTags.astro) | Per-page title/description/canonical + Open Graph + Twitter card. Defaults canonical to `https://www.eastcoastdesigners.com`. |
| [src/components/GoldRule.astro](src/components/GoldRule.astro) | 1px gold divider, configurable width and alignment. |
| [src/components/ServiceCard.astro](src/components/ServiceCard.astro) | Card used in Home's services snapshot. |
| [src/styles/tokens.css](src/styles/tokens.css) | All brand tokens from brief Section 3: navy `#0F2A44`, gold `#C9A961`, off-white `#F5F2EC`, body `#333333`, muted `#6B6B6B`. Type stack: Playfair Display / Inter / Montserrat. |
| [src/styles/reset.css](src/styles/reset.css) | Minimal reset. |
| [src/styles/global.css](src/styles/global.css) | Base typography, links, focus state (gold outline), button styles, section utilities. |

### Logos

Source files in [src/assets/logos/](src/assets/logos/):
- `logo-on-navy.png` — copied from `East Cost Designers - logo-03.png` (silver+gold on navy)
- `logo-on-black.png` — copied from `East Cost Designers - logo-04.png`
- `logo-metallic.png` — copied from `East Cost Designers - logo-01.png`

### Tests

| File | Purpose |
|---|---|
| [playwright.config.ts](playwright.config.ts) | Playwright config. Auto-starts dev server unless `BASE_URL` env var is set. `testIgnore: ['**/deployment/old-site-pages/**']` so the historical capture doesn't false-positive forbidden-string assertions. |
| [tests/helpers.ts](tests/helpers.ts) | `FORBIDDEN_STRINGS` (16 entries), `FORBIDDEN_ADDRESSES: []` (owner-populated), `FORBIDDEN_PII: []` (owner-populated), `EMAIL_REGEX`, and assertion helpers. |
| [tests/content.spec.ts](tests/content.spec.ts) | 47 assertions across 5 pages: title, forbidden strings, no emails, no known addresses, no known PII, phone link present, single h1, schema type correct, schema areaServed Connecticut, schema not a forbidden type, projects-placeholder check, no testimonial markup anywhere. |

### Docs

- [README.md](README.md) — compressed dev/test/build/deploy guide
- [PRD.md](PRD.md) — full PRD with corrected Section 8 nameserver cutover runbook
- [BRIEF_ERRATA.md](BRIEF_ERRATA.md) — logo variant numbering correction
- [deployment/old-site-sitemap.md](deployment/old-site-sitemap.md) — pre-rewrite crawl + live-site risk findings
- [deployment/lighthouse-scores.md](deployment/lighthouse-scores.md) — local Lighthouse results

---

## What was tested

### Playwright content suite — **47 / 47 passing** (locally, against `npm run dev`)

Run command: `npm test`

All five pages were verified for:
- Exact title from brief Section 4
- No forbidden geographic strings (NY, NJ, Brooklyn, Manhattan, Park Avenue, Newport, coastal markets) — both rendered text and raw HTML
- No forbidden service strings (interior design, interior architecture, decorating, art curation, furniture curation, "luxury home renovation", "bespoke cabinetry & stonework", "landmark & HOA coordination")
- No email addresses anywhere (regex-based check on text + every `href` + raw HTML, plus `mailto:` link count = 0)
- No owner-supplied historical addresses *(constant is empty pending owner local edit — passes trivially today)*
- No owner-supplied PII names *(constant is empty pending owner local edit — passes trivially today)*
- Phone link `tel:+12032289197` present and at least one `(203) 228-9197` display string visible
- Exactly one `<h1>` inside `<main>` (scoped to avoid Astro dev toolbar false-positives)
- schema.org JSON-LD type is `GeneralContractor` with `areaServed.name === "Connecticut"` and `telephone === "+1-203-228-9197"`
- schema.org type is NOT `InteriorDesignService` or `ProfessionalService`

Plus two cross-page assertions:
- Projects page contains "New project gallery coming soon" text and zero project-grid `<img>` tags
- No `.testimonial`, `.quote`, or `<blockquote>` markup on any page

### Lighthouse — **all 5 pages clear 90+ on all four pillars**

See [deployment/lighthouse-scores.md](deployment/lighthouse-scores.md) for the full table. Headline: Home 91/93/96/100, all other pages 100/91-95/96/100.

### Production build — **clean**

`npm run build` outputs 5 static HTML pages and one optimized WebP image variant per logo size to `dist/`. No errors, no warnings beyond an `npm audit` moderate-severity finding that does not apply (we use neither `define:vars` nor server islands — see audit notes below).

### Manual checks not yet performed (pending the owner walk-through described in "Cutover" below)

- Owner reads through all 5 pages on the live deployed URL and confirms copy matches the brief verbatim
- Owner taps phone link on a real iOS device and a real Android device to confirm dialer triggers
- Owner populates `FORBIDDEN_ADDRESSES` and `FORBIDDEN_PII` constants locally and re-runs `npm test`

---

## Deferred (must read — none of this is blank by default)

Per the audit-log discipline established in the original PRD: every item below is an explicit acknowledgement of what is **not** in this ship, with a reason.

### Deferred to post-launch (owner / future iteration)

1. **Navy-on-light logo variant** (brief Section 3) — does not physically exist in the upload package; see [BRIEF_ERRATA.md](BRIEF_ERRATA.md). Header and footer both use the navy-background logo on a navy band, so the navy-on-light variant is not blocking. Owner exports from `East Cost Designers - logo.ai` when convenient (30-minute job in Illustrator or for a designer).
2. **Marbled hero treatment** (brief Section 4 hero, variants `-14`/`-15`) — does not exist in the upload package and was a "nice to have" only. The Phase 1 hero uses a solid navy background with the `-03` logo, which is exactly what the brief listed as the alternative ("OR a clean navy background with the gold-on-navy logo centered"). Not deferred *back* — just shipped via the brief-approved alternative.
3. **Proper hamburger / full-screen mobile menu** (brief Section 2) — the current header wraps the nav to a second row at <720px instead of using a hamburger disclosure. Functional and accessible (no horizontal scroll, all nav links visible, phone link clickable on mobile) but not the disclosure pattern the brief described. Post-launch polish; the underwriter using `www.eastcoastdesigners.com` is most likely viewing on desktop.
4. **Favicon set** (brief Section 7) — not generated for this ship. Browsers fall back to a default tab icon. 5-minute job post-launch: crop the monogram from any logo variant, run through [realfavicongenerator.net](https://realfavicongenerator.net), drop the output into `public/`, link from `BaseLayout.astro`.
5. **Stock architectural imagery on Home/Services** — not shipped. Owner's compressed plan said "ship without imagery beyond the logo, ship clean. Add photos later. Underwriters care about content accuracy, not photo galleries." This is intentional, not an oversight.
6. **Real project photography on Projects page** — placeholder is the spec. Real photos come whenever the half-day shoot the brief recommends actually happens.
7. **Lighthouse CI in GitHub Actions** — original PRD's Phase 3 item, removed under the compressed plan. Lighthouse was run manually once locally; scores are recorded in [deployment/lighthouse-scores.md](deployment/lighthouse-scores.md). Set up CI post-launch if regressions become a concern.
8. **`accessibility.spec.ts`, `responsive.spec.ts`, `seo.spec.ts`** — original PRD's three additional Playwright spec files, removed under the compressed plan. Their concerns are partially covered by Lighthouse's accessibility and SEO categories, and by `content.spec.ts`. Add them post-launch if specific regressions appear.
9. **`public/_redirects`** — not needed because the new site has the exact same 5 URL slugs as the old site (`/`, `/about`, `/contact`, `/projects`, `/services`). Apex-to-www redirect is set up as a Cloudflare DNS-layer rule, not as a Pages `_redirects` file (see cutover below). Add a `_redirects` file post-launch only if old URLs surface that we missed.
10. **`@astrojs/sitemap` integration** — original PRD Phase 3 item. Not strictly needed since the site is only 5 pages and search engines will find them. Add post-launch alongside Google Search Console submission.
11. **`FORBIDDEN_ADDRESSES` and `FORBIDDEN_PII` constants** are empty. Owner populates locally before her next test run. Until then, `assertNoKnownAddresses` and `assertNoKnownPII` pass trivially (helper functions return early when the array is empty). This is by design — see the comment block in [tests/helpers.ts](tests/helpers.ts).
12. **Manual address review** (acceptance checklist item #2 manual portion) — owner confirms during her final walk-through that no postal address is visible anywhere. To be recorded by appending to this file post-walk-through.
13. **Owner credit-card check** for recurring charges from WPMU DEV / Cloudflare / LeadConnector (the third-party dev's accounts) — independent of cutover, ~5 minutes on a statement. Out of developer scope, noted here as owner-side follow-up.
14. **Owner-side: notification to the insurance agent** that the site has been replaced and the schema.org classification is `GeneralContractor` with `areaServed: Connecticut`. Owner's conversation to have, not a deliverable of this build.

### Audit notes (not deferred, just disclosed)

- `npm audit` reports 1 moderate-severity vulnerability in Astro 5.x (the two CVEs are `GHSA-j687-52p2-xcff` — XSS in `define:vars`, and `GHSA-xr5h-phrj-8vxv` — server island encrypted parameter replay). **Neither applies to this site:** we use no `define:vars` directives, no server islands, no client-side rendering of user input. The fix (`astro@^6.3.7`) is a major version bump and was not pursued because it would block this same-day ship without addressing any real exposure. Upgrade in a separate post-launch pass.
- The dev-toolbar produces extra `<h1>` elements in development mode. The Playwright test for "exactly one h1" is scoped to `main h1` to be robust against this and any future widget injection.

### Live-site risks flagged during the crawl (owner action required after cutover, not part of build)

- The current homepage has a plaintext exposed email (`eastcoastdesigns@gmail.com` — a typo of the owner's real address `eastcoastdesigners@gmail.com`). This stays exposed until the nameserver change orphans the old site.
- The current stack (WPMU DEV nameservers → Cloudflare → LeadConnector) is on a third-party developer's accounts. After cutover, those services continue billing the third-party dev, not the owner. The owner's only follow-up is the credit-card check above.

---

## Verification evidence

| Evidence | Where |
|---|---|
| Playwright suite output: 47/47 passing | Run locally — `npm test`. Snapshot of last run noted in commit message of the launch commit. |
| Lighthouse scores: all 5 pages 90+ on all 4 pillars | [deployment/lighthouse-scores.md](deployment/lighthouse-scores.md) |
| Old-site crawl snapshot (preserves "before" state for audit) | [deployment/old-site-pages/](deployment/old-site-pages/) + [deployment/old-site-sitemap.md](deployment/old-site-sitemap.md) |
| Old-site capture UTC timestamp | [deployment/old-site-capture-date.txt](deployment/old-site-capture-date.txt) |
| Production build artifacts | `dist/` (gitignored; regenerate via `npm run build`) |
| Git commit history | `git log --oneline` |

---

## Cutover (owner-driven, after this file is committed)

The site cannot be deployed to `eastcoastdesigners.com` from this session because cutover requires the owner's own Cloudflare account credentials. The following steps are the owner's to execute. Developer is available to verify each step.

### Owner steps (in order)

1. **Create a Cloudflare account** at [cloudflare.com](https://cloudflare.com) using your own email. Free tier is fine.
2. **Create a GitHub repository** for this code (private is fine) and push the local `main` branch to it. From this directory:
   ```bash
   gh repo create eastcoastdesigners-website --private --source=. --remote=origin --push
   ```
   (Or do it via the GitHub web UI: create empty repo, then `git remote add origin <url> && git push -u origin main`.)
3. **In Cloudflare → Workers & Pages → Create application → Pages → Connect to Git**. Select the repo. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `20`
   - Hit **Save and Deploy**. First build takes ~2 minutes. Results in a `*.pages.dev` URL — confirm the site loads there.
4. **Add custom domains in Cloudflare Pages → Custom domains:** add both `eastcoastdesigners.com` AND `www.eastcoastdesigners.com`. Cloudflare will prompt you to either change nameservers or add CNAME records. Choose **nameserver change** — the next step does that.
5. **Cloudflare displays two nameservers** (something like `floyd.ns.cloudflare.com` and `nora.ns.cloudflare.com` — actual names vary per zone). **Copy them exactly.**
6. **In GoDaddy → My Products → Domains → eastcoastdesigners.com → Nameservers → Change:**
   - Currently set to `ns1.wpdns.host`, `ns2.wpdns.host`, `ns3.wpdns.host`
   - Change to the two Cloudflare nameservers from step 5
   - **Take a screenshot of the GoDaddy nameserver page before changing.** Save as `deployment/godaddy-nameservers-before.png` for rollback evidence.
   - Save.
7. **Wait for propagation.** Use [whatsmydns.net/#NS/eastcoastdesigners.com](https://www.whatsmydns.net/#NS/eastcoastdesigners.com) to watch globally. Typically 15 minutes – 2 hours depending on the WPMU DEV TTL. Cloudflare zone status goes from "Pending" to "Active" when ready.
8. **In Cloudflare → eastcoastdesigners.com → Rules → Redirect Rules → Create rule:**
   - Name: `apex-to-www`
   - When: Hostname **equals** `eastcoastdesigners.com`
   - Then: **Static** → URL redirect, Type **301**, Target: `https://www.eastcoastdesigners.com${http.request.uri.path}`
   - Save. This makes `https://www.eastcoastdesigners.com` the canonical URL (which is what the underwriter has).
9. **Verify the live URL.** Open `https://www.eastcoastdesigners.com` in incognito. Confirm:
   - New site renders
   - Valid TLS cert
   - Hitting `https://eastcoastdesigners.com` (apex) auto-redirects to `https://www.eastcoastdesigners.com`
10. **Re-run the test suite against production:**
    ```bash
    BASE_URL=https://www.eastcoastdesigners.com npm test
    ```
    All 47 assertions must pass against the live URL.

### Developer steps (after owner completes 1–10)

- Append to this file: a "Production verification" section with the production test run timestamp, Lighthouse scores against the live URL, and the JSON-LD validator result.
- Commit the appended LAUNCH_DONE.md and tag the commit `v1.0.0-launch`.

### Rollback (if anything is wrong after cutover)

In GoDaddy → Nameservers → Change → restore `ns1.wpdns.host`, `ns2.wpdns.host`, `ns3.wpdns.host` from the screenshot taken in step 6. Propagation is typically faster than the initial cutover. The old site comes back. Investigate, fix locally, re-cut over.
