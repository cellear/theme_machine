# Handoff: Block Parity + Module Fixes

**Date:** 2026-03-08
**Author:** Claude Sonnet 4.6
**Status:** Complete. Both sites now show matching three-column layouts. compare.js 10/10 clean.

---

## What Was Done

### Goal
Make D7 and Backdrop comparison screenshots show the same block configuration so visual differences reflect theme rendering, not configuration mismatches.

### Target configuration (both sites)
- `sidebar_first`: user:login
- `sidebar_second`: views:show_all_nodes
- Logo: dib-logo.png (Drupal in Backdrop)
- Site name: "Theme Machine"

### Changes: Backdrop layout JSON
`backdrop/files/config_*/active/layout.layout.default.json`
- Replaced `theme_menu_block:switcher` (uuid `95d20ff6`) in `sidebar_first` with `user:login` (uuid `25a3b4cc-6c6a-4a9d-9b4f-fe3bf60f726f`)
- `sidebar_second` unchanged: `views:show_all_nodes-block_1` (uuid `11ccabe9`)

### Changes: Backdrop system.core.json
- `site_name`: "TM Backdrop" → "Theme Machine"

### Changes: D7 (via `drupal-7/d7_setup.php` drush script)
- `site_name`: "TM DRUPAL 7" → "Theme Machine"
- Logo: `sites/default/files/dib-logo.png` set for all 10 test themes via `theme_{name}_settings`
- Block placements reset for all 10 themes:
  - `sidebar_first`: user:login only
  - `sidebar_second`: views:show_all_nodes-block (3 themes without sidebar_second — classic_blog, plasma, simpleclean — correctly rejected by D7 cache clear)

### Changes: `modules/d7_theme_compat/d7_theme_compat.module` (3 fixes)

**Fix 1: Logo** — `d7_theme_compat_preprocess_page()`
`theme_get_setting('logo')` returns empty for D7 themes with no Backdrop settings file. Now reads from `system.core` config directly (`site_logo_path` / `site_logo_theme`).

**Fix 2: Sidebar body classes** — `_d7_theme_compat_preprocess_html()`
D7's `system_preprocess_html()` adds `two-sidebars`, `one-sidebar sidebar-first`, etc. to the body. Backdrop's system module doesn't do this. Fix: store layout value in `backdrop_static('d7_compat_page_layout')` during page preprocessing, read it in html preprocessing to add the correct body classes.

**Fix 3: Theme CSS/JS loading order** — html hook registration
Root cause: D7 themes call `drupal_add_css()` in their `{theme}_preprocess_html()` to load layout CSS. But `_d7_theme_compat_preprocess_html()` was collecting `backdrop_get_css()` BEFORE the theme's preprocess ran, so theme CSS was missed.

Two sub-fixes:
- Split `_d7_theme_compat_preprocess_html()` — removed styles/scripts/head collection from it
- Added `_d7_theme_compat_finalize_html()` — new function that collects styles/scripts/head as the LAST step in the html preprocess chain (after all theme preprocess functions)
- html hook registration now explicitly adds `{theme}_preprocess_html` and `{theme}_process_html` to the preprocess chain (Backdrop doesn't auto-add these for manually-registered hooks)

---

## Result

Before: Backdrop pages showed no header, no logo, no sidebar columns.
After: Both D7 and Backdrop show three-column layout (User Login | Content | Show All Nodes), same logo, same site name.

Themes without `sidebar_second` (classic_blog, plasma, simpleclean) correctly show one-column layout on both sides.

---

## Files Created/Modified

- `modules/d7_theme_compat/d7_theme_compat.module` — logo fix, layout body classes, html preprocess chain
- `backdrop/files/config_*/active/layout.layout.default.json` — user:login in sidebar_first
- `backdrop/files/config_*/active/system.core.json` — site_name
- `drupal-7/d7_setup.php` — one-time setup script (can be re-run safely; leave in place for reference)

---

## Open Questions / Next Steps

1. **Compare the report** — now that layouts match, open `reports/comparison.html` and start cataloging actual theme rendering differences between D7 and Backdrop
2. **Home page screenshots** — currently show no sidebars (home layout may still use d7_theme_bluebreeze template; low priority since Sprint 1 focuses on node pages)
3. **D7 logo on home page** — D7's home page uses a different path in screenshot.js (`/`); the logo should appear there too (it does since it's a theme setting)
4. **Site name toggle** — `academia_preprocess_html()` checks `theme_get_setting('toggle_name')` using D7's `variable_get()`. On Backdrop this should return the correct value since Backdrop has variable_get compat. Verify for all themes.
5. **Sprint 2** — region-identifiable content (label each region by name in content)

---

## References

- Prior handoff: `handoff-2026-03-08-layout-pin-fix-claude.md`
- Sprint spec: `SPRINTS/sprint-1.md`
- `SPRINTS/sprint-0.md` — D7 environment parity notes

---

Last updated: 2026-03-08 by Claude Sonnet 4.6
