# Changelog — D7 Theme Compatibility

## 1.0.0 — Initial release

- Template bridging: D7 core templates (`html.tpl.php`, `page.tpl.php`, `node.tpl.php`, `block.tpl.php`, `comment.tpl.php`, `field.tpl.php`, `region.tpl.php`, `user-picture.tpl.php`, `user-profile.tpl.php`, `maintenance-page.tpl.php`) redirected through Backdrop-compatible equivalents
- Layout suppression: Backdrop's Layout system bypassed when a D7 theme is active; theme renders via `page.tpl.php` as it did in D7
- Region mapping: D7 theme regions automatically mapped and surfaced in Backdrop's Layout UI for block placement
- D7 page variable parity: `$logo`, `$site_name`, `$main_menu`, `$secondary_menu`, `$breadcrumb`, `$tabs`, `$messages`, and other standard D7 page variables populated for template use
- D7 core CSS injection: bundled copies of D7's `system.base`, `system.menus`, `system.messages`, `system.theme`, `node`, `comment`, `field`, and `user` stylesheets; toggle on the settings page (default: on)
- Region labels overlay: dashed outlines and machine-name badges on all theme regions; debug aid for block placement (default: off)
- Auto-sync layout templates: keeps Backdrop's Default and Front Page layouts in sync with the active D7 theme's declared regions (default: on)
- Admin settings UI at `admin/config/user-interface/d7-theme-compat`
- Per-theme overrides: any global setting can be overridden for a specific theme
- PHP fatal detection: themes with PHP 8.0-incompatible curly-brace array syntax (`$arr{0}`) are flagged in watchdog and the site falls back to the default theme rather than going blank
- Ships with a `d7_default` layout plugin so Backdrop's layout system has a valid target when D7 themes are active
