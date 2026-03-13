# Story: Download Theme Screenshots & Images

**Story ID:** download-screenshots
**Epic:** epic0228-theme-catalog
**Status:** 0-backlog
**Points:** 5 (medium)

## Description

For each D7 theme in the catalog, resolve image file references from the API and download screenshots to a local directory organized by machine name.

## Tasks

- [ ] For each theme with `field_project_images`, call `/api-d7/file/{fid}` to get the actual file URL
- [ ] Download each image to `TOOLING/theme-screenshots/{machine_name}/`
- [ ] Handle themes with no images (skip gracefully)
- [ ] Handle themes with multiple images
- [ ] Respect rate limits (1-2s delay between file API calls)
- [ ] Add image path to catalog data (update catalog file)
- [ ] Report: X themes with images, Y themes without

## Acceptance Criteria

- Screenshots downloaded for all themes that have them
- Organized in directories by machine name
- Catalog updated with local image paths
- No broken/partial downloads

## Dependencies

- build-scraper (for theme list with image file IDs)

## Notes

Each image requires a separate API call to resolve the file URI to a download URL. This is the slowest part of the pipeline — if 500 themes have images, that's 500+ extra API calls. May want to batch or parallelize carefully.
