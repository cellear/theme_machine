# Drupal 7 Theme Catalog (Full Projects)

Reference catalog of Drupal.org themes from this exact filtered listing:

- `https://www.drupal.org/project/project_theme?f%5B44%5D=&f%5B46%5D=&f%5B47%5D=sm_core_compatibility%3A7&f%5B48%5D=sm_field_project_type%3Afull&f%5B49%5D=&f%5B50%5D=&text=&solrsort=ds_created%20desc&op=Search`

Snapshot details:

- Result count on source page at extraction time: `761 themes`
- Pager range at extraction time: pages `0..30`
- Extraction date: `2026-02-23`
- Data file: `DOC/d7-theme-catalog.tsv`

## Data columns

`DOC/d7-theme-catalog.tsv` is tab-separated with this schema:

1. `rank`  
   Position in listing order (created date desc as returned by the source filter).
2. `listing_page`  
   Pager page number from Drupal.org (`0`-based).
3. `page_position`  
   Position within that page (`1`-based).
4. `project_machine_name`
5. `title`
6. `teaser`  
   Short project description snippet from listing results.
7. `project_url`
8. `git_clone_url`

## Notes

- This is a crawl snapshot, not a live index.
- `teaser` text may be truncated by Drupal.org with `...`.
- Some projects in this filtered list are base themes, starter kits, or cross-version projects; not all are “simple themes”.

## Quick usage examples

Show first 20 rows:

```bash
sed -n '1,21p' DOC/d7-theme-catalog.tsv
```

Find likely “simple” candidates by title/teaser keywords:

```bash
rg -n -i 'simple|clean|minimal|starter' DOC/d7-theme-catalog.tsv
```

Get only project names for batch cloning:

```bash
cut -f4 DOC/d7-theme-catalog.tsv | tail -n +2
```

Last updated: 2026-02-23 by codex
