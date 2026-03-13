# Theme Test Results

- **Date**: 2026-02-23 23:36:41
- **Test URL**: `http://localhost/node/1`
- **Restored default**: `addari`

## Summary

| Status | Theme | Machine Name | HTTP | Errors | Warnings | Missing Regions |
|--------|-------|-------------|------|--------|----------|-----------------|
| PASS | Plasma | `Plasma` | 200 | 0 | 0 | header, sidebar_second |
| PASS | Academia | `academia` | 200 | 0 | 0 | — |
| PASS | adaptIC Responsive Theme | `adaptic` | 200 | 0 | 0 | header, highlighted, help |
| PASS | Addari | `addari` | 200 | 0 | 2 | sidebar_first, sidebar_second |
| PASS | Adelante Theme | `adelante` | 200 | 0 | 0 | header, sidebar_first, sidebar_second, highlighted |
| PASS | Arti | `arti` | 200 | 0 | 2 | highlighted |
| PASS | b2 drupal + | `b2_drupal_plus` | 200 | 0 | 2 | header, footer, sidebar_first, sidebar_second, highlighted, help |
| PASS | Bartik (Drupal 7) | `bartik_d7` | 200 | 0 | 0 | — |
| PASS | Bartik Facebook | `bartik_fb` | 200 | 0 | 0 | — |
| PASS | Basis | `basis` | 200 | 0 | 0 | — |
| PASS | BIZ | `biz` | 200 | 0 | 0 | — |
| PASS | Black Lagoon | `black_lagoon` | 200 | 0 | 0 | header, highlighted, help |
| PASS | Bluebreeze | `bluebreeze` | 200 | 0 | 0 | highlighted |
| PASS | Bluebreeze fixed | `bluebreeze_fixed` | 200 | 0 | 0 | highlighted |
| PASS | Blue Freedom 3 (Rounded Corners) | `bluefreedom3` | 200 | 0 | 0 | — |
| PASS | ChangeMe | `changeme` | 200 | 0 | 29 | — |
| PASS | Classic Blog | `classic_blog` | 200 | 0 | 0 | sidebar_second, highlighted |
| PASS | Clean Theme | `clean_theme` | 200 | 0 | 0 | sidebar_second, highlighted |
| PASS | Colorfulness Theme | `colorfulness_theme` | 200 | 0 | 0 | highlighted |
| PASS | Elegant Blue | `elegant_blue` | 200 | 0 | 2 | sidebar_second, highlighted |
| PASS | FDT Grey | `fdt_grey` | 200 | 0 | 0 | footer, sidebar_second |
| PASS | FDT Yellow | `fdt_yellow` | 200 | 0 | 0 | sidebar_first, sidebar_second |
| PASS | Fold | `fold` | 200 | 0 | 0 | — |
| PASS | Garland (Drupal 7) | `garland_d7` | 200 | 0 | 0 | — |
| PASS | Havasu | `havasu` | 200 | 0 | 0 | header, footer, highlighted |
| PASS | icandy | `icandy` | 200 | 0 | 1 | header, sidebar_second, highlighted, help |
| PASS | jq_theme | `jq_theme` | 200 | 0 | 1 | header, sidebar_second, highlighted, help |
| PASS | Lexi Responsive Theme | `lexi_responsive_theme` | 200 | 0 | 2 | header, highlighted, help |
| PASS | Lightword | `lightword` | 200 | 0 | 2 | sidebar_first, highlighted, help |
| PASS | mFirst | `mfirst` | 200 | 0 | 0 | header |
| PASS | Modern Theme | `modern_theme` | 200 | 0 | 0 | highlighted |
| PASS | niGraphic Studio | `nigraphic` | 200 | 0 | 0 | header, sidebar_first, sidebar_second, highlighted |
| PASS | Parish Theme | `parish_theme` | 200 | 0 | 1 | — |
| PASS | Professional Pro | `professional_pro` | 200 | 0 | 0 | highlighted |
| PASS | Professional Responsive Theme | `professional_responsive_theme` | 200 | 0 | 2 | header, highlighted, help |
| PASS | Responsive Green | `responsive_green` | 200 | 0 | 2 | header, highlighted, help |
| PASS | Sankofa | `sankofa` | 200 | 0 | 0 | header |
| PASS | Seven | `seven` | 200 | 0 | 0 | — |
| PASS | Simple Clean | `simpleclean` | 200 | 0 | 0 | sidebar_second |
| PASS | Simpler | `simpler` | 200 | 0 | 0 | header |
| PASS | Sir Bones | `sirbones` | 200 | 0 | 0 | help |
| FAIL | SuperClean | `superclean` | 500 | 1 | 4 | header, sidebar_first, sidebar_second, highlighted, help |
| PASS | Talata | `talata` | 200 | 0 | 0 | highlighted |
| PASS | Tarski | `tarski` | 200 | 0 | 0 | header, footer, highlighted |
| PASS | Themage | `themage` | 200 | 0 | 0 | — |
| PASS | Touch | `touch` | 200 | 0 | 1 | — |
| PASS | BD X-Ray | `xray` | 200 | 0 | 0 | — |
| PASS | Zebilla | `zebilla` | 200 | 0 | 0 | highlighted |

**Total**: 48 tested, 47 passed, 1 failed.

## Error Details

### SuperClean (`superclean`)

1. Error: Cannot access private property BlockLegacy::$content in include() (line 7 of /var/www/html/themes/superclean/block.tpl.php).

## Missing Standard Regions

Standard D7 layout regions: content, header, footer, sidebar_first, sidebar_second, highlighted, help.

- **Plasma** (`Plasma`): header, sidebar_second
- **adaptIC Responsive Theme** (`adaptic`): header, highlighted, help
- **Addari** (`addari`): sidebar_first, sidebar_second
- **Adelante Theme** (`adelante`): header, sidebar_first, sidebar_second, highlighted
- **Arti** (`arti`): highlighted
- **b2 drupal +** (`b2_drupal_plus`): header, footer, sidebar_first, sidebar_second, highlighted, help
- **Black Lagoon** (`black_lagoon`): header, highlighted, help
- **Bluebreeze** (`bluebreeze`): highlighted
- **Bluebreeze fixed** (`bluebreeze_fixed`): highlighted
- **Classic Blog** (`classic_blog`): sidebar_second, highlighted
- **Clean Theme** (`clean_theme`): sidebar_second, highlighted
- **Colorfulness Theme** (`colorfulness_theme`): highlighted
- **Elegant Blue** (`elegant_blue`): sidebar_second, highlighted
- **FDT Grey** (`fdt_grey`): footer, sidebar_second
- **FDT Yellow** (`fdt_yellow`): sidebar_first, sidebar_second
- **Havasu** (`havasu`): header, footer, highlighted
- **icandy** (`icandy`): header, sidebar_second, highlighted, help
- **jq_theme** (`jq_theme`): header, sidebar_second, highlighted, help
- **Lexi Responsive Theme** (`lexi_responsive_theme`): header, highlighted, help
- **Lightword** (`lightword`): sidebar_first, highlighted, help
- **mFirst** (`mfirst`): header
- **Modern Theme** (`modern_theme`): highlighted
- **niGraphic Studio** (`nigraphic`): header, sidebar_first, sidebar_second, highlighted
- **Professional Pro** (`professional_pro`): highlighted
- **Professional Responsive Theme** (`professional_responsive_theme`): header, highlighted, help
- **Responsive Green** (`responsive_green`): header, highlighted, help
- **Sankofa** (`sankofa`): header
- **Simple Clean** (`simpleclean`): sidebar_second
- **Simpler** (`simpler`): header
- **Sir Bones** (`sirbones`): help
- **SuperClean** (`superclean`): header, sidebar_first, sidebar_second, highlighted, help
- **Talata** (`talata`): highlighted
- **Tarski** (`tarski`): header, footer, highlighted
- **Zebilla** (`zebilla`): highlighted

Last updated: 2026-02-23 by theme_tester
