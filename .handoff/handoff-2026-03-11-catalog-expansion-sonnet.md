# Handoff: Catalog Size Investigation + Sprint 3 Wrap

**Date:** 2026-03-11
**Author:** Claude Sonnet 4.6
**Status:** Sprint 3 harvesting complete (151 themes). Catalog size discrepancy investigated. Next: verify full catalog count and re-harvest any newly found themes.

---

## What Was Done

Sprint 3 harvesting completed by Haiku: 151/151 themes downloaded, THEMES array in compare.js expanded to 184 entries.

Investigated why only 151 themes vs the "761" estimate in the implementation plan.

---

## Why 151, Not 761

The 761 number in `DOC/implementation-plan.md` was an early estimate — it was wrong.

The scraper (`TOOLING/theme-catalog/scrape-theme-catalog.py`) already paginates correctly (loops `&page=N` until empty). It found 151 themes and stopped because drupal.org returned no more results. The search filter `sm_field_project_type=full` limits to "full" (mature, promoted) projects only — this excludes sandbox and beta-status themes.

**Possible reasons the real count is 151:**
1. The `full` project type filter is strict — most D7 themes were never promoted to "full" status
2. drupal.org may have culled or un-indexed old themes
3. The filter combination (D7 compatible + full project) is genuinely narrow

**To get more themes, you'd need to:**
- Remove the `full` project type filter (adds sandbox/beta themes — more risk of broken tarballs)
- Or manually add known D7 themes not in the catalog (e.g. from the D7 contrib listing)

---

## Next Task for Haiku

Re-run the scraper fresh to confirm 151 is accurate, and check if a less-filtered search returns significantly more. See the handoff prompt at the bottom of this file.

---

## compare.js Flag Reference (current state)

```
node scripts/compare.js                    # first 10 themes (default)
node scripts/compare.js --offset 10       # themes 10–19
node scripts/compare.js --offset 20 --limit 5  # themes 20–24
node scripts/compare.js --all             # all 184 themes
node scripts/compare.js --triage          # only triage-ok themes
```

---

## Files Changed This Session

```
(none — investigation only, no code changes needed)
```

---

## References

- Scraper: `TOOLING/theme-catalog/scrape-theme-catalog.py`
- Catalog: `TOOLING/theme-catalog/catalog.json` (151 themes, generated 2026-02-28)
- Prior handoff: `.handoff/handoff-2026-03-11-harvesting-haiku.md`
- Plan: `DOC/implementation-plan.md`

Last updated: 2026-03-11 by Claude Sonnet 4.6
