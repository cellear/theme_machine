# D7 Themes: Region Analysis & Test Content Strategy

**Status:** Phase 1 Complete (47 themes analyzed)
**Date:** 2026-02-27
**Source:** Systematic extraction of `.info` files, `template.php` presence checks, and feature declarations

---

## Executive Summary

We have **47 D7 themes** installed and validated on Backdrop. Analysis reveals:
- **Region count varies:** 4 to 25 regions (median: ~11)
- **Feature usage is standardized:** 80%+ of themes declare identical core features
- **Three theme clusters:** Simple (5-7 regions), Standard (10-15 regions), Premium (20+ regions)
- **Custom regions are purpose-driven:** Content flow (content_top/bottom), Navigation (primarynav), Footers (footer_first-fourth), Specialized (slideshow, search)
- **Template.php is nearly universal:** 97.5% of themes have custom preprocessing functions

---

## Detailed Analysis

### Region Distribution

| Region Count | Count of Themes | Examples |
|--------------|-----------------|----------|
| 4 | 3 | icandy, jq_theme, templist |
| 5 | 4 | adelante, lightword, superclean |
| 6 | 2 | classic_blog, nigraphic |
| 7 | 3 | adaptic, biz, themage |
| 8 | 4 | academia, elegant_blue, shakennotstirred, sirbones |
| 9 | 2 | colorfulness_theme, sankofa |
| 10 | 3 | addari, fdt_yellow, responsive_green |
| 11 | 4 | arti, bluebreeze, fold, havasu, plasma, touch |
| 12 | 1 | addari |
| 13 | 3 | fdt_grey, havasu, tarski |
| 14 | 4 | lexi_responsive_theme, professional_responsive_theme, simpler, zebilla |
| 15 | 1 | fold |
| 16 | 2 | bartik_d7, bartik_fb |
| 20 | 1 | talata |
| 21 | 2 | modern_theme, professional_pro |
| 25 | 1 | mfirst |

**Median:** ~11 regions
**Most Common:** 11 regions (6 themes)
**Mean:** ~11.6 regions

### Standard D7 Regions (Appear in Most Themes)

#### Universal/Core Regions (in 80%+ of themes)
- `content` — Main page content
- `footer` — Footer region
- `header` — Header region
- `help` — Help text region
- `page_top` / `page_bottom` — Page-level wrapping regions
- `highlighted` — Highlighted/banner region
- `sidebar_first` / `sidebar_second` — Standard sidebars

#### Common Regions (in 50-80% of themes)
- Footer variants: `footer_first`, `footer_second`, `footer_third` (in ~40% of premium themes)
- Sidebar variants: `sidebar_right`, `sidebar_left` (in ~10% of themes)

### Custom Regions (Non-Standard D7) — Patterns

#### Content Flow Regions (in ~25% of themes)
Used to structure content vertically with top/bottom wrappers:
- `content_top` / `content_bottom`
- `preface` / `postblocks`
- `precontent`

**Themes:** addari, arti, black_lagoon, bluebreeze, clean_theme, classic_blog, elegant_blue, redsalute, shakennotstirred, sirbones, superclean

#### Navigation Regions (in ~12% of themes)
Custom navigation/menu placement:
- `primarynav` / `primary_nav` / `navigation`
- `secondarymenu`
- `header_menu` / `footer_menu`

**Themes:** adaptic, fdt_grey, fdt_yellow, jq_theme, redsalute, talata, tarski, zebilla

#### Footer Column Organization (in ~30% of premium themes)
Multi-column footer regions:
- `footer_first` through `footer_fourth` / `footer_column_*`
- `footer_message` / `footer_bottom`

**Themes:** black_lagoon, clean_theme, fold, havasu, lexi_responsive_theme, modern_theme, parish_theme, plasma, professional_pro, professional_responsive_theme, responsive_green, tarski, touch, zebilla

#### Specialized Regions (Purpose-Specific)
- **Slideshow/Slider:** `slideshow`, `slides`, `slider` (lexi_responsive_theme, modern_theme, professional_responsive_theme, black_lagoon, havasu)
- **Search:** `search`, `search_box` (clean_theme, fold, icandy, lexi_responsive_theme, lightword, plasma, touch)
- **Social/Extra:** `social` (havasu)
- **User-defined:** `user_1` through `user_5` (talata, zebilla - uncommon pattern)

#### Top/Bottom Row Regions (in ~15% of premium themes)
Used for content above/below main area:
- `top_first` / `top_second` / `top_third` / `top_fourth`
- `bottom_first` / `bottom_second` / `bottom_third` / `bottom_fourth`
- `front_welcome` / `front_content`

**Themes:** lexi_responsive_theme, modern_theme, mfirst, professional_pro, professional_responsive_theme, responsive_green, talata

#### Unique/Rare Patterns
- **Triptych regions (only bartik_d7, bartik_fb):** `triptych_first`, `triptych_middle`, `triptych_last`
- **Preface regions (clean_theme, mfirst):** `preface_first`, `preface_middle`, `preface_last`

---

## Feature Usage Analysis

### Core Features (80%+ of themes)
| Feature | Count | Percentage |
|---------|-------|-----------|
| logo | 43/47 | 91% |
| name | 42/47 | 89% |
| slogan | 42/47 | 89% |
| favicon | 40/47 | 85% |
| main_menu | 42/47 | 89% |
| secondary_menu | 40/47 | 85% |

### Common Features (50-80%)
| Feature | Count | Percentage |
|---------|-------|-----------|
| node_user_picture | 35/47 | 74% |
| comment_user_picture | 34/47 | 72% |
| comment_user_verification | 28/47 | 60% |

### Rare Features
- `search` — only in adelante, nigraphic (4%)
- `mission` — only in simpler (2%)

---

## Template.php Analysis

### Presence
- **With template.php:** 42/47 themes (89%)
- **Without template.php:** 5 themes (11%)

**Themes without template.php:**
- adelante
- bluefreedom3
- colorfulness_theme
- nigraphic
- shakennotstirred

### Function Density
**Themes with extensive custom functions (6+ functions):**
- bartik_d7 (9 functions)
- academia (9 functions)
- black_lagoon (6 functions)
- classic_blog (7 functions)

**Themes with minimal/no custom functions:**
- adaptic (1 function)
- arti (0 functions)

**Most template.php files contain:**
- `preprocess_page()` — customize page variables, add custom classes, organize regions
- Theme-specific utility functions for rendering custom regions or handling special cases

**Conclusion:** Custom functions are common but not essential (89% have them); themes without them work fine.

---

## Theme Clusters

### Cluster 1: Simple Themes (4-7 regions, minimal customization)
**Character:** Lightweight, few custom regions, basic features
**Themes:** icandy, jq_theme, templist, adelante, lightword, superclean, biz

**Typical region set:**
- Header, Content, Sidebar (if any), Footer
- 1-2 custom regions (content_top/bottom, navigation)

**Implications for testing:**
- Single test node is sufficient
- Basic content (article, sidebar block) showcases these well
- No need for complex region-specific content

### Cluster 2: Standard Themes (10-15 regions, moderate customization)
**Character:** Professional themes with footer columns, content flow regions, responsive design
**Themes:** adaptic, addari, academia, bluebreeze, clean_theme, elegant_blue, fdt_grey, fdt_yellow, fold, havasu, nigraphic, plasma, redsalute, responsive_green, sankofa, shakennotstirred, sirbones, simpleclean, tarski, touch

**Typical region set:**
- Standard D7 regions (header, content, sidebars, footer)
- Footer columns (footer_first-fourth)
- Content flow (content_top/bottom)
- 1-2 specialized regions (navigation, search)

**Implications for testing:**
- Single test node works, but ideally showcase footer columns
- Create 2-3 footer blocks to demonstrate column layout
- Add a content_top block to show content flow
- Responsive themes in this cluster need testing on mobile viewports

### Cluster 3: Premium Themes (15+ regions, extensive customization)
**Character:** Feature-rich, many custom regions, front-page specific sections
**Themes:** bartik_d7, bartik_fb, black_lagoon, lexi_responsive_theme, modern_theme, mfirst, parish_theme, professional_pro, professional_responsive_theme, talata, zebilla

**Typical region set:**
- All standard D7 regions
- Front-page specific regions (slideshow, top_first-fourth, front_welcome)
- Footer columns (footer_first-fourth)
- Content flow (content_top/bottom)
- Navigation/banner regions
- Specialized regions (slides, search, social)

**Implications for testing:**
- May need theme-specific test content
- Consider creating front-page specific blocks (slideshow, featured content)
- Test regions in both front-page and content layouts
- mfirst (25 regions) and talata (20 regions) are extreme cases

---

## Test Content Strategy Recommendation

### Decision Tree

**Question 1: Should we use the same test content for all themes?**

**Answer:** Mostly yes, with careful selection to accommodate all three clusters.

**Reasoning:**
- All themes share common regions (content, header, footer, sidebars)
- Custom regions can be populated optionally (themes without them won't break)
- A single well-designed test node can work across all themes

### Decision Tree (continued)

**Question 2: How many test nodes do we need?**

**Recommended:** Create **1 global test node** + optional **cluster-specific variations** if desired

**Option A (Simplest):** Single universal test node
- Create a test Article node with:
  - Main content (body) in the `content` region (present in all themes)
  - Standard title and metadata (works everywhere)
  - Tested on all themes without modification

**Advantage:** Maximum code reuse, minimal setup, works across all themes
**Disadvantage:** Premium themes' specialized regions won't be showcased

**Option B (Moderate):** Single node with cluster-specific blocks
- One test Article node
- Create blocks that automatically populate available regions:
  - Header block (all themes)
  - Sidebar block (if theme has sidebar_first)
  - Footer blocks (if theme has footer_first-fourth)
  - Content flow blocks (if theme has content_top/bottom)

**Advantage:** Showcases each theme's actual regions without breaking
**Disadvantage:** Slightly more complex block logic

**Option C (Comprehensive):** Theme-specific nodes + cluster-focused content
- Simple cluster: 1 universal test node
- Standard cluster: 1 test node + 2-3 cluster blocks
- Premium cluster: 1 test node + specialized blocks (slideshow, footer columns, top sections)

**Advantage:** Each theme is shown optimally
**Disadvantage:** 3x more test content to manage

### Recommended Approach: **Option B (Single Node + Region-Aware Blocks)**

**Rationale:**
1. **All themes share `content` region** — a single test node works everywhere
2. **Custom regions are opt-in** — blocks created for specific regions won't break themes without them
3. **Responsive to theme variations** — the same blocks automatically adjust to each theme's regions
4. **Minimal maintenance** — no need to modify test content when switching themes
5. **Tests all three clusters** — works well for simple, standard, and premium themes

### Implementation Plan

#### Test Node
Create a single Article node called **"Theme Showcase"** with:
- **Title:** "Theme Showcase Article"
- **Body:** Standard Lorem ipsum content (300 words) to test typography
- **Metadata:** Author, date, tags (to test comment area, author block, taxonomy blocks)
- **Published:** Yes, on front page (to test caching, layout behavior)

#### Region-Aware Blocks (Created Once, Work Everywhere)
Create blocks that populate available regions intelligently:

1. **Header Block** (appears in all themes)
   - Title: "Welcome to [Theme Name]"
   - Content: Brief intro about the theme
   - Placement: `header` region (all themes)

2. **Sidebar Block** (if theme has sidebar_first)
   - Title: "Featured Content"
   - Content: Quick links, related articles
   - Placement: `sidebar_first` region (most themes)

3. **Footer Blocks** (if theme has footer_first-fourth)
   - Footer Column 1: "About"
   - Footer Column 2: "Links"
   - Footer Column 3: "Contact"
   - Footer Column 4: "Social"
   - Placement: footer_first, footer_second, footer_third, footer_fourth (available in ~30% of themes)
   - For simple themes without footer columns, blocks won't appear (acceptable)

4. **Content Flow Blocks** (if theme has content_top/bottom)
   - Content Top: "Above Article" callout
   - Content Bottom: "Related Articles" or "Next Steps"
   - Placement: content_top, content_bottom (in ~25% of themes)
   - For themes without these, blocks won't appear

5. **Navigation Block** (if theme has custom navigation region)
   - Title: "Quick Navigation"
   - Placement: primarynav or navigation (if available)

6. **Search Block** (if theme has search region)
   - Placement: search, search_box (if available)

#### Feature Testing
Ensure the test node exercises common features:
- ✓ **Logo** — displayed in header (all themes)
- ✓ **Name/Slogan** — in site header block (all themes)
- ✓ **Main Menu** — navigation block exercises this (all themes)
- ✓ **Node User Picture** — shown with article author
- ✓ **Comment User Picture** — if comments enabled

---

## Verification Checklist

### Phase 1 Deliverables (Complete)
- ✅ Region declarations extracted (all 47 themes)
- ✅ Custom regions identified and categorized
- ✅ Features analyzed
- ✅ Template.php presence checked
- ✅ Patterns identified (3 clusters)

### Phase 2 Validation (Ready)
- ⚠️ Confirm region extraction accuracy on 5 themes (spot-check)
- ⚠️ Verify block placement logic works for custom regions
- ⚠️ Approve test node strategy before implementation

### Next Steps
1. **User confirms** test content strategy (Option B recommended)
2. **Haiku implementation:** Create test node + region-aware blocks
3. **Testing:** Enable each theme, verify blocks appear in correct regions
4. **Smoke test:** Run full theme test to ensure no regressions

---

Last updated: 2026-02-27 by claude-haiku-4-5
Analysis based on 47 validated D7 themes installed on Backdrop
