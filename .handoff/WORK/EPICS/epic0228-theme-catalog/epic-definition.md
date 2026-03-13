# Epic: D7 Theme Catalog

**Epic ID:** epic0228-theme-catalog
**Created:** 2026-02-28
**Status:** Backlog

---

## Goal

Build a comprehensive catalog of Drupal 7 themes by scraping Drupal.org's API. The catalog will serve as the master reference for which themes exist, their metadata, and their visual appearance — feeding downstream decisions about which themes to port, prioritize, and test in Backdrop.

## Scope

- Scrape metadata for all D7-compatible themes from Drupal.org (**151 themes** per 2026-02-28 discovery; see canonical search URL below)
- Collect: theme name, machine name, project URL, created/updated dates, author, D7 compatibility info, security advisory coverage, install counts, and description
- Download screenshots and project images
- Output a structured catalog (format TBD: CSV, JSON, or XML)
- Validate against the 47 themes already installed locally

## Data Source

**Canonical D7 theme list** (search result, 2026-02-28):

- **URL:** `https://www.drupal.org/project/project_theme?f%5B44%5D=&f%5B46%5D=&f%5B47%5D=sm_core_compatibility%3A7&f%5B48%5D=sm_field_project_type%3Afull&f%5B49%5D=&f%5B50%5D=&text=&solrsort=ds_created+desc&op=Search`
- **Filters:** `f[47]=sm_core_compatibility:7`, `f[48]=sm_field_project_type:full` (D7 + full projects only)
- **Result:** 151 themes (2026-02-28); 7 pages; paginated with `&page=0` … `&page=6`
- Use this page (or its HTML/API equivalent) to obtain the **list of theme project URLs**; then fetch full metadata per theme via the API below.

**Discrepancy (not yet investigated):** A similar or same query was run a day or two prior and returned **over 800** D7 themes. The reason for the difference (140 vs 800+) is unknown; document actual count at time of scrape and flag if it differs significantly from expectations.

**Drupal.org REST API** (for full metadata per theme):

- Endpoint: `https://www.drupal.org/api-d7/node.json?type=project_theme&field_project_type=full` (or fetch by node ID/URL if supported)
- Per-theme: fetch node by project machine name or URL to get full fields
- Images require a second API call to resolve file URIs (e.g., `/api-d7/file/{fid}`)

### Fields Available Per Theme

| Field | API key | Notes |
|-------|---------|-------|
| Name | `title` | Human-readable |
| Machine name | `field_project_machine_name` | Used for downloads |
| Project URL | `url` | e.g., `https://www.drupal.org/project/zen` |
| Description | `body.value` | HTML; needs stripping |
| Created | `created` | Unix timestamp |
| Last updated | `changed` | Unix timestamp |
| Author | `author.name` | Drupal.org username |
| D7 installs | `project_usage["7.x-*"]` | Active install count |
| Security coverage | `field_security_advisory_coverage` | `covered` or `not-covered` |
| Screenshots | `field_project_images[].file.uri` | Requires file API lookup |
| Maintenance status | `taxonomy_vocabulary_44` | Term reference |
| Development status | `taxonomy_vocabulary_46` | Term reference |

## Approach

1. **Discovery**: Scrape the canonical D7 theme search URL (above) to get the list of ~140 theme project URLs or machine names
2. **Metadata collection**: For each theme, fetch full node from API; extract fields into structured format
3. **Image retrieval**: Resolve file URIs, download screenshots
4. **Catalog generation**: Output final catalog file(s)
5. **Validation**: Cross-reference with local install

## Risks & Considerations

- **Rate limiting**: Drupal.org may throttle requests; scraper needs polite delays
- **Volume**: ~140 D7 themes; search result is a few pages; then 140 API calls for full metadata
- **Image resolution**: Each image requires a separate `/api-d7/file/{id}` call
- **HTML in descriptions**: Body field contains HTML that needs sanitizing for CSV output
- **Stale data**: Some D7 themes may be abandoned/archived; catalog should capture status

## Backlog order

1. api-discovery ✓
2. catalog-schema ✓
3. build-scraper ✓
4. download-screenshots
5. validate-catalog
6. document-process

## Definition of Done

- [ ] Catalog file exists with all D7-compatible themes from Drupal.org
- [ ] Each entry has: name, machine name, URL, dates, author, install count, security status, description
- [ ] Screenshots downloaded and organized by machine name
- [ ] Catalog validated against the 47 locally installed themes
- [ ] Process is documented and repeatable

---

Last updated: 2026-02-28 by cursor (added canonical D7 theme search URL, ~140 themes)
