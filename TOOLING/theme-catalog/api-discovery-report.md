# API Discovery Report: D7 Theme Catalog

**Epic:** epic0228-theme-catalog  
**Story:** api-discovery  
**Date:** 2026-02-28

---

## Summary

| Metric | Value |
|--------|-------|
| Themes extracted | **151** |
| Search pages | 7 |
| Sample validated | 8/8 |
| Field coverage (body, author) | OK |
| Taxonomy terms | Resolvable to human-readable labels |

---

## Count Note

**Discrepancy:** User reported 800+ themes from a similar query a day or two prior. Current extraction: **151**. Reason unknown; flag for follow-up if expectations differ.

---

## Pagination

- **URL pattern:** `{SEARCH_URL}&page={0..6}`
- **Page size:** ~25 themes per page (last page: 2 themes)
- **Total pages:** 7

---

## Theme List Extraction

- **Source:** HTML of Drupal.org project_theme search result
- **Method:** Regex `href="/project/([a-z0-9_]+)"` — exclude `issues`, `project_theme`
- **Output:** Machine names (e.g. `zen`, `bartik`, `bluemarine`)
- **Full list:** `api-discovery-report.json` → `machine_names` array

---

## API Validation

**Endpoint:** `https://www.drupal.org/api-d7/node.json?type=project_theme&field_project_machine_name={machine}`

**Sample themes tested:** bootstrap, beta, koi, smashing_dilectio, chameleon, stark, noprob, bluemarine

**Fields verified present:** body, author, created, changed, project_usage, taxonomy_vocabulary_44, taxonomy_vocabulary_46, field_project_images

**Taxonomy resolution:**  
`/api-d7/taxonomy_term/{tid}.json` returns `name` (e.g. "Actively maintained", "Maintenance fixes only")

---

## Rate Limits

- **Delay used:** 1.5s between requests
- **No throttling observed** during discovery run (~55 seconds total)
- **Recommendation:** Keep 1–1.5s delay for production scraper

---

## Fetch Method

Drupal.org returns 403 for Python `urllib` and `requests` from this environment. **Solution:** Use `curl` via subprocess. Script: `TOOLING/theme-catalog/discover-d7-themes.py`
