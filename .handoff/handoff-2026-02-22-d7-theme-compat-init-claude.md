# Handoff: D7 Theme Compat Module — Initial Session

**Date**: 2026-02-22
**Author**: claude
**Task**: Build a Backdrop module that lets unmodified Drupal 7 themes run on Backdrop CMS

## What Was Accomplished

### 1. D7 Bartik installed as test theme
- Copied `drupal/themes/bartik/` → `backdrop/themes/bartik_d7/`
- Renamed `bartik.info` → `bartik_d7.info` (only change — the theme code is unmodified)
- Theme machine name is `bartik_d7` to avoid collision with Backdrop's core `bartik`

### 2. Created `d7_theme_compat` module
**Location**: `backdrop/modules/d7_theme_compat/`

**Working features**:
- `hook_system_info_alter()`: Detects `core = 7.x` in theme .info files and
  injects `backdrop = 1.x` + `type = theme`. This makes D7 themes appear as
  valid, enableable themes in admin/appearance. **CONFIRMED WORKING.**
- `hook_theme_registry_alter()`: Injects early setup and late flatten functions
  into the preprocess chain for D7 theme templates.
- Setup function: Creates `classes_array`/`attributes_array` from Backdrop's
  array-based `classes`/`attributes` so D7 preprocess functions can use them.
- Flatten function: Converts `classes_array` → string `$classes`,
  `attributes_array` → string `$attributes` (replicates D7's `template_process()`).
  Only runs for templates whose path is inside the D7 theme directory.

### 3. Testing results with D7 Bartik as default theme
- Theme shows up in Appearances list ✓
- Theme can be enabled and set as default ✓
- `class="Array"` bug fixed by flatten function ✓
- **BLOCKING**: `$page['header']` TypeError on page.tpl.php line 124 — `$page`
  is a string, not an array of regions. This is the Layout module conflict.

## What Didn't Work / Lessons Learned

1. **Flatten must be selective about templates**: Initially flattened for ALL
   template hooks. This broke `views-view-grid.tpl.php` (Backdrop template
   that expects `$classes` as array) and `template_preprocess_image()` (theme
   function that expects `$attributes` as array). Fixed by only flattening
   for templates whose path is inside the D7 theme directory.

2. **Theme functions vs template hooks**: Theme functions like `theme_image()`
   call `backdrop_attributes()` themselves. The flatten function must NOT run
   for function-based hooks, only template-based hooks. Addressed by checking
   the registry's `path` against the D7 theme directory.

## Current State

- Module is enabled
- Default theme is **Basis** (safe)
- `bartik_d7` is enabled but not default
- Site loads fine at 200 with Basis
- Setting `bartik_d7` as default produces a 500 due to `$page` region issue

## Next Steps (in progress)

### Immediate: Bypass Layout, Replace Core Templates

The agreed approach:

1. **Suppress Layout module** via `layout_suppress(TRUE)` in `hook_init()`
   when D7 theme is active. This makes Backdrop fall back to D7-style page
   rendering (`menu_default_route_handler()` instead of `layout_route_handler()`).

2. **Replace ALL Backdrop core templates** with D7 equivalents via
   `hook_theme_registry_alter()`. Redirect template paths from Backdrop core
   to D7 core (the `drupal/` install has all D7 templates). This ensures the
   entire template stack is D7-consistent.

3. **Flatten globally** for all template hooks (since everything is now D7-style).
   No more selective per-template-path logic needed.

4. **Implement D7-style `template_preprocess_page()`** to populate:
   - `$page['region_name']` arrays for all theme-declared regions
   - `$logo`, `$site_name`, `$site_slogan`
   - `$main_menu`, `$secondary_menu`
   - `$breadcrumb`, `$messages`, `$tabs`, `$action_links`
   - `$title`, `$feed_icons`

5. **Implement D7-style `template_process_html()`** to populate:
   - `$head`, `$styles`, `$scripts`
   - `$page_top`, `$page_bottom`

### Success criteria
- `curl -s -o /dev/null -w "%{http_code}" "https://theme-machine.ddev.site/"`
  returns 200 with bartik_d7 as default theme
- No PHP errors in `ddev bee log --severity=error`
- Page HTML contains Bartik's CSS classes and structure
- Can switch back to Basis without issues

## Open Questions

- For Backdrop-only templates (Views, Layout admin, Dashboard), what happens
  when we flatten globally? We might need exceptions for admin pages.
- Should D7 templates be copied into our module or referenced from `drupal/`?
  Referencing is less duplication but creates a dependency on the drupal/ install.
- How to handle block assignment to D7 regions without the Layout UI?

## Files Created or Modified

| File | Action |
|------|--------|
| `backdrop/modules/d7_theme_compat/d7_theme_compat.info` | Created |
| `backdrop/modules/d7_theme_compat/d7_theme_compat.module` | Created, iterated |
| `backdrop/themes/bartik_d7/` | Copied from drupal/themes/bartik/ |
| `backdrop/themes/bartik_d7/bartik_d7.info` | Renamed from bartik.info |
| `DOC/template-mapping.md` | Created — full template inventory |
| `DOC/backdrop-for-llms.md` | Created — LLM reference guide |

## References

- `DOC/template-mapping.md` — Complete inventory of D7 vs Backdrop templates
- `DOC/backdrop-for-llms.md` — Quick reference for AI agents
- D7 `template_process()`: `drupal/includes/theme.inc:2565`
- D7 `template_preprocess_page()`: `drupal/includes/theme.inc:2677`
- D7 `template_process_page()`: `drupal/includes/theme.inc:2731`
- D7 `template_process_html()`: `drupal/includes/theme.inc:2760`
- Backdrop `layout_suppress()`: `backdrop/core/modules/layout/layout.module:738`
- Backdrop `layout_route_handler()`: `backdrop/core/modules/layout/layout.module:760`
