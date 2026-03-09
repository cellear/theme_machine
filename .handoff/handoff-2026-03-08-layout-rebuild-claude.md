# Handoff: Layout Rebuild — Sidebars Fixed

**Date:** 2026-03-08
**Author:** Claude Sonnet 4.6
**Status:** Sidebars working. compare.js ready to re-run.

---

## What Was Done

### Problem diagnosed

Both layouts (`default` and `home`) were using `layout_template: "d7_theme_bluebreeze"` — a per-theme template registered dynamically by `d7_theme_compat`. The Default layout's positions object only had `header`, `top`, `half1`, `half2`, `bottom`, `footer` — no `sidebar_first` or `sidebar_second`. All sidebar blocks were missing from all non-home pages.

The `theme_menu_block:switcher` and `views:show_all_nodes-block_1` blocks had been placed in the `content` region of the Default layout, effectively stuffing sidebar content into the main column.

### Fix applied

**`layout.layout.default.json`** — completely rewritten:
- Template changed: `d7_theme_bluebreeze` → `d7_default`
- Positions cleaned: removed `top`, `half1`, `half2`, `bottom`
- Sidebar positions added:
  - `sidebar_first`: `theme_menu_block:switcher` (uuid `95d20ff6`)
  - `sidebar_second`: `views:show_all_nodes-block_1` (uuid `11ccabe9`)
- Content trimmed: removed duplicate `system:main-menu` from content region (kept in header only)
- Content region now: title_combo + breadcrumb + current_theme_block + system:main

**`layout.layout.home.json`** — `d7_theme_bluebreeze` was changed to `d7_default` and stale `title` position removed, but user reverted this change (home layout currently still uses `d7_theme_bluebreeze`). Home layout already had working sidebar positions (`sidebar_first` / `sidebar_second`) so functionally fine for now.

### Verified

Screenshot of `https://theme-machine.ddev.site/node/6` (Saltwater Crocodile) confirmed:
- `sidebar_second` rendering (show_all_nodes animal thumbnails visible)
- Main content rendering correctly
- Three-column layout active

### D7 content path updated

`scripts/screenshot.js` — `contentPath` for D7 changed from `/node/1` to `/animals/fox` (pathauto clean URL added by user).

### compare.js CLI fix (previous session)

`ddev drush` / `ddev bee` passthrough commands fail outside their project directory. Fixed by adding `projectDir` to each config entry and passing `cwd: cfg.projectDir` to all `execSync` calls. No more `-p` flag.

---

## Current State

Ready to run:
```bash
cd /Users/lukemccormick/Sites/BACKDROP/THEME-MACHINE
node scripts/compare.js
```

Expected: 10 themes render with sidebars visible on the node page screenshots.

---

## Open Issues / Next Steps

1. **Home layout template** — still `d7_theme_bluebreeze`. Low priority since we don't screenshot the home path in Sprint 1, but should be aligned to `d7_default` for consistency.

2. **Sidebar_first rendering** — the `theme_menu_block:switcher` should appear in the left sidebar. Verify it's visible in screenshots (it's a narrow block listing all installed themes with the active one marked). If not rendering, check whether the active D7 theme's `page.tpl.php` uses `$page['sidebar_first']`.

3. **Themes without sidebars** — some themes in the Sprint 1 set declare no `sidebar_first` / `sidebar_second` in their `.info` file (e.g., `tarski` is missing header, footer, highlighted; `plasma` is missing header, sidebar_second). For those themes, `d7_theme_compat` will populate `$page['sidebar_first']` but the theme template may not render it. Correct behavior — shows the real compat picture.

4. **D7 watchdog checking** — not yet confirmed whether `ddev drush watchdog-show --severity=error --count=50` works on the drupal-7 instance. The script skips D7 watchdog gracefully if the command fails.

---

## Files Modified

- `backdrop/files/config_*/active/layout.layout.default.json` — rewritten (template + sidebar regions)
- `backdrop/files/config_*/active/layout.layout.home.json` — template change (then reverted by user; stale `title` position removed)
- `scripts/screenshot.js` — D7 `contentPath` changed to `/animals/fox`

---

## References

- `SPRINTS/sprint-1.md` — sprint spec
- Prior handoff: `handoff-2026-03-07-sprint1-scripts-claude.md`

---

Last updated: 2026-03-08 by Claude Sonnet 4.6
