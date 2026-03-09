# Handoff: d7_default Layout Pin + Path Updates

**Date:** 2026-03-08
**Author:** Claude Sonnet 4.6
**Status:** Layout now stable. Sidebars survive theme switching. Ready for compare run.

---

## Problem Diagnosed

`_d7_theme_compat_sync_layout()` fires on every page request (via `hook_init`) AND on every `system.core` config update (via `hook_config_update`). It was overwriting any layout template back to the per-theme `d7_theme_<name>` template whenever the active theme changed.

Our JSON edits kept getting undone — not by Backdrop's admin UI, but by the module's own sync running on every request.

The per-theme templates (e.g. `d7_theme_academia`) only expose the regions that the specific theme declares in its `.info` file. While academia DOES declare sidebar_first and sidebar_second, the Layout admin was not displaying the sidebar blocks we placed — likely because the admin renders regions from the layout template definition, and some state confusion (possibly from the hook saving over our JSON mid-session) caused them to go missing from the UI.

---

## Fixes Applied

### 1. Module patch — `modules/d7_theme_compat/d7_theme_compat.module`

Added a `d7_default` pin guard inside `_d7_theme_compat_sync_layout()`. If a layout's template is already `d7_default`, the sync function now skips it:

```php
// Respect a manual pin to d7_default. If the admin has selected the
// standard D7 regions template, don't override it when the active theme
// changes.
if ($layout->layout_template === 'd7_default') {
  continue;
}
```

This is backward-compatible: layouts using per-theme templates still auto-sync as before. Only layouts explicitly pinned to `d7_default` are protected.

### 2. Layout JSON reset

Both layouts reset to `d7_default`:
- `layout.layout.default.json` — `layout_template: "d7_default"`
- `layout.layout.home.json` — `layout_template: "d7_default"`

Sidebar positions preserved:
- `sidebar_first`: theme_menu_block:switcher (uuid `95d20ff6`)
- `sidebar_second`: views:show_all_nodes-block_1 (uuid `11ccabe9`)

### 3. Verified

After a live page request (triggers `hook_init` → `_d7_theme_compat_sync_layout`):
- `layout.layout.default.json` still shows `layout_template: "d7_default"` ✅
- `sidebar_first`: 1 block ✅
- `sidebar_second`: 1 block ✅

### 4. Content paths updated — `scripts/screenshot.js`

| Site | Old | New |
|---|---|---|
| D7 | `/animals/fox` | `/animal/fox` |
| Backdrop | `/node/6` | `/animal/lion` |

Lion is confirmed present on both sites (it's the configured home page animal). Fox was confirmed on D7. Using the same animal on both sides is a future improvement for Sprint 2 content alignment.

---

## Admin UI: How to Add Sidebar Blocks

With `d7_default` as the layout template, the Backdrop layout admin at:
`/admin/structure/layouts/manage/default`

...will now show **Sidebar first** and **Sidebar second** regions with Add Block buttons. The `d7_default` template ("Drupal 7 Default Regions" in the picker) always exposes the full standard set regardless of which D7 theme is active.

---

## Next Steps

1. Run `node scripts/compare.js` — sidebars should now appear in all screenshots
2. Review academy screenshots first (clean pass, full region set)
3. If sidebars are still not rendering on-screen, check whether the active D7 theme's `page.tpl.php` outputs `<?php print render($page['sidebar_first']); ?>` — if it doesn't, the block is populated but not displayed by that theme

---

## Files Modified

- `modules/d7_theme_compat/d7_theme_compat.module` — `d7_default` pin guard in `_d7_theme_compat_sync_layout()`
- `backdrop/files/config_*/active/layout.layout.default.json` — template reset to `d7_default`
- `backdrop/files/config_*/active/layout.layout.home.json` — template reset to `d7_default`
- `scripts/screenshot.js` — D7 contentPath `/animals/fox` → `/animal/fox`; Backdrop contentPath `/node/6` → `/animal/lion`

---

Last updated: 2026-03-08 by Claude Sonnet 4.6
