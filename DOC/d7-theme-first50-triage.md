# D7 Theme Next-50: First 50 Triage Results

Scope: testing-only triage for the first 50 ranked themes from `DOC/d7-theme-next-50.tsv`.

Rules applied:
- No fixes during triage.
- Skip Twig/newer-Drupal shapes (`.info.yml`, `.html.twig`).
- Skip untestable checkouts with no `.info` file.
- Deprioritize explicit `core = 6.x` in this pass.

Test path for runnable themes:
- Copy from `INCOMING/<theme>` to `backdrop/themes/<theme>`
- `ddev bee en --type=theme <theme>`
- `ddev bee theme-default <theme>`
- `ddev bee cc all`
- HTTP smoke check on `/node/1`
- On failure: capture current `ddev bee log --count=40 --severity=error --type=php`

## Final counts (first 50)

- PASS: **37**
- FAIL: **5**
- SKIP: **8**

## Failures

| Theme | Failure mode | Notes |
|---|---|---|
| `redsalute` | HTTP 500 | parse-error style failure in template rendering path |
| `templist` | HTTP 500 | `ParseError` in template (`unexpected token "*"`) |
| `shakennotstirred` | HTTP 500 | `ParseError` in template (`unexpected token "*"`) |
| `black_lagoon` | HTTP 500 | `TypeError` around legacy `file_copy()` call signature |
| `superclean` | HTTP 500 | block rendering error (`BlockLegacy::$content` private access) |

## Skips

| Theme | Reason |
|---|---|
| `basic` | Twig/newer-Drupal shape |
| `dessert` | `core = 6.x` (deprioritized) |
| `energetic` | `core = 6.x` (deprioritized) |
| `ishalist` | `core = 6.x` (deprioritized) |
| `floater` | no `.info` in checkout |
| `profolio` | no `.info` in checkout |
| `hiya` | no `.info` in checkout |
| `blank` | no `.info` in checkout |

## Notes on cross-theme contamination handled during run

A few themes (`pro`, `fueldeluxe`) can trigger PHP 8.3 fatals that interfere with subsequent `bee` operations when left present/active. Post-`pro` entries were rerun in isolation, and final table values in the TSV reflect the isolated outcomes.

## Artifacts

- Full table: `DOC/d7-theme-first50-triage.tsv`
- Batch 1 snapshot (top 10): `DOC/d7-theme-batch1-top10.tsv`, `DOC/d7-theme-batch1-top10.md`

Last updated: 2026-02-23 by codex
