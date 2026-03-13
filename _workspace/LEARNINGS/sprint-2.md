# Backdrop for Drupal 7 Developers — Sprint 2 Learnings

Sprint 2 expanded from 10 to 45 themes, added the interactive reviewer, and built `region_labels` modules for both D7 and Backdrop. The main new territory: Backdrop's block and layout APIs as they relate to D7-compat theme testing.

---

## 1. Block placement is not the right primitive for D7-compat themes

In D7, you place blocks at admin/structure/block. The block table records which region each block belongs to for each theme. When using a D7 theme on Backdrop through `d7_theme_compat`, the Layout module is suppressed — so the Backdrop block system doesn't apply.

The D7 `{block}` table still works (D7 modules can write to it), but the Backdrop layout config JSON is irrelevant for D7-compat themes.

**The right primitive:** `hook_page_build(&$page)`. This fires for every page request before rendering, regardless of whether the Layout module is active. If you want something to appear in `$page['sidebar_first']` on D7-compat themes, inject it in `hook_page_build()`. This is what `region_labels` does.

---

## 2. `hook_block_info()` and `hook_block_view()` still matter for Backdrop themes

When a native Backdrop theme is active (using the Layout system), blocks are placed in Layout config, not the block admin UI. But `hook_block_info()` still registers blocks so they appear as available in the Layout editor.

`hook_block_view()` returns the rendered block content — same structure as D7 (`subject`, `content`). The content can be a render array or a string. Return both from any module that wants to support both D7 and Backdrop native themes.

**D7 vs Backdrop `hook_block_info()` difference:**
- D7: cache key is `DRUPAL_CACHE_GLOBAL`
- Backdrop: cache key is `BACKDROP_CACHE_GLOBAL`

Same constant, different prefix.

---

## 3. Backdrop's Layout config JSON (for reference — not used here)

For completeness: Backdrop stores layout config in `files/config_*/active/layout.layout_name.json`. Each layout has a `content` key that maps regions to arrays of block data. Programmatically placing blocks at install time means writing to this JSON (or using `config_set()`). Example:

```json
{
  "name": "default",
  "content": {
    "sidebar_first": [
      {
        "module": "region_labels",
        "delta": "sidebar_first",
        ...
      }
    ]
  }
}
```

**Why we didn't use this for region_labels:** D7 themes bypass the Layout module entirely. Writing to layout config would have no effect for the themes we're testing. `hook_page_build()` is universal.

---

## 4. D7's `hook_install()` block placement pattern

In D7, installing a module with blocks and auto-placing them uses `db_merge()` on the `{block}` table:

```php
db_merge('block')
  ->key(array('module' => 'region_labels', 'delta' => $region, 'theme' => $theme))
  ->fields(array('status' => 1, 'weight' => -50, 'region' => $region, ...))
  ->execute();
```

`db_merge()` does an INSERT if the row doesn't exist, UPDATE if it does — idempotent and safe to run multiple times.

**Important columns:**
- `status` — 1 = enabled, 0 = disabled
- `region` — machine name of the region
- `theme` — theme machine name (or `-1` for all themes in some contexts)
- `weight` — display order within the region

Note: this places blocks for themes that are currently enabled. New themes added later won't get the blocks automatically — they need to be placed manually or the install hook re-run.

---

## 5. `#prefix` / `#suffix` on region render arrays

To wrap an entire region's output in a div (for the dashed outline effect), we add `#prefix` and `#suffix` to the region's render array in `hook_page_build()`:

```php
$page[$region]['#prefix'] = '<div class="region-labels-wrapper">';
$page[$region]['#suffix'] = '</div>';
```

These prepend/append to the rendered output of the entire region. This works in both D7 and Backdrop because render arrays use the same `#prefix`/`#suffix` keys.

**Gotcha:** If another module has already set `#prefix`/`#suffix` on the region, you'll overwrite their value. The safe pattern concatenates:

```php
$page[$region]['#prefix'] = '<div class="region-labels-wrapper">' . ($page[$region]['#prefix'] ?? '');
```

---

## 6. CSS injection: inline vs file

For a dev-only overlay module like region_labels, inline CSS (injected via `drupal_add_css(..., array('type' => 'inline'))` in D7, or via `#attached['html_head']` in Backdrop) is simpler than a file. No path resolution, no cache-bust issues.

**D7 inline CSS:**
```php
drupal_add_css('.my-class { ... }', array('type' => 'inline', 'group' => CSS_SYSTEM));
```

**Backdrop inline via html_head:**
```php
$page['#attached']['html_head'][] = array(
  array('#type' => 'markup', '#markup' => '<style>...</style>'),
  'unique_key',
);
```

Backdrop's `backdrop_add_css()` also works for inline styles but `#attached` is more idiomatic in render arrays.

---

## 7. The 45-theme expansion revealed: most themes work, watchdog is the differentiator

Expanding from 10 to 45 themes in `compare.js` required no new compatibility code in `d7_theme_compat`. The pipeline handles all 45 themes without crashing. What varies between themes is:

- Watchdog status: `clean` vs `errors` (PHP 8.3 deprecation noise from older themes)
- Layout: some themes render all regions, others only a subset
- Visual fidelity: most look identical between D7 and Backdrop; a few have minor CSS differences

The interactive reviewer is designed exactly for this: let a human look at each pair and mark `accept` / `reject` / `needs-work`. Algorithmic scoring can't easily distinguish "intentionally different" from "broken".

---

## 8. `ddev bee` cache clearing is mandatory after module changes

After enabling, disabling, or changing any module:

```bash
ddev bee cc all
```

Backdrop aggressively caches the module registry, theme registry, and hook implementations. Without a cache clear, your new `hook_page_build()` won't fire even if the module is "enabled."

Same is true in D7 — `ddev drush cc all` — but Backdrop's registry cache sometimes catches developers off guard because the site appears to load fine while serving stale hook data.

---

Source: Sprint 2 implementation (2026-03-10), `.handoff/` files, `DOC/backdrop-for-llms.md`

Last updated: 2026-03-10 by Claude Sonnet 4.6
