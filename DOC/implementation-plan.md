# Implementation Plan — Theme Machine Testing Pipeline

**Goal:** Deliver a reproducible, automated comparison pipeline that demonstrates D7 themes running on Backdrop CMS, building confidence that any D7 theme can be dropped into Backdrop with only minor modifications.

The `d7_theme_compat` module is already working (47/48 pass rate as of Feb 2026). This plan focuses on **proving and demonstrating that at scale** — not on further module development unless testing surfaces regressions.

---

## Current State (2026-03-07)

- `d7_theme_compat` module: functional, 47/48 themes pass HTTP smoke test
- D7 instance: `https://drupal-7.ddev.site` — 56 themes, animal content, theme_menu_block
- Backdrop instance: `https://theme-machine.ddev.site` — 48 themes, animal content, theme_menu_block
- 45 themes with identical machine names exist in both installs
- No screenshot automation, no comparison tooling, no diff scoring
- Backdrop runs PHP 8.3; many D7 themes were written for PHP 5.3–5.6
- `watchdog_tools` module installed (clear/count); `bee log` available for reading entries

---

## Known Risk: PHP 8.3 Compatibility

Most D7 themes in the catalog were created 2006–2012 and never tested against PHP 8.x. Common breakage: `each()` removed in 8.0, `create_function()` removed in 8.0, dynamic properties deprecated in 8.2, `${var}` interpolation deprecated in 8.2. These issues often produce watchdog errors rather than white screens — the theme renders but fills the log with PHP warnings/notices.

**Policy:** Themes that produce watchdog errors on PHP 8.3 should be flagged in the report, not silently ignored. The report should distinguish rendering failures (FAIL) from PHP deprecation noise (WARN). We do not attempt to support older PHP versions — if a theme can't run on 8.3, it gets flagged and excluded from passing results.

---

## Sprint Arc

| Sprint | Goal | Demo |
|---|---|---|
| 1 | Comparison pipeline — 10 themes, Playwright screenshots, HTML report | Run `node scripts/compare.js`, open timestamped report, see 10 themes side by side with watchdog status |
| 2 | Interactive reviewer + 45 themes — human-review workflow, region labels | Run `node scripts/build-reviewer.js`, keyboard-nav through 45 themes, export verdicts JSON |
| 3 | Scale to 761 themes — download automation, incremental testing, human review at scale | All drupal.org themes processable, reviewer handles full catalog |
| 4 | One-command setup — fresh install to full comparison run on a clean machine | `./setup.sh && node scripts/compare.js` works start to finish |
| 5 | Release — Backdrop contrib module packaging, documentation, demo report | `ddev add-on get cellear/theme-machine` or contrib listing |

---

## Step 1: Playwright + comparison pipeline (Sprint 1)

- Outcome: For 10 themes, one command produces `reports/comparison.html` with D7 and Backdrop screenshots side by side, including watchdog error counts per theme.
- Primary owner: Sonnet
- High-reasoning needed: No — straightforward Node.js + Playwright scripting
- Human role: Confirm both DDEV sites are running before sprint; review comparison.html at demo
- Token strategy: Scripts should be under 150 lines each; no framework, no test runner
- Error handling: Per-theme errors (PHP fatals, white screens, watchdog entries) must not crash the run. Failed themes get logged and shown in the report with their error info. Use `bee watchdog-clear` before each theme, `bee log --severity=error --type=php` after rendering.
- See: `SPRINTS/sprint-1.md`

## Step 2: Interactive reviewer + 45-theme expansion (Sprint 2)

- Outcome: `build-reviewer.js` generates a self-contained HTML file with all 45 themes side by side. Human reviewer navigates with arrow keys, casts verdicts (accept/reject/needs-work), exports JSON. Region labels visible in screenshots.
- Primary owner: Sonnet (reviewer, region labels modules); Haiku for theme list expansion + report TOC
- High-reasoning needed: Yes for reviewer UI design and region_labels hook selection
- Human role: Enable region_labels on both sites; run compare.js then build-reviewer.js; review all 45 themes
- Token strategy: build-reviewer.js is self-contained, no new npm deps. Region label modules under 100 lines each.
- See: `SPRINTS/sprint-2.md`

## Step 3: Scale to 761 themes (Sprint 3)

- Outcome: All ~761 D7 themes from drupal.org are downloadable and testable. compare.js + build-reviewer.js handle the full catalog. Incremental runs skip already-captured themes.
- Primary owner: Sonnet (download automation, incremental logic)
- High-reasoning needed: Moderate — download pipeline needs error handling and rate limiting
- Human role: Review batches of themes in the reviewer; flag themes needing investigation
- See: `SPRINTS/sprint-3.md`

## Step 4: One-command setup (Sprint 4)

- Outcome: A new contributor can run one script and have both DDEV instances running with all themes, content, and region labels ready.
- Primary owner: Haiku (shell scripting)
- High-reasoning needed: No
- Human role: Test on a clean DDEV environment; note any step that fails
- Key deliverable: `setup.sh` in project root

## Step 5: Release (Sprint 5)

- Outcome: `d7_theme_compat` module packaged for Backdrop contrib or as a standalone GitHub release. README documents installation and known limitations.
- Primary owner: Sonnet for documentation; human for release mechanics
- High-reasoning needed: No for packaging; yes if contrib review feedback requires module changes
- Key deliverables: Updated README, CHANGELOG, contrib packaging

---

## Model Usage Policy

- **Haiku**: Shell scripts, boilerplate module stubs, mechanical porting, straightforward CLI commands
- **Sonnet**: Node.js scripts with logic (screenshot automation, diff scoring), PHP modules with hook implementations, anything touching the D7/Backdrop theme layer
- **Opus/high-reasoning**: Only if a regression surfaces in `d7_theme_compat` that requires deep PHP/theme-layer analysis

## Human Participation Pattern

After each sprint:
1. Review the demo artifact (HTML report, screenshot output, etc.)
2. Note any themes that look wrong
3. Start the next sprint with a brief "what I saw" message to the agent

Between sprints, the human should:
- Keep both DDEV instances running (or restart them before the next sprint begins)
- Commit the sprint's output files if they should be preserved

---

## Files this plan governs

```
SPRINTS/
  sprint-1.md    — comparison pipeline (10 themes)
  sprint-2.md    — region content + scale (45 themes)
  sprint-3.md    — diff scoring
  sprint-4.md    — one-command setup (to be written in Sprint 3)
  sprint-5.md    — release (to be written in Sprint 4)
scripts/
  screenshot.js  — Playwright capture for one theme, one site
  compare.js     — main driver: loops themes, builds report
  diff.js        — pixel + HTML diff (Sprint 3)
  setup.sh       — one-command bootstrap (Sprint 4)
backdrop/modules/
  region_labels/ — places labeled blocks in every region (Sprint 2)
d7-modules/
  region_labels/ — D7 port of the above (Sprint 2)
reports/         — generated HTML comparison reports (gitignored)
screenshots/     — generated screenshots (gitignored)
```

Last updated: 2026-03-10 by Claude Sonnet 4.6 (Sprint 2 execution)
