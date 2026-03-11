# D7 Theme Catalog

Scraped Drupal.org theme catalog. See `DOC/theme-catalog-schema.md` for the schema.

**Location:** `TOOLING/theme-catalog/`

**Contents:**
- `00-theme-catalog.csv` — Summary (no descriptions); 151 themes
- `catalog.json` — Complete catalog with descriptions; 151 themes
- `theme-catalog.md` — Human-readable MD, grouped by maintenance status
- `{machine_name}/` — Directories for screenshots (populated by download-screenshots story)

**Scraper:** `python3 scrape-theme-catalog.py` — Full run (~6 min). Use `--resume` after failure, `--limit N` for testing.

**MD generator:** `python3 generate-catalog-md.py` — Regenerates `theme-catalog.md` from `catalog.json`.
