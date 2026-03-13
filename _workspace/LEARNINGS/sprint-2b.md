# Theme Machine Node.js Tooling — A Guide for PHP Developers

Sprint 2b refined the comparison pipeline: replaced sidebar blocks with visual
Left/Right markers, tightened the watchdog triage to catch PHP warnings (not
just errors), and removed broken themes. This document explains how all four
Node scripts work, how triage filters themes, and how `d7_setup.php`
standardises the D7 site.

---

## 1. Why Node.js?

The comparison pipeline needs to drive a headless browser (Playwright) to
screenshot each theme. Playwright's native API is JavaScript, and Node.js
has built-in modules for everything else we need (filesystem, child processes,
HTTP). No PHP extensions or Composer packages required.

All four scripts live in `scripts/` and share these conventions:

- **Zero external dependencies** beyond Playwright — they use only Node
  built-ins (`fs`, `path`, `child_process`).
- **Run from the project root** — paths like `screenshots/d7/academia/node.png`
  are relative to the project root, not the `scripts/` directory.
- **Shell out to DDEV** — theme switching, cache clears, and watchdog checks
  all happen via `execSync('ddev drush ...')` or `execSync('ddev bee ...')`.

### Quick reference

| Command | What it does |
|---------|-------------|
| `node scripts/compare.js` | Screenshot all themes on both sites, generate HTML report |
| `node scripts/build-reviewer.js` | Build an interactive side-by-side reviewer from existing screenshots |
| `node scripts/triage.js` | Analyse .info files + watchdog data, sort themes into ok/hard |
| `node scripts/screenshot.js --site=d7 --theme=academia` | Screenshot a single theme (used by compare.js internally) |

---

## 2. screenshot.js — the capture engine

This is the low-level workhorse. `compare.js` calls it via
`require('./screenshot')`.

### What it does per theme

1. **Clears watchdog** — so only errors from *this* theme render are captured.
2. **Switches the active theme** — `ddev drush vset theme_default <theme>` (D7)
   or `ddev bee config-set system.core theme_default <theme>` (Backdrop).
3. **Clears cache** — mandatory after a theme switch.
4. **Launches a headless Chromium** browser via Playwright, navigates to
   `/animals/llama`, takes a full-page screenshot, saves the rendered HTML.
5. **Checks watchdog** for PHP warnings or errors that fired during render.

### The watchdog check

After closing the browser, the script runs:

```
ddev drush watchdog-show --severity=warning --count=50     (D7)
ddev bee log --count=50 --severity=warning --type=php      (Backdrop)
```

The `--severity=warning` flag catches warnings AND everything more severe
(errors, criticals). This was changed from `--severity=error` after we
discovered that themes with missing parent themes (arti, parish_theme) throw
PHP *warnings* that completely break the page — but those warnings weren't
caught by an error-only check.

The output is parsed, ANSI escape codes stripped, and stored as
`{ status: 'clean' | 'errors', output: '...' }` in the return value.

### Key file written

`screenshots/{d7|backdrop}/{theme}/meta.json` — contains the watchdog result
and a timestamp. This file is what `triage.js` reads later.

---

## 3. compare.js — the batch runner

### How it works

1. Saves the current default theme on both sites (so it can restore them).
2. Loops through the `THEMES` array (currently 30 themes).
3. For each theme, calls `captureTheme()` from screenshot.js for both D7 and
   Backdrop.
4. Writes `meta.json` alongside each screenshot.
5. Restores both sites to their original themes (even if the run crashes
   mid-way — this is in a `try/finally` block).
6. Generates a timestamped HTML report in `reports/comparison-{timestamp}.html`.

### The HTML report includes

- A **table of contents** with anchor links to each theme.
- A **summary line** — `28 clean / 2 errors / 0 failed` — colour-coded.
- **Side-by-side screenshots** (D7 left, Backdrop right) for each theme.
- **Watchdog badges** — green "clean" or red "errors" next to each heading.
- **Sticky headers** per theme so you know which theme you're looking at
  while scrolling.

### Command-line flags

| Flag | Effect |
|------|--------|
| `--triage` | Only process themes listed as "ok" in `TOOLING/theme-triage.json` |
| `--limit N` | Cap to the first N themes (useful for quick test runs) |

---

## 4. build-reviewer.js — the interactive reviewer

This script reads *existing* screenshots (from a prior compare.js run) and
generates a self-contained HTML file: `reports/reviewer-{timestamp}.html`.

### How it differs from the comparison report

The comparison report is a static document. The reviewer is an interactive
single-page app:

- **One theme at a time** — D7 left, Backdrop right, fills the viewport.
- **Keyboard navigation** — ← → for prev/next.
- **Verdict buttons** — Accept (A), Reject (R), Needs Work (W), Skip (S).
- **Auto-advance** — after a verdict, jumps to the next unreviewed theme.
- **Notes field** — per-theme text notes (press N to focus).
- **Sidebar** with colour-coded verdict status and progress bar.
- **localStorage persistence** — verdicts survive page reloads.
- **Export/Import JSON** — share verdicts between team members.

### No base64 embedding

Earlier versions embedded screenshots as base64 data URIs. The current version
uses relative paths (`../screenshots/d7/academia/node.png`). This keeps the
HTML file small and lets the browser load images on demand — important when you
have 300+ themes.

---

## 5. triage.js — automated theme filtering

### The problem it solves

Not all themes are worth comparing. Some are broken on PHP 8.3. Some only have
one sidebar. Triage automates the yes/no decision.

### Two checks

1. **Sidebar check** — reads the theme's `.info` file and looks for region
   declarations. A theme passes if it has both a left-ish sidebar
   (`sidebar_first`, `sidebar_left`, `left`, etc.) and a right-ish sidebar
   (`sidebar_second`, `sidebar_right`, `right`, etc.). Themes with NO regions
   block at all also pass — D7 gives them default regions including both
   sidebars.

2. **Watchdog check** — reads `screenshots/d7/{theme}/meta.json` (written by
   compare.js). If `watchdog.status === 'errors'`, the theme fails. If the file
   doesn't exist (theme hasn't been screenshotted yet), triage doesn't
   penalise — it just notes "no data".

### Usage

```bash
node scripts/triage.js              # dry run — prints table
node scripts/triage.js --apply      # also writes TOOLING/theme-triage.json
```

### Output: `TOOLING/theme-triage.json`

```json
{
  "ok": ["academia", "adaptic", ...],
  "hard": [
    { "theme": "addari", "reasons": ["PHP 8.3 errors in watchdog"] },
    { "theme": "arti", "reasons": ["PHP 8.3 warnings in watchdog (missing parent...)"] }
  ]
}
```

### What we learned about triage accuracy

The original triage only checked `--severity=error` in watchdog. This missed
themes like `arti` and `parish_theme` that throw PHP *warnings* (missing parent
themes `arctica` and `boron`). Those warnings produce a wall of error messages
on the rendered page, completely obscuring the content.

Lesson: **for Theme Machine's purposes, any PHP watchdog output during render
is a disqualifier.** We changed both `screenshot.js` watchdog checks to
`--severity=warning`, and we expect roughly half of all D7 themes to fail
triage — leaving us with an estimated 300-400 usable themes out of 800+.

---

## 6. d7_setup.php — D7 site standardisation

This is the one PHP script in the pipeline. It runs inside D7 via Drush:

```bash
cd drupal-7 && ddev drush php-script d7_setup.php
```

### What it standardises across all 30 clean themes

1. **Site name** — sets `site_name` to "Theme Machine" (matching Backdrop).
2. **Logo** — sets each theme's logo to `sites/default/files/dib-logo.png`
   (the "Drupal in Backdrop" logo).
3. **Custom blocks** — creates (or updates) two custom blocks in the
   `block_custom` table:
   - "Left" — green "Left" heading + illuminated L image
   - "Right" — green "Right" heading + illuminated R image
4. **Sidebar placement** — for each theme, clears the sidebars and places the
   Left block in the left sidebar and Right block in the right sidebar. Handles
   non-standard region names (adaptic and b2_drupal_plus use `sidebar_left` /
   `sidebar_right`). Skips the right sidebar for single-sidebar themes.
5. **Cache clear** — flushes all caches at the end.

### Why custom blocks instead of user:login or views?

The original setup placed `user:login` in the left sidebar and a views block in
the right. This was replaced with simple visual marker blocks (a big "L" and
big "R" with illuminated letter images) for two reasons:

- **Visual clarity** — in the comparison report, you can instantly see which
  sidebar is which, even on themes with unusual layouts.
- **Parity with Backdrop** — the Backdrop site uses the same Left/Right custom
  blocks via its Layout config. Both sites now show identical sidebar content.

---

## 7. The pipeline in order

A full comparison run looks like this:

```bash
# 1. Standardise D7 (only needed once, or after adding themes)
cd drupal-7 && ddev drush php-script d7_setup.php && cd ..

# 2. Run comparison (screenshots both sites for all themes)
node scripts/compare.js

# 3. Run triage (reads screenshots/d7/*/meta.json)
node scripts/triage.js --apply

# 4. Build interactive reviewer
node scripts/build-reviewer.js

# 5. Open the reviewer
open reports/reviewer-*.html
```

Steps 2-4 can be re-run independently. The reviewer always reads whatever
screenshots currently exist.

---

## 8. Themes removed during this session and why

| Theme | Reason |
|-------|--------|
| `arti` | Missing parent theme `arctica` — cascading null property warnings in `drupal_alter()` |
| `parish_theme` | Missing parent theme `boron` — same cascading null property warnings |
| `bartik_fb` | Sub-theme of Bartik, which already exists as a Backdrop core theme |

These were caught by visual inspection of the comparison report, not by the
original triage. The triage has since been tightened (severity=warning) to
catch similar issues automatically in future runs.

---

Source: Sprint 2b session (2026-03-11), `scripts/`, `drupal-7/d7_setup.php`

Last updated: 2026-03-11 by Claude Opus 4.6
