# Handoff: D7 Theme Compat Module — Rendering Breakthrough

**Date**: 2026-02-22
**Author**: claude
**Task**: Get D7 Bartik to actually render HTML on Backdrop CMS
**Previous**: `handoff-2026-02-22-d7-theme-compat-init-claude.md`

## What Was Accomplished

### D7 Bartik now renders on Backdrop!

`/node/1` returns HTTP 200 with ~4.6KB of proper D7-style HTML:
- `<!DOCTYPE html>` from D7's `html.tpl.php`
- `<head>` with title, CSS, JS — all populating correctly
- Bartik's CSS files loading (layout.css, style.css, colors.css, print.css)
- D7 page structure (`#page-wrapper`, `#page`, `#header`, `#content`, `#footer`)
- Node content rendered correctly (title, submitted, body field)
- Proper body classes (`not-front not-logged-in page-node page-node-1 node-type-post`)
- `xml:lang="en"` and `dir="ltr"` set correctly
- Theme switching works cleanly (Basis ↔ bartik_d7 without issues)

## Bugs Found and Fixed This Session

### 1. Template path doubling (CRITICAL)
**Symptom**: `theme('page')` returned empty string. No visible error.
**Root cause**: Template paths in our map were absolute (`/var/www/html/backdrop/../drupal/modules/system`), but Backdrop's `theme()` at `theme.inc:1584` prepends `BACKDROP_ROOT`, creating doubled paths: `/var/www/html/backdrop//var/www/html/backdrop/../drupal/...`.
**Fix**: Changed `_d7_theme_compat_get_template_map()` to use relative paths (`../drupal/modules/system`). Also updated `is_dir()` checks to prepend `BACKDROP_ROOT` explicitly.

### 2. `layout_suppress()` failing in `hook_init()` (CRITICAL)
**Symptom**: Layout HTML appearing in page callback result despite `layout_suppress(TRUE)`.
**Root cause**: `_d7_theme_compat_is_d7_theme()` checks the global `$theme`, which is NOT initialized during `hook_init()`. Returns FALSE, so `layout_suppress()` was never called.
**Fix**: In `hook_init()`, read the default theme from `config_get('system.core', 'theme_default')` and check `list_themes()` directly instead of relying on the global.

### 3. Front page uses `layout_page_callback` (KNOWN LIMITATION)
**Discovery**: The 'home' path in Backdrop has `layout_page_callback` as its page callback. This function always renders through the Layout system, regardless of `layout_suppress()`. So `/` still produces Layout HTML even when suppressed.
**Workaround**: Test with `/node/1` instead. The front page issue needs a different solution (change `site_frontpage` config to 'node', or override the menu router entry).

### 4. `$attributes` printing as `Array` on `<body>` tag
**Symptom**: `<body class="..." Array>` in html.tpl.php output.
**Root cause**: `_d7_theme_compat_preprocess_html()` didn't initialize `$variables['attributes']` or `$variables['attributes_array']`, so Backdrop's default (an array) was passed through unflatten.
**Fix**: Initialize `$variables['attributes_array'] = array()` and `$variables['attributes'] = ''` in the html preprocess.

### 5. `xml:lang=""` empty in `<html>` tag
**Symptom**: D7's html.tpl.php uses `$language->language`, but Backdrop's language object uses `$language->langcode`.
**Fix**: In preprocess functions, clone the language object and set `$language->language = $language->langcode` when the D7 property is missing.

## Key Lessons Learned

1. **Template paths MUST be relative to BACKDROP_ROOT**: Backdrop's `theme()` prepends `BACKDROP_ROOT` to all template paths when including the file. Absolute paths get doubled.

2. **`$theme` global is NOT available during `hook_init()`**: Theme initialization happens after `hook_init()`. Use `config_get()` and `list_themes()` to detect the theme during early bootstrap.

3. **`layout_suppress()` doesn't affect `layout_page_callback` routes**: The suppress function prevents the route handler from wrapping content in a layout, but Layout-managed pages (whose page callback IS `layout_page_callback`) still render through Layout because `menu_default_route_handler()` just calls the page callback.

4. **Debug with file logging, not `error_log()`**: In ddev, PHP's `error_log()` with no configured path goes to stderr which may not be captured. Use `file_put_contents('/tmp/debug.log', ...)` instead.

5. **Backdrop language object differs from D7**: D7 uses `$language->language` for the language code; Backdrop uses `$language->langcode`. Both have `$language->direction` (0=ltr, 1=rtl) but D7 templates expect `$language->dir` ('ltr'/'rtl').

## Current State

- **Module**: `d7_theme_compat` enabled, clean (no debug code)
- **Default theme**: `bartik_d7` (can switch to Basis cleanly)
- **Working**: `/node/1` renders 200 with full D7 HTML structure
- **Not working**: `/` (front page) — gets Layout HTML due to `layout_page_callback`
- **Caching**: Disabled at admin/config/development/performance
- **Views**: Still has old `views-view-grid.tpl.php` implode() errors (only triggered on front page)

## Module Architecture (Current)

```
d7_theme_compat.module
├── _d7_theme_compat_get_template_map()     — Relative paths to D7 templates
├── hook_system_info_alter()                — Injects backdrop=1.x for D7 themes
├── hook_init()                            — layout_suppress(TRUE) via config check
├── hook_page_delivery_callback_alter()     — Replaces delivery with D7-style
├── _d7_theme_compat_deliver_html_page()    — theme('page') + theme('html') wrapper
├── hook_theme_registry_alter()             — Redirects templates + injects preprocess
├── d7_theme_compat_preprocess_page()       — Populates D7 page variables
├── _d7_theme_compat_preprocess_html()      — Populates html.tpl.php variables
├── _d7_theme_compat_is_d7_theme()          — Checks if active theme is D7
├── _d7_theme_compat_get_d7_theme_path()    — Gets D7 theme directory
├── _d7_theme_compat_setup_variables()      — Creates *_array vars from Backdrop arrays
└── _d7_theme_compat_flatten_variables()    — Flattens arrays to strings for D7 templates
```

## Next Steps

### Immediate priorities
1. **Fix front page**: Either change `site_frontpage` to 'node', or implement `hook_menu_alter()` to change the 'home' route's page callback
2. **Disable Views** (user offered) to eliminate the views-view-grid errors
3. **Test admin pages**: Admin overlay/toolbar — do they work or break?

### Medium-term
4. **Bartik's template.php**: D7 Bartik has `bartik_preprocess_html()`, `bartik_process_html()`, `bartik_process_page()` — these use `variable_get()` and manipulate `classes_array`. Need to verify they run.
5. **Block assignment**: D7 themes have regions in .info but no blocks assigned. Need a way to assign blocks to D7 regions.
6. **Logo/site name**: These variables are set but may not display if the theme's template expects specific conditions.
7. **CSS conflicts**: Bartik's CSS references D7-style markup structure. Verify it matches what we're producing.

### Future
8. **Test with D7 Seven**: Admin theme
9. **Expand to more themes**: Once Bartik is solid
10. **Package the module**: Remove dependency on `../drupal/` install (copy D7 templates into the module)

## Files Modified

| File | Action |
|------|--------|
| `backdrop/modules/d7_theme_compat/d7_theme_compat.module` | Heavily modified — added delivery callback, fixed paths, fixed language compat |

## References

- `backdrop/core/includes/theme.inc:1584` — Where Backdrop prepends BACKDROP_ROOT to template paths
- `backdrop/core/includes/menu.inc:529` — Where the route handler config is read
- `backdrop/core/modules/layout/layout.pages.inc:10` — `layout_page_callback()` — always renders through Layout
- Backdrop menu router: `home` path → `layout_page_callback('home', 0)`
- Backdrop menu router: `node` path → `node_page_default()` (D7-compatible)

Last updated: 2026-02-22 by claude
