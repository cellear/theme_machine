# Scripts Reference

Quick reference for the five Node.js scripts in `scripts/`. All are run from the project root.

---

## harvest.js

Downloads D7 themes from drupal.org into `backdrop/themes/`. Reads the theme catalog and skips themes already present. Run this when you need to expand the theme set.

```
node scripts/harvest.js [--batch N]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--batch N` | 50 | Number of themes to download in this run |
| `--help` | | Show help |

**Reads:** `TOOLING/theme-catalog/catalog.json`
**Writes:** `backdrop/themes/{theme}/`, `TOOLING/harvest-log.json`

---

## setup-d7-blocks.js

Assigns standard test blocks to regions for each D7 theme that lacks block configuration. Reads each theme's `.info` file to discover regions, then inserts rows into the D7 database. Skips themes already configured. Run this after copying new themes into `drupal-7/sites/all/themes/`.

```
node scripts/setup-d7-blocks.js [--dry-run]
```

| Flag | Description |
|------|-------------|
| `--dry-run` | Print SQL without executing |
| `--help` | Show help |

**Reads:** `drupal-7/sites/all/themes/{theme}/*.info`
**Writes:** D7 database (`block` table) via drush

---

## compare.js

The main pipeline. Switches each site to each theme in sequence, takes a screenshot, captures watchdog output, then restores defaults. Produces an HTML comparison report. Default run is 10 themes; use `--all` for a full run.

```
node scripts/compare.js [options]
```

| Flag | Description |
|------|-------------|
| `--all` | Run every theme in the THEMES list |
| `--limit N` | Run N themes (default: 10) |
| `--offset N` | Start at position N in the list |
| `--theme NAME` | Run a single named theme |
| `--skip-existing` | Skip themes with existing Backdrop screenshots |
| `--triage` | Only run themes in the `ok` list from `TOOLING/theme-triage.json` |
| `--help` | Show help |

**Reads:** hardcoded `THEMES` array in the script; `TOOLING/theme-triage.json` (if `--triage`)
**Writes:**
- `screenshots/{d7,backdrop}/{theme}/node.png`
- `screenshots/{d7,backdrop}/{theme}/meta.json` (watchdog data)
- `reports/comparison-{timestamp}.html`
- `reports/last-run.json` (theme list for this run, used by build-reviewer.js)

---

## triage.js

Reads D7 `.info` files and watchdog `meta.json` data from a prior `compare.js` run and sorts themes into `ok` vs `hard`. Hard criteria: PHP errors in watchdog, or theme lacks both a left-ish and right-ish sidebar region. Dry run by default; use `--apply` to write output.

```
node scripts/triage.js [--apply]
```

| Flag | Description |
|------|-------------|
| `--apply` | Write results to `TOOLING/theme-triage.json` |
| `--help` | Show help |

**Reads:** `drupal-7/sites/all/themes/{theme}/*.info`, `screenshots/d7/{theme}/meta.json`
**Writes:** `TOOLING/theme-triage.json` (only with `--apply`)

---

## build-reviewer.js

Generates a self-contained interactive HTML reviewer from existing screenshots. Keyboard-navigable, side-by-side D7 vs Backdrop, with Accept / Reject / Needs Work verdicts saved to localStorage and exportable as JSON. Defaults to the most recent `compare.js` run.

```
node scripts/build-reviewer.js [options]
```

| Flag | Description |
|------|-------------|
| `--all` | Include all themes with screenshots (ignores last-run.json) |
| `--only FILE` | Restrict to themes in a JSON file — accepts a bare array, `{ ok: [...] }` (triage output), or `{ themes: [...] }` (last-run output) |
| `--help` | Show help |

**Reads:** `reports/last-run.json` (default), `screenshots/{d7,backdrop}/{theme}/node.png`, `screenshots/{d7,backdrop}/{theme}/meta.json`
**Writes:** `reports/reviewer-{timestamp}.html`

---

## Typical workflows

**Full run from scratch:**
```
node scripts/compare.js --all
node scripts/triage.js --apply
node scripts/build-reviewer.js
```

**Re-run only ok themes:**
```
node scripts/compare.js --triage
node scripts/build-reviewer.js
```

**Single theme debug:**
```
node scripts/compare.js --theme danland
node scripts/build-reviewer.js
```

**After adding new themes to D7:**
```
node scripts/setup-d7-blocks.js
node scripts/compare.js --skip-existing --all
```

---

Last updated: 2026-03-12 by Claude Sonnet 4.6
