# Handoff: Module Directory Restructure

**Date:** 2026-02-25
**Author:** Claude (Cursor, claude-4.6-opus)

## What was done

Restructured the project so that all custom module source code lives at the
project root, not buried inside CMS installation directories. The Backdrop and
Drupal 7 installs are test harnesses; the modules are the deliverables.

### New layout

```
modules/                          # Backdrop modules (source of truth)
  d7_theme_compat/                #   Main deliverable
  theme_menu_block/               #   Dev tool
  current_theme_block/            #   Dev tool
  watchdog_tools/                 #   Dev tool (Bee commands)
  theme_tester/                   #   Dev tool (Bee commands)
  lost_regions/                   #   Dev tool
  sample_animal_content/          #   Test content

d7-modules/                       # Drupal 7 ports (separate code, same purpose)
  theme_menu_block/               #   D7 port of dev tool
  current_theme_block/            #   D7 port of dev tool
  sample_animal_content/          #   D7 port of test content
```

Each module is symlinked into its respective CMS install:

- `backdrop/modules/<name>` -> `../../modules/<name>`
- `drupal-7/sites/all/modules/<name>` -> `../../../../d7-modules/<name>`

### Other changes

- `.gitignore`: Added negation patterns to track `backdrop/.ddev/php/short-open-tag.ini`
  (required for D7 theme `<?print` syntax with PHP 8.3)
- `d7_theme_compat.module`: includes changes from prior session (debug code removed,
  module functioning normally)

## What worked

- `git mv` cleanly renamed all tracked Backdrop modules
- Symlinks are transparent to PHP — both sites return HTTP 200
- Git correctly tracks symlinks as symlinks (not dereferencing them)

## Current state

- Both ddev sites (`theme-machine.ddev.site` and `drupal-7.ddev.site`) are operational
- All modules load via symlinks
- Ready to commit

## Prior handoffs

- `handoff-2026-02-23-d7-theme-next-50-codex.md` — theme shortlists
- `handoff-2026-02-23-d7-theme-compat-four-themes-codex.md` — four-theme testing
- `handoff-2026-02-22-codex-review-ddev-move-claude.md` — D7 review + ddev relocation
