# Sprint 1 — Comparison Pipeline

**Goal:** For 10 themes, generate a side-by-side HTML comparison report — D7 screenshot left, Backdrop screenshot right — with a single command.

**Demo (binary pass/fail):**
Run `node scripts/compare.js` → open `reports/comparison.html` → see 10 themes side by side, each showing the D7 render and the Backdrop render.

If you can open that file and see 10 themes with two screenshots each, Sprint 1 is done.

---

## Background

Both test instances are already configured:

| Instance | URL | DDEV project | Themes | Content |
|---|---|---|---|---|
| Drupal 7 | `https://drupal-7.ddev.site` | `drupal-7` | 56 installed | animal nodes (Fox = node/1), theme_menu_block |
| Backdrop | `https://theme-machine.ddev.site` | `theme-machine` | 48 installed | animal nodes start at node/6, theme_menu_block |

45 themes share the same machine name in both installs. Sprint 1 uses 10 of them.

**DDEV project names (confirmed running 2026-03-07):**
- D7: `drupal-7` — `https://drupal-7.ddev.site` — Fox node at `/node/1`
- Backdrop: `theme-machine` — `https://theme-machine.ddev.site` — animal nodes start at `/node/6`

---

## Starter theme set (10 themes)

These 10 are confirmed present in both installs, cover a range of region configurations, and include at least one known-warning theme:

| Machine name | Notes |
|---|---|
| `academia` | clean pass |
| `biz` | clean pass |
| `bluebreeze` | missing: highlighted |
| `classic_blog` | missing: sidebar_second, highlighted |
| `fold` | clean pass |
| `modern_theme` | clean pass |
| `plasma` | missing: header, sidebar_second |
| `simpleclean` | missing: sidebar_second |
| `tarski` | missing: header, footer, highlighted |
| `touch` | 1 warning |

---

## Story 1.1 — Playwright installed and can screenshot

**What:** Install Playwright in the project root as a Node.js dependency. Verify it can take a screenshot of a running DDEV site.

**Files created:**
```
package.json
package-lock.json
node_modules/       (gitignored)
screenshots/        (gitignored, created on first run)
reports/            (gitignored, created on first run)
```

**Setup commands:**
```bash
cd /Users/lukemccormick/Sites/BACKDROP/THEME-MACHINE
npm init -y
npm install playwright
npx playwright install chromium
```

**Smoke test:** `node -e "const {chromium} = require('playwright'); (async()=>{ const b=await chromium.launch(); const p=await b.newPage(); await p.goto('http://drupal-7.ddev.site'); await p.screenshot({path:'screenshots/smoke-test.png'}); await b.close(); console.log('OK'); })()"`

**Acceptance:** `screenshots/smoke-test.png` exists and shows the D7 site.

---

## Story 1.2 — Theme switching via CLI

**What:** Confirm that themes can be switched on both sites from the host terminal using `ddev drush` / `ddev bee`, with cache cleared after each switch.

**D7 switch commands:**
```bash
# From drupal-7/ directory:
ddev drush vset theme_default academia
ddev drush cc all

# Or from anywhere:
ddev -p drupal-7 drush vset theme_default academia
ddev -p drupal-7 drush cc all
```

**Backdrop switch commands:**
```bash
# From project root:
ddev bee config-set system.core theme_default academia
ddev bee cache-clear

# Or from anywhere using project name:
ddev -p theme-machine bee config-set system.core theme_default academia
ddev -p theme-machine bee cache-clear
```

**Acceptance:** After running the D7 switch command, reloading `http://drupal-7.ddev.site` shows the Academia theme. Same for Backdrop.

**Note:** Identify the exact working CLI invocations during Story 1.1 and record them — the compare script depends on these exact strings.

---

## Story 1.3 — Screenshot script

**What:** `scripts/screenshot.js` — given a site URL, DDEV project name, CMS type (d7 or backdrop), and theme machine name, switches the theme, clears cache, screenshots front page and node/1, saves HTML of both pages.

**Usage:**
```bash
node scripts/screenshot.js --site=d7 --theme=academia
node scripts/screenshot.js --site=backdrop --theme=academia
```

**Pages captured per theme per site:**
- Front page (`/`)
- A content node with an image: `/node/1` on D7 (Fox), `/node/6` on Backdrop (Saltwater Crocodile)

**Output files** (one set per theme per site):
```
screenshots/d7/academia/home.png
screenshots/d7/academia/home.html
screenshots/d7/academia/node.png
screenshots/d7/academia/node.html
screenshots/backdrop/academia/home.png
screenshots/backdrop/academia/home.html
screenshots/backdrop/academia/node.png
screenshots/backdrop/academia/node.html
```

**Config block at top of script** (hardcoded, not flags):
```js
const config = {
  d7: {
    url: 'https://drupal-7.ddev.site',
    ddevProject: 'drupal-7',
    contentPath: '/node/1',       // Fox node with image
  },
  backdrop: {
    url: 'https://theme-machine.ddev.site',
    ddevProject: 'theme-machine',
    contentPath: '/node/6',       // Saltwater Crocodile with image
  },
};
```

**Acceptance:**
- Running `node scripts/screenshot.js --site=d7 --theme=academia` produces 4 files in `screenshots/d7/academia/`
- Running the same for `--site=backdrop` produces 4 files in `screenshots/backdrop/academia/`
- Both home.png files show the Academia theme rendering

---

## Story 1.4 — Comparison report

**What:** `scripts/compare.js` — loops the 10 starter themes, calls the screenshot logic for both sites, then generates `reports/comparison.html` showing D7 and Backdrop side by side.

**Usage:**
```bash
node scripts/compare.js
```

**Report layout per theme:**
```
┌─────────────────────────────────────────────┐
│ academia                                    │
├──────────────────────┬──────────────────────┤
│ D7                   │ Backdrop             │
│ [home screenshot]    │ [home screenshot]    │
│ [node/1 screenshot]  │ [node/1 screenshot]  │
└──────────────────────┴──────────────────────┘
```

Screenshots are embedded as base64 in the HTML so the report is a single portable file.

**Acceptance:**
- `node scripts/compare.js` runs to completion without crashing
- `reports/comparison.html` opens in a browser
- All 10 themes appear with 4 screenshots each (D7 home, D7 node1, Backdrop home, Backdrop node1)
- The current_theme_block label is visible in at least some screenshots, confirming which theme rendered

---

## Story 1.5 — Restore default theme after run

**What:** After compare.js finishes, both sites are restored to a neutral default theme (e.g. `academia` or whichever was set before the run started).

This prevents the sites from being left in a random theme state if the script is interrupted.

**Implementation:** Record the current default theme at the start of the run; restore it in a `finally` block.

**Acceptance:** After `node scripts/compare.js` completes, both sites load with the same theme they had before the run started.

---

## Files to create this sprint

```
package.json
.gitignore            (add node_modules/, screenshots/, reports/)
scripts/
  screenshot.js
  compare.js
SPRINTS/
  sprint-1.md         (this file)
```

---

## Error Handling and Watchdog Integration

### Per-theme resilience

The compare loop must not crash when a single theme fails. Wrap each theme iteration in try/catch. If a theme produces a white screen, PHP fatal, or timeout, log it and continue to the next theme. The report should show failed themes with their error message rather than omitting them.

### Watchdog checking (Backdrop side)

For each theme on the Backdrop instance:

1. `ddev bee watchdog-clear` — clear before switching
2. Switch theme + clear cache
3. Screenshot pages
4. `ddev bee log --count=50 --severity=error --type=php` — capture any PHP errors
5. Store error count and messages alongside that theme's screenshots

The HTML report should show a status indicator per theme:
- **Clean:** 0 watchdog errors after rendering
- **Warnings:** watchdog entries at warning level only
- **Errors:** watchdog entries at error level or above — list them in the report

### D7 side

D7 uses drush. Equivalent: `ddev drush watchdog-show --severity=error --count=50` (confirm exact flags during Story 1.2). If drush watchdog commands aren't available on the D7 instance, skip watchdog checking for D7 in Sprint 1 — it can be added later.

---

## Not in Sprint 1

- Region-identifiable content (each region labeled with its name) — Sprint 2
- Special content (slideshows, custom homepage elements) — Sprint 2+
- Scaling beyond 10 themes — Sprint 2
- Visual diff / automated pass-fail scoring — Sprint 3
- D7 `current_theme_block` D7-port verification — Sprint 2 (nice-to-have)
- HTML diffing — Sprint 3

---

## Confirmed (2026-03-07)

All three pre-sprint questions are resolved:

1. ✅ **Backdrop DDEV project name** — `theme-machine`, URL `https://theme-machine.ddev.site`
2. ✅ **D7 node/1** — Fox node with image, confirmed from screenshot
3. ✅ **Theme identification in screenshots** — Theme Menu Block in left sidebar shows active theme in bold with "(active)". `current_theme_block` not required; Theme Menu Block is sufficient.

Both sites confirmed running 2026-03-07. Sprint is ready to execute.

---

## Implementation notes

- Keep `screenshot.js` and `compare.js` simple and readable — one file each, under ~100 lines
- Use `child_process.execSync` for the drush/bee CLI calls (synchronous is fine; these are dev scripts)
- No test framework needed — these are utility scripts, not a test suite
- Embed screenshots as base64 in the HTML report so it's a single portable file
- Chromium only (not Firefox/WebKit) — keeps Playwright install small

Last updated: 2026-03-07
