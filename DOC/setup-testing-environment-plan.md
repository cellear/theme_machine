# Testing Environment Setup Plan

**Date:** 2026-02-25
**Status:** Phase 2 complete (D7 modules ported), Phase 1 & 3 pending
**Author:** Claude (Opus/Haiku)

## Overview

Establish an easy, automated way for testers to spin up isolated Backdrop CMS and Drupal 7 development environments in parallel using DDEV, pre-configured with theme testing modules and sample content.

## Goals

1. **Phase 1: Automated DDEV Setup Script**
   - Single command to bootstrap both Backdrop and D7 instances
   - Each instance runs on separate DDEV projects (e.g., `theme-machine-bd` and `theme-machine-d7`)
   - Auto-install theme modules (switcher, identifier/current theme block)
   - Auto-import sample content
   - Quick reset capability via scripts

2. **Phase 2: D7 Sample Content** ✅ COMPLETE
   - Ported `sample_animal_content` from Backdrop to D7 → `d7-modules/sample_animal_content/`
   - Ported `theme_menu_block` from Backdrop to D7 → `d7-modules/theme_menu_block/`
   - See "D7 Module Install Instructions" section below for usage

3. **Phase 3: DrupalForge Template** (future)
   - Create repository compatible with DrupalForge platform
   - Structure: `.ddev/`, `.devpanel/`, `.devcontainer/` directories
   - GitHub Actions for Docker image publishing
   - Contact DrupalForge team for listing

## Phase 1 Details: Automated Setup Script

### What needs to happen

1. **Create `setup-testing-environment.sh`** in project root
   - Detects if ddev is installed
   - Creates two ddev projects: `theme-machine-bd` (Backdrop) and `theme-machine-d7` (D7)
   - Runs initialization hooks for each

2. **Backdrop instance setup**
   - Use existing Backdrop install as base OR fresh Backdrop CMS install
   - Enable: `theme_menu_block`, theme identifier module, sample_animal_content
   - Cache clear, watchdog clear
   - Output: site URL and admin credentials

3. **D7 instance setup**
   - Fresh D7 install
   - Port Backdrop modules OR create D7-native equivalents
   - Import sample content (to be determined in Phase 2)
   - Cache clear
   - Output: site URL and admin credentials

4. **Create `reset-testing-environment.sh`**
   - Destroys and recreates ddev instances
   - Optionally resets just one instance (Backdrop or D7)
   - Useful for testing from clean state

### File structure after setup

```
theme_machine/
├── setup-testing-environment.sh    # Main setup script
├── reset-testing-environment.sh    # Reset script
├── .ddev/                          # Backdrop DDEV config (existing)
├── .ddev-d7/                       # NEW: D7 DDEV config
│   ├── config.yaml
│   ├── commands/
│   └── ...
├── d7-modules/                     # D7 theme compat modules (port from d7_theme_compat, etc.)
├── d7-content/                     # D7 sample content module (Phase 2)
└── DOC/
    └── setup-testing-environment-plan.md  # This file
```

## Phase 2 Details: D7 Modules ✅ COMPLETE

Two Backdrop modules were ported to Drupal 7 and placed in `d7-modules/`.

### D7 Module Install Instructions

**Prerequisites:**
1. A working Drupal 7 site
2. The `link` contrib module (required by `sample_animal_content`)

**Install steps:**

```bash
# 1. Copy modules into D7 site
cp -r d7-modules/theme_menu_block /path/to/d7/sites/all/modules/
cp -r d7-modules/sample_animal_content /path/to/d7/sites/all/modules/

# 2. Install link contrib module (dependency for sample_animal_content)
drush dl link && drush en link -y

# 3. Enable the modules
drush en theme_menu_block -y
drush en sample_animal_content -y

# 4. Place the theme switcher block in a region
#    Go to admin/structure/block and place "Theme Menu Block" in a sidebar

# 5. Grant "Switch themes" permission to desired roles
#    Go to admin/people/permissions and check "Switch themes"
```

**What gets created on install of `sample_animal_content`:**
- "Animal" content type with image, body, taxonomy class, and link fields
- "Class" taxonomy vocabulary with terms: Mammalia, Aves, Reptilia
- 8 animal nodes with images and body text (Crocodile, Eagle, Elephant, Fox, Giraffe, Lion, Llama, Panda)

**Clean uninstall:**
```bash
drush dis sample_animal_content -y
drush pm-uninstall sample_animal_content -y
```
This removes all animal nodes, fields, the content type, vocabulary, variables, and uploaded images.

## Phase 3 Details: DrupalForge Template (Future)

### Structure

Use https://github.com/drupalforge/starter_template as base.

```
drupal-theme-testing-template/
├── .ddev/                      # DDEV config for local dev
├── .devcontainer/              # VS Code Remote Containers
├── .devpanel/                  # DevPanel cloud deployment
│   ├── init.sh                 # Initialization script
│   ├── composer_setup.sh       # Composer project setup
│   ├── settings.devpanel.php   # DevPanel-specific settings
│   └── README.md
├── .github/workflows/          # GitHub Actions (Docker publish, etc.)
├── composer.json               # Full project definition
├── README.md
└── LICENSE
```

### Key `.devpanel/init.sh` steps

1. Create ddev projects for both Backdrop and D7
2. Run theme module installation
3. Import sample content via drush
4. Set default theme to bartik_d7
5. Create admin user
6. Warm caches

### Deployment flow

1. User clicks template on DrupalForge
2. DevPanel provisions Kubernetes pod with Docker image
3. `.devpanel/init.sh` runs on startup
4. Site is live with both Backdrop and D7 testing instances in ~5 seconds
5. VS Code available in browser for real-time code editing

## Known Blockers & Questions

1. ~~**D7 Theme Compatibility Modules**~~ ✅ RESOLVED
   - `d7_theme_compat`, `lost_regions`, `watchdog_tools` are Backdrop-only modules (they help D7 themes run on Backdrop)
   - The D7 instance only needs `theme_menu_block` + `sample_animal_content` + stock D7 themes

2. ~~**D7 Sample Content**~~ ✅ RESOLVED
   - Ported `sample_animal_content` to D7 — straightforward port
   - Requires `link` contrib module as dependency

3. **DDEV Configuration**
   - Should both instances share one ddev project (two docroots) or separate projects?
   - Recommendation: Separate projects for isolation and easier reset

4. **Testing Against Multiple Themes**
   - Should setup script enable all 47 themes in D7?
   - Recommendation: Enable a subset (5-10) by default, document how to enable all for full test

## Next Steps (Priority Order)

1. ~~**Verify D7 compatibility module requirements**~~ ✅ DONE
2. ~~**Port `sample_animal_content` and `theme_menu_block` to D7**~~ ✅ DONE

3. **Test D7 module ports on actual D7 site** (1-2 hours)
   - Pull to test machine, install on D7 via ddev
   - Verify `link` module dependency works
   - Test theme switching with multiple D7 themes enabled
   - Verify sample content displays correctly

4. **Create setup script skeleton** (2 hours)
   - Basic ddev project creation for both Backdrop and D7
   - Module enable/install automation
   - Content import hooks

5. **Test setup script with actual testers** (4 hours)
   - Document any edge cases
   - Simplify/clarify instructions

6. **Phase 3: DrupalForge template** (4-6 hours)
   - Fork starter_template
   - Adapt for dual-instance setup
   - Contact DrupalForge team

## Success Criteria

- [ ] Tester can run one command and have both Backdrop and D7 instances ready in < 10 minutes (most time spent downloading)
- [ ] Both instances have identical theme testing capabilities
- [ ] Sample content displays correctly on multiple themes
- [ ] Reset script works cleanly without orphaned databases
- [ ] DrupalForge template listed and usable (Phase 3)

---

**Last updated:** 2026-02-25 by Claude — Phase 2 complete, install instructions added
