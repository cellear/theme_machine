# INCOMING Theme Triage (D7 Compat)

## Purpose

Capture the analysis used to choose the next test themes for `d7_theme_compat`, so future sessions can reuse the ranking instead of re-triaging from scratch.

## Scope

Reviewed 12 candidate theme packages in `INCOMING/`:

1. `INCOMING/aberdeen`
2. `INCOMING/bluebreeze`
3. `INCOMING/bluebreeze/bluebreeze_fixed`
4. `INCOMING/bluelake`
5. `INCOMING/bluemarine`
6. `INCOMING/contented7`
7. `INCOMING/glossyblue`
8. `INCOMING/internet_services`
9. `INCOMING/internet_services/internet_services_2`
10. `INCOMING/noprob`
11. `INCOMING/ocadia`
12. `INCOMING/zen`

## Method (quick risk signals)

- Declared core target (`core = 7.x`, `6.x`, or missing).
- Template style in `page.tpl.php`:
  - D7-like signals: `$page['content']`, `$main_menu`, `links__system_main_menu`.
  - D6-like signals: `$left`, `$right`, `$closure`, `$search_box`, `$primary_links`.
- Theme code complexity (`template.php` function count and use of custom preprocess/process logic).
- Base-theme dependency shape.

## Results

| Theme | Core signal | Template style | Code complexity | Compatibility risk |
|---|---|---|---|---|
| `bluebreeze_fixed` | `7.x` | D7-like | Very low | Lowest |
| `bluebreeze` | `7.x` | D7-like | Very low | Very low |
| `glossyblue` | `7.x` | D7-like | Very low | Low |
| `bluemarine` | `7.x` | D7-like | Medium (`template.php` preprocess/process hooks) | Low-medium |
| `bluelake` | `7.x` | D6-like page vars | Low | Medium-high |
| `aberdeen` | no `.info` found in top-level package | D6-like page vars | Medium | High |
| `contented7` | `6.x` | D6-like page vars | Medium | High |
| `internet_services` | `6.x` | D6-like page vars | Medium | High |
| `internet_services_2` | `6.x` (base theme: `internet_services`) | inherits base | Low alone, but depends on D6 base | High |
| `noprob` | core unset | D6-like page vars | Medium | High |
| `ocadia` | `6.x` | D6-like page vars | Low | High |
| `zen` | Drupal 8/9 (`core_version_requirement`) | N/A for D7 | High (different major stack) | Out of scope for D7 compat |

## Decision history

- Selected and implemented as third test theme: `bluebreeze_fixed`.
- Rationale:
  - `core = 7.x`
  - Minimal custom PHP hooks
  - D7-style template variable usage already aligned with current compat layer

## Implementation note discovered during Bluebreeze work

`bluebreeze_fixed` is packaged as a subtheme of `bluebreeze`, and its CSS uses relative imports (for example `@import "../style.css";`).

Because of that, it must live at:

- `themes/bluebreeze/bluebreeze_fixed`

Placing it at root (`themes/bluebreeze_fixed`) causes broken asset URLs like:

- `/themes/style.css`
- `/themes/images/bg-header.gif`
- `/themes/images/bg-footer.gif`

## Recommended next test order

1. `glossyblue`
2. `bluemarine`
3. `bluelake` (good first D6-internals pressure test despite `core = 7.x`)
4. `contented7` / `internet_services` (explicit D6-era templates)

## Additional batch (cloned 2026-02-23)

Cloned into `INCOMING/`:

1. `classic_blog`
2. `clean_theme`
3. `talata`
4. `simpleclean`
5. `forest_floor`

Quick triage:

| Theme | Core signal | TPL count | Theme hook fn count | D6 page vars hit | D7 page signals hit | Notes |
|---|---|---:|---:|---:|---:|---|
| `simpleclean` | `7.x` | 5 | 5 | 0 | 1 | Smallest D7 set in this batch; good next “simple” trial |
| `talata` | `7.x` | 6 | 5 | 0 | 1 | Relatively small; uses `drupal_add_css`/menu helpers |
| `clean_theme` | `7.x` | 9 | 5 | 0 | 0* | D7-style templates, but heavier page-template logic/settings |
| `classic_blog` | `7.x` | 9 | 7 | 0 | 0* | D7-style templates, but most custom hooks in this batch |
| `forest_floor` | `6.x` | 4 | 0 | 5 | 0 | Very simple, but D6-style internals (`$primary_links`, `$search_box`, `$closure`) |

\* `classic_blog` and `clean_theme` are still D7-style templates; their "0" is from strict signal matching, not a D6 classification.

Recommended order for this new batch:

1. `simpleclean`
2. `talata`
3. `clean_theme`
4. `classic_blog`
5. `forest_floor` (best saved for D6-compat work)

Execution outcome (2026-02-23):

1. Implemented and enabled in `backdrop/themes/`: `simpleclean`, `talata`, `clean_theme`, `classic_blog`
2. Sequential smoke tests passed on `/node/1` (HTTP 200 for each theme)
3. One compat gap was found and fixed:
   - `simpleclean` expected `$show_messages` in `page.tpl.php`
   - fixed in `d7_theme_compat_preprocess_page()` by always setting `$variables['show_messages']`
4. `forest_floor` intentionally deferred (D6 internals path)

## Next-50 batch 1 smoke pass (2026-02-23)

Top 10 from `DOC/d7-theme-next-50.tsv` were handled with a low-hanging-fruit policy:

- skip Twig/newer-Drupal shapes (`.info.yml`, `.html.twig`)
- skip hidden/unclear checkouts with no `.info`
- skip `core = 6.x` for now

Results:

- **PASS**: `nigraphic`, `colorfulness_theme`, `bluefreedom3`, `simpler` (HTTP 200, no new PHP errors in smoke window)
- **FAIL**: `redsalute` (HTTP 500; `ParseError: Unmatched '}'` in `templates/page.tpl.php`, line 75)
- **SKIP (Twig/newer stack)**: `basic`
- **SKIP (D6 deprioritized)**: `dessert`, `energetic`, `ishalist`
- **SKIP (hidden/branch-only checkout)**: `floater` (README indicates “See major version branches” and no `.info` in checkout)

Artifact:

- `DOC/d7-theme-batch1-top10.tsv`
- `DOC/d7-theme-batch1-top10.md`

## Implication for the “D6 internals” follow-up

Themes that rely on D6-style page variables (`$left/$right/$closure/$search_box/$primary_links`) are likely to need an additional compatibility layer separate from current D7-focused handling.

Last updated: 2026-02-23 by codex
