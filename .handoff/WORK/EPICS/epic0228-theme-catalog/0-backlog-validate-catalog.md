# Story: Validate Catalog Against Local Install

**Story ID:** validate-catalog
**Epic:** epic0228-theme-catalog
**Status:** 0-backlog
**Points:** 2 (small)

## Description

Cross-reference the scraped catalog against the 47 D7 themes already installed in this project. Identify matches, missing themes, and any data discrepancies.

## Tasks

- [ ] Load catalog and extract machine names
- [ ] List locally installed themes (from `backdrop/themes/` or `.info` files)
- [ ] Report: which local themes are in the catalog, which aren't (if any are custom/non-Drupal.org)
- [ ] Report: total catalog themes vs. local themes (coverage percentage)
- [ ] Flag any data quality issues (missing fields, suspicious values)

## Acceptance Criteria

- Validation report showing match/mismatch between catalog and local themes
- Any gaps or anomalies documented
- Confidence that the catalog is complete for Drupal.org-hosted D7 themes

## Dependencies

- build-scraper (complete catalog needed)
