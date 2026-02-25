# Handoff: Black Lagoon Fix & Full D7 Theme Audit

**Date**: 2026-02-23
**Author**: claude
**Prior sessions**:
- `HANDOFF/handoff-2026-02-23-theme-switcher-cursor.md`
- `HANDOFF/handoff-2026-02-23-d7-theme-next-50-codex.md`
- `HANDOFF/handoff-2026-02-23-d7-theme-compat-four-themes-codex.md`
- (Prior session in same conversation: block rendering + layout template fixes)

## What was attempted and outcome

1. **Fixed black_lagoon crash** (TypeError: `file_copy()` requires `File` entity, not `stdClass`)
2. **Ran full audit** of all 38+ D7 themes in the themes directory

### Black Lagoon Fix

**Root cause**: black_lagoon's `template.php` (line 16-18) checks `variable_get('theme_black_lagoon_first_install', TRUE)` on first page load. When TRUE (the default), it calls `_black_lagoon_install()` which creates `$file = new stdClass` and passes it to `file_copy()`. In Backdrop, `file_copy()` has a PHP type hint requiring a `File` entity, causing a fatal `TypeError`.

**Fix**: Added logic in `d7_theme_compat_init()` that detects D7 themes with `theme_{name}_first_install` variables and pre-sets them to `FALSE`, preventing the incompatible file operations from running. This pattern is general — it handles any D7 theme that uses the Marinelli-framework `first_install` convention.

### Full Theme Audit Results

Tested all D7 themes by switching to each and loading the homepage:

**Working (35 themes):**
academia, addari, adelante, adaptic, arti, b2_drupal_plus, bartik_d7, bartik_fb, biz, black_lagoon, bluebreeze, classic_blog, clean_theme, colorfulness_theme, elegant_blue, fdt_grey, fdt_yellow, fold, garland_d7, havasu, icandy, jq_theme, lexi_responsive_theme, modern_theme, nigraphic, parish_theme, professional_pro, professional_responsive_theme, responsive_green, sankofa, simpleclean, simpler, sirbones, talata, tarski, themage, touch, zebilla

**Failing (2 themes — ParseError in theme template files):**
- `redsalute`: ParseError in `page.tpl.php` line 75 (known from earlier session)
- `templist`: ParseError in `node.tpl.php` line 107 — broken PHP comment using `<?/*php ... */?>` syntax that relies on short_open_tag=On (disabled in PHP 8)

**Theme discovery issue (1 theme):**
- `plasma`: .info file is `Plasma.info` (uppercase P) but directory is `plasma` (lowercase). Backdrop's theme discovery expects them to match. Not a compat module issue.

**Also confirmed working (non-D7):**
- `bluefreedom3`: No core line in .info (may be Backdrop-native or D6-derived)
- D6 themes (`superclean`, `changeme`, `shakennotstirred`): Not handled by d7_theme_compat (different core version)

## What worked

1. General `first_install` variable pattern in `hook_init()` — cleanly prevents all D7 themes using this convention from crashing
2. Automated test script cycling through all 38 themes quickly identified the full pass/fail picture
3. The compat module now supports 35+ D7 themes rendering successfully on Backdrop

## What did not work / caveats

1. ParseError themes (`redsalute`, `templist`) have broken PHP in their templates — these are bugs in the themes themselves, not fixable by the compat module without modifying theme files
2. The `plasma` filename case mismatch is a packaging issue, not a compat module issue
3. Banner images for `black_lagoon` won't be set up (since we skip the install routine), but the theme loads without crashing. Banners can be set up manually via theme settings.

## Current state and blockers

- **35 D7 themes confirmed working** on Backdrop via d7_theme_compat
- **2 themes with ParseErrors** — would need theme-file edits to fix
- **1 theme with packaging issue** — needs .info file rename
- **Block rendering**: Working for Views blocks, custom blocks, and theme_menu_block
- **No technical blockers** for continuing to import more themes from the next-50 queue

## Open questions

1. Should we auto-fix ParseError themes by patching their template files during import? (violates "unmodified D7 themes" principle)
2. Should we handle the `Plasma.info` case by adding case-insensitive .info file discovery?
3. The maintenance-page.tpl.php template has warnings about undefined `$language`, `$head`, `$styles`, `$scripts` — should we fix that template's preprocess variables?

## Files created or modified

- `backdrop/modules/d7_theme_compat/d7_theme_compat.module` — Updated `hook_init()` with first_install variable prevention
- `HANDOFF/handoff-2026-02-23-black-lagoon-fix-and-theme-audit-claude.md` (this file)

## References

- `DOC/backdrop-for-llms.md`
- `DOC/incoming-theme-triage.md`
- `DOC/d7-theme-next-50.md`
- `HANDOFF/handoff-2026-02-23-theme-switcher-cursor.md`
