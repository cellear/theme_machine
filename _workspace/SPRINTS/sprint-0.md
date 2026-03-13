# Sprint 0 — Environment Parity (Retroactive)

**Goal:** Configure both test instances (D7 and Backdrop) to render as similarly as possible before automated comparison begins. This is a reference document for setup work completed manually — not executable instructions. Sprint 4 (one-command setup) will automate this.

**Status:** Completed manually by human, 2026-03-07/08.

---

## Why This Exists

The automated comparison pipeline (Sprint 1) only produces meaningful output if both sites are configured comparably. Before running screenshots, the D7 and Backdrop instances needed to share:

- The same sidebar blocks (theme switcher, node listing)
- The same content structure (image + body + taxonomy)
- Clean, readable URLs
- A layout system capable of rendering standard D7 regions

This sprint documents what was done to achieve parity.

---

## D7 Configuration (`drupal-7.ddev.site`)

### Modules Enabled

| Module | Purpose |
|---|---|
| `pathauto` | Auto-generate clean URLs from content title |
| `token` | Token replacement for pathauto patterns |
| `views` | Node listing blocks and pages |
| `ctools` | Views dependency |

### Pathauto Configuration

Pattern for `animal` content type: `animals/[node:title]`

Result: Fox node at `/node/1` is accessible at `https://drupal-7.ddev.site/animals/fox`. This is the canonical URL used in the comparison script.

### Block Configuration

| Block | Region |
|---|---|
| Theme Menu Block (switcher) | `sidebar_first` (left sidebar) |
| Show All Nodes — Block display | `sidebar_second` (right sidebar) |

### Views: `show_all_nodes`

A custom view matching the Backdrop version. Block display is a 1-column grid of thumbnails filtered to `animal` content type only.

**D7 export (for Sprint 4 reference):**

```php
$view = new view();
$view->name = 'show_all_nodes';
$view->description = '';
$view->tag = 'default';
$view->base_table = 'node';
$view->human_name = 'Show All Nodes';
$view->core = 7;
$view->api_version = '3.0';
$view->disabled = FALSE;
/* Display: Master */
$handler = $view->new_display('default', 'Master', 'default');
$handler->display->display_options['title'] = 'Show All Nodes';
$handler->display->display_options['use_more_always'] = FALSE;
$handler->display->display_options['access']['type'] = 'perm';
$handler->display->display_options['cache']['type'] = 'none';
$handler->display->display_options['query']['type'] = 'views_query';
$handler->display->display_options['exposed_form']['type'] = 'basic';
$handler->display->display_options['pager']['type'] = 'none';
$handler->display->display_options['style_plugin'] = 'table';
/* Field: Content: Title */
$handler->display->display_options['fields']['title']['id'] = 'title';
$handler->display->display_options['fields']['title']['table'] = 'node';
$handler->display->display_options['fields']['title']['field'] = 'title';
$handler->display->display_options['fields']['title']['label'] = '';
$handler->display->display_options['fields']['title']['alter']['word_boundary'] = FALSE;
$handler->display->display_options['fields']['title']['alter']['ellipsis'] = FALSE;
$handler->display->display_options['fields']['title']['element_type'] = 'h3';
$handler->display->display_options['fields']['title']['element_label_colon'] = FALSE;
/* Field: Content: Image */
$handler->display->display_options['fields']['field_image']['id'] = 'field_image';
$handler->display->display_options['fields']['field_image']['table'] = 'field_data_field_image';
$handler->display->display_options['fields']['field_image']['field'] = 'field_image';
$handler->display->display_options['fields']['field_image']['label'] = '';
$handler->display->display_options['fields']['field_image']['element_type'] = 'h2';
$handler->display->display_options['fields']['field_image']['element_label_colon'] = FALSE;
$handler->display->display_options['fields']['field_image']['click_sort_column'] = 'fid';
$handler->display->display_options['fields']['field_image']['settings'] = array(
  'image_style' => 'thumbnail',
  'image_link' => 'content',
);
/* Sort criterion: Content: Post date */
$handler->display->display_options['sorts']['created']['id'] = 'created';
$handler->display->display_options['sorts']['created']['table'] = 'node';
$handler->display->display_options['sorts']['created']['field'] = 'created';
$handler->display->display_options['sorts']['created']['order'] = 'DESC';
/* Filter criterion: Content: Published status */
$handler->display->display_options['filters']['status']['id'] = 'status';
$handler->display->display_options['filters']['status']['table'] = 'node';
$handler->display->display_options['filters']['status']['field'] = 'status';
$handler->display->display_options['filters']['status']['value'] = 1;
$handler->display->display_options['filters']['status']['group'] = 1;
$handler->display->display_options['filters']['status']['expose']['operator'] = FALSE;
/* Display: Page */
$handler = $view->new_display('page', 'Page', 'page');
$handler->display->display_options['path'] = 'show-all-nodes';
/* Display: Block */
$handler = $view->new_display('block', 'Block', 'block');
$handler->display->display_options['defaults']['pager'] = FALSE;
$handler->display->display_options['pager']['type'] = 'none';
$handler->display->display_options['defaults']['style_plugin'] = FALSE;
$handler->display->display_options['style_plugin'] = 'grid';
$handler->display->display_options['style_options']['columns'] = '1';
$handler->display->display_options['defaults']['style_options'] = FALSE;
$handler->display->display_options['defaults']['row_plugin'] = FALSE;
$handler->display->display_options['row_plugin'] = 'fields';
$handler->display->display_options['defaults']['row_options'] = FALSE;
$handler->display->display_options['defaults']['filter_groups'] = FALSE;
$handler->display->display_options['defaults']['filters'] = FALSE;
/* Filter criterion: Content: Published status */
$handler->display->display_options['filters']['status']['id'] = 'status';
$handler->display->display_options['filters']['status']['table'] = 'node';
$handler->display->display_options['filters']['status']['field'] = 'status';
$handler->display->display_options['filters']['status']['value'] = 1;
$handler->display->display_options['filters']['status']['group'] = 1;
$handler->display->display_options['filters']['status']['expose']['operator'] = FALSE;
/* Filter criterion: Content: Type */
$handler->display->display_options['filters']['type']['id'] = 'type';
$handler->display->display_options['filters']['type']['table'] = 'node';
$handler->display->display_options['filters']['type']['field'] = 'type';
$handler->display->display_options['filters']['type']['value'] = array(
  'animal' => 'animal',
);
```

### Test Content Node

Fox: `https://drupal-7.ddev.site/animals/fox` (internal: `/node/1`)

---

## Backdrop Configuration (`theme-machine.ddev.site`)

### Layout Rebuild

Both layouts (`default` and `home`) were using `d7_theme_bluebreeze` as their layout template. This template had non-standard region keys (`top`, `half1`, `half2`, `bottom`) instead of the expected D7 region names, causing sidebars to be invisible on all non-home pages.

**Fix:** Both layouts switched to `d7_default` template (already in `d7_theme_compat` module).

**Default layout regions (after fix):**

| Region | Blocks |
|---|---|
| `header` | system:header, system:main-menu (dropdown) |
| `content` | title_combo, breadcrumb, current_theme_block, system:main |
| `sidebar_first` | theme_menu_block:switcher |
| `sidebar_second` | views:show_all_nodes-block_1 |
| `footer` | system:powered-by |

### Test Content Node

Saltwater Crocodile: `https://theme-machine.ddev.site/node/6` (no clean URL configured yet)

---

## Comparison Script Configuration

```js
// scripts/screenshot.js
config = {
  d7: {
    url: 'https://drupal-7.ddev.site',
    contentPath: '/animals/fox',   // pathauto clean URL
  },
  backdrop: {
    url: 'https://theme-machine.ddev.site',
    contentPath: '/node/6',        // Saltwater Crocodile; clean URL TBD
  },
};
```

---

## Known Remaining Gaps

These are not blockers for Sprint 1 but will affect screenshot quality and Sprint 2:

| Gap | Impact | Fix for |
|---|---|---|
| D7 and Backdrop show different animals (Fox vs Crocodile) | Node screenshots won't pixel-match | Sprint 2 or whenever content is aligned |
| Backdrop has no pathauto clean URLs | `/node/6` is functional but not readable | Sprint 2 or 4 |
| D7 show_all_nodes filters to `animal` type; Backdrop version may not | Sidebar node list may differ | Sprint 2 |
| `highlighted` region missing from some themes (e.g. bluebreeze) | No highlighted banner content | Acceptable — themes that don't declare it just skip it |

---

## Files This Sprint Governs

```
SPRINTS/
  sprint-0.md           (this file)
scripts/
  screenshot.js         (contentPath config)
backdrop/files/config_*/active/
  layout.layout.default.json   (template + sidebar regions)
  layout.layout.home.json      (template only)
drupal-7/
  (module/block config managed through UI; see Sprint 4 for automation)
```

---

Last updated: 2026-03-08 by Claude Sonnet 4.6
