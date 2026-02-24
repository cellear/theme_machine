# Watchdog Tools

A lightweight Backdrop module that adds Bee CLI commands for managing the watchdog log.

## Purpose

Built for the THEME-MACHINE project so agents and developers can quickly clear and inspect the watchdog log from the command line during theme smoke-testing, without navigating admin pages or writing raw SQL.

## Commands

### `bee watchdog-clear`

Aliases: `wc`, `wd-clear`

Truncates the watchdog table and reports how many entries were removed. If the log is already empty it says so and exits cleanly.

```bash
ddev bee watchdog-clear
# ✔ Cleared 47 watchdog log entries.
```

### `bee watchdog-count`

Aliases: `wcount`, `wd-count`

Shows the total number of watchdog entries, with optional filters.

```bash
ddev bee watchdog-count
# ℹ Watchdog entries: 47

ddev bee watchdog-count --severity=error
# ℹ Watchdog entries (severity=error): 3

ddev bee watchdog-count --type=php
# ℹ Watchdog entries (type=php): 12

ddev bee watchdog-count --severity=warning --type=php
# ℹ Watchdog entries (severity=warning, type=php): 5
```

Valid severity values: emergency, alert, critical, error, warning, notice, info, debug.

## Files

```
backdrop/modules/watchdog_tools/
  watchdog_tools.info      # Module metadata
  watchdog_tools.module    # Placeholder (required by Backdrop)
  watchdog_tools.bee.inc   # Bee command definitions and callbacks
```

## How Bee command extensions work

Bee discovers commands by looking for `MODULE_NAME.bee.inc` files in enabled modules. The file implements `hook_bee_command()` returning an array of command definitions (name, description, callback, aliases, options, examples). Bee picks these up automatically after the module is enabled and caches are cleared.

## Setup

```bash
ddev bee en watchdog_tools
```

No configuration, no permissions, no database tables.

Last updated: 2026-02-23 by cursor
