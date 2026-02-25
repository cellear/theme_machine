# Testing Environment Setup Plan

**Date:** 2026-02-25
**Status:** Planning phase
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

2. **Phase 2: D7 Sample Content**
   - Option A: Port `sample_animal_content` from Backdrop to D7
   - Option B: Create lightweight D7 equivalent using Features + Devel Generate
   - Must include: images, taxonomy, multiple content types with varied layouts
   - Should be feature-based for easy reuse

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

## Phase 2 Details: D7 Sample Content

### Decision Tree

- **Analyze `sample_animal_content` Backdrop module:**
  - What Backdrop-specific APIs does it use?
  - Can it be ported with minimal changes?
  - How many nodes, taxonomy terms, images?

- **If easy to port (< 4 hours):** Create `d7_sample_animal_content` module
  - Reuse most code from Backdrop version
  - Adapt Views, blocks, content type definitions to D7

- **If difficult to port:** Create lightweight D7 alternative
  - Use Devel Generate for base content
  - Create one custom content type (Animal) with fields
  - Hand-craft 5-10 nodes with real images from Unsplash/Drupal.org
  - Create simple custom block to display animal count

### Sample content must include

- Multiple content types OR multiple nodes of same type
- At least 2 images per content item (demonstrate image field handling)
- Taxonomy terms (categories/tags)
- Some nodes published, some unpublished
- Custom blocks referencing the content

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

1. **D7 Theme Compatibility Modules**
   - Do `d7_theme_compat`, `lost_regions`, `watchdog_tools` need porting to D7 or do they already work?
   - Assumption: They're designed to help D7 themes run on Backdrop, so only needed in Backdrop instance

2. **D7 Sample Content**
   - Need to verify difficulty of porting `sample_animal_content`
   - Devel module available for D7? (Yes, but may be older)

3. **DDEV Configuration**
   - Should both instances share one ddev project (two docroots) or separate projects?
   - Recommendation: Separate projects for isolation and easier reset

4. **Testing Against Multiple Themes**
   - Should setup script enable all 47 themes in D7?
   - Recommendation: Enable a subset (5-10) by default, document how to enable all for full test

## Next Steps (Priority Order)

1. **Verify D7 compatibility module requirements** (30 min)
   - Test if theme modules work on D7 as-is
   - Identify what needs porting

2. **Analyze `sample_animal_content` module** (1 hour)
   - Examine GitHub source
   - Estimate porting effort
   - Make Phase 2 decision (port vs. create new)

3. **Create setup script skeleton** (2 hours)
   - Basic ddev project creation
   - Module enable/install
   - Content import hooks

4. **Test setup script with actual testers** (4 hours)
   - Document any edge cases
   - Simplify/clarify instructions

5. **Phase 2: D7 content** (4-8 hours)
   - Implement chosen approach
   - Create module structure

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

**Last updated:** 2026-02-25 by Claude
