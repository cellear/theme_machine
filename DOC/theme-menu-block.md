# Theme Menu Block

A lightweight Backdrop module that provides a block for switching the site's default theme with one click.

## Purpose

Built for the THEME-MACHINE project to make it fast to toggle between the many D7 themes under test, without navigating to the admin appearance page each time.

## How it works

The module registers a single block ("Theme Menu Block") that:

1. Lists all **enabled** themes alphabetically by human-readable name
2. Shows the current default theme in **bold** with "(active)"
3. All other themes are rendered as clickable links
4. Clicking a link hits the `theme-switcher/MACHINE_NAME` callback, which:
   - Validates a CSRF token
   - Sets the clicked theme as the default via `config_set('system.core', 'theme_default', ...)`
   - Clears all caches
   - Shows a confirmation message
   - Redirects back to the page you were on

## Files

```
backdrop/modules/theme_menu_block/
  theme_menu_block.info      # Module metadata
  theme_menu_block.module    # All logic (~110 lines)
```

## Hooks implemented

| Hook | Purpose |
|------|---------|
| `hook_permission()` | Defines "switch themes" permission |
| `hook_menu()` | Registers `theme-switcher/%` callback path |
| `hook_block_info()` | Registers the block |
| `hook_block_view()` | Builds the themed list of links |

## Security

- Every switch link includes a CSRF token generated with `backdrop_get_token('theme_menu_block_MACHINE_NAME')`
- The callback validates the token with `backdrop_valid_token()` before doing anything
- Access is gated by the "switch themes" permission — only users with that permission see the block or can use the callback

## Setup

1. Enable: `ddev bee en theme_menu_block`
2. Go to Structure > Layouts and place the "Theme Menu Block" block in a region (e.g., sidebar)
3. Grant the "switch themes" permission to the appropriate role(s) at admin/config/people/permissions

## Notes

- The block only lists themes that are **enabled** (`$theme->status == 1`). Themes that are installed but disabled won't appear.
- The module has no database tables, no config files, and no JavaScript.
- The URL path is `theme-switcher/` (with a hyphen), while the module machine name is `theme_menu_block` (with underscores).

Last updated: 2026-02-23 by cursor
