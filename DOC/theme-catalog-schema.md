# D7 Theme Catalog Schema

Schema for the scraped Drupal.org theme catalog. Defines both CSV (summary) and JSON (complete) formats, plus directory layout for screenshots and other assets.

**Epic:** epic0228-theme-catalog  
**Last updated:** 2026-02-28 by cursor

---

## Output Formats

| Format | Purpose | Content |
|--------|---------|---------|
| **CSV** | Spreadsheet review, quick scans | Metadata only; **no descriptions** or other multi-line content |
| **JSON** | Complete data, programmatic use | Full catalog including descriptions, image paths, etc. |

---

## Directory Hierarchy

```
TOOLING/
  theme-catalog/
    00-theme-catalog.csv          # CSV summary (00- prefix sorts first)
    catalog.json                  # Complete catalog
    {machine_name}/               # One dir per theme for screenshots/assets
      screenshot.png
      ...
```

**Rationale:**
- `00-theme-catalog.csv` — Numeric prefix ensures it sorts before other files (e.g. `01-`, `02-` for future artifacts).
- `catalog.json` — Single file with all themes; simple to consume.
- `{machine_name}/` — Directories named by theme machine name; each holds that theme's screenshots and other downloaded assets. Matches the `machine_name` key in JSON.

---

## CSV Schema

**File:** `TOOLING/theme-catalog/00-theme-catalog.csv`

**Columns (in order):**

| Column | Type | Notes |
|--------|------|-------|
| machine_name | string | Drupal.org project machine name |
| name | string | Human-readable title |
| project_url | string | e.g. https://www.drupal.org/project/zen |
| created | string | ISO 8601 date (YYYY-MM-DD) |
| changed | string | ISO 8601 date (YYYY-MM-DD) |
| author | string | Drupal.org username |
| install_count_7x | integer | Active D7 installs (from project_usage) |
| security_coverage | string | `covered` or `not-covered` |
| maintenance_status | string | Resolved taxonomy label or empty |
| development_status | string | Resolved taxonomy label or empty |
| has_screenshots | boolean | `true` or `false` |

**Excluded from CSV:** `description` (multi-line, HTML-stripped; use JSON for full content).

---

## JSON Schema

**File:** `TOOLING/theme-catalog/catalog.json`

**Structure:**

```json
{
  "generated": "2026-02-28T12:00:00Z",
  "source_url": "https://www.drupal.org/project/project_theme?...",
  "theme_count": 140,
  "themes": [
    {
      "machine_name": "zen",
      "name": "Zen",
      "project_url": "https://www.drupal.org/project/zen",
      "created": "2006-05-15",
      "changed": "2024-01-20",
      "author": "john.albin",
      "install_count_7x": 45000,
      "security_coverage": "covered",
      "maintenance_status": "Actively maintained",
      "development_status": "Maintenance fixes only",
      "description": "Zen is a powerful, flexible theme...",
      "screenshots": [
        "zen/screenshot.png",
        "zen/screenshot2.png"
      ]
    }
  ]
}
```

**Field details:**

| Field | Type | Notes |
|-------|------|-------|
| machine_name | string | Used for dir names, downloads |
| name | string | From `title` |
| project_url | string | From `url` |
| created | string | ISO 8601 date |
| changed | string | ISO 8601 date |
| author | string | From `author.name` |
| install_count_7x | integer \| null | Sum or primary 7.x branch from project_usage |
| security_coverage | string | `covered` or `not-covered` |
| maintenance_status | string | Human-readable from taxonomy_vocabulary_44 |
| development_status | string | Human-readable from taxonomy_vocabulary_46 |
| description | string | HTML stripped to plain text |
| screenshots | string[] | Paths relative to theme-catalog root, e.g. `zen/screenshot.png` |

---

## Image / Asset Storage

- **Location:** `TOOLING/theme-catalog/{machine_name}/`
- **Naming:** Preserve original filename when downloading (e.g. `screenshot.png`). If multiple images, use `screenshot-1.png`, `screenshot-2.png` or the API-provided alt/filename.
- **Reference in JSON:** `screenshots` array contains paths like `zen/screenshot.png` (relative to `theme-catalog/`).

---

## HTML in Descriptions

- **JSON:** Strip HTML tags; store plain text. Optionally normalize whitespace and newlines.
- **CSV:** Omit description entirely.

---

## Catalog Scope: Why 151 Themes

The scraper filters to `sm_field_project_type=full`, which limits results to projects promoted to "full" status on drupal.org. This is a meaningful quality signal, not a bureaucratic label — a project reaches full status only after community review.

**The catalog has 151 themes.** Earlier planning documents estimated ~761; that number was wrong. The scraper paginates correctly and 151 is the genuine total for full-status D7 themes.

### What "full" excludes

Roughly 600 additional D7-compatible projects exist in sandbox status. For D7 (EOL January 2025, peak usage ~2012–2018), the sandbox population is mostly:

- Abandoned experiments that never shipped
- One-off client themes accidentally uploaded
- Themes started and dropped mid-development
- Duplicates and forks that never diverged meaningfully
- A small number of real themes that simply never sought promotion

### Why 151 is the right working set

The full-status themes are the ones real D7 sites actually used. Install counts confirm this: Bootstrap (35k installs), Omega (12k), AdaptiveTheme (9.5k). These are the themes worth demonstrating Backdrop compatibility with.

For the project's stated goal — showing that D7 themes work on Backdrop with minor modifications — 151 well-used themes makes a stronger case than 750 themes where half are half-finished experiments.

### If you ever want more

Remove the `sm_field_project_type=full` filter from the search URL in `scrape-theme-catalog.py`. You could then cherry-pick by `install_count_7x` to surface sandbox themes that actually had real users. That's a future option, not a current gap.

Last updated: 2026-03-11 by Claude Sonnet 4.6
