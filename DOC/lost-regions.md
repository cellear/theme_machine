# Lost Regions

A Backdrop module that rescues blocks placed in Layout regions that the active D7 theme doesn't declare.

## Problem it solves

When `d7_theme_compat` renders a D7 theme, blocks placed in Layout regions like `sidebar_first`, `highlighted`, or `sidebar_second` are silently dropped if the active D7 theme doesn't declare those regions. Content assigned to those regions simply vanishes.

## How it works

The module provides a single block ("Lost Regions") that, when rendered:

1. Checks whether the active theme is a D7 theme (via `_d7_theme_compat_is_d7_theme()`)
2. Loads the active Layout via `layout_get_layout_by_path()`
3. Compares Layout regions against the D7 theme's declared regions
4. Renders any blocks in regions the theme **doesn't** have
5. Groups the output under region-name headings inside `<div class="lost-regions">`

### Blocks that are skipped

- System blocks that duplicate D7 template variables (`main`, `header`, `main-menu`, `breadcrumb`, `page_components`) — same skip list as `d7_theme_compat`
- The Lost Regions block itself (prevents recursion)
- Disabled blocks

## Files

```
backdrop/modules/lost_regions/
  lost_regions.info      # Depends on d7_theme_compat, package "Theme Machine"
  lost_regions.module    # Block info/view + orphan-rescue logic (~170 lines)
```

## Setup

1. Enable: `ddev bee en lost_regions`
2. Place the "Lost Regions" block in the **content** region via Layout admin (`admin/structure/layouts/manage/default`)

## Testing

Switch to a theme like `classic_blog` which is missing `highlighted` and `sidebar_second`. Any non-system blocks placed in those Layout regions should appear in the content area under their region headings.

## HTML output

```html
<div class="lost-regions">
  <div class="lost-region lost-region--sidebar-first">
    <h3 class="lost-region__label">Sidebar First</h3>
    <div id="block-views-..." class="block block-views">
      <h2>Block Title</h2>
      <div class="content">...</div>
    </div>
  </div>
</div>
```

## Origin

Written by desktop Claude in a session that ran out of tokens before handoff/commit. Committed by cursor.

Last updated: 2026-02-23 by cursor
