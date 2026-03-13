#!/usr/bin/env node
/**
 * setup-d7-blocks.js
 *
 * For each D7 theme that lacks block assignments, reads its .info file,
 * extracts regions, and inserts the standard test-block rows via drush sqlq.
 *
 * Standard block set per theme:
 *   - system / main          → content  (main page content)
 *   - current_theme_block    → content
 *   - region_labels          → every region
 *   - system / powered-by    → footer   (if footer region exists)
 *   - system / help          → help     (if help region exists)
 *   - block / 2 (Left)       → sidebar_first   (if exists)
 *   - block / 3 (Right)      → sidebar_second  (if exists)
 *
 * Usage:
 *   node scripts/setup-d7-blocks.js [--dry-run]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
setup-d7-blocks.js — assign standard test blocks to regions for each D7 theme

Reads each theme's .info file for region declarations and inserts block
assignments into the D7 database via drush. Skips themes already configured.

Standard blocks placed per theme:
  system/main           → content
  current_theme_block   → content
  region_labels         → every declared region
  system/powered-by     → footer (if region exists)
  system/help           → help (if region exists)
  block/2 (Left)        → sidebar_first (if region exists)
  block/3 (Right)       → sidebar_second (if region exists)

Usage:
  node scripts/setup-d7-blocks.js            Live run
  node scripts/setup-d7-blocks.js --dry-run  Print what would happen, no DB writes

Options:
  --dry-run    Print SQL without executing
  --help, -h   Show this help
`);
  process.exit(0);
}

const DRY_RUN = process.argv.includes('--dry-run');
const THEMES_DIR = path.join(__dirname, '../drupal-7/sites/all/themes');
const D7_DIR = path.join(__dirname, '../drupal-7');

// Themes to skip (not actual theme directories)
const SKIP = new Set(['README.md', 'README.txt', 'Bad in D7', 'bd-xray-theme-main.zip']);

function ddevExec(cmd) {
  return execSync(`cd ${D7_DIR} && ddev exec ${cmd}`, { encoding: 'utf8' }).trim();
}

function drush(sql) {
  const escaped = sql.replace(/"/g, '\\"').replace(/\$/g, '\\$');
  if (DRY_RUN) {
    console.log('[DRY RUN]', sql.substring(0, 120));
    return '';
  }
  try {
    return ddevExec(`drush sqlq "${escaped}"`);
  } catch (e) {
    console.error('SQL error:', sql.substring(0, 120));
    console.error(e.message);
    return '';
  }
}

function getThemesWithBlocks() {
  const result = ddevExec(`drush sqlq "SELECT DISTINCT theme FROM block ORDER BY theme;"`);
  return new Set(result.split('\n').map(l => l.trim()).filter(Boolean));
}

function parseInfoFile(themeDir) {
  let files;
  try {
    files = fs.readdirSync(themeDir).filter(f => f.endsWith('.info'));
  } catch (e) {
    return null; // broken symlink or unreadable dir
  }
  if (!files.length) return null;
  const content = fs.readFileSync(path.join(themeDir, files[0]), 'utf8');
  const regions = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^regions\[(\w+)\]\s*=\s*(.+)/);
    if (m) regions[m[1].trim()] = m[2].trim();
  }
  // If no regions declared, use D7 defaults
  if (!Object.keys(regions).length) {
    return {
      header: 'Header',
      highlighted: 'Highlighted',
      help: 'Help',
      content: 'Content',
      sidebar_first: 'Sidebar first',
      sidebar_second: 'Sidebar second',
      footer: 'Footer',
    };
  }
  return regions;
}

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

function setupTheme(theme, regions) {
  const regionKeys = Object.keys(regions);
  const rows = [];

  const addBlock = (module, delta, region) => {
    rows.push(`('${escapeSQL(module)}', '${escapeSQL(delta)}', '${escapeSQL(theme)}', 1, 0, '${escapeSQL(region)}', 0, 0, '', '')`);
  };

  // system/main in content (always)
  if (regionKeys.includes('content')) {
    addBlock('system', 'main', 'content');
    addBlock('current_theme_block', 'current_theme', 'content');
  }

  // system/powered-by in footer
  if (regionKeys.includes('footer')) {
    addBlock('system', 'powered-by', 'footer');
  }

  // system/help in help
  if (regionKeys.includes('help')) {
    addBlock('system', 'help', 'help');
  }

  // region_labels block for every region
  for (const region of regionKeys) {
    addBlock('region_labels', region, region);
  }

  // Custom blocks: Left → sidebar_first, Right → sidebar_second
  if (regionKeys.includes('sidebar_first')) {
    addBlock('block', '2', 'sidebar_first');
  }
  if (regionKeys.includes('sidebar_second')) {
    addBlock('block', '3', 'sidebar_second');
  }

  if (!rows.length) return;

  const sql =
    `INSERT INTO block (module, delta, theme, status, weight, region, custom, visibility, pages, title) VALUES ` +
    rows.join(', ') + ';';

  drush(sql);
}

// Main
console.log(`setup-d7-blocks.js — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);

const themesWithBlocks = getThemesWithBlocks();
console.log(`Themes already configured: ${themesWithBlocks.size}`);

const allThemeDirs = fs.readdirSync(THEMES_DIR).filter(name => {
  if (SKIP.has(name)) return false;
  const full = path.join(THEMES_DIR, name);
  return fs.statSync(full).isDirectory();
});

const toSetup = allThemeDirs.filter(t => !themesWithBlocks.has(t));
console.log(`Themes needing setup: ${toSetup.length}`);

let done = 0, skipped = 0;
for (const theme of toSetup) {
  const themeDir = path.join(THEMES_DIR, theme);
  const regions = parseInfoFile(themeDir);
  if (!regions) {
    console.warn(`  SKIP ${theme} — no .info file found`);
    skipped++;
    continue;
  }
  console.log(`  ${theme} (${Object.keys(regions).length} regions)`);
  setupTheme(theme, regions);
  done++;
}

console.log(`\nDone. Configured: ${done}, Skipped: ${skipped}`);
if (DRY_RUN) console.log('(Dry run — no changes written)');
