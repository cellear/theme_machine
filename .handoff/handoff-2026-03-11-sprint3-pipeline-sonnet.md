# Handoff: Sprint 3 Complete — Pipeline Hardening & Triage Tooling

**Date:** 2026-03-11
**Author:** Claude Sonnet 4.6
**Status:** Sprint 3 done. Triage of "both errors" tranche in progress (human review). Next: Sprint 4 (setup.sh).

---

## What Was Done This Session

### Sprint 3: Theme harvesting (Haiku)
- `scripts/harvest.js` written and run in 4 batches (10 + 50 + 50 + 31)
- 151/151 themes downloaded from drupal.org and installed in `backdrop/themes/`
- `THEMES` array in `compare.js` updated to 184 entries (151 harvested + 33 pre-existing)
- `TOOLING/harvest-log.json` written

### First full run at scale
- `node scripts/compare.js --skip-existing --all` run against all 134 newly-harvested themes
- 0 hard fails — every theme rendered a page
- Results: 4 both-clean, 98 D7-only errors, 31 both-errors, 1 Backdrop-only (bartik)
- Key finding: Backdrop handles old theme code more cleanly than D7 does on PHP 8.3
- Documented in `DOC/implementation-plan.md` and `DOC/theme-catalog-schema.md`

### Bugs found and fixed

**PHP fatal lockout** (`scripts/screenshot.js`):
Themes with curly-brace array syntax (`$arr{0}`, removed PHP 8.0) cause PHP fatals that prevent all subsequent `bee` commands, locking the site. Fixed with `setBackdropTheme()` → on failure, fall back to editing `system.core.json` directly on host + `ddev mysql TRUNCATE` on cache tables. No PHP involved, site always recovers.

**D7 stuck on harvested theme after crash** (`scripts/compare.js`):
`getDefaultTheme('d7')` was saving whatever D7's current theme was as the restore target — including leftover harvested themes from crashed runs (e.g. `abarre`). Added directory-existence validation: if the theme doesn't exist in `sites/all/themes/` or `themes/` (core), warn and use `bartik` as fallback.

**Missing `path` require** (`scripts/compare.js`):
Used `path.join` in `getDefaultTheme` without importing `path`. ReferenceError on every run. Fixed.

### New flags added to compare.js
- `--skip-existing` — skip themes with existing `screenshots/backdrop/{theme}/meta.json`
- `--theme=NAME` / `--theme NAME` — run a single theme; typo detection for `theme=NAME`
- `--offset N` — start at position N in the theme list
- `--all` — run every theme (ignores default 10-theme limit)
- Default changed from "all themes" to first 10

### New flags added to build-reviewer.js
- `--only <file.json>` — filter reviewer to a specific JSON array of theme names

### Triage tooling
- `TOOLING/triage-both-errors.json` — the 31 themes with watchdog errors on both D7 and Backdrop
- Human review of this tranche is in progress at end of session

### Catalog scope documented
- `DOC/theme-catalog-schema.md` updated with "Why 151 themes" section
- Explains: `full` project filter = quality signal; sandbox pool (~600) is mostly abandoned experiments; 151 is the right working set

---

## Current State

- Both DDEV sites running: `drupal-7.ddev.site` (D7) and `theme-machine.ddev.site` (Backdrop)
- Active Backdrop theme: `classic_blog`; D7 default: `biz` (or `bartik` after any run)
- 184 themes in `THEMES` array, all installed in `backdrop/themes/`
- Screenshots exist for all 184 themes in `screenshots/`
- `TOOLING/triage-both-errors.json`: 31 "both errors" themes pending human verdict

---

## Commits This Session (newest first)

```
85d4629  Add --only flag to build-reviewer.js for triage subsets
5218e7e  Fix: add missing path require to compare.js
84cfa46  Validate D7 default theme on startup, fall back to bartik if broken
8c55134  Fix --theme flag parsing: accept both forms, catch typo
db7a59b  Add --theme=NAME parameter to compare.js for single-theme testing
11d58cc  Document PHP 8.3 findings at scale; Sprint 3 handoff
258d87a  Fix PHP-fatal theme lockout: direct config fallback for bee failures
7bdb8d1  DOC: catalog scope — why 151 themes, not 761
230e62a  compare.js: add --skip-existing flag for incremental triage
```

---

## Open Questions / Blockers

- Human triage of `triage-both-errors.json` in progress — results not yet recorded
- After triage: update `TOOLING/theme-triage.json` with final ok/reject lists if desired
- D7 site may need `pushd drupal-7 && ddev drush vset theme_default bartik && ddev drush cc all && popd` if it gets stuck on a harvested theme

---

## Next: Sprint 4 — One-Command Setup

**Owner:** Haiku
**Goal:** `setup.sh` that brings both DDEV sites up from scratch with all themes, content, and modules ready. A new contributor runs one script and has a working environment.

**Key deliverables:**
- `setup.sh` in project root
- Starts/provisions both DDEV projects
- Installs all themes (D7 and Backdrop)
- Enables `d7_theme_compat` module
- Creates animal content (or imports fixture)
- Validates both sites are up before exiting

**References:**
- `DOC/implementation-plan.md` — Sprint 4 spec
- `DOC/d7-setup-versioning.md` — D7 setup details
- `DOC/setup-testing-environment-plan.md` — environment setup notes

Last updated: 2026-03-11 by Claude Sonnet 4.6
