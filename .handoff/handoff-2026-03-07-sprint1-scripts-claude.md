# Handoff: Sprint 1 — Scripts Written and Smoke Tested

**Date:** 2026-03-07
**Author:** Claude Sonnet 4.6
**Status:** Sprint 1 scripts complete. Ready to run `node scripts/compare.js`.

---

## What Was Done

Executed Sprint 1 per `SPRINTS/sprint-1.md`. All stories 1.1–1.5 are implemented.

### Story 1.1 — Playwright installed
- `npm init -y` in project root → `package.json` created
- `npm install playwright` + `npx playwright install chromium`
- Smoke test passed: `screenshots/smoke-test.png` — D7 site rendered, 232 KB

### Story 1.2 — Theme switching via CLI
- CLI invocations are baked into `scripts/screenshot.js` as the authoritative source
- D7: `ddev -p drupal-7 drush vset theme_default <theme>` + `ddev -p drupal-7 drush cc all`
- Backdrop: `ddev -p theme-machine bee config-set system.core theme_default <theme>` + `ddev -p theme-machine bee cache-clear`
- D7 watchdog: `ddev -p drupal-7 drush vget theme_default` (for default-restore; watchdog check deferred to Sprint 2 on D7 — only confirmed that `drush vget` works)

### Story 1.3 — `scripts/screenshot.js`
- Accepts `--site=d7|backdrop` and `--theme=<name>`
- Switches theme, clears cache, screenshots home + node page, saves HTML
- Watchdog clear (before) + log check (after) on Backdrop side
- Exported as module for use by compare.js

### Story 1.4 — `scripts/compare.js`
- Loops the 10 starter themes (academia, biz, bluebreeze, classic_blog, fold, modern_theme, plasma, simpleclean, tarski, touch)
- Per-theme try/catch — one theme failure does not crash the run
- Builds `reports/comparison.html` with base64-embedded screenshots
- Watchdog badge per theme (clean / errors / n/a)

### Story 1.5 — Restore default theme
- `getDefaultTheme(site)` records both sites' current defaults at start
- `restoreTheme(site, theme)` called in `finally` block

### `.gitignore` updated
- Added `node_modules/`, `screenshots/`, `reports/`

---

## What Was NOT Done

- D7 watchdog checking — sprint spec says skip if unavailable; confirmed `drush watchdog-show` is available on D7 but not wired in yet (Sprint 1 scope is Backdrop only for watchdog)
- Actual full compare run — scripts are ready but **both DDEV sites need to be running** before the user executes

---

## Current State

Scripts are written and Playwright is verified working. To run:

```bash
cd /Users/lukemccormick/Sites/BACKDROP/THEME-MACHINE
node scripts/compare.js
```

Both DDEV sites must be running:
- `ddev start` in backdrop/ (theme-machine)
- `ddev start` in drupal-7/ project dir

---

## Blockers

None — but sites must be running. Smoke test confirmed D7 was running at time of writing.

---

## Open Questions

1. **D7 watchdog**: `drush watchdog-show --severity=error --count=50` — does this work on the D7 instance? Should be wired in for Sprint 2.
2. **`bee watchdog-clear` exact syntax**: Script uses `bee watchdog-clear`; if `watchdog_tools` module uses different bee command name, update `screenshot.js` line ~30.
3. **`bee log` output format**: The empty/no-error detection uses `/no log messages/i` regex. If `bee log` outputs something different for empty results, update screenshot.js line ~62.

---

## Files Created or Modified

**Created:**
- `package.json`
- `package-lock.json`
- `scripts/screenshot.js`
- `scripts/compare.js`
- `screenshots/smoke-test.png` (gitignored)

**Modified:**
- `.gitignore` — added node_modules/, screenshots/, reports/

---

## References

- `SPRINTS/sprint-1.md` — sprint spec
- `DOC/implementation-plan.md` — overall plan
- Prior handoff: `handoff-2026-03-07-plan-review-claude.md` (Opus 4.6)

---

## Next Step

User runs `node scripts/compare.js`. Review `reports/comparison.html`. Then hand to Sonnet for Sprint 2 (region-identifiable content, scale to 45 themes).

---

Last updated: 2026-03-07 by Claude Sonnet 4.6
