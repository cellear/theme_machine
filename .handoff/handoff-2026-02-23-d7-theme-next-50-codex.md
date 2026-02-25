# Handoff: D7 Theme Compat — Next 50 Candidate Queue (Backfilled)

**Date**: 2026-02-23
**Author**: codex
**Type**: backfilled handoff (missed at end of prior session)
**Prior sessions**:
- `HANDOFF/handoff-2026-02-22-codex-review-ddev-move-claude.md`
- `HANDOFF/handoff-2026-02-23-d7-theme-compat-four-themes-codex.md`
- `HANDOFF/handoff-2026-02-22-d7-theme-compat-bluebreeze-fixed-codex.md`

## What was attempted and outcome

Built a ranked shortlist of the next 50 Drupal 7 theme candidates to test with `d7_theme_compat`, using the full catalog dataset.

Outcome: completed and documented in two new files:
- `DOC/d7-theme-next-50.md`
- `DOC/d7-theme-next-50.tsv`

## What worked

1. Used `DOC/d7-theme-catalog.tsv` (761 projects) as the source set.
2. Excluded already imported/tested themes from `INCOMING/` to avoid rework.
3. Applied practical hard filters to drop obvious non-targets:
   - base/starter/framework/sub-theme families
   - admin/dashboard themes
   - explicit newer-Drupal marketing signals (8/9/10/11)
   - install-only listings
4. Scored remaining candidates with transparent compatibility heuristics:
   - simplicity keywords (`simple`, `clean`, `minimal`, `basic`, `classic`, `lightweight`)
   - generic layout/compatibility signals (`responsive`, `html5`, `css3`, `tableless`, `fluid`, `fixed width`)
   - slight age bonus for older listings
5. Produced a ranked top-50 queue in both human-readable (`.md`) and script-friendly (`.tsv`) formats.

## What did not work / caveats

- This ranking is metadata-driven, not runtime-verified.
- Some high-ranking themes may still be D6-internals-heavy or contain custom hooks that require extra compatibility work.
- Keyword filtering can produce false positives/negatives (for example, a project that mentions modern frameworks in text but still ships a D7-compatible code path).

## Current state and blockers

- Current candidate pool after filtering: **446 themes**.
- Ranked top 50 is ready for sequential clone/import/test automation.
- No technical blocker for starting implementation from the queue.

## Open questions

1. Keep strict score order for import, or split into batches (e.g., top 10 first) for faster feedback loops?
2. Should next pass add stronger penalties for known heavy families (for example, certain vendor/theme-shop ecosystems) to reduce expected breakage?
3. Should we auto-annotate queue entries with quick static signals (`core` value, template count, hook count) before cloning?

## Files created or modified

- `DOC/d7-theme-next-50.md` (created)
- `DOC/d7-theme-next-50.tsv` (created)

## References

- `DOC/d7-theme-catalog.md`
- `DOC/d7-theme-catalog.tsv`
- `DOC/incoming-theme-triage.md`
- `HANDOFF/handoff-2026-02-22-codex-review-ddev-move-claude.md`
- `HANDOFF/handoff-2026-02-23-d7-theme-compat-four-themes-codex.md`
