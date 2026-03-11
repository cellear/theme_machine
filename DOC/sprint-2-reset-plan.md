# Sprint 2 Reset Plan

## Summary

Sprint 1 should be treated as complete. The next roadmap is no longer "region labels + 45 common themes" as originally written. The work now splits into three tracks that reflect what Sprint 1 actually proved:

1. Scale validation from 10 themes to the **151 catalogued D7 themes**
2. Run a **parity audit** to identify the remaining visual drift before changing CSS behavior
3. Produce a concise **architecture brief** for Backdrop core contributors

This resets Sprint 2 around the current implementation and removes stale assumptions from the older sprint docs.

## Roadmap

### 1. Scale validation to the 151-theme catalog milestone

- Replace the hardcoded 10-theme list in `scripts/compare.js` with a catalog-backed list
- Treat 151 catalogued D7 themes as the next milestone, not an immediate jump to an undefined long tail
- Keep the current node-page comparison pipeline as the baseline artifact
- Add per-theme classification in the report:
  - rendered cleanly
  - rendered with PHP/log noise
  - failed to render
  - major visual mismatch
  - manual review needed
- Improve the report for large runs:
  - table of contents
  - summary counts by status
  - filtering or grouping by status
  - anchors for each theme section

### 2. Audit visual parity before importing Drupal 7 core CSS

- Do not import old Drupal 7 core CSS as the default next step
- First review a representative sample of themes:
  - near-perfect matches
  - acceptable-but-off matches
  - worst mismatches
- For each mismatch, classify the likely cause:
  - Backdrop core CSS drift versus Drupal 7 core CSS
  - markup or wrapper differences
  - preprocess / asset-order differences
  - theme-specific PHP 8.3 issues
- Capture examples that show whether the fix belongs in:
  - `d7_theme_compat`
  - environment/layout parity
  - an optional D7 core-style shim
- Only propose a CSS import or shim if the audit shows repeated, high-value drift that cannot be explained more directly

### 3. Prepare contributor-facing documentation

- Write a technical brief for Backdrop contributors that explains:
  - the goal of running D7 themes natively on Backdrop
  - the compat-layer strategy
  - the key implementation choices
  - the important fixes found during Sprint 1
  - the current evidence and limitations
- Include the specific Sprint 1 lessons that matter for presentation:
  - early results were too easy to over-read
  - a sequence/order bug caused major rendering issues
  - once fixed, parity improved dramatically across the 10-theme set
- Support the brief with a small set of representative screenshots and one report artifact

### 4. Clean up the written plan

- Update `DOC/implementation-plan.md` to reflect the current state after Sprint 1
- Replace the existing Sprint 2 doc with this reset direction
- Remove stale assumptions from planning docs:
  - home page as the primary screenshot artifact
  - fixed `reports/comparison.html` output path
  - region labels as the default next sprint
  - Sprint 3 depending on home-page pixel scoring
- Revisit scoring later, only after the larger catalog run and parity audit are in place

## Public Interfaces And Artifacts

- `scripts/compare.js` should move from a fixed theme list to catalog-backed input
- The comparison report should emit richer per-theme status metadata
- `DOC/implementation-plan.md` should be revised to match the current post-Sprint-1 state
- A contributor-facing architecture document should be added under `DOC/`

## Test Plan

- Run an intermediate expansion batch before the full 151-theme milestone
- Verify the report distinguishes clean renders, PHP/log noise, hard failures, and manual-review cases
- Confirm at least one validated example for each parity-audit mismatch category before proposing CSS shims
- Ensure claims in the contributor brief are backed by existing code, handoffs, or generated reports

## Assumptions And Defaults

- The next concrete scale target is **151 catalogued themes**
- Visual refinement starts with a parity audit, not immediate CSS import
- The presentation deliverable is an architecture brief first, with the comparison report as supporting evidence
- Region labels are deferred unless the audit shows they are needed for debugging
- Pixel diff scoring is not the immediate next priority

Last updated: 2026-03-09 by codex
