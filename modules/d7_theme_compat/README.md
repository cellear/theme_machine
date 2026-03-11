# D7 Theme Compatibility

Enables unmodified Drupal 7 themes to run on Backdrop CMS. This module bridges the gap between D7 theme expectations and Backdrop's theme system, allowing site owners to install and use D7 themes with minimal friction.

## Requirements

- Backdrop CMS 1.x
- PHP 8.1 or higher

## Installation

```bash
bee dl d7_theme_compat
bee en d7_theme_compat
```

## Configuration

Visit **Admin > Configuration > User Interface > D7 Theme Compatibility** to configure:

- **Inject Drupal 7 core CSS** — Load bundled D7 system CSS (system.base, node, comment, field, user, etc.). Most D7 themes depend on these styles for basic formatting. Default: ON.
- **Show region labels overlay** — Display dashed outlines and region name badges on all theme regions (debug tool). Default: OFF.
- **Auto-sync layout templates** — Automatically update the Default and Front Page layout templates to match the active D7 theme's declared regions. Allows manual pin to a standard layout if needed. Default: ON.

### Per-Theme Overrides

Each setting can be overridden on a per-theme basis. Override only the settings you want to change for a specific theme; others inherit the global defaults.

## How It Works

When a D7 theme (identified by `core = 7.x` in its `.info` file) is active:

1. **Template bridging** — D7 core templates (html.tpl.php, page.tpl.php, node.tpl.php, etc.) are redirected to Backdrop-compatible equivalents that maintain D7's template contract.
2. **Layout suppression** — Backdrop's Layout system is suppressed; D7 themes render directly via page.tpl.php instead.
3. **Region mapping** — D7 theme regions are automatically mapped and made available in the Backdrop Layout UI for block placement.
4. **D7 variable parity** — Page variables ($logo, $site_name, $main_menu, $breadcrumb, etc.) are populated to match D7's theme layer expectations.
5. **CSS/JS injection** — Optional bundled D7 core CSS can be injected to provide styles that themes may depend on.

## Known Limitations

- **Color module** — D7 themes using the `color` module for dynamic color schemes may not work as expected; color settings are not carried over to Backdrop.
- **PHP 8.x incompatibility** — D7 themes written for PHP 5.x or early 6.x may trigger warnings or errors on PHP 8.1+ due to deprecated patterns (e.g., `each()`, `create_function()`, dynamic properties). These themes will render but may fill the watchdog log with PHP warnings.
- **Admin-only themes** — Backdrop's admin theme (typically Basis) is not affected; D7 CSS injection and region labels only apply when a D7 theme is the site's active theme.
- **Theme customizations** — Themes that rely on D7-specific contrib modules (e.g., theme settings modules, advanced color module extensions) may not fully integrate.

## Companion Modules

- **lost_regions** — Rescues block placements that end up in regions no longer declared by the active theme.
- **theme_tester** — Automated testing helper for D7 themes on Backdrop.

## License

This module is released under the [GPL v2](LICENSE.txt) license, consistent with Drupal/Backdrop licensing.
