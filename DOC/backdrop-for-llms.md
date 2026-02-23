# Backdrop CMS for LLMs

Quick-reference for AI agents working on Backdrop CMS projects. Backdrop is
a fork of Drupal 7, so many D7 concepts apply, but there are significant
differences.

## Development Environment

This project uses **ddev** for local development. The ddev project lives
inside the `backdrop/` directory (i.e., `backdrop/.ddev/`).

- Site URL: `https://theme-machine.ddev.site/`
- PHP 8.3
- Backdrop root inside ddev container: `/var/www/html`
- Local Backdrop root: `backdrop/` (relative to project root)
- **Run `ddev` commands from the `backdrop/` directory** (or use `cd backdrop &&` prefix)

### Bee (Backdrop CLI tool)

Bee is the Backdrop equivalent of Drush. Installed via:
```
ddev add-on get backdrop-ops/ddev-backdrop-bee
```

Common commands:
```bash
ddev bee pml --type=module        # List modules (name, status, version)
ddev bee pml --type=theme         # List themes
ddev bee en <module_name>         # Enable a module
ddev bee dis <module_name>        # Disable a module
ddev bee en --type=theme <name>   # Enable a theme
ddev bee theme-default <name>     # Set the default theme
ddev bee cc all                   # Clear all caches (CRITICAL after code changes)
ddev bee log                      # Show recent watchdog log entries
ddev bee log --count=10 --severity=error  # Show recent errors
ddev bee log --count=25 --severity=error --type=php  # PHP errors only
ddev bee help <command>           # Get help on a command
ddev bee config-get <file> <key>  # Read a config value
```

**Important**: There is no `ddev bee themes` command. Use `ddev bee pml --type=theme`.

## Backdrop vs Drupal 7: Key Differences

### Configuration Management (CMI)
- D7: `variable_get()`/`variable_set()` → stored in `{variable}` table
- Backdrop: `config_get('file.name', 'key')` → stored in JSON files in `files/config_*/active/`
- The `drupal.inc` compat layer wraps many `variable_get()` calls, but not all

### Theme System
- D7: `html.tpl.php` wraps `page.tpl.php`. Process layer flattens arrays to strings.
- Backdrop: No `html.tpl.php`. No process layer. Layout module handles page structure.
- D7 `$classes` = string. Backdrop `$classes` = array (use `implode(' ', $classes)`)
- D7 `$attributes` = string. Backdrop `$attributes` = array (use `backdrop_attributes()`)
- D7 has `$classes_array` for manipulation. Backdrop just uses `$classes` directly.
- D7 page templates may rely on `$show_messages`; compatibility preprocess should
  always set it (boolean), then derive `$messages` from that flag.
- Verified with current compat layer on node pages: `bartik_d7`, `garland_d7`,
  `bluebreeze`, `simpleclean`, `talata`, `clean_theme`, `classic_blog`.

### Layout Module (Backdrop-only)
- Replaces D7's block-to-region system for page structure
- Themes no longer define regions in `.info` files (Layout handles it)
- `layout_suppress(TRUE)` bypasses the Layout system's route handler
- `layout_route_handler()` is the entry point; falls back to
  `menu_default_route_handler()` when suppressed
- **GOTCHA**: `layout_suppress()` does NOT affect routes whose page callback
  IS `layout_page_callback` (e.g., the 'home' path). Those still render
  through Layout because `menu_default_route_handler()` just calls the
  page callback directly.
- The route handler is configured in `system.core` config: `menu_route_handler`
- Regular node pages (e.g., `node/1`) use `node_page_view` as callback and
  work correctly with `layout_suppress()`

### Theme Discovery Pipeline
1. `backdrop_system_listing()` scans for `.info` files in `themes/` directories
2. `_system_rebuild_theme_data()` parses `.info`, checks `type != 'theme'`
3. `hook_system_info_alter()` fires — modules can modify parsed info
4. `system_themes_page()` checks for `backdrop = 1.x` compatibility
5. A theme without `backdrop = 1.x` shows as "incompatible" (no Enable button)
6. `hook_system_info_alter()` can inject `backdrop = 1.x` to make D7 themes valid

### Function Name Mapping
| D7 function | Backdrop function |
|-------------|-------------------|
| `drupal_attributes()` | `backdrop_attributes()` |
| `drupal_get_css()` | `backdrop_get_css()` |
| `drupal_get_js()` | `backdrop_get_js()` |
| `drupal_get_html_head()` | `backdrop_get_html_head()` |
| `drupal_render()` | `backdrop_render()` (also `render()` shorthand) |
| `drupal_add_css()` | `backdrop_add_css()` |
| `drupal_add_js()` | `backdrop_add_js()` |
| `drupal_set_message()` | `backdrop_set_message()` |
| `drupal_get_path()` | `backdrop_get_path()` |
| `drupal_html_class()` | `backdrop_html_class()` |

The `drupal.inc` compatibility layer (enabled by default via
`$settings['backdrop_drupal_compatibility'] = TRUE` in settings.php)
provides wrappers so the D7 function names still work.

### Page Rendering Flow
1. `menu_execute_active_handler()` runs the page callback
2. Result goes to `backdrop_deliver_html_page()`
3. Normal path: `layout_route_handler()` wraps output in a Layout
4. Suppressed path: `menu_default_route_handler()` → `backdrop_render_page()`
   → `theme('page', ...)` — this is D7-style rendering
5. `backdrop_render_page($page)` calls `theme('page', array('page' => render($page)))`

### .info File Format
D7:
```ini
name = My Theme
core = 7.x
```

Backdrop:
```ini
name = My Theme
type = theme
backdrop = 1.x
```

Both use the same .ini-style parser. D7 files don't set `type` (Backdrop
defaults to accepting them through the type check). The `backdrop = 1.x`
key is what matters for compatibility.

### Template File Locations
- D7: templates live alongside the module (e.g., `modules/node/node.tpl.php`)
- Backdrop: templates live in `templates/` subdirectory (e.g., `modules/node/templates/node.tpl.php`)

### Theme Registry
- Stored in cache, rebuilt on cache clear
- `hook_theme_registry_alter()` can modify any hook's preprocess functions,
  template path, or template file
- Each entry has: `preprocess functions` (array), `path`, `template` or
  `function`, `variables` or `render element`
- For template hooks, `path` indicates where the `.tpl.php` lives
- For function hooks, `function` names the PHP function (e.g., `theme_image`)

### Language Object Differences
- D7: `$language->language` = language code (e.g., 'en')
- Backdrop: `$language->langcode` = language code (e.g., 'en')
- D7: `$language->dir` = 'ltr' or 'rtl'
- Backdrop: `$language->direction` = 0 (ltr) or 1 (rtl); no `->dir` property
- D7 templates (html.tpl.php) use `$language->language` and `$language->dir`

### Template Path Handling
- **CRITICAL**: Backdrop's `theme()` function prepends `BACKDROP_ROOT` when
  including template files (see `theme.inc:1584`).
- Template paths in the registry must be RELATIVE to `BACKDROP_ROOT`.
- Using absolute paths causes doubled paths like
  `/var/www/html//var/www/html/../drupal/...`
- D7 templates are shipped inside `d7_theme_compat/templates/` (not
  referenced from outside the Backdrop root).
- **CRITICAL**: Backdrop's registry may store the `template` key with full
  subdirectory paths (e.g., `core/modules/user/templates/user-picture`
  instead of just `user-picture`). When redirecting template paths, you
  MUST also strip directory components from the `template` key with
  `basename()`, otherwise the include will try to find
  `your-path/core/modules/user/templates/user-picture.tpl.php`.
- Some hooks use `function` instead of `template` in the registry (e.g.,
  `field` uses `theme_field()`). These don't have templates to redirect.
- Some D7 hooks aren't registered in Backdrop at all (e.g., `region` is
  handled entirely by the Layout module).

### Bootstrap Timing
- `hook_init()` runs BEFORE the global `$theme` is initialized
- To detect the active theme in `hook_init()`, use
  `config_get('system.core', 'theme_default')` + `list_themes()` directly
- `hook_page_delivery_callback_alter()` runs AFTER theme initialization

## Debugging Tips

- Always `ddev bee cc all` after changing `.module` files, `.info` files,
  or anything that affects the theme registry
- Check `ddev bee log --severity=error` after page loads to see PHP errors
- Use `curl -s -o /dev/null -w "%{http_code}" "https://theme-machine.ddev.site/"`
  to quickly check if the site returns 200 vs 500
- Use `curl -s "https://..." | head -5` to see the top of the HTML output
- When the site shows a maintenance page, it usually means the main page
  rendering hit a fatal error and fell back to the error handler
- **error_log()** in ddev: PHP's `error_log()` with no configured path goes
  to stderr which may not be captured. Use `file_put_contents('/tmp/debug.log', ...)`
  and read with `ddev exec cat /tmp/debug.log` instead.

## File Structure (this project)

```
THEME-MACHINE/
  backdrop/                          # Backdrop CMS install (ddev root)
    .ddev/                           # ddev config (moved here from project root)
    core/                            # Backdrop core
      includes/theme.inc             # Theme engine
      includes/common.inc            # backdrop_render_page(), etc.
      includes/drupal.inc            # D7 compatibility wrappers
      modules/layout/layout.module   # Layout system
      modules/system/                # System module + core templates
      themes/                        # Core themes (basis, bartik, seven)
    modules/                         # Custom/contrib modules
      d7_theme_compat/               # OUR MODULE
        templates/                   # D7 core templates (copied, not referenced)
    themes/                          # Custom/D7 themes
      bartik_d7/                     # D7 Bartik (renamed — name collision)
      garland_d7/                    # D7 Garland (renamed — name collision)
      bluebreeze/                    # D7 Bluebreeze (unmodified)
      simpleclean/                   # D7 Simple Clean (unmodified)
      talata/                        # D7 Talata (unmodified)
      clean_theme/                   # D7 Clean Theme (unmodified)
      classic_blog/                  # D7 Classic Blog (unmodified)
  drupal/                            # Stock Drupal 7.103 install (has its own ddev)
  INCOMING/                          # Raw theme clones for triage (not in git)
  DOC/                               # Persistent reference docs
  HANDOFF/                           # Session journals
```

Last updated: 2026-02-22 by claude (ddev moved to backdrop/, updated paths and theme list)
