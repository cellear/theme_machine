# Per-Theme Layout Generation for d7_theme_compat

## The Problem

`d7_theme_compat` currently registers a single hardcoded layout template (`d7_default`) with 7 standard D7 regions:

```
header, highlighted, help, content, sidebar_first, sidebar_second, footer
```

Real-world D7 themes commonly declare custom regions beyond these defaults — `featured`, `triptych_first`, `triptych_second`, `triptych_third`, `footer_firstcolumn`, `footer_secondcolumn`, etc. Themes in production will almost always use custom regions.

**Result:** Admins can only place blocks into the 7 standard regions via the Layout UI. Blocks cannot be placed into theme-specific regions. Those regions render empty even if the D7 theme's `page.tpl.php` expects them.

**Note:** The rendering side is already correct. `_d7_theme_compat_render_layout_blocks()` (line 661-663) already filters to only populate regions declared by the active D7 theme:
```php
if (!in_array($layout_region, $d7_regions)) {
  continue;
}
```
The gap is in block *placement* — the Layout UI only offers 7 regions to place into.

---

## The Solution: Per-Theme Layout Templates + Auto-Managed Instances

### Concept

When a D7 theme is activated as the default:
1. Dynamically register a layout **template** for that theme, declaring its exact regions
2. Auto-create or update the **Default** and **Front Page** layout instances to use that template

The layout template doesn't need a real HTML rendering template — `d7_theme_compat` suppresses the Layout renderer entirely. It only needs to declare region names so the block placement UI offers the right regions.

### Scope

Only two layout instances need management:
- **Default layout** — covers all standard pages
- **Front Page layout** — covers the front page

Path-specific layouts are out of scope for now.

---

## Implementation Plan

### Step 1: Dynamic `hook_layout_template_info()`

Replace the hardcoded `d7_default` template with a dynamic function that reads all enabled D7 themes and registers one template per theme.

```php
function d7_theme_compat_layout_template_info() {
  $templates = array();

  // Keep d7_default as fallback for themes with no declared regions.
  $templates['d7_default'] = array(
    'title' => t('Drupal 7 Default Regions'),
    'path' => 'layouts/d7_default',
    'regions' => array(
      'header'         => t('Header'),
      'highlighted'    => t('Highlighted'),
      'help'           => t('Help'),
      'content'        => t('Content'),
      'sidebar_first'  => t('Sidebar first'),
      'sidebar_second' => t('Sidebar second'),
      'footer'         => t('Footer'),
    ),
    'default region' => 'content',
  );

  // Register a template for each enabled D7 theme with declared regions.
  foreach (list_themes() as $name => $theme) {
    if (!$theme->status) continue;
    if (!isset($theme->info['core']) || $theme->info['core'] !== '7.x') continue;
    if (empty($theme->info['regions'])) continue;

    $machine_name = 'd7_theme_' . $name;
    $regions = array();
    foreach ($theme->info['regions'] as $key => $label) {
      $regions[$key] = t($label);
    }
    // Ensure 'content' region always exists.
    if (!isset($regions['content'])) {
      $regions['content'] = t('Content');
    }

    $templates[$machine_name] = array(
      'title'          => t('@theme regions', array('@theme' => $theme->info['name'])),
      'path'           => 'layouts/d7_default',   // reuse same no-op template files
      'regions'        => $regions,
      'default region' => 'content',
    );
  }

  return $templates;
}
```

### Step 2: Auto-Update Layout Instances on Theme Activation

Hook into theme switching to update the Default and Front Page layout instances when a D7 theme becomes the default.

**Where to hook:** `hook_init()` already detects the active D7 theme (line 115-130). We can add a check there: if the active layout template doesn't match the current D7 theme, update it.

Alternatively, hook into `hook_config_data_presave()` or `hook_system_theme_enable()` to catch the moment of switching.

**The simpler approach:** On `hook_init()`, compare the active layout's template to the expected template for the current D7 theme. If mismatched, update.

```php
function _d7_theme_compat_sync_layout($theme_name) {
  $expected_template = 'd7_theme_' . $theme_name;

  // Get the default layout (applies to all paths not matched by others).
  $default_layout = layout_load('default');
  if ($default_layout && $default_layout->layout_template !== $expected_template) {
    // Check the template actually exists (theme has declared regions).
    $templates = layout_get_layout_template_info();
    if (isset($templates[$expected_template])) {
      $default_layout->layout_template = $expected_template;
      $default_layout->save();
    }
  }

  // Also update the front page layout if it exists.
  $front_layout = layout_load('home');  // 'home' is Backdrop's default front page layout machine name
  if ($front_layout && $front_layout->layout_template !== $expected_template) {
    $templates = layout_get_layout_template_info();
    if (isset($templates[$expected_template])) {
      $front_layout->layout_template = $expected_template;
      $front_layout->save();
    }
  }
}
```

Call this from `d7_theme_compat_init()` when a D7 theme is active.

### Step 3: Handle Block Placement Migration

When the layout template changes, existing block placements in old regions may become orphaned. Options:
- **Ignore** — blocks in regions the new theme doesn't declare are silently dropped (current `lost_regions` behavior)
- **Migrate** — move orphaned blocks to the `content` region (complex, probably overkill)
- **Warn** — log a watchdog notice if block placements exist in regions that no longer exist

**Recommendation:** Start with ignore/lost_regions behavior. Add a watchdog warning for visibility.

---

## Key Files to Modify

| File | Change |
|------|--------|
| `modules/d7_theme_compat/d7_theme_compat.module` | Replace `d7_theme_compat_layout_template_info()` with dynamic version; add `_d7_theme_compat_sync_layout()` |
| `modules/d7_theme_compat/layouts/d7_default/` | Existing layout template files; may be reused as-is for all per-theme templates |

### Existing layout template files to check:
```
modules/d7_theme_compat/layouts/d7_default/
  d7_default.info      (or similar)
  d7_default.tpl.php   (or similar)
  screenshot.png       (optional)
```

These can be shared across all per-theme templates by pointing `'path'` to the same directory.

---

## Key Questions for Next Agent

1. **Layout machine names:** What are the actual machine names of Backdrop's default and front-page layouts? Likely `default` and `home` but verify with `layout_load()` or by checking `backdrop/config/active/layout.layout.*.json`.

2. **When to sync:** `hook_init()` runs on every request — syncing there is wasteful. Better to hook into the moment of theme switching. Does Backdrop provide `hook_system_theme_enable()` or a config presave hook? Check Backdrop's API.

3. **Template file sharing:** Confirm that multiple layout templates can share the same `path` (pointing to `layouts/d7_default/`). The template machine name (`d7_theme_{name}`) would differ but the files would be the same.

4. **`layout_get_layout_template_info()` caching:** This function may be statically cached. If we register templates dynamically, does the cache need clearing when a new D7 theme is enabled?

5. **Existing block placements:** If an admin has already placed blocks in the `d7_default` layout, those placements reference the old region names. When switching to a per-theme layout, those placements should still work if region names overlap.

---

## Testing After Implementation

1. Enable a D7 theme with custom regions (e.g., one with a `featured` region)
2. Set it as the default theme
3. Go to Admin > Structure > Layouts — verify the Default layout now offers the theme's custom regions
4. Place a block in a custom region
5. Visit a page — verify the block renders in that region
6. Switch to a different D7 theme — verify the layout updates to that theme's regions
7. Run `bee theme-test` — all themes should still pass (no regressions)

---

Last updated: 2026-02-26 by claude-sonnet-4-6
