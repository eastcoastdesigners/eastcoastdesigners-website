# Lighthouse Scores — Local Pre-Launch Run

**Run date:** 2026-05-22 (UTC)
**Method:** `lighthouse <url> --quiet --chrome-flags="--headless=new"` against `astro preview` server (production build) on `http://localhost:4322`.
**Chrome version:** Chromium 148 (via Playwright's Chrome for Testing binary).
**Categories:** performance, accessibility, best-practices, seo. **Pass threshold per brief Section 8:** all four ≥ 90.

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| `/` (Home) | **91** | **93** | **96** | **100** |
| `/about` | **100** | **95** | **96** | **100** |
| `/contact` | **100** | **91** | **96** | **100** |
| `/projects` | **100** | **95** | **96** | **100** |
| `/services` | **100** | **95** | **96** | **100** |

**Result:** all 20 cells ≥ 90. Brief Section 8 item #12 (Lighthouse 90+ across all four pillars on all pages) — satisfied.

## Notes

- Raw JSON reports are excluded from git (large; ~400 KB each). They live at `.lighthouse-local/*.json` on the developer's machine if needed for diagnostics. Re-run anytime via `npx lighthouse <url> --output=json --output-path=...`.
- Re-run against production after DNS cutover to confirm scores hold under real network conditions. Production scores are typically equal-or-higher than local (better caching headers, real CDN edge).
- The Home page's Performance score (91) is the lowest of the set — the navy hero and three additional sections create more total work than the simpler interior pages. Still above the 90 threshold. If post-launch performance dips below 90, look at the Google Fonts preconnect + font-display=swap configuration first.
