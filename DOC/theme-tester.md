# Theme Tester

A Backdrop module that provides a Bee CLI command to smoke-test all enabled themes automatically.

## What it does

For each enabled theme, the `bee theme-test` command:

1. Clears the watchdog log
2. Switches the default theme
3. Clears all caches
4. Makes an HTTP request to a test page (default: `/node/1`)
5. Checks watchdog for errors (severity <= ERROR) and counts warnings
6. Records which standard D7 layout regions the theme doesn't declare
7. Restores the original default theme when done

## Commands

### `bee theme-test`

Alias: `tt`

```bash
# Test all enabled themes
ddev bee theme-test --base-url=http://localhost

# Test specific themes only
ddev bee theme-test --base-url=http://localhost --themes=bartik_d7,garland_d7

# Test against a different page
ddev bee theme-test --base-url=http://localhost --path=node/5

# Save a markdown report (path must be writable from inside the container)
ddev bee theme-test --base-url=http://localhost --report=/var/www/html/modules/theme_tester/results.md
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--base-url` | `$GLOBALS['base_url']` | Base URL for HTTP requests. Use `http://localhost` inside ddev. |
| `--path` | `node/1` | Internal path to request for each theme. |
| `--themes` | all enabled | Comma-separated list of machine names to test. |
| `--report` | none | File path to save a markdown report. Must be a container-accessible path. |

### Output

Console shows real-time progress, then a summary:

```
[PASS] Bartik (Drupal 7) (bartik_d7) — HTTP 200, 0 errors, 0 warnings, missing regions: none
[FAIL] SuperClean (superclean) — HTTP 500, 1 errors, 4 warnings, missing regions: header, sidebar_first, ...
  -> Error: Cannot access private property BlockLegacy::$content ...
```

### Report file

When `--report` is used, a markdown file is generated with:
- Summary table (status, HTTP code, error/warning counts, missing regions)
- Error details section listing each failure's error messages
- Missing regions section

**Note on paths**: The `--report` path is resolved inside the ddev container. Use container-absolute paths like `/var/www/html/modules/theme_tester/results.md`, then copy the file out to `DOC/` from the host. The `DOC/` directory is outside the web root and not directly writable from the container.

## Standard regions checked

These are the regions defined in the `d7_default` layout template:

content, header, footer, sidebar_first, sidebar_second, highlighted, help

Themes that don't declare a region won't display blocks placed there (unless `lost_regions` module is catching them).

## Files

```
backdrop/modules/theme_tester/
  theme_tester.info      # Module metadata
  theme_tester.module    # Placeholder
  theme_tester.bee.inc   # Bee command and report generator
```

## Setup

```bash
ddev bee en theme_tester
```

No configuration, no permissions, no database tables.

Last updated: 2026-02-23 by cursor
