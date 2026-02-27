# Handoff: DDEV Symlink Fixes + Theme Restore

**Date:** 2026-02-25
**Author:** Cursor (claude-4.6-sonnet)

## Problem

Three errors on startup after the previous session's module reorganization:

1. `theme_menu_block` and `current_theme_block` missing from filesystem (D7 site)
2. Same modules missing (Backdrop site)
3. `bluebreeze` theme errors (Backdrop site) — all 47 D7 themes were empty shells

## Root Cause

The previous session set up a smart git-friendly module structure using symlinks:

- `drupal-7/sites/all/modules/{module}` → `../../../../d7-modules/{module}`
- `backdrop/modules/{module}` → `../../modules/{module}`

Both resolve correctly on the host, but **DDEV only mounts the project's own docroot** into
the container. The symlink targets (`/var/www/d7-modules/` and `/var/www/modules/`) didn't
exist inside either container, making the modules invisible to Drupal/Backdrop.

The theme issue was separate: the 47 D7 theme directories in `backdrop/themes/` all contained
only `.DS_Store` files — actual theme files were gone from disk, probably from a `git clean`
or similar. The active theme (`bluebreeze`) was therefore broken.

## Fixes Applied

### 1. D7 site — module mount
Created `drupal-7/.ddev/docker-compose.d7-modules.yaml`:
```yaml
services:
  web:
    volumes:
      - "${DDEV_APPROOT}/../d7-modules:/var/www/d7-modules"
```
Mounts the repo-root `d7-modules/` at the path symlinks resolve to inside the container.

### 2. Backdrop site — module mount
Created `backdrop/.ddev/docker-compose.modules.yaml`:
```yaml
services:
  web:
    volumes:
      - "${DDEV_APPROOT}/../modules:/var/www/modules"
```
Mounts the repo-root `modules/` at the path symlinks resolve to inside the container.

### 3. Backdrop default theme
Switched `theme_default` from `bluebreeze` to `basis` in:
`backdrop/files/config_152f5614c0b20abf0caba0ca2e5bbe8c/active/system.core.json`

Basis is a real Backdrop core theme; bluebreeze files were gone.

### 4. Restore 47 D7 themes to backdrop/themes/

31 themes copied from `drupal-7/sites/all/themes/` (already present there).
2 themes (`bartik_d7`, `garland_d7`) copied from `drupal-7/themes/` (D7 core themes),
renamed directory + `.info` filename.
14 themes downloaded fresh via `ddev exec drush dl` in the drupal-7 project:
adaptic (7.x-1.3), addari, adelante, b2_drupal_plus, bartik_fb, black_lagoon (7.x-1.3),
changeme (beta1), fdt_yellow (alpha1), lightword, nigraphic (4.1), redsalute, 
shakennotstirred (1.1), superclean (beta1), templist.

## Current State

- Both DDEV projects running clean
- All custom modules accessible in both containers
- All 47 D7 themes present and recognized in Backdrop's Appearance admin
- Default theme: Basis (stable)
- No module-missing or theme warnings on either site

## Architecture Notes

The symlink strategy is correct and should be preserved:
- `modules/` at repo root → shared by Backdrop site via symlinks
- `d7-modules/` at repo root → shared by D7 site via symlinks
- DDEV docker-compose overrides make this work inside containers
- See `DOC/backdrop-for-llms.md` for overall project structure

## Files Created/Modified

- `drupal-7/.ddev/docker-compose.d7-modules.yaml` — NEW (D7 container mount)
- `backdrop/.ddev/docker-compose.modules.yaml` — NEW (Backdrop container mount)
- `backdrop/files/.../system.core.json` — theme_default bluebreeze → basis
- `backdrop/themes/{47 themes}` — restored from copies + downloads
