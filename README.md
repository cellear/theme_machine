# Theme Machine

**The product:** [`modules/d7_theme_compat/`](modules/d7_theme_compat/) — a Backdrop CMS module that lets unmodified Drupal 7 themes run on Backdrop CMS. Install just that module on any Backdrop site.

Everything else in this repo is the development and testing environment used to build and validate it across 170+ D7 themes.

## What d7_theme_compat does

Makes D7 themes installable and renderable on Backdrop by:

- Injecting `backdrop = 1.x` into D7 `.info` files so Backdrop recognizes them
- Suppressing Backdrop's Layout system and rendering pages D7-style via `theme('page', ...)`
- Redirecting Backdrop's theme registry to use D7 core templates (shipped inside the module)
- Flattening Backdrop's array-style `$classes` and `$attributes` variables to strings, as D7 templates expect

## Utility modules

These support the testing workflow and may be useful independently:

| Module | What it does |
|---|---|
| `modules/theme_tester/` | Bee CLI command (`bee theme-test`) — smoke-tests all enabled themes automatically |
| `modules/watchdog_tools/` | Bee CLI commands for managing the watchdog log (`bee watchdog-clear`, `bee watchdog-count`) |
| `modules/theme_menu_block/` | Block that lists all enabled themes as one-click switcher links |
| `modules/lost_regions/` | Rescues blocks placed in regions that the active D7 theme doesn't declare |
| `d7-modules/` | D7 ports of `sample_animal_content` and `theme_menu_block` for the D7 test site |

## Requirements

- [Backdrop CMS](https://backdropcms.org) 1.x
- PHP 7.1+

## Installation

Copy `modules/d7_theme_compat/` into your Backdrop site's modules directory and enable it.

For the full testing environment, see the `_workspace/` directory.

## Repository structure

```
README.md               This file
DOC/                    Reference documentation
modules/                The product — Backdrop modules
  d7_theme_compat/        The compatibility layer
  theme_tester/           Automated theme smoke-testing
  watchdog_tools/         Watchdog log CLI tools
  theme_menu_block/       Theme switcher block
  lost_regions/           Fallback region rendering
d7-modules/             D7 ports of utility modules

_workspace/             Development & testing environment
  backdrop/               Backdrop CMS install (DDEV project)
  drupal-7/               Drupal 7 install (DDEV project)
  scripts/                Testing pipeline (compare.js, triage.js, etc.)
  TOOLING/                Theme catalogs, triage data, test results
  SPRINTS/                Sprint tracking
  HANDOFF/                Session journals
  CLAUDE.md               AI agent instructions
```

## Documentation

- [`DOC/scripts-reference.md`](DOC/scripts-reference.md) — Testing pipeline quick reference
- [`DOC/backdrop-for-llms.md`](DOC/backdrop-for-llms.md) — Backdrop vs D7 quick reference
- [`DOC/template-mapping.md`](DOC/template-mapping.md) — D7 ↔ Backdrop template substitution strategy
- [`DOC/theme-tester.md`](DOC/theme-tester.md) — `bee theme-test` usage
- [`DOC/lost-regions.md`](DOC/lost-regions.md) — Lost Regions module setup
