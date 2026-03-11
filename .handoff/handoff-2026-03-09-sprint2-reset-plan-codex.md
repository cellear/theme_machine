# Handoff: Sprint 2 Reset Plan

**Date:** 2026-03-09
**Author:** Codex
**Status:** Plan reset written. Ready to update the formal roadmap docs and execute the next sprint.

---

## What Was Done

Reviewed the recent March handoffs, current sprint documents, implementation-plan docs, and the actual comparison scripts to reconcile the written roadmap with the repo's real state.

Confirmed that Sprint 1 ended substantially ahead of the original written plan:
- comparison pipeline working for the initial 10-theme set
- layout/block parity fixes landed
- CSS/JS preprocess ordering bug identified and fixed
- D7 and Backdrop watchdog checks wired into the pipeline
- home-page screenshots removed in favor of the more useful node-page comparison flow
- report output switched to timestamped files

Based on that review, replaced the old "Sprint 2 = region labels + 45 common themes" direction with a new reset plan and saved it as:
- `DOC/sprint-2-reset-plan.md`

## The New Direction

The reset plan establishes three immediate workstreams:

1. **Scale validation**
   - Move from 10 themes to the 151 catalogued D7 themes
   - Make the report catalog-backed and triage-oriented

2. **Parity audit**
   - Investigate remaining visual differences before importing old Drupal 7 core CSS
   - Classify drift as CSS, markup, preprocess/order, or PHP/runtime issues

3. **Contributor documentation**
   - Produce an architecture brief for Backdrop core contributors explaining how the compat approach works, what broke, what was fixed, and what remains limited

## Why The Plan Changed

The written sprint docs had drifted from reality:
- `SPRINTS/sprint-2.md` still assumed region labels were the obvious next milestone
- `SPRINTS/sprint-3.md` still depended on home-page screenshots as the main scoring artifact
- `DOC/implementation-plan.md` still described the pre-fix version of the roadmap rather than the post-Sprint-1 state

The review conclusion was that the project should not spend the next sprint building synthetic debugging infrastructure by default when the real-content comparison pipeline is already producing strong results.

## Risks / Traps Called Out

- Planning against stale docs instead of current implementation
- Jumping straight to "all themes" without report-level triage categories
- Importing Drupal 7 core CSS before proving the remaining drift is actually CSS-driven
- Adding pixel scoring before the scaled report and parity audit are stable

## Files Created

- `DOC/sprint-2-reset-plan.md`
- `.handoff/handoff-2026-03-09-sprint2-reset-plan-codex.md`

## Recommended Next Steps

1. Update `DOC/implementation-plan.md` to align with the reset plan
2. Replace or rewrite `SPRINTS/sprint-2.md` around the 151-theme catalog validation milestone
3. Add report-scale improvements to `scripts/compare.js`
4. Start the parity audit on a representative subset of themes
5. Draft the contributor-facing architecture brief under `DOC/`

## References

- `DOC/sprint-2-reset-plan.md`
- `DOC/implementation-plan.md`
- `SPRINTS/sprint-2.md`
- `SPRINTS/sprint-3.md`
- `.handoff/handoff-2026-03-08-block-parity-claude.md`
- `.handoff/handoff-2026-03-08-report-tuning-claude.md`
- `.handoff/handoff-2026-03-08-layout-rebuild-claude.md`

Last updated: 2026-03-09 by codex
