# Handoff: D7 Theme Compat — Template Path Fixes (Session 3)

**Date**: 2026-02-22
**Author**: claude
**Prior sessions**: handoff-2026-02-22-d7-theme-compat-init-claude.md, handoff-2026-02-22-d7-theme-compat-rendering-claude.md

## What was attempted

Continued from session 2 where D7 Bartik was rendering pages but producing
template path warnings. User reported two categories of errors:

1. **Hybrid path errors**: Template paths combined our `../drupal/` redirect
   with Backdrop's original subdirectory paths, producing invalid paths like
   `../drupal/modules/user/core/modules/user/templates/user-picture.tpl.php`

2. **Missing registry keys**: `html` hook lacked `type` and `theme path` keys

User explicitly directed: "If you need those files, you should copy them into
the backdrop root — probably in your module file."

## What was done

### Template approach: copy into module (user directive)
- Copied 10 D7 core templates into `d7_theme_compat/templates/`
- Rewrote `_d7_theme_compat_get_template_map()` to use
  `backdrop_get_path('module', 'd7_theme_compat') . '/templates'`
- Removed `field` (uses `theme_field()` function, not a template) and
  `region` (not in Backdrop's registry at all) from the template map

### Critical fix: template key with subdirectory paths
- **Root cause**: Backdrop's theme registry stores the `template` key with
  full subdirectory paths for some hooks (e.g., `core/modules/user/templates/user-picture`
  instead of just `user-picture`). When we override `path` to our flat
  `templates/` directory, the include becomes
  `templates/core/modules/user/templates/user-picture.tpl.php` — wrong!
- **Fix**: Added `basename()` stripping in `hook_theme_registry_alter()`:
  ```php
  if (isset($registry[$hook]['template']) && strpos($registry[$hook]['template'], '/') !== FALSE) {
    $registry[$hook]['template'] = basename($registry[$hook]['template']);
  }
  ```
- Affected hooks: `user_picture`, `user_profile`, `block` (had `templates/block`)

### Other fixes in this session
- Updated `bartik_d7.info`: name="Bartik (Drupal 7)", package="Drupal 7 Themes",
  description identifies it as a D7 theme (user request)
- Fixed flatten function: empty `*_array` variables now produce empty strings
  instead of leaving `$title_attributes` etc. undefined
- Fixed `html` hook registration: added `type` and `theme path` keys
- Rewrote `_d7_theme_compat_setup_variables()` to always initialize
  `classes_array`, `attributes_array`, `title_attributes_array`,
  `content_attributes_array`

## Current state

- **D7 Bartik renders cleanly** on `/node/1`, `/node/2`, `/about`
- All 8 template files resolve correctly (verified with file_exists check)
- **Zero PHP warnings** on page loads after cache clear
- Theme switching between Basis and bartik_d7 works

## What didn't work / lessons learned

- Referencing templates outside the Backdrop root (`../drupal/`) caused
  cascading path issues. User was right — copying is the correct approach.
- Backdrop's `template` registry key is NOT always a simple basename.
  Some modules store it with full subdirectory paths. Any registry
  manipulation MUST account for this.
- `ddev logs` shows the full docker log buffer; clearing PHP error logs
  from the CLI is difficult in ddev. The user cleared logs manually.

## Open questions / blockers

- **Front page**: Still renders through Layout because `layout_page_callback`
  IS the page callback. Options: change `site_frontpage` to `node`, or
  provide a custom route handler.
- **Views templates**: Not yet tested. The flatten function only runs for
  D7 templates (detected by path prefix), so Views should be unaffected.
  But Views' own templates may still have issues with D7 theme overrides.
- **Additional D7 templates**: taxonomy-term, search-results, book-*
  templates not yet shipped. Add as needed when those pages are tested.

## Files modified

- `backdrop/modules/d7_theme_compat/d7_theme_compat.module` — major updates
- `backdrop/themes/bartik_d7/bartik_d7.info` — name/description/package
- `backdrop/modules/d7_theme_compat/templates/` — 10 D7 template files (new)
- `DOC/backdrop-for-llms.md` — updated template path docs
- `DOC/template-mapping.md` — resolved open questions, added shipped list

## References

- `DOC/backdrop-for-llms.md` — template path handling section
- `DOC/template-mapping.md` — full template inventory + decisions
