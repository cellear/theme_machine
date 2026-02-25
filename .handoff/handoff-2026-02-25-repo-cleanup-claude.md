# Handoff: Repo cleanup for public display

**Date:** 2026-02-25
**Author:** claude (sonnet)

## What was done

Cleaned up the repository for public display. All tasks completed.

## Changes

### Created
- `README.md` — Public-facing project description: what Theme Machine is, module summaries, requirements, getting-started steps, doc index, project structure.

### Renamed
- `HANDOFF/` → `.handoff/` — Hidden from casual browsing; signals it's internal AI tooling, not part of the Theme Machine project itself.

### Created
- `TOOLING/` — New home for internal working data that was cluttering `DOC/`.

### Moved from `DOC/` to `TOOLING/`
- `d7-theme-catalog.md` + `.tsv`
- `d7-theme-batch1-top10.md` + `.tsv`
- `d7-theme-first50-triage.md` + `.tsv` + `d7-theme-first50-rest.tsv`
- `d7-theme-next-50.md` + `.tsv`
- `incoming-theme-triage.md`
- `theme-test-results.md`

### Updated
- `CLAUDE.md` — `HANDOFF/` → `.handoff/` throughout; added `.handoff/` description noting it's internal AI tooling; added `TOOLING/` to the Directories section.
- `DOC/backdrop-for-llms.md` — File structure diagram updated; Last updated bumped.
- `DOC/git-conventions.md` — Handoff reference updated to `.handoff/`.

## DOC/ now contains (user-facing only)
- `backdrop-for-llms.md`
- `template-mapping.md`
- `theme-tester.md`
- `watchdog-tools.md`
- `theme-menu-block.md`
- `lost-regions.md`
- `git-conventions.md`

### Removed from git tracking
- `backdrop/themes/` — all 47 D7 themes (1,539 files, ~20MB) removed from index via
  `git rm --cached -r`. Files remain on disk. `backdrop/themes/` added to `.gitignore`.
- Theme list preserved in `TOOLING/d7-themes-installed.md` for future re-fetch tooling.

## State
All changes staged. Not pushed — awaiting user clearance.

## Open questions
- Future: a `bee fetch-themes` command (or shell script) to re-download the 47 themes
  from Drupal.org. `bartik_d7` and `garland_d7` need rename handling after download.
  See `TOOLING/d7-themes-installed.md`.
