# Template Mapping: D7 Core → Backdrop Core

When a D7 theme is active on Backdrop, we need to decide what happens with
each template. The goal is to run the entire theme layer in "D7 mode" —
all templates expect D7-style variables (strings for $classes/$attributes,
$classes_array for manipulation, etc.).

## Strategy

- **D7 equivalents exist**: Replace the Backdrop template with the D7 version
  via hook_theme_registry_alter(). This is the cleanest path.
- **Backdrop-only (no D7 equivalent)**: These templates come from modules that
  didn't exist in D7 core (Layout, Views, Dashboard, Installer, etc.). We need
  to either make them tolerate string variables, or provide D7-compatible
  wrappers. Decision deferred per-template.
- **D7-only (no Backdrop equivalent)**: Templates for modules removed from
  Backdrop (overlay, poll, profile, forum, aggregator). Not needed unless
  someone installs contrib versions.

## Category 1: Direct D7 Equivalents (REPLACE)

These templates exist in both D7 and Backdrop. When a D7 theme is active,
swap the Backdrop version for the D7 version.

| Template | D7 Source | Backdrop Source | Notes |
|----------|-----------|-----------------|-------|
| html.tpl.php | drupal/modules/system/ | (removed in Backdrop) | D7 has it, Backdrop doesn't. Must be injected. |
| page.tpl.php | drupal/modules/system/ | backdrop/core/modules/system/templates/ | Major differences — D7 has $page[] regions, Backdrop uses Layout |
| node.tpl.php | drupal/modules/node/ | backdrop/core/modules/node/templates/ | Variables differ ($classes string vs array) |
| block.tpl.php | drupal/modules/block/ | backdrop/core/modules/layout/templates/ | D7 block module vs Backdrop layout module |
| comment.tpl.php | drupal/modules/comment/ | backdrop/core/modules/comment/templates/ | Similar structure, variable format differs |
| field.tpl.php | drupal/modules/field/theme/ | backdrop/core/modules/field/templates/ | Similar structure |
| region.tpl.php | drupal/modules/system/ | (removed in Backdrop) | D7 has region template, Backdrop uses Layout |
| maintenance-page.tpl.php | drupal/modules/system/ | backdrop/core/modules/system/templates/ | Both exist |
| taxonomy-term.tpl.php | drupal/modules/taxonomy/ | backdrop/core/modules/taxonomy/templates/ | Similar |
| search-results.tpl.php | drupal/modules/search/ | backdrop/core/modules/search/templates/ | Similar |
| user-profile.tpl.php | drupal/modules/user/ | backdrop/core/modules/user/templates/ | Similar |
| user-picture.tpl.php | drupal/modules/user/ | backdrop/core/modules/user/templates/ | Similar |
| book-all-books-block.tpl.php | drupal/modules/book/ | backdrop/core/modules/book/templates/ | Similar |
| book-navigation.tpl.php | drupal/modules/book/ | backdrop/core/modules/book/templates/ | Similar |

## Category 2: Backdrop-Only (NO D7 EQUIVALENT)

These templates come from modules that are Backdrop-native or were contrib in D7.
They expect Backdrop-style variables (arrays). We need a strategy for each.

### Layout Module (Backdrop-only, no D7 equivalent)

| Template | Notes |
|----------|-------|
| layout.tpl.php | Core layout rendering — the Layout module is fundamental to Backdrop |
| layout--*.tpl.php | Specific layout templates (boxton, geary, harris, etc.) |
| layout-content-form.tpl.php | Layout editing UI |
| layout--flexible.tpl.php | Flexible layout template |
| block-dynamic.tpl.php | Dynamic block rendering |
| block--system--main.tpl.php | System main content block |

**Decision**: Layout templates must continue working as-is. We cannot replace
these with D7 equivalents because D7 has no Layout module. The $page region
mapping problem needs to be solved separately — we need to populate D7's
$page['region_name'] variables from Backdrop's Layout system.

### Views Module (was contrib in D7, core in Backdrop)

| Template | Notes |
|----------|-------|
| views-view.tpl.php | Main view wrapper |
| views-view-grid.tpl.php | Grid display (uses $classes as array — already broke) |
| views-view-list.tpl.php | List display |
| views-view-table.tpl.php | Table display |
| views-view-unformatted.tpl.php | Unformatted display |
| views-view-fields.tpl.php | Field-based row |
| views-view-field.tpl.php | Single field |
| views-view-summary.tpl.php | Summary |
| views-view-summary-unformatted.tpl.php | Unformatted summary |
| views-view-grouping.tpl.php | Grouping |
| views-view-row-comment.tpl.php | Comment row |
| views-view-row-rss.tpl.php | RSS row |
| views-view-rss.tpl.php | RSS feed |
| views-exposed-form.tpl.php | Exposed filter form |
| views-more.tpl.php | "More" link |

**Decision**: Views templates need to tolerate D7-style string variables.
Options: (a) ship D7 Views templates in our module, (b) make the flatten
function smart enough to handle both, (c) don't flatten Views templates.
TBD — depends on whether D7 themes actually override Views templates.

### Other Backdrop-Only Templates

| Template | Module | Notes |
|----------|--------|-------|
| header.tpl.php | system | Backdrop's header block — no D7 equivalent |
| page-components.tpl.php | system | Backdrop page components |
| entity.tpl.php | entity | Generic entity template |
| file.tpl.php | file | File entity template |
| dashboard-panel.tpl.php | dashboard | Dashboard UI |
| installer-*.tpl.php | installer | Backdrop's project installer UI |
| date-views-*.tpl.php | date | Date module views integration |
| user-simplified-page.tpl.php | user | Simplified user page |

**Decision**: These are all admin/utility templates unlikely to be affected
by D7 theme overrides. Leave as-is for now. If they break, handle individually.

## Category 3: D7-Only (NO BACKDROP EQUIVALENT)

These templates exist in D7 but not in Backdrop core. The corresponding
modules were removed, merged, or significantly changed.

| Template | D7 Module | Status in Backdrop |
|----------|-----------|-------------------|
| aggregator-*.tpl.php | aggregator | Module removed from core |
| announcements-feed.tpl.php | announcements_feed | Module removed |
| block-admin-display-form.tpl.php | block | Block module replaced by Layout |
| book-export-html.tpl.php | book | May still exist differently |
| book-node-export-html.tpl.php | book | May still exist differently |
| comment-wrapper.tpl.php | comment | Removed in Backdrop |
| forum-*.tpl.php | forum | Module removed from core |
| overlay.tpl.php | overlay | Module removed |
| poll-*.tpl.php | poll | Module removed from core |
| profile-*.tpl.php | profile | Module removed |
| search-block-form.tpl.php | search | Changed in Backdrop |
| search-result.tpl.php | search | Changed in Backdrop |
| toolbar.tpl.php | toolbar | Changed in Backdrop (admin bar) |
| user-profile-category.tpl.php | user | Removed |
| user-profile-item.tpl.php | user | Removed |

**Decision**: Not needed unless the corresponding D7 contrib module is
also installed on Backdrop. Ignore for now.

## Implementation Notes

The `hook_theme_registry_alter()` in d7_theme_compat.module should:

1. For Category 1 templates: redirect the registry's `path` to the D7 source
2. For Category 2 templates: either leave alone (if they work) or provide
   compatibility wrappers
3. For Category 3 templates: ignore (they won't be in the registry unless
   the module is installed)

The flatten function should run for ALL template hooks when a D7 theme is
active, EXCEPT for templates that are known to require Backdrop-style arrays
(Category 2 templates that we haven't provided D7 versions for).

## Resolved Questions

- **Copy vs reference?** RESOLVED: Copy D7 templates into the module at
  `d7_theme_compat/templates/`. This keeps everything inside the Backdrop
  root and makes the module self-contained. Do NOT reference files outside
  the Backdrop root (e.g., `../drupal/`).
- **Template key with subdirectories?** RESOLVED: Backdrop's registry may
  store `template` with path components (e.g., `core/modules/user/templates/user-picture`).
  When redirecting, strip with `basename()` so our flat `templates/` dir works.
- **Hooks without templates?** RESOLVED: `field` uses `theme_field()` (function,
  not template). `region` isn't registered at all. These are omitted from the
  template map.

## Open Questions

- For Views: do D7 themes commonly override Views templates? If not, we can
  leave Views templates alone and just ensure the flatten doesn't break them.
  Currently the flatten function only runs for D7 templates (our module's
  templates/ dir or the D7 theme itself), so Views templates are left alone.
- The Layout module is suppressed via `layout_suppress(TRUE)`, which works
  for node pages. The front page uses `layout_page_callback` as its route
  handler and still renders through Layout. Fix by changing `site_frontpage`
  to `node` or providing a custom route.

## Currently Shipped D7 Templates

These 8 templates are in `d7_theme_compat/templates/`:
- html.tpl.php, page.tpl.php, maintenance-page.tpl.php
- node.tpl.php, block.tpl.php, comment.tpl.php
- user-profile.tpl.php, user-picture.tpl.php

Not yet shipped (may be needed later): region.tpl.php (not in Backdrop registry),
field.tpl.php (Backdrop uses function), taxonomy-term.tpl.php, search-results.tpl.php,
book-*.tpl.php.

Last updated: 2026-02-22 by claude (session 3: resolved copy-vs-reference, template key fix)
