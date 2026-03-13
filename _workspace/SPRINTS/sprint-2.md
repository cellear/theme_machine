# Sprint 2 -- Interactive Reviewer + 45-Theme Expansion

## Context

Sprint 1 delivered a working 10-theme comparison pipeline (`scripts/compare.js` + `scripts/screenshot.js`) with node-page screenshots, watchdog checking, and timestamped HTML reports. The old Sprint 2/3 plans (region labels, pixel-diff scoring) are stale and being replaced.

The new direction: human review is the QA method. An interactive HTML reviewer replaces algorithmic pixel scoring. The 45 already-installed common themes are the immediate target; 761+ themes from drupal.org are the eventual horizon.

---

## Model Usage Policy

Use the cheapest model that can handle each story well. Opus is reserved for planning, review, and deep debugging -- not implementation.

- **Haiku** -- mechanical edits, array updates, HTML template changes, markdown rewrites. Any task where the spec is fully defined and the code changes are localized.
- **Sonnet** -- new scripts with design judgment, CMS module development (hook implementations, block APIs), interactive UI code. Tasks where the model needs to make architectural micro-decisions.
- **Opus** -- planning sessions (like this one), reviewing agent output, debugging unexpected CMS behavior. Not used for implementation.

Any tool that supports these tiers works: Claude.ai, Claude Code, Cursor (Composer or Agent), Codex. The model tier matters more than the tool.

---

## Story 2.1 -- Expand theme list to 45 [Haiku]

**File:** `scripts/compare.js`
**Change:** Replace the `THEMES` array (lines 7-10) with all 45 common themes. Add a counter to the console log: `[12/45] Processing: bluebreeze...`

The 45 themes (already installed on both D7 and Backdrop):

academia, adaptic, addari, adelante, arti, b2_drupal_plus, bartik_fb, biz, black_lagoon, bluebreeze, bluefreedom3, changeme, classic_blog, clean_theme, colorfulness_theme, elegant_blue, fdt_grey, fdt_yellow, fold, havasu, icandy, jq_theme, lexi_responsive_theme, lightword, mfirst, modern_theme, nigraphic, parish_theme, plasma, professional_pro, professional_responsive_theme, redsalute, responsive_green, sankofa, shakennotstirred, simpleclean, simpler, sirbones, superclean, talata, tarski, templist, themage, touch, zebilla

**Acceptance:** `node scripts/compare.js` runs and console shows `[1/45]` through `[45/45]`.

**Why Haiku:** Single array replacement + one format string. Fully specified, no judgment calls.

---

## Story 2.2 -- Report improvements [Haiku]

**File:** `scripts/compare.js` -- the `buildReport()` function (lines 60-106)
**Changes:**

- Add a table of contents at the top with anchored links to each theme section
- Add summary counts: "35 clean / 7 errors / 3 failed"
- Add `id` attributes to each theme `<div>` for anchor targets
- Add a sticky header with theme name as user scrolls

**Acceptance:** Open the generated report, click a theme in the TOC, jump to that section. Summary line shows correct counts.

**Why Haiku:** HTML template modifications following a clear pattern. The existing `buildReport()` function is the only code touched.

---

## Story 2.3 -- Interactive reviewer generator [Sonnet]

**New file:** `scripts/build-reviewer.js`
**Output:** `reports/reviewer-{timestamp}.html`

A Node.js script that reads pre-captured screenshots from `screenshots/` and generates a self-contained interactive HTML file. No new npm dependencies (just `fs` and `path`).

### How it works

1. Scans `screenshots/d7/*/node.png` and `screenshots/backdrop/*/node.png`
2. Base64-encodes each screenshot
3. Embeds all images + interactive JavaScript into a single HTML file

### Reviewer UI spec

**Layout**: One theme at a time, filling the viewport. D7 screenshot on the left, Backdrop on the right, scaled to fit without scrolling.

**Navigation**:

- Prev/Next buttons + clickable theme list
- Keyboard: left/right arrow keys
- Theme list panel (collapsible sidebar or top strip) with verdict status color-coding

**Verdict buttons**:

- Accept (green), Reject (red), Needs Work (yellow)
- Optional notes textarea per theme
- Keyboard: A = accept, R = reject, W = needs work, N = focus notes

**Progress**: "23/45 reviewed" progress bar. Unreviewed themes highlighted. Auto-advance to next unreviewed theme after casting a verdict.

**Data persistence**:

- `localStorage` for verdicts (survives refresh, no server)
- "Export JSON" button downloads `verdicts.json`
- "Import" button restores from a previous export
- Format: `[{"theme": "academia", "verdict": "accept", "notes": "", "timestamp": "..."}]`

**Watchdog badges**: If screenshot data includes watchdog status (from the compare.js run), show clean/errors badge per theme.

**Why screenshots, not iframes**: No server needed, works offline, instant loading, portable file that can be shared with other reviewers.

**Acceptance:** Run `node scripts/build-reviewer.js`, open the resulting HTML, step through themes with arrow keys, accept a few, export JSON, reimport it.

**Why Sonnet:** The most complex new code in the sprint. Requires UI design decisions (layout, keyboard handling, state management, localStorage schema). Haiku could stumble on the interactive JavaScript.

---

## Story 2.4 -- Region labels module: Backdrop [Sonnet]

**New files:**

```
backdrop/modules/region_labels/
  region_labels.info
  region_labels.module
  region_labels.install
```

**Implementation:**

- `hook_block_info()` -- register one block per standard D7 region: header, highlighted, help, content, sidebar_first, sidebar_second, footer
- `hook_block_view()` -- render `<div class="region-label">REGION_NAME</div>`
- `hook_install()` -- programmatically place blocks in the Default layout via layout config
- `hook_page_build()` -- inject CSS for dashed 2px borders around regions + small dark label in top-left corner

**Design:** High contrast (dark bg, white text, semi-transparent). Uses CSS `position: relative` on region wrappers + `position: absolute` on labels. Must not break theme layouts.

**Acceptance:** `ddev bee en region_labels` on Backdrop, load any D7-compat theme page, see region borders and labels. `ddev bee dis region_labels` removes them cleanly.

**Why Sonnet:** Requires understanding Backdrop's layout config JSON structure and block placement API. The programmatic install hook is the tricky part.

---

## Story 2.5 -- Region labels module: D7 [Sonnet]

**New files:**

```
drupal-7/sites/all/modules/region_labels/
  region_labels.info
  region_labels.module
  region_labels.install
```

Port of the Backdrop module using D7's block API:

- `hook_block_info()` and `hook_block_view()` -- same logic, slightly different signatures
- `hook_install()` -- uses `db_insert('block')` to place blocks in all regions for all themes
- Same CSS injection approach via `drupal_add_css()`

**Acceptance:** `ddev drush en region_labels -y` on D7, load any theme, see matching region labels.

**Why Sonnet:** D7's block placement via database inserts has quirks (weight, status, region, theme columns). This is a port but not a copy-paste -- the APIs differ enough to need CMS knowledge.

---

## Story 2.6 -- Doc cleanup [Haiku]

**Files modified:**

- `DOC/implementation-plan.md` -- rewrite sprint arc table: Sprint 2 = interactive reviewer + 45 themes, Sprint 3 = scale to 761 themes, drop pixel-diff Sprint 3
- `SPRINTS/sprint-3.md` -- rewrite as the 761-theme scale sprint (download automation, incremental testing, human review at scale)

Remove stale assumptions: home-page screenshots as primary artifact, fixed `reports/comparison.html` path, region labels as Sprint 2 prerequisite, pixel scoring.

**Acceptance:** Both files updated. No references to home-page screenshots or pixel diff scoring remain in active sprint docs.

**Why Haiku:** Rewriting markdown from a clear spec. No code, no judgment calls.

---

## Story 2.7 -- Learnings: Backdrop for Drupal 7 Developers [Haiku]

**New file:** `LEARNINGS/sprint-2.md`

Each sprint produces a short learnings document explaining the Backdrop/D7 differences encountered during that sprint, targeted at Drupal 7 developers exploring Backdrop.

### Sprint 2 topics (expected)

- How Backdrop's layout system replaces D7's block region assignments (config JSON vs `block` database table)
- Block API differences: `hook_block_info()` / `hook_block_view()` are similar, but placement is config-driven in Backdrop vs db-driven in D7
- `ddev bee` vs `ddev drush` -- the Backdrop CLI equivalent
- Any new D7-vs-Backdrop differences surfaced by the 45-theme expansion

### Retroactive: Sprint 1 learnings

Also create `LEARNINGS/sprint-1.md` covering the Sprint 1 discoveries:

- Backdrop's theme layer: `hook_preprocess_html` / `hook_preprocess_page` registration differences
- The CSS/JS loading order issue (D7 themes call `drupal_add_css()` in preprocess; Backdrop's timing differs)
- Layout templates: `d7_default` layout vs per-theme layouts
- Body class generation differences (`two-sidebars`, `one-sidebar`, etc.)
- `theme_get_setting()` behavior differences (logo, site name toggle)

These are all documented in the Sprint 1 handoffs -- the learnings doc just repackages them for a D7-developer audience.

**Acceptance:** Both `LEARNINGS/sprint-1.md` and `LEARNINGS/sprint-2.md` exist. A Drupal 7 developer could read them and understand the key differences encountered so far.

**Why Haiku:** Documentation writing from existing handoff notes. No code, clear source material.

---

## What is NOT in Sprint 2

- Downloading/installing the remaining ~716 themes from drupal.org (Sprint 3+)
- Contributor architecture brief (deferred until after 45-theme review; the LEARNINGS docs may serve this role)
- Algorithmic pixel-diff scoring (replaced permanently by human review)
- CI/CD integration
- One-command setup script

---

## Sequencing

1. **Stories 2.1 + 2.2** [Haiku]: Expand compare.js + improve report. Run to populate `screenshots/`.
2. **Story 2.3** [Sonnet]: Build the interactive reviewer from the screenshots.
3. **Stories 2.4 + 2.5** [Sonnet]: Region labels modules (independent, can overlap with 2.3).
4. **Story 2.6** [Haiku]: Doc cleanup.
5. **Story 2.7** [Haiku]: Learnings docs (last, after all implementation is done).

Stories 2.1 and 2.2 can be done in a single Haiku session. Stories 2.4 and 2.5 can be done in a single Sonnet session. Stories 2.6 and 2.7 can be done in a single Haiku session.

Last updated: 2026-03-09 by Opus (Cursor planning session)
