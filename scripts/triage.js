'use strict';

/**
 * triage.js
 *
 * Reads D7 theme .info files + watchdog metadata from prior compare.js runs
 * and sorts themes into "ok" (worth pursuing) vs "hard" (skip for now).
 *
 * Hard criteria:
 *   1. PHP 8.3 errors in watchdog (screenshots/d7/{theme}/meta.json)
 *   2. No two-sidebar layout — theme doesn't declare both a left-ish and
 *      right-ish sidebar region in its .info file.
 *      Exception: themes with NO regions block at all use D7 defaults,
 *      which include sidebar_first + sidebar_second — those pass.
 *
 * Usage:
 *   node scripts/triage.js              # dry run, prints table
 *   node scripts/triage.js --apply      # also writes TOOLING/theme-triage.json
 *
 * After --apply, run compare.js with --triage to use the filtered list.
 */

const fs   = require('fs');
const path = require('path');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
triage.js — sort themes into "ok" and "hard" based on automated criteria

Hard criteria (either disqualifies a theme):
  1. PHP errors in watchdog (from screenshots/d7/{theme}/meta.json)
  2. Theme doesn't declare both a left-ish and right-ish sidebar region
     (themes with no regions block at all pass — they use D7 defaults)

Usage:
  node scripts/triage.js            Dry run — print table, don't write anything
  node scripts/triage.js --apply    Write results to TOOLING/theme-triage.json

After --apply:
  node scripts/compare.js --triage  Run only the "ok" themes
  node scripts/build-reviewer.js --only TOOLING/theme-triage.json

Options:
  --apply      Write TOOLING/theme-triage.json
  --help, -h   Show this help
`);
  process.exit(0);
}

const ROOT          = path.resolve(__dirname, '..');
const D7_THEMES_DIR = path.join(ROOT, 'drupal-7', 'sites', 'all', 'themes');
const SCREENSHOTS   = path.join(ROOT, 'screenshots');
const TOOLING_DIR   = path.join(ROOT, 'TOOLING');

// Region key synonyms for left and right sidebars.
// Checked against the machine name (the key in regions[key] = Label).
const LEFT_KEYS  = new Set([
  'left', 'sidebar_first', 'sidebar_left', 'left_sidebar',
  'first', 'primary', 'primary_sidebar',
]);
const RIGHT_KEYS = new Set([
  'right', 'sidebar_second', 'sidebar_right', 'right_sidebar',
  'second', 'secondary', 'secondary_sidebar',
]);

// Also check region LABELS (values) for common sidebar words,
// as a fallback for themes with unusual machine names.
const LEFT_LABEL_WORDS  = /\b(left|first|primary)\b/i;
const RIGHT_LABEL_WORDS = /\b(right|second|secondary)\b/i;

/**
 * Parse regions[key] = Label lines from a D7 .info file.
 * Returns null if file not found, {} if file has no regions block.
 */
function parseRegions(theme) {
  // Try the canonical path: themes/{theme}/{theme}.info
  // Some themes use a different filename — fall back to any *.info in the dir.
  const themeDir = path.join(D7_THEMES_DIR, theme);
  if (!fs.existsSync(themeDir)) return null;

  const candidates = fs.readdirSync(themeDir).filter(f => f.endsWith('.info'));
  if (candidates.length === 0) return null;

  const content = fs.readFileSync(path.join(themeDir, candidates[0]), 'utf8');
  const regions = {};
  const re = /^regions\[(\w+)\]\s*=\s*(.+)$/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    regions[m[1].trim()] = m[2].trim();
  }
  return regions;
}

function hasTwoSidebars(regions) {
  const keys   = Object.keys(regions);
  const labels = Object.values(regions);

  const hasLeft  = keys.some(k => LEFT_KEYS.has(k))
                || labels.some(l => LEFT_LABEL_WORDS.test(l));
  const hasRight = keys.some(k => RIGHT_KEYS.has(k))
                || labels.some(l => RIGHT_LABEL_WORDS.test(l));
  return hasLeft && hasRight;
}

function readWatchdog(theme) {
  const p = path.join(SCREENSHOTS, 'd7', theme, 'meta.json');
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')).watchdog || null; } catch (_) { return null; }
}

function triageTheme(theme) {
  const reasons = [];

  // --- Sidebar check ---
  const regions = parseRegions(theme);
  if (regions === null) {
    reasons.push('no .info file in drupal-7/sites/all/themes/');
  } else if (Object.keys(regions).length === 0) {
    // No regions block → theme uses D7 defaults (sidebar_first + sidebar_second) → OK
  } else if (!hasTwoSidebars(regions)) {
    const listed = Object.entries(regions).map(([k, v]) => `${k}="${v}"`).join(', ');
    reasons.push(`no two-sidebar layout (${listed || 'empty regions'})`);
  }

  // --- PHP 8.3 watchdog check ---
  const wd = readWatchdog(theme);
  if (wd === null) {
    // No metadata yet — don't penalise, just note it
  } else if (wd.status === 'errors') {
    reasons.push('PHP 8.3 errors in watchdog');
  }

  return {
    theme,
    hard: reasons.length > 0,
    reasons,
    watchdog: wd ? wd.status : 'no data',
    regions: regions || {},
  };
}

function main() {
  const apply = process.argv.includes('--apply');

  // Discover themes from screenshots dir (these are the ones we've actually run)
  const d7Dir = path.join(SCREENSHOTS, 'd7');
  if (!fs.existsSync(d7Dir)) {
    console.error('No screenshots/d7/ found. Run compare.js first.');
    process.exit(1);
  }
  const themes = fs.readdirSync(d7Dir)
    .filter(n => fs.statSync(path.join(d7Dir, n)).isDirectory())
    .sort();

  const results = themes.map(triageTheme);
  const ok   = results.filter(r => !r.hard);
  const hard = results.filter(r => r.hard);

  // --- Print table ---
  console.log(`\nTriage: ${themes.length} themes  →  ${ok.length} ok, ${hard.length} hard\n`);

  if (hard.length) {
    console.log('HARD (will be skipped with --triage):');
    hard.forEach(r => {
      console.log(`  ✗  ${r.theme.padEnd(36)} ${r.reasons.join('; ')}`);
    });
    console.log('');
  }

  console.log(`OK (${ok.length}):`);
  ok.forEach(r => {
    const wd = r.watchdog === 'clean' ? '✓ clean' : r.watchdog === 'no data' ? '  (no data)' : `! ${r.watchdog}`;
    console.log(`  ✓  ${r.theme.padEnd(36)} watchdog: ${wd}`);
  });

  if (!apply) {
    console.log('\nDry run — pass --apply to write TOOLING/theme-triage.json');
    return;
  }

  // --- Write output ---
  fs.mkdirSync(TOOLING_DIR, { recursive: true });
  const out = {
    generated: new Date().toISOString(),
    criteria: [
      'no PHP 8.3 watchdog errors',
      'theme declares both a left-ish and right-ish sidebar region (or no regions block)',
    ],
    total: themes.length,
    ok:   ok.map(r => r.theme),
    hard: hard.map(r => ({ theme: r.theme, reasons: r.reasons })),
  };
  const outPath = path.join(TOOLING_DIR, 'theme-triage.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outPath}`);
  console.log('Use: node scripts/compare.js --triage');
}

main();
