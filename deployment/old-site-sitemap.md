# Old Site Sitemap — eastcoastdesigners.com (pre-rewrite capture)

**Captured:** see [old-site-capture-date.txt](old-site-capture-date.txt) (UTC)
**Method:** `curl -sL` of homepage, then breadth-first crawl of internal `href` values discovered there.
**Purpose:** Source list for the `_redirects` mapping in Phase 3. The captured HTML in `old-site-pages/` is **historical artifact only** — it contains forbidden content (NY/NJ refs, the exposed email, fabricated testimonial) and must be excluded from Playwright test runs via `testIgnore` in `playwright.config.ts`.

---

## URL inventory

| Old URL | HTTP | Captured file | Proposed redirect target | Notes |
|---|---|---|---|---|
| `/` | 200 | [old-site-pages/index.html](old-site-pages/index.html) | `/` (no redirect needed — same slug) | Home page, ~329 KB shell + LeadConnector JS bundle |
| `/about` | 200 | [old-site-pages/about.html](old-site-pages/about.html) | `/about` (no redirect needed) | Title rendered client-side (empty in raw HTML) |
| `/contact` | 200 | [old-site-pages/contact.html](old-site-pages/contact.html) | `/contact` (no redirect needed) | Title rendered client-side |
| `/projects` | 200 | [old-site-pages/projects.html](old-site-pages/projects.html) | `/projects` (no redirect needed) | Title rendered client-side |
| `/services` | 200 | [old-site-pages/services.html](old-site-pages/services.html) | `/services` (no redirect needed) | Title rendered client-side |

**Discovery completeness:** All internal `href` values pointing to `eastcoastdesigners.com` from the homepage were followed. No sitemap.xml or robots.txt is exposed by the current site. No additional internal URLs discovered.

**`_redirects` implication:** The new site's 5-page structure is a **1:1 match** with the old site's URL slugs. No path-level 301s are required. Only consider:
- `www.eastcoastdesigners.com` → `eastcoastdesigners.com` (or vice versa) — pick canonical host in Phase 3
- Trailing-slash normalization (`/services/` → `/services`) — Cloudflare Pages handles this automatically

---

## Old-page titles (where present in raw HTML)

| Page | `<title>` captured |
|---|---|
| `/` | `Luxury Home Renovation & Remodeling \| East Coast Designers` |
| `/about` | *(empty — rendered client-side)* |
| `/contact` | *(empty — rendered client-side)* |
| `/projects` | *(empty — rendered client-side)* |
| `/services` | *(empty — rendered client-side)* |

The old homepage title contains the term "Luxury Home Renovation & Remodeling" — exactly the kind of misrepresentation the new site replaces. The new homepage title (per PRD Section 5) is `Connecticut Renovation & Construction | East Coast Designers`.

---

## ⚠️ Live-site risks discovered during crawl

These are real findings from the captured HTML that the owner should be aware of. Flagged per PRD Section 6 instruction.

### Risk 1 (HIGH) — Plaintext email address still exposed on homepage

The current homepage contains, in its embedded page data:

```
Email: eastcoastdesigns@gmail.com
Phone: (203) 228-9197
```

This is present both as **plaintext** within a LeadConnector page-data JSON blob AND as a **Cloudflare-obfuscated** `data-cfemail` attribute (which decodes back to the same address). Cloudflare's obfuscation is anti-scraper-bot protection, not anti-disclosure — the address is fully exposed to any human visitor and to AI/search crawlers that render JavaScript.

**Action required by owner:** None for the new site (which excludes email entirely per brief). But the current live site continues to expose this address until DNS cutover completes. If the address is being actively scraped for spam, the urgency is "cut over as soon as Phase 3 is verified," not "wait." Note: the spelling is `eastcoastdesigns` (no final "ers") — confirm with owner whether this is her actual address.

### Risk 2 (MEDIUM) — Current site is hosted on LeadConnector (HighLevel funnel builder)

The captured HTML and outbound asset URLs are dominated by `leadconnectorhq.com` domains (`backend.`, `images.`, `services.`, `stcdn.`). The site is a hosted SaaS funnel page, not a static deployment.

**Action required by owner:**
- LeadConnector likely has a recurring subscription that will continue billing after DNS cutover unless explicitly cancelled. Cutting over DNS only redirects visitors; it does not stop the LeadConnector subscription.
- LeadConnector may also be the source of any CRM/lead data — confirm whether any leads have been captured there historically (the live site has no visible forms, but the platform may have had them earlier).
- Cancel/downgrade the LeadConnector subscription **after** DNS cutover succeeds and the new site is verified live. Don't cancel before — the broken site at the old URL is still better than no site at all during the cutover window.

### Risk 3 (LOW) — Current site is already served via Cloudflare (cf-ray header present)

The current site is fronted by Cloudflare (visible in `cf-ray` and `cf-cache-status` response headers), with origin appearing to be Google Cloud (`via: 1.1 google`). This is likely Cloudflare's free CDN in front of the LeadConnector origin, configured at some point on the eastcoastdesigners.com zone.

**Action required by owner:** Confirm whether eastcoastdesigners.com is currently using Cloudflare nameservers OR a GoDaddy CNAME pointing at Cloudflare's edge. If on Cloudflare nameservers, the cutover plan in PRD Section 8 changes — instead of editing GoDaddy DNS, the change happens in the existing Cloudflare zone's DNS panel. Either path works for Cloudflare Pages, but the runbook needs to be tightened once we know which it is.

### Risk 4 (NONE — clean) — No active contact forms

Scanned all 5 captured pages for `<form>`, `<input>`, `mailto:` — **all zero**. No active lead-capture mechanism is currently running on the site that would silently keep collecting leads after cutover. This is the one piece of good news.

---

## What we did NOT capture (intentionally)

- LeadConnector JS bundle content (`stcdn.leadconnectorhq.com/_preview/*.js`) — third-party, not the owner's IP, not relevant to redirect mapping.
- Cloudflare/LeadConnector cookies set during the crawl — discarded.
- Rendered (post-JS) DOM — the captured HTML is the pre-render shell only. For full readable content, a headless-browser snapshot would be needed; not required for redirect mapping purposes.

---

**Crawl integrity:** This capture was performed once at the timestamp in [old-site-capture-date.txt](old-site-capture-date.txt) and is locked in. Do not re-run after Phase 3 DNS cutover — the URLs will resolve to the new site by then.
