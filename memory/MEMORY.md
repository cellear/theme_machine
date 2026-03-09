# Theme Machine — Agent Memory

## Project
Backdrop module making D7 themes run natively on Backdrop CMS.
- Backdrop site: `~/Sites/BACKDROP/THEME-MACHINE/backdrop/` — DDEV project `THEME-MACHINE`
- D7 site: `~/Sites/BACKDROP/THEME-MACHINE/drupal-7/` — DDEV project `drupal-7`
- Module: `modules/d7_theme_compat/d7_theme_compat.module`

## Current Sprint
Sprint 1 complete. compare.js 10/10 themes. `reports/comparison.html` is the output.

## Key Module Architecture Notes

### html hook preprocess chain (critical order)
The `html` hook is manually registered in `hook_theme_registry_alter()` step 4 (Backdrop removed html.tpl.php). The preprocess chain MUST be:
1. `_d7_theme_compat_setup_variables`
2. `_d7_theme_compat_preprocess_html` (body classes, language, etc.)
3. `{theme}_preprocess_html` (explicitly added — Backdrop won't auto-add for manually-registered hooks)
4. `{theme}_process_html` (if exists)
5. `_d7_theme_compat_flatten_variables`
6. `_d7_theme_compat_finalize_html` (CSS/JS/head collected LAST — after theme added its CSS)

### Sidebar body classes
D7's `system_preprocess_html()` adds `two-sidebars`, `one-sidebar sidebar-first`, etc. Backdrop's system doesn't. The module replicates this in `_d7_theme_compat_preprocess_html()` using a `backdrop_static('d7_compat_page_layout')` value set during page preprocessing.

### Logo
`theme_get_setting('logo')` returns empty for D7 themes with no Backdrop settings config. Read from `system.core` (`site_logo_path` / `site_logo_theme`) as fallback.

### Site name
Always output — D7 themes control their own `toggle_name` display logic in page.tpl.php.

## Block Configuration (Sprint 1)
- Both sites: sidebar_first = user:login, sidebar_second = views:show_all_nodes
- 3 themes without sidebar_second (classic_blog, plasma, simpleclean) — correct behavior on both sides
- D7 setup script: `drupal-7/d7_setup.php` (safe to re-run)

## Drush/Bee Commands
- Backdrop cache: `cd backdrop && ddev drush cache-clear all`
- D7 cache: `cd drupal-7 && ddev exec drush cc all`
- D7 php-script: `cd drupal-7 && ddev exec drush php-script filename.php`
- D7 sql: `cd drupal-7 && ddev exec drush sql-query "..."`
