# Sprint 3 — Scale to 761 Themes

## Context

Sprint 2 delivered: 45-theme comparison pipeline, interactive reviewer with verdict persistence, and region_labels modules for both D7 and Backdrop.

Sprint 3 scales to the full universe of D7 themes on drupal.org (~761 themes). The comparison and review workflow is already proven at 45 themes. The goal here is automation to get all themes installed and captured, plus incremental execution so large runs don't need to restart from zero.

Human review via the reviewer is still the QA method — no algorithmic scoring.

---

## Model Usage Policy

- **Haiku** — mechanical scripts, config changes, array/list updates
- **Sonnet** — new scripts with design judgment (download automation, incremental logic, error classification)
- **Opus** — planning and deep debugging only

---

## Story 3.1 — Theme catalog download script [Sonnet]

**New file:** `scripts/download-themes.js`

Downloads D7 themes from drupal.org in batch. Sources theme machine names from a catalog file (`TOOLING/theme-catalog/themes.json` or similar).

**Behaviour:**
- Reads a list of theme names
- For each theme not already in `drupal-7/sites/all/themes/`, fetches the latest stable release from `https://ftp.drupal.org/files/projects/<name>-7.x-*.tar.gz`
- Extracts into `drupal-7/sites/all/themes/`
- Logs skipped (already present), downloaded, and failed themes
- Rate-limits to avoid hammering ftp.drupal.org (1 req/sec min)
- Writes a summary `TOOLING/download-log-{timestamp}.json`

**No new npm deps** — use `https` built-in + `zlib` + `tar` (Node 18+ built-in).

**Acceptance:** Run script against a list of 10 new themes. All 10 appear in `drupal-7/sites/all/themes/`. Log shows correct counts.

---

## Story 3.2 — Incremental compare runs [Sonnet]

**File:** `scripts/compare.js`

Add `--incremental` flag. When set, skip any theme that already has a screenshot at `screenshots/d7/<theme>/node.png` AND `screenshots/backdrop/<theme>/node.png` dated less than 7 days ago.

**Changes:**
- Parse `process.argv` for `--incremental`
- Before capturing a theme, check screenshot mtimes
- Skip + log `[n/N] Skipping: theme (screenshots up to date)`
- At end, report how many were skipped vs newly captured

**Acceptance:** Run once to capture 45 themes. Run again with `--incremental` — all 45 are skipped. Remove one screenshot folder, run again — only that theme is re-captured.

---

## Story 3.3 — Enable themes in bulk [Sonnet]

**New file:** `scripts/install-themes.js`

For themes that are present in the filesystem but not yet enabled in either DDEV site, enable them via `ddev drush pm-enable` (D7) and `ddev bee en` (Backdrop).

**Behaviour:**
- Reads theme directories from `drupal-7/sites/all/themes/`
- For each theme, checks if it's enabled via `ddev drush pml --type=theme` (D7) and `ddev bee pml --type=theme` (Backdrop)
- Enables any disabled theme
- Logs enabled vs already-active vs failed

**Acceptance:** Add 5 theme directories manually. Run script. All 5 are enabled in both DDEV sites.

---

## Story 3.4 — Full-catalog compare run [Sonnet]

After Stories 3.1–3.3 are working, run the full pipeline:

1. `node scripts/download-themes.js` — download all ~761 themes
2. `node scripts/install-themes.js` — enable all in both sites
3. `node scripts/compare.js` — capture screenshots (use `--incremental` for reruns)
4. `node scripts/build-reviewer.js` — generate reviewer

**Acceptance:** Reviewer opens with 700+ themes. Navigation works. Export produces a valid JSON file.

This story is a **manual validation step**, not a code story. Document results in the sprint handoff.

---

## Story 3.5 — Doc: update theme catalog schema [Haiku]

**File:** `DOC/theme-catalog-schema.md`

Update to reflect the 761-theme scope and the download log format from Story 3.1.

**Acceptance:** File exists, describes the catalog format and download log schema.

---

## What is NOT in Sprint 3

- Algorithmic pixel diff scoring (human review remains the QA method)
- CI/CD automation
- Backdrop-only themes (only D7 themes in scope)
- Theme fixes or patches (flag and skip; d7_theme_compat is the fix layer)

---

## Sequencing

1. **3.1** — Download script (unblocks 3.2–3.4)
2. **3.2** — Incremental compare (can run in parallel with 3.3)
3. **3.3** — Bulk enable (can run in parallel with 3.2)
4. **3.4** — Full run (after 3.1–3.3)
5. **3.5** — Doc update (last, after full run confirms catalog format)

Last updated: 2026-03-10 by Claude Sonnet 4.6 (Sprint 2 execution, Sprint 3 planning)
