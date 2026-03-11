# Handoff: compare.js --skip-existing flag

**Date:** 2026-03-11
**Author:** Claude Sonnet 4.6
**Status:** Flag added, ready to run triage on 154 new themes.

---

## What Was Done

Added `--skip-existing` flag to `scripts/compare.js`. Filters out any theme that already has `screenshots/backdrop/{theme}/meta.json`, meaning it was captured in a prior run.

This lets you run compare on only the new themes harvested in Sprint 3 without re-processing the original 30.

---

## How to Use

```bash
# Run all new themes (154 expected), no limit
node scripts/compare.js --skip-existing --all

# Or in batches of 20 — re-run the same command each time,
# it automatically advances as screenshots accumulate
node scripts/compare.js --skip-existing --limit 20
```

---

## Next: Review Results

After running, open the timestamped report in `reports/`. Look for:
- FAIL rows (white screens, Playwright errors) — themes that don't install cleanly
- Watchdog ERRORS — PHP deprecation noise vs real breakage
- Visual regressions vs the D7 side

Once reviewed, run `node scripts/triage.js` to update `TOOLING/theme-triage.json` with the new pass/fail data.

---

## Files Changed

```
scripts/compare.js   added --skip-existing flag (~5 lines)
```

---

## Catalog Scope (why 151)

Documented in `DOC/theme-catalog-schema.md` under "Catalog Scope: Why 151 Themes". Short version: the `full` project type filter on drupal.org is a real quality signal — only reviewed, promoted projects pass it. The ~600 excluded themes are mostly sandbox experiments. 151 is the right working set; the earlier "761" estimate was wrong.

## References

- Catalog scope doc: `DOC/theme-catalog-schema.md` (new section added this session)
- Prior handoff: `.handoff/handoff-2026-03-11-catalog-expansion-sonnet.md`
- Plan: `DOC/implementation-plan.md` (Sprint 3)

Last updated: 2026-03-11 by Claude Sonnet 4.6
