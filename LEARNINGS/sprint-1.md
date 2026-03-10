# Backdrop for Drupal 7 Developers — Sprint 1 Learnings

Sprint 1 built the comparison pipeline: 10 themes captured with Playwright, compared side by side in an HTML report. Along the way it surfaced concrete differences between D7 and Backdrop that any D7 developer porting a theme will encounter.

---

## 1. There is no `html.tpl.php` in Backdrop

In D7, `html.tpl.php` wraps everything — `<html>`, `<head>`, `<body>` — and `page.tpl.php` sits inside it. Backdrop removed `html.tpl.php`. The Layout module handles page structure now.

**What this means for D7 themes:** An unmodified D7 theme that defines both `html.tpl.php` and `page.tpl.php` will have neither loaded by Backdrop unless you intervene. The `d7_theme_compat` module ships D7 core templates and redirects the theme registry to use them, so D7 themes get their templates without modification.

**Key hook:** `hook_theme_registry_alter()` is where `d7_theme_compat` redirects template paths. Template paths in the registry must be relative to `BACKDROP_ROOT` — not absolute. Getting this wrong gives doubled paths like `/var/www/html//var/www/html/...`.

---

## 2. `$classes` and `$attributes` are arrays, not strings

In D7, `$classes` and `$attributes` in `.tpl.php` files are already rendered strings (e.g. `class="sidebar first"`). In Backdrop, they're arrays. D7 templates that do `class="<?php print $classes; ?>"` will output `Array`.

**Fix used in d7_theme_compat:** The compatibility preprocess functions call `implode(' ', $classes)` and `backdrop_attributes($attributes)` before passing variables to the templates. D7 themes never see the array form.

---

## 3. The Layout module bypasses block-to-region assignments

D7 uses the `{block}` database table to assign blocks to regions. Enable a module with blocks, go to admin/structure/block, place them. Backdrop uses a Layout system: each URL pattern has a Layout config (JSON in `files/config_*/active/`), and blocks are placed in the Layout, not the block table.

**For D7 theme testing, this is irrelevant** — `d7_theme_compat` calls `layout_suppress(TRUE)`, which bypasses the Layout module entirely and falls back to D7-style `hook_page_build()` rendering. But if you're building a Backdrop module that injects content, you inject it via `hook_page_build()`, not via the block admin UI.

---

## 4. `hook_page_build()` is the universal injection point

Both D7 and Backdrop have `hook_page_build(&$page)`. It fires before the page is assembled and lets modules add render arrays to any region key (`$page['content']`, `$page['sidebar_first']`, etc.). This works regardless of whether the Layout module is active.

The `current_theme_block` module in this project uses it to show the active theme name at the top of every page, bypassing per-theme block configuration entirely. This is the pattern `region_labels` follows in Sprint 2.

---

## 5. CSS/JS loading order differs

D7 themes call `drupal_add_css()` inside `template_preprocess_page()` to inject per-theme CSS. In Backdrop, the preprocess timing is similar, but the hook order can differ. Symptoms: styles that appeared in D7 reports are missing or duplicated in Backdrop.

The fix is to load CSS from `hook_page_build()` or `hook_init()` instead of relying on theme preprocess timing, or to use the `#attached` render array key to attach styles at render time.

---

## 6. Body classes differ (`two-sidebars`, `one-sidebar`)

D7's `template_process_page()` generates body classes like `two-sidebars` when both sidebars have content. Backdrop doesn't have an equivalent — Layout handles regions, so body classes from region presence aren't set the same way.

**Impact on compat:** The D7 themes that rely on body classes for two-column layout will still apply their CSS rules, but if the body class isn't set, the layout falls back to a single column. `d7_theme_compat` addresses this by populating sidebar variables so themes can check `$left` and `$right` directly rather than relying on body classes alone.

---

## 7. `theme_get_setting()` works differently

D7's `theme_get_setting('toggle_logo')` reads from the theme-specific variable, falling back to defaults in the theme's `.info` file. Backdrop replaced per-theme variable storage with config (`config.get('system.theme.{theme_name}', 'settings')`).

`drupal.inc` provides a compatibility wrapper, but some edge cases (reading settings for a theme other than the active one) may not work correctly. In practice: most D7 themes read logo and site-name toggle settings in their preprocess, and the compat layer handles the common cases.

---

## 8. Watchdog is your friend for PHP 8.3 issues

Most D7 themes were written for PHP 5.3–5.6. Running them on PHP 8.3 (which Backdrop requires) surfaces deprecated patterns:

- `each()` — removed in PHP 8.0
- `create_function()` — removed in PHP 8.0
- Dynamic properties on non-stdClass objects — deprecated in PHP 8.2
- `${var}` string interpolation — deprecated in PHP 8.2

These don't always cause white screens. Themes often render fine while logging PHP notices and warnings. The compare pipeline uses `ddev drush watchdog-show --severity=error --type=php` (D7) and `ddev bee log --severity=error --type=php` (Backdrop) after each render to surface these.

A `clean` watchdog status means the theme rendered with no PHP errors. An `errors` status means look at the log before trusting the screenshot.

---

## 9. `ddev bee` vs `ddev drush`

Backdrop uses **Bee** as its CLI tool — it's the Drush equivalent, purpose-built for Backdrop. Common equivalents:

| D7 / Drush | Backdrop / Bee |
|---|---|
| `ddev drush pm-enable foo` | `ddev bee en foo` |
| `ddev drush pm-disable foo` | `ddev bee dis foo` |
| `ddev drush cc all` | `ddev bee cache-clear` (or `cc all`) |
| `ddev drush watchdog-delete all` | `ddev bee watchdog-clear` (if available) |
| `ddev drush watchdog-show --severity=error` | `ddev bee log --severity=error` |
| `ddev drush vget theme_default` | `ddev bee config-get system.core theme_default` |
| `ddev drush vset theme_default foo` | `ddev bee config-set system.core theme_default foo` |

**Run Bee commands from the `backdrop/` directory** (where the ddev project lives).

---

Source: `.handoff/` files from Sprint 1 (2026-03-07 — 2026-03-08)

Last updated: 2026-03-10 by Claude Sonnet 4.6
