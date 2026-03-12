# Theme Machine

A Backdrop CMS project that makes Drupal 7 themes run on Backdrop — with a suite of utility modules built to support the workflow.

## What it is

**Theme Machine** is a local Backdrop CMS installation wired up to test D7 theme compatibility. The core of the project is `d7_theme_compat`, a module that bridges the gap between Drupal 7's theme layer and Backdrop's. Around it are four utility modules that make large-scale theme testing practical.

## Modules

### `d7_theme_compat`

The compatibility layer. Makes D7 themes installable and renderable on Backdrop by:

- Injecting `backdrop = 1.x` into D7 `.info` files so Backdrop recognizes them
- Suppressing Backdrop's Layout system and rendering pages D7-style via `theme('page', ...)`
- Redirecting Backdrop's theme registry to use D7 core templates (shipped inside the module)
- Flattening Backdrop's array-style `$classes` and `$attributes` variables to strings, as D7 templates expect

### `theme_tester`

A Bee CLI command (`bee theme-test`) that smoke-tests all enabled themes automatically. For each theme it clears the log, switches the default, makes an HTTP request, checks for errors, and restores the original theme. See `DOC/theme-tester.md`.

### `watchdog_tools`

Bee CLI commands for managing the watchdog log from the terminal: `bee watchdog-clear` and `bee watchdog-count`. See `DOC/watchdog-tools.md`.

### `theme_menu_block`

A block that lists all enabled themes as one-click switcher links. Handy for toggling between themes without going through admin pages. See `DOC/theme-menu-block.md`.

### `lost_regions`

Rescues blocks placed in Layout regions that the active D7 theme doesn't declare. Blocks that would otherwise vanish silently are rendered in a fallback area. See `DOC/lost-regions.md`.

## Requirements

- [Backdrop CMS](https://backdropcms.org) 1.x
- [ddev](https://ddev.readthedocs.io) (local development environment)
- [Bee](https://github.com/backdrop-contrib/bee) (Backdrop CLI, installed via ddev add-on)

## Getting started

```bash
# Clone the repo
git clone <repo-url> theme_machine
cd theme_machine/backdrop

# Start ddev
ddev start

# Install the add-on for Bee
ddev add-on get backdrop-ops/ddev-backdrop-bee

# Enable the compat layer and utilities
ddev bee en d7_theme_compat theme_tester watchdog_tools theme_menu_block lost_regions

# Clear caches
ddev bee cc all
```

The site runs at `https://theme-machine.ddev.site/`.

## Documentation

- `DOC/backdrop-for-llms.md` — Backdrop vs D7 quick reference (also useful for human developers)
- `DOC/template-mapping.md` — Strategy for D7 ↔ Backdrop template substitution
- `DOC/theme-tester.md` — `bee theme-test` usage and options
- `DOC/watchdog-tools.md` — `bee watchdog-clear` / `bee watchdog-count` usage
- `DOC/theme-menu-block.md` — Theme switcher block setup
- `DOC/lost-regions.md` — Lost Regions module setup
- `DOC/git-conventions.md` — Commit style and workflow conventions
- `TOOLING/` — Internal working data: theme catalogs, triage results, test run output

## Project structure

```
theme_machine/
  backdrop/               # Backdrop CMS install (ddev root)
    modules/              # Custom modules (d7_theme_compat, theme_tester, etc.)
    themes/               # D7 themes under test
  DOC/                    # Reference documentation
  TOOLING/                # Internal working data (catalogs, triage, test results)
```
