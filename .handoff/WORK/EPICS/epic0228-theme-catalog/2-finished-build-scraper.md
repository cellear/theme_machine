# Story: Build Theme Metadata Scraper

**Story ID:** build-scraper
**Epic:** epic0228-theme-catalog
**Status:** finished
**Points:** 5 (medium)

## Description

Write a script that (1) scrapes the canonical D7 theme search URL to get the list of theme project URLs/machine names, (2) for each theme fetches full metadata from the Drupal.org API, and (3) writes the catalog in the chosen output format.

## Tasks

- [x] Choose scripting language (Python + curl via subprocess; csv/json stdlib)
- [x] Implement search-page fetcher: paginate the canonical D7 theme search URL, parse HTML to extract theme project links or machine names
- [x] For each theme in the list, fetch full node from API (by machine name) with polite delay (1.5s)
- [x] Extract fields: name, machine_name, url, created, changed, author, install_count, security_coverage, description, maintenance_status, development_status
- [x] Strip HTML from description field
- [x] Handle missing/null fields gracefully (placeholder for API failures)
- [x] Write output to CSV and JSON per schema
- [x] Add progress reporting ([N/151] Fetching …)
- [x] Add resume capability (--resume loads scrape-progress.json)

## Acceptance Criteria

- [x] Script runs end-to-end and produces a complete catalog
- [x] All 151 D7 themes from the canonical search are captured
- [x] Handles API errors gracefully (placeholder + continue; progress saved for resume)
- [x] Output files well-formed and parseable

## Deliverables

- **Script:** `TOOLING/theme-catalog/scrape-theme-catalog.py`
- **Output:** `TOOLING/theme-catalog/00-theme-catalog.csv`, `TOOLING/theme-catalog/catalog.json`
- **Usage:** `python3 scrape-theme-catalog.py` (full run) or `python3 scrape-theme-catalog.py --resume` (after failure)
- **Options:** `--limit N` (test with N themes), `--resume`

## Notes

- One theme (decayed) returned non-JSON on first run; resume succeeded. Script now adds placeholder on API failure and continues.
- Taxonomy terms resolved via `/api-d7/taxonomy_term/{tid}.json`; cached in memory.
- Uses curl (Drupal.org 403 for Python urllib/requests).
