# Story: API Discovery & D7 Theme Count

**Story ID:** api-discovery
**Epic:** epic0228-theme-catalog
**Status:** finished
**Points:** 2 (small)

## Description

Use the canonical D7 theme search URL to obtain the full list of theme project URLs/machine names. Confirm pagination of the search results, then verify that the API returns full metadata for each theme.

## Tasks

- [x] Fetch the D7 theme search URL (see epic-definition.md); confirm total count (~140) and pagination (`&page=0`, `&page=1`, …)
- [x] Parse search result HTML to extract theme project links or machine names (one list of ~140 items)
- [x] For 5–10 themes from that list, fetch full node via API (by URL or machine name) and verify: body, author, images, dates, project_usage
- [x] Check if taxonomy terms (44, 46) can be resolved to human-readable labels
- [x] Test rate limits — how fast can we request without getting throttled?
- [x] Document findings in a short report

## Acceptance Criteria

- [x] Complete list of D7 theme project machine names from the canonical search (**151 themes**)
- [x] Confirmed pagination: 7 pages, ~25 themes/page
- [x] Sample API response for 8 themes; field coverage validated

## Findings (2026-02-28)

- **Count:** 151 themes (discrepancy with prior 800+ report noted in epic)
- **Pagination:** `&page=0` through `&page=6`; 7 pages total
- **API:** `field_project_machine_name={machine}` works; returns full node
- **Taxonomy:** `/api-d7/taxonomy_term/{tid}.json` resolves to human-readable `name`
- **Rate limit:** 1.5s delay; no throttling observed
- **Fetch:** Drupal.org returns 403 for Python urllib/requests; script uses `curl` via subprocess

## Reference

- **Report:** `TOOLING/theme-catalog/api-discovery-report.md`
- **Data:** `TOOLING/theme-catalog/api-discovery-report.json`
- **Script:** `TOOLING/theme-catalog/discover-d7-themes.py`

**Canonical D7 theme search:**  
`https://www.drupal.org/project/project_theme?f%5B44%5D=&f%5B46%5D=&f%5B47%5D=sm_core_compatibility%3A7&f%5B48%5D=sm_field_project_type%3Afull&f%5B49%5D=&f%5B50%5D=&text=&solrsort=ds_created+desc&op=Search`
