# Handoff: Sprint 0 Doc + Watchdog Fix

**Date:** 2026-03-08
**Author:** Claude Sonnet 4.6
**Status:** compare.js ran successfully (10/10 themes). Two fixes applied. Ready for next run.

---

## What Was Done

### 1. Diagnosed comparison-01.html

All 10 themes ran successfully — 4 screenshots each, no script FAIL errors.
The "errors" badges were a false positive.

### 2. Watchdog detection bug fixed (`scripts/screenshot.js`)

`ddev bee log` always outputs one ANSI-reversed table header row (`| ID | Date | Type | Severity | Message |`) even when the log is empty. The original code treated any non-empty output as errors.

**Fix:** Strip ANSI codes, then count lines that start with `|` and are NOT the header row and NOT a separator line. Only those lines are actual error entries.

Updated: `scripts/screenshot.js` lines ~68–76.

### 3. SPRINTS/sprint-0.md created

Retroactive documentation of all manual environment parity work:
- D7: pathauto, token, views, ctools enabled; pathauto pattern; blocks placed; show_all_nodes view export
- Backdrop: layout template rebuild (d7_theme_bluebreeze → d7_default); sidebar regions restored
- Known remaining gaps for Sprint 2/4

---

## Theme Recommendation: Start with `academia`

**Reasoning:**
- Listed as "clean pass" in sprint spec — no missing regions, no known warnings
- Has both `sidebar_first` and `sidebar_second` declared in .info
- Simplest theme in the set — fewest templates, minimal CSS
- Easiest to spot-check differences between D7 and Backdrop rendering
- Once academia matches, other themes can be calibrated against it

If academia looks wrong, the problem is almost certainly in the shared infrastructure (d7_theme_compat, layout config, block rendering) rather than theme-specific templates.

**Suggested workflow:**
1. Run `node scripts/compare.js` again (watchdog fix will show clean badges now)
2. Open `reports/comparison.html`, find academia
3. Compare D7 left column vs Backdrop right column — note differences
4. Address the most obvious differences first (layout structure > content > cosmetics)
5. When academia looks close, check bluebreeze, then biz/fold

---

## Current State

All scripts functional. Ready to run:
```bash
cd /Users/lukemccormick/Sites/BACKDROP/THEME-MACHINE
node scripts/compare.js
```

---

## Files Modified

- `scripts/screenshot.js` — watchdog false-positive fix

## Files Created

- `SPRINTS/sprint-0.md` — retroactive environment parity documentation

## Files Created (prior session, same day)

- `.handoff/handoff-2026-03-08-layout-rebuild-claude.md`

---

Last updated: 2026-03-08 by Claude Sonnet 4.6
