# d7_theme_compat — Architecture Brief

How the module works, why each decision was made, and what it takes for an unmodified Drupal 7 theme to render correctly on Backdrop CMS.

---

## The Problem

Drupal 7 themes assume a specific rendering pipeline:

1. A request comes in.
2. Backdrop/Drupal calls a page callback, gets a render array.
3. `theme('page', ...)` renders `page.tpl.php` with region variables populated.
4. `theme('html', ...)` wraps that in `html.tpl.php`.
5. CSS and JS collected during the request are emitted via `$styles` and `$scripts`.

Backdrop changed every step of that pipeline:

- `html.tpl.php` was removed entirely. The Layout module handles page structure.
- The Layout module is the default page renderer — it manages regions, block placement, and URL-pattern routing. D7 themes have no Layout.
- Template variables (`$classes`, `$attributes`) became arrays instead of strings.
- The `template_process()` step — which flattened arrays to strings — was removed.
- CSS/JS loading order and timing shifted.
- Body classes set by region presence (`two-sidebars`, `one-sidebar`) are no longer generated.
- Per-theme settings moved from `variable_get()` to Backdrop's config system.

A D7 theme dropped into Backdrop with none of this addressed will either produce a white screen or render severely broken layout.

The strategy of `d7_theme_compat` is: **don't modify the theme**. Instead, give it a Backdrop environment that looks like D7 from the theme's perspective.

---

## The Seven Mechanisms

### 1. Layout Suppression

**Hook:** `hook_init()`

```php
layout_suppress(TRUE);
```

This single call is the most important. It tells Backdrop's Layout module to step aside. Instead of routing the request through Layout, Backdrop falls back to the pre-Layout rendering path — the same path D7 used:

```
menu callback → backdrop_render_page() → theme('page') → page.tpl.php
```

Without this, Layout tries to render the page, finds no matching layout template for the D7 theme, and either errors or produces blank output.

**Side effect handled:** Block placement is done via the Layout UI, not the D7 block table. Even with Layout suppressed, the module loads the relevant Layout object to read its block assignments and renders them into D7 page region variables (see Mechanism 5).

---

### 2. Template Redirection

**Hook:** `hook_theme_registry_alter()`

D7 ships core templates that Backdrop either removed (`html.tpl.php`, `region.tpl.php`) or significantly changed (`page.tpl.php`, `node.tpl.php`, `block.tpl.php`). When a D7 theme is active, the module redirects the theme registry to use D7 versions of these templates, shipped inside the module at `templates/`:

```
html.tpl.php          maintenance-page.tpl.php
page.tpl.php          user-profile.tpl.php
node.tpl.php          user-picture.tpl.php
block.tpl.php
comment.tpl.php
```

If the active D7 theme provides its own override of any of these (i.e., the theme has its own `node.tpl.php`), the redirect is skipped for that hook. The theme's own template takes precedence, exactly as it would on D7.

The registry redirect also re-registers the `html` hook entirely, since Backdrop removed it. This requires building the full preprocess chain manually (including collecting the theme's own `{theme}_preprocess_html()` functions).

---

### 3. Custom Page Delivery

**Hook:** `hook_page_delivery_callback_alter()`

Even with Layout suppressed, Backdrop's default delivery function `backdrop_deliver_html_page()` would try to render the page through its own system. The module replaces it with `_d7_theme_compat_deliver_html_page()`, which replicates D7's two-template wrapping:

```php
$page_content = theme('page', array('page' => $rendered));
$html_output = theme('html', array('page' => $page_content));
print $html_output;
```

This is the exact sequence D7 used. `html.tpl.php` wraps `page.tpl.php`, which is exactly what every D7 theme expects.

---

### 4. Variable Parity

**Hooks:** `hook_preprocess_page()`, preprocess for `html`

D7's `template_preprocess_page()` populated a rich set of page-level variables that Backdrop's version omits or restructures. The module's preprocess hook reconstructs them:

| Variable | D7 source | How we provide it |
|----------|-----------|-------------------|
| `$page['sidebar_first']` etc. | D7 region system | Built from Layout block assignments |
| `$logo` | `theme_get_setting('logo')` | Read from system.core config |
| `$site_name` | `variable_get('site_name')` | Read from system.core config |
| `$main_menu` | `menu_main_menu()` | Same function, still exists |
| `$tabs` | Rendered tabs | `#primary`/`#secondary` array |
| `$breadcrumb` | `backdrop_get_breadcrumb()` | Same function |
| `$messages` | `theme('status_messages')` | Same function |
| `$layout` | Region presence check | Custom sidebar detection |

Body classes set by D7's `system_preprocess_html()` are also reconstructed:
- `two-sidebars` when both sidebars have content
- `one-sidebar sidebar-first` or `sidebar-second` as appropriate
- `no-sidebars` when both are empty

The sidebar detection is region-name-aware: themes that use `sidebar_left`/`sidebar_right` instead of the standard `sidebar_first`/`sidebar_second` are handled correctly.

---

### 5. Variable Flattening (Restoring template_process)

**Hook:** `hook_theme_registry_alter()` (injecting into preprocess chains)

D7 had a `template_process()` step that ran after all preprocess functions. Its job was to flatten array variables into strings so templates could use them directly:

```php
// D7's template_process():
$variables['classes'] = implode(' ', $variables['classes_array']);
$variables['attributes'] = backdrop_attributes($variables['attributes_array']);
```

Backdrop removed `template_process()`. Templates that do `class="<?php print $classes; ?>"` now print `Array`.

The module injects two functions into every template's preprocess chain:
- **Early:** `_d7_theme_compat_setup_variables()` — creates the `*_array` form of variables from Backdrop's array variables, so D7 preprocess functions can manipulate them.
- **Late:** `_d7_theme_compat_flatten_variables()` — flattens the arrays back to strings before the template renders.

The flatten function only runs for D7 templates (those from the D7 theme or the module's `templates/` directory). Backdrop-native templates (Views, Layout blocks, etc.) are left alone.

---

### 6. Theme Function Registration

**Helper:** `_d7_theme_compat_register_theme_functions()`

Some D7 themes have been renamed in this setup (e.g., `garland` → `garland_d7`). Backdrop looks for `garland_d7_preprocess_page()`, but the theme defines `garland_preprocess_page()`. The function scans defined PHP functions to find the original prefix and injects those preprocess/process functions into the registry manually.

D7's `{theme}_process_{hook}()` functions (the process layer that Backdrop removed) are also detected and injected into the preprocess chain, before the flatten step.

---

### 7. D7 Core CSS Injection

**Hook:** `hook_init()` (conditional)

D7 themes commonly assume that `system.base.css`, `node.css`, `comment.css`, and similar core stylesheets are present. Backdrop reorganised or dropped some of them. The module bundles copies of these files in `css/d7-core/` and injects them at `CSS_SYSTEM` group, weight `-100`, so they load before theme CSS:

```
system.base.css     system.theme.css
system.menus.css    node.css
system.messages.css comment.css
                    field.css
                    user.css
```

This is optional (off switch in settings) but enabled by default, since most D7 themes depend on at least some of these styles.

---

## The Request Flow

When a request comes in with a D7 theme active:

```
Request
  │
  ├─ hook_init()
  │     layout_suppress(TRUE)
  │     sync layout templates if auto_layout_sync enabled
  │     backdrop_add_css(8 D7 core files) if inject_d7_core_css enabled
  │
  ├─ hook_theme_registry_alter()
  │     redirect html/page/node/block/comment template paths
  │     inject setup + flatten into all preprocess chains
  │     register missing html hook
  │     detect + register theme's own preprocess/process functions
  │
  ├─ hook_page_delivery_callback_alter()
  │     replace backdrop_deliver_html_page with custom callback
  │
  ├─ menu callback executes, returns render array
  │
  ├─ d7_theme_compat_preprocess_page()
  │     populate $page['region'] arrays from Layout block assignments
  │     set $logo, $site_name, $main_menu, $tabs, $breadcrumb, $messages
  │     detect sidebar regions, set $layout variable
  │     inject region labels overlay (if enabled)
  │
  ├─ theme('page', ...) → page.tpl.php (D7 version from module)
  │     theme's own page.tpl.php if it has one, otherwise the D7 core fallback
  │
  ├─ _d7_theme_compat_preprocess_html()
  │     set body classes (front/not-front, logged-in, two-sidebars, etc.)
  │     build $head_title
  │
  ├─ _d7_theme_compat_finalize_html()
  │     collect $styles, $scripts, $head after theme's own preprocess runs
  │     (ensures CSS added by theme's preprocess_html is captured)
  │
  └─ theme('html', ...) → html.tpl.php (D7 version from module)
        theme's own html.tpl.php if it has one
```

---

## Configuration

The module exposes three runtime toggles via `admin/config/user-interface/d7-theme-compat`:

| Setting | Default | What it controls |
|---------|---------|-----------------|
| `inject_d7_core_css` | ON | Load bundled D7 core CSS files |
| `region_labels` | OFF | Debug overlay: dashed outlines + region name badges |
| `auto_layout_sync` | ON | Auto-update layout templates when active theme changes |

Each can be overridden per D7 theme. Config lives in `config/d7_theme_compat.settings.json` (Backdrop config system, not variables).

---

## Known Limits

**PHP 8.3 incompatibilities.** Most D7 themes were written for PHP 5.x. Common failures on PHP 8.3: `each()` removed, `create_function()` removed, dynamic property deprecations. These produce PHP warnings in watchdog rather than white screens, but output may be broken. The comparison pipeline flags these.

**Themes with missing dependencies.** Sub-themes that declare a base theme (`base theme = omega`, etc.) will fail if the base theme isn't also installed. The compat layer cannot fix missing code.

**D7 color.module.** Many D7 themes use `color.module` for dynamic color schemes. Backdrop's color module works differently. The compat layer provides stub functions (`_color_html_alter()`, `_color_page_alter()`) to prevent fatals, but colors won't dynamically apply.

**Admin theme.** The D7 theme is the *default* theme. Admin pages use Backdrop's admin theme (typically Basis), which is not a D7 theme. The compat layer does not activate for admin pages.

**Per-path layouts.** The layout sync only manages the Default and Front Page layouts. Complex per-path Layout configurations need manual management.

---

## Evidence

Sprint 2 testing established the baseline: 30 D7 themes render correctly on Backdrop via `d7_theme_compat` with no theme modifications — all in the `TOOLING/theme-triage.json` `ok` bucket. Sprint 3 will extend this to the full catalog of ~761 themes on drupal.org.

The comparison pipeline (`scripts/compare.js`) screenshots each theme on both D7 and Backdrop, checks watchdog for PHP errors/warnings, and feeds results to an interactive reviewer (`scripts/build-reviewer.js`). Pass/fail criteria: clean watchdog + visually comparable output.

---

Last updated: 2026-03-11 by Claude Sonnet 4.6
