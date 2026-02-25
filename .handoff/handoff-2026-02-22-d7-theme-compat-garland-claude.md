# Handoff: D7 Theme Compat — Garland Support (Session 4)

**Date**: 2026-02-22
**Author**: claude
**Prior sessions**: handoff-2026-02-22-d7-theme-compat-templates-claude.md

## What was attempted

Added Garland (D7's other core theme) to test the compat module with a
structurally different theme. Garland differs from Bartik in key ways:
- No regions declared in .info (uses D7 defaults)
- Templates in theme root (not a templates/ subdirectory)
- Custom preprocess variables ($primary_nav, $secondary_nav, $site_title)
- Uses D7's process layer (garland_process_html, garland_process_page)
- Calls D7 color module functions (_color_page_alter, _color_html_alter)

## What was done

### Garland theme setup
- Copied D7 Garland to `backdrop/themes/garland_d7/`
- Renamed .info to `garland_d7.info`, updated name/description/package

### Bug fixes discovered through Garland testing

1. **D7 default regions**: Themes without regions in .info now get D7 defaults
   (sidebar_first, sidebar_second, content, header, footer, highlighted, help,
   page_top, page_bottom). Previously only populated from .info declarations.

2. **Theme function prefix mismatch**: When D7 themes are renamed (garland ->
   garland_d7), their preprocess/process functions have the wrong prefix.
   Added `_d7_theme_compat_register_theme_functions()` which:
   - Detects the original D7 function prefix (tries removing `_d7` suffix first)
   - Falls back to scanning all defined functions for preprocess patterns
   - Injects both preprocess AND process functions into the registry
   - Process functions (D7-only, Backdrop removed them) inserted before flatten

3. **D7 color module stubs**: D7 themes call `_color_page_alter()` and
   `_color_html_alter()` which don't exist in Backdrop's color module.
   Added harmless stubs with `function_exists()` guards.

4. **D7-style tabs structure**: Backdrop's `menu_local_tabs()` returns a string;
   D7 returned `array('#primary' => ..., '#secondary' => ...)`. Garland's
   `garland_preprocess_page()` accesses `$tabs['#secondary']`. Fixed by
   building the D7 structure from `menu_primary_local_tasks()` and
   `menu_secondary_local_tasks()`.

5. **$theme->uri vs ->filename** (committed separately): Backdrop theme objects
   use `->filename`, not `->uri`. Caused 8 warnings per registry rebuild.

## Current state

- **Garland renders cleanly** on node pages
- **Bartik still works** (verified no regressions)
- Theme switching between all three (Basis, bartik_d7, garland_d7) works
- Front page still deferred (layout_page_callback issue)

## Files modified

- `backdrop/modules/d7_theme_compat/d7_theme_compat.module` — major additions:
  - D7 default regions fallback in preprocess_page
  - `_d7_theme_compat_register_theme_functions()` — prefix detection + injection
  - `_color_html_alter()` / `_color_page_alter()` stubs
  - D7-style tabs array structure
- `backdrop/themes/garland_d7/` — new theme (copied from drupal/themes/garland)
- `backdrop/themes/garland_d7/garland_d7.info` — renamed + updated description

## Key insight: renamed D7 themes lose their function hooks

This is a fundamental issue when D7 themes are renamed for clarity. The theme
registry uses the machine name as the function prefix. A theme named `garland_d7`
looks for `garland_d7_preprocess_page()`, but the original code defines
`garland_preprocess_page()`. The compat module now handles this automatically.

## References

- `DOC/backdrop-for-llms.md` — template path handling, function name mapping
- `DOC/template-mapping.md` — template inventory + resolved questions
