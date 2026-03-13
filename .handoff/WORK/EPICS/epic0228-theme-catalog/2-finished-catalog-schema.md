# Story: Design Catalog Schema & Output Format

**Story ID:** catalog-schema
**Epic:** epic0228-theme-catalog
**Status:** done
**Points:** 2 (small)

## Description

Decide on the catalog output format (CSV, JSON, or XML) and define the exact column/field schema.

## Tasks

- [x] Evaluate formats: CSV (simple, spreadsheet-friendly), JSON (structured, queryable), XML (verbose but self-describing)
- [x] Define column order and naming
- [x] Decide how to handle HTML in descriptions (strip tags? keep markdown?)
- [x] Decide how to reference screenshots (inline path? separate manifest?)
- [x] Create a sample catalog file with 3-5 hand-entered themes as a template

## Acceptance Criteria

- [x] Format decision documented with rationale
- [x] Schema definition with all fields, types, and ordering
- [x] Sample file committed as a reference template

## Decisions (2026-02-28)

- **Both CSV and JSON** — CSV for spreadsheet review; JSON is the complete source (descriptions, multi-line content).
- **CSV excludes descriptions** — Multi-line content is awkward in CSV; use JSON for full content.
- **Directory layout:** `TOOLING/theme-catalog/` with `00-theme-catalog.csv` (sorts first), `catalog.json`, and `{machine_name}/` per theme for screenshots.
- **Screenshot paths in JSON:** Relative paths like `zen/screenshot.png` (relative to theme-catalog root).

## Reference

- **Schema:** `DOC/theme-catalog-schema.md`
- **Sample:** `TOOLING/theme-catalog/00-theme-catalog.csv`, `TOOLING/theme-catalog/catalog.json`
