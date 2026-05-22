# Brief Errata

**Source document:** [East_Coast_Designers_Brief.docx](East_Coast_Designers_Brief.docx)
**Date errata recorded:** 2026-05-22
**Recorded by:** Developer (with owner approval)

This file documents corrections to the original handoff brief that were identified during PRD review. **The original brief is preserved unmodified** as the historical handoff artifact. The PRD and the implementation reflect these corrections.

---

## Erratum 1 — Logo variant numbering (Section 3 of brief)

### What the brief says

Section 3 of the brief specifies logo variants by numbered filename:

| Context | Brief says |
|---|---|
| Navy background (header on dark sections) | `East_Cost_Designers_-_logo-03.png` |
| White / light background (main header, footer) | `East_Cost_Designers_-_logo-09.png` OR `-10.png` |
| Black background (rare, hero overlays) | `East_Cost_Designers_-_logo-04.png` OR `-06.png` |
| Hero / decorative marbled background | `East_Cost_Designers_-_logo-14.png` OR `-15.png` |

### What's actually on disk

The asset folder ([ECD LOGO & VECTORS/eastcoastdesignerslogojpgandtransparentlogos/](ECD%20LOGO%20%26%20VECTORS/eastcoastdesignerslogojpgandtransparentlogos/)) contains:

- **Numbered standalone logo files:** only `East Cost Designers - logo-01` through `-04` (PNG + JPG each). Variants `-06`, `-09`, `-10`, `-14`, `-15` **do not exist.**
- **Lettered files:** `b1.jpg`, `d2.jpg`, `p1.jpg`, `t1.jpg`, `t2.jpg`, `w1.jpg`, `w2.jpg`, `w3.jpg`, `w4.jpg`. These are mockup photographs (storefront signage, business cards, t-shirts, marbled-treatment renderings) — explicitly marked in Section 6 of the brief as "for reference only, not site use." They are not standalone exportable logo variants.
- **Source files:** `East Cost Designers - logo.ai` (Adobe Illustrator master) and `East Cost Designers - logo.pdf` (vector PDF). Additional variants can be exported from these.

### Root cause

When the brief's Section 3 logo table was written, the visual variety across all 16 uploaded image files was mentally indexed by sequential numbers (-09, -10, -14, -15), but the actual delivered upload package only contained 4 numbered logo variants (-01 to -04) plus 9 lettered mockup photographs. The brief conflated mockup imagery with exportable logo variants.

### Resolution

**Phase 1 (current scope):** Use only the variants that physically exist.

| Surface | Phase 1 file used | Phase 2 plan |
|---|---|---|
| Navy backgrounds | `East Cost Designers - logo-03.png` ✓ | Unchanged |
| Black backgrounds | `East Cost Designers - logo-04.png` ✓ (or `-01.png`) | Unchanged |
| White / light backgrounds | **No suitable file exists.** Phase 1 uses plain navy text in place of the logo on light surfaces, OR falls back to `-03` on a small navy band within the header. | **Owner exports navy-on-light variant from the `.ai` master before Phase 2** (or hands the `.ai` to a designer for a 30-minute job). |
| Hero marbled treatment | **Skipped.** Phase 1 hero uses a solid navy background with `-03`. | Marbled treatment is deferred indefinitely — revisit post-launch only if the owner exports it from the master. It was a "nice to have," not a requirement. |
| Favicon | Cropped monogram from the `.ai` master, exported at 32×32 and 192×192. | Same. |

**Audit trail:** This erratum is referenced from:
- [PRD.md](PRD.md) Section 3, Feature 3
- `PHASE_1_DONE.md` Deferred section (will list: "Logo variants -09/-10 navy-on-light and -14/-15 marbled hero — to be exported from .ai master before Phase 2")

---

## Erratum 2 — Filename spacing (minor, documentation-only)

### What the brief says

Brief Section 6 lists files as `East_Cost_Designers_-_logo-01.png` (with underscores).

### What's actually on disk

Files are named `East Cost Designers - logo-01.png` (with spaces).

### Resolution

When copying into `src/assets/logos/`, files are renamed to clean kebab-case (e.g., `logo-on-navy.png`, `logo-on-light.png`) so the codebase doesn't carry spaces in import paths. The original on-disk filenames are preserved in `assets/logos-source/` for archival. No functional impact.

---

## How to add future errata

If you discover additional discrepancies between the brief and reality during the build:
1. Add a new `## Erratum N` section above with: **What the brief says** / **What's actually on disk (or what's true)** / **Resolution** / **Audit trail**.
2. Update the PRD to reference the new erratum where relevant.
3. Note the addition in the relevant `PHASE_N_DONE.md` so the audit trail is complete.

The goal is that the brief + this errata file + the PRD together always describe a coherent, accurate picture of the project as actually built.
