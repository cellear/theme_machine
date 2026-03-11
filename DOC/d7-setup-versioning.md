# d7_setup.php Versioning Challenge

**Status:** Unresolved design question

## Problem

`drupal-7/d7_setup.php` is a critical script that standardises the D7 test site
(sets logo, site name, places sidebar blocks). It's not tracked in git because
the entire `drupal-7/` directory is gitignored (it contains site-specific data,
uploads, and the Drush executable).

However, changes to `d7_setup.php` are part of the Theme Machine work and
should be versioned.

## What's in d7_setup.php

- Sets site name to "Theme Machine"
- Sets logo to dib-logo.png for all themes
- Creates/upserts custom Left/Right blocks (March 11, 2026)
- Places those blocks in every theme's sidebars
- Clears caches

## Solutions to explore

1. **Move to a tracked directory** — copy `d7_setup.php` to `scripts/` or
   `d7-modules/d7_setup/` so it's tracked, then invoke it from `drupal-7/`
   via symlink or explicit copy at setup time.

2. **Track as a template** — store in `DOC/d7_setup.php.template` and document
   the "copy to drupal-7/ and run" workflow.

3. **Embed in d7-modules/** — create a custom module that does the same
   standardisation via `hook_install()` instead of a standalone script.

4. **CI/CD automation** — commit to a separate "setup" repo and pull at
   deployment time (overkill for current scope).

## Current workaround

- `d7_setup.php` lives in the running `drupal-7/sites/` (or root) but is not
  version-controlled.
- Changes are documented in handoffs (`.handoff/`) and LEARNINGS files.
- Recreating the setup requires manually copying the script and running
  `ddev drush php-script d7_setup.php`.

## Decision needed

This should be resolved before Sprint 3, when we'll be installing hundreds of
themes. At that point, automated standardisation via d7_setup.php becomes
critical, and we need a reliable way to deploy and version it.

---

**Created:** 2026-03-11
**Related:** `.handoff/handoff-2026-03-11-sidebar-blocks-triage-fix-claude.md`

Last updated: 2026-03-11 by Claude Haiku 4.5
