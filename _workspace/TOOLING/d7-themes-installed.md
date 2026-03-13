# D7 Themes — Installed Set

These themes were removed from git tracking on 2026-02-25 to keep the repo lean.
All are unmodified D7 theme downloads from Drupal.org, except where noted.

A future `bee fetch-themes` command (or equivalent) could re-download them from
Drupal.org using their machine names. The two renamed themes need special handling
(downloaded under their original name, then the directory and .info machine name
adjusted to avoid collision with Backdrop's own Bartik/Garland).

## Special cases

| Machine name in repo | Original Drupal name | Notes |
|----------------------|----------------------|-------|
| `bartik_d7` | `bartik` | Renamed to avoid collision with Backdrop's core Bartik |
| `garland_d7` | `garland` | Renamed to avoid collision with Backdrop's core Garland |

## Full list (47 themes)

academia, adaptic, addari, adelante, arti, b2_drupal_plus, bartik_d7, bartik_fb,
biz, black_lagoon, bluebreeze, bluefreedom3, changeme, classic_blog, clean_theme,
colorfulness_theme, elegant_blue, fdt_grey, fdt_yellow, fold, garland_d7, havasu,
icandy, jq_theme, lexi_responsive_theme, lightword, mfirst, modern_theme,
nigraphic, parish_theme, plasma, professional_pro, professional_responsive_theme,
redsalute, responsive_green, sankofa, shakennotstirred, simpleclean, simpler,
sirbones, superclean, talata, tarski, templist, themage, touch, zebilla

## Test results summary

See `d7-theme-first50-triage.md` and `theme-test-results.md` for pass/fail data.
As of 2026-02-23: 48 themes tested, 47 PASS, 1 FAIL (superclean — BlockLegacy
private property access error).
