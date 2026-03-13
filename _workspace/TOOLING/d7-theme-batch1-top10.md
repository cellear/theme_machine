# D7 Theme Next-50 Batch 1 (Top 10) Results

Scope: pragmatic low-hanging-fruit smoke pass on top 10 from `DOC/d7-theme-next-50.tsv`.

## Policy used

- Skip newer-Drupal/Twig themes (`*.info.yml`, `*.html.twig`).
- Skip hidden/offline/unclear artifacts (no `.info` in checkout).
- Deprioritize `core = 6.x` for now.
- Smoke test runnable candidates with:
  - copy to `backdrop/themes/<machine>`
  - `ddev bee en --type=theme <machine>`
  - `ddev bee theme-default <machine>`
  - `ddev bee cc all`
  - HTTP check on `/node/1`
  - `ddev bee log --severity=error --type=php` inspection on failure

## Outcome summary

- PASS: 4
- FAIL: 1
- SKIP: 5

## Detailed outcomes

| Theme | Result | Notes |
|---|---|---|
| `nigraphic` | PASS | HTTP 200, no new PHP errors in smoke window |
| `colorfulness_theme` | PASS | HTTP 200, no new PHP errors in smoke window |
| `bluefreedom3` | PASS | HTTP 200, no new PHP errors in smoke window |
| `simpler` | PASS | HTTP 200, no new PHP errors in smoke window |
| `redsalute` | FAIL | HTTP 500; `ParseError: Unmatched '}'` in `themes/redsalute/templates/page.tpl.php` line 75 |
| `basic` | SKIP | Twig/newer-Drupal shape (`.info.yml`, Twig templates) |
| `dessert` | SKIP | `core = 6.x` (deprioritized D6-internals path) |
| `energetic` | SKIP | `core = 6.x` (deprioritized D6-internals path) |
| `ishalist` | SKIP | `core = 6.x` (deprioritized D6-internals path) |
| `floater` | SKIP | Checkout contains no `.info` theme artifact (README: "See major version branches.") |

## Artifacts

- Results TSV: `DOC/d7-theme-batch1-top10.tsv`

## Environment note

- Default theme restored after tests: `talata`.

Last updated: 2026-02-23 by codex
