# D7 Theme Compatibility

Lets you run unmodified Drupal 7 themes on a Backdrop CMS site. Install the module, enable it, set your D7 theme as the active theme, and your site renders using that theme's original templates and stylesheets — no manual porting required. The module handles template bridging, region mapping, layout suppression, and optional injection of D7 core CSS that many themes depend on.

## Requirements

- Backdrop CMS 1.x
- PHP 8.1 or higher

## Installation

1. Download or copy the `d7_theme_compat` directory into your site's `modules/` folder.
2. Go to **Admin > Functionality** and enable **D7 Theme Compatibility**.
3. Visit **Admin > Configuration > User Interface > D7 Theme Compatibility** to review settings.
4. Install your D7 theme into `themes/` and set it as the active theme.

If you use Bee:

```bash
bee dl d7_theme_compat
bee en d7_theme_compat
```

## Settings Page

Visit **Admin > Configuration > User Interface > D7 Theme Compatibility** (`admin/config/user-interface/d7-theme-compat`).

**Inject Drupal 7 core CSS** (default: on)
Loads a bundled copy of D7's system CSS files (system.base, system.menus, system.messages, system.theme, node, comment, field, user). Most D7 themes were designed against these styles and will look broken without them.

**Show region labels overlay** (default: off)
Draws dashed outlines around every theme region and overlays a badge with the region machine name. Useful when you are placing blocks and want to confirm which region is which.

**Auto-sync layout templates** (default: on)
Keeps Backdrop's Default and Front Page layout templates in sync with the regions declared by the active D7 theme. Disable this if you have manually customised your layout templates and do not want them overwritten.

### Per-Theme Overrides

Any setting can be overridden for a specific theme. Open the per-theme override form, pick a theme, and set only the values you want to change — all other settings fall back to the global defaults. This is useful if one theme needs D7 CSS off while the rest use it.

## How It Works

When a D7 theme (identified by `core = 7.x` in its `.info` file) is active, the module:

1. **Bridges templates** — Redirects Backdrop's template discovery so D7 core templates (`html.tpl.php`, `page.tpl.php`, `node.tpl.php`, etc.) are served through Backdrop-compatible equivalents that maintain D7's template variable contract.
2. **Suppresses layouts** — Backdrop's Layout system is bypassed; the theme renders directly through `page.tpl.php` as it did in D7.
3. **Maps regions** — The theme's declared regions are made available in Backdrop's Layout UI for block placement.
4. **Populates D7 page variables** — `$logo`, `$site_name`, `$main_menu`, `$breadcrumb`, `$tabs`, and other standard D7 page variables are populated so themes that reference them render correctly.
5. **Injects CSS/JS** — Optionally loads bundled D7 core stylesheets that many themes expect to be present.

## Known Limitations

**PHP 8.0-incompatible themes will not render.**
Themes that use curly-brace array access syntax (`$array{0}`), which was removed in PHP 8.0, cause a PHP fatal error. The module detects this failure, flags the theme in watchdog, and falls back to the default theme. This is intentional — silent failure would be harder to diagnose. Check the watchdog log (`Reports > Recent log messages`) if a theme produces a blank page.

**PHP 8.3 warnings are expected and normal.**
Most D7 themes were written for PHP 5.x and produce deprecation warnings on PHP 8.3 (dynamic properties, `${var}` string interpolation, etc.). These warnings appear in the watchdog log on both a D7 site and a Backdrop site running PHP 8.3 — they are not caused by this module. The theme will still render. See the [Theme Machine project](https://github.com/cellear/theme-machine) for data on which themes are affected across the full D7 theme catalog.

**Color module is not supported.**
D7 themes that use the `color` module for dynamic colour schemes will not have their colour settings carried over. The theme will render with its default stylesheet colours.

**Admin theme is unaffected.**
D7 CSS injection and region labels only activate when a D7 theme is the site's active front-end theme. Backdrop's admin theme (typically Basis) is not changed.

**D7-specific contrib dependencies.**
Themes that require D7-only contrib modules (advanced theme settings modules, D7-specific colour extensions, etc.) may not fully integrate. The theme will still render; the contrib-dependent features will be absent.

## Background

This module was developed as part of the [Theme Machine](https://github.com/cellear/theme-machine) project, which tests all public D7 themes against Backdrop CMS to measure compatibility at scale. As of the first full run (184 themes, March 2026), every theme rendered a page — no hard failures. 98 of those themes actually produced *fewer* errors on Backdrop than on D7 itself, which is a notable result.

## License

Released under the [GPL v2](LICENSE.txt) license, consistent with Drupal and Backdrop licensing conventions.
