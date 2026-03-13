# Roadmap Reset After Sprint 1

## Summary

Sprint 1 should be treated as complete and more successful than the written plan anticipated. The next roadmap should be re-cut around three parallel goals:

1. **Scale validation to the full known D7 catalog milestone**: move from 10 themes to the **151 catalogued D7 themes** as the next concrete target, not directly to an undefined “hundreds.”
2. **Run a focused parity audit before changing CSS behavior**: do not import old Drupal 7 core CSS yet. First classify the remaining visual differences as CSS drift, markup drift, or compat-layer drift.
3. **Prepare an architecture brief for Backdrop core contributors**: document how the compat layer works, what had to be fixed, what evidence supports the approach, and what limitations remain.

This replaces the current stale “Sprint 2 = region labels + 45 themes” direction. Region labels become optional debug tooling, not the mainline next sprint.

## Implementation Changes

### 1. Replace the next sprint with a scale-and-triage sprint
- Update the roadmap so the immediate next sprint is **151-theme catalog validation**.
- Keep the current real-content comparison pipeline as the baseline; do not add synthetic region-label content unless the parity audit proves it is needed for specific diagnostics.
- Extend `scripts/compare.js` from the hardcoded 10-theme list to a catalog-driven theme list with explicit buckets:
  - installed and testable now
  - catalogued but not yet installed in Backdrop
  - catalogued but known-incompatible or erroring
- Add report-level classification fields per theme:
  - rendered cleanly
  - rendered with PHP/log noise
  - failed to render
  - major visual mismatch
  - manual review needed
- Make the report usable at 151 themes:
  - TOC
  - summary counts by status
  - filtering or section grouping by status
  - anchors to each theme section

### 2. Add a parity-audit sprint before any CSS import decision
- Create a short audit pass over a representative set of themes: a few near-perfect matches, a few acceptable-but-off matches, and the worst mismatches.
- For each mismatch, classify root cause as one of:
  - Backdrop core CSS differs from Drupal 7 core CSS
  - template markup or wrapper structure differs
  - preprocess/order/asset-loading behavior differs
  - PHP 8.3/runtime issues in the theme itself
- Capture concrete examples with before/after screenshots and note whether the fix belongs in:
  - `d7_theme_compat`
  - layout/config parity
  - optional D7 core-style shim
- Only if the audit shows repeated, high-value CSS drift from D7 core styles should a follow-up sprint propose importing or shimming old D7 core CSS. That decision stays deferred until the audit is written.

### 3. Add a contributor-facing architecture brief
- Create a concise technical document for presentation that explains:
  - the problem: D7 themes assume Drupal 7’s theme/render pipeline
  - the strategy: run D7 themes natively on Backdrop via a compat layer rather than rewriting themes
  - the key technical adaptations already in place:
    - template handling
    - page/layout suppression or routing strategy
    - HTML preprocess chain registration
    - CSS/JS collection timing fix
    - body class parity
    - logo/settings parity
    - watchdog-based validation
  - the evidence from Sprint 1:
    - 10-theme comparison success
    - the sequence bug that caused early false confidence
    - the fix and the resulting parity improvement
  - known limits:
    - themes that depend on deprecated PHP patterns
    - themes with missing/odd region declarations
    - themes not yet installed or mapped in Backdrop
- Package the brief with a small set of representative screenshots and one summary comparison report link/path.

### 4. Clean up the planning/docs layer now
- Rewrite `DOC/implementation-plan.md` and the next sprint doc so they match the current scripts and handoffs.
- Remove stale assumptions from sprint docs:
  - home-page screenshots as the main artifact
  - `reports/comparison.html` as the only output path
  - region labels as the default next step
  - Sprint 3 relying on home-page pixel diff
- Reframe the later scoring work as optional and evidence-driven. If added later, it should score the **current node-page comparison artifact**, not the no-longer-primary home-page flow.

## Public Interfaces / Artifacts To Change

- `scripts/compare.js` should move from a fixed 10-theme array to a catalog-backed input list and emit richer per-theme status metadata.
- The comparison report format should gain summary/triage sections for large runs.
- `DOC/implementation-plan.md` should be revised to reflect the post-Sprint-1 reality and the new sprint ordering.
- Add one contributor-facing architecture document in `DOC/` for the presentation.

## Test Plan

- Run the expanded compare pipeline on a small intermediate batch first, then the full 151-theme catalog milestone.
- Verify the report clearly distinguishes:
  - clean renders
  - watchdog/PHP-noise renders
  - render failures
  - manual-review mismatches
- For the parity audit, validate at least one confirmed example in each mismatch category before proposing any CSS import/shim work.
- For the architecture brief, ensure every major claim is backed by an existing code path, handoff, or report artifact already in the repo.

## Assumptions And Defaults

- The next milestone is **151 catalogued themes**, not an immediate jump to the undefined full long tail.
- Visual work begins with an audit, not with automatic Drupal 7 core CSS import.
- The presentation deliverable is an **architecture brief** first, with the report as supporting evidence.
- Region labels are deferred unless the parity audit shows they are necessary for diagnosing specific failures.
- Pixel diff scoring is not the immediate next priority and should not drive roadmap decisions until the larger-scale report and parity audit are in place.
