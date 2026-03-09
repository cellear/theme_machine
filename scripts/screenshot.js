'use strict';

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const config = {
  d7: {
    url: 'https://drupal-7.ddev.site',
    ddevProject: 'drupal-7',
    projectDir: path.join(ROOT, 'drupal-7'),
    contentPath: '/animals/llama', // Llama — same animal on both sites
  },
  backdrop: {
    url: 'https://theme-machine.ddev.site',
    ddevProject: 'theme-machine',
    projectDir: path.join(ROOT, 'backdrop'),
    contentPath: '/animals/llama', // Llama — same animal on both sites
  },
};

function run(cmd, cwd) {
  return execSync(cmd, { encoding: 'utf8', cwd: cwd || ROOT });
}

function tryRun(cmd, cwd) {
  try { return run(cmd, cwd); } catch (e) { return ''; }
}

async function captureTheme(site, theme) {
  const cfg = config[site];
  const dir = path.join('screenshots', site, theme);
  fs.mkdirSync(dir, { recursive: true });

  // Clear watchdog before theme switch (Backdrop only)
  if (site === 'backdrop') {
    tryRun(`ddev bee watchdog-clear`, cfg.projectDir);
  }

  // Switch theme and clear cache
  if (site === 'd7') {
    run(`ddev drush vset theme_default ${theme}`, cfg.projectDir);
    run(`ddev drush cc all`, cfg.projectDir);
  } else {
    run(`ddev bee config-set system.core theme_default ${theme}`, cfg.projectDir);
    run(`ddev bee cache-clear`, cfg.projectDir);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Home page
  await page.goto(cfg.url + '/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: path.join(dir, 'home.png') });
  fs.writeFileSync(path.join(dir, 'home.html'), await page.content());

  // Content node
  await page.goto(cfg.url + cfg.contentPath, { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: path.join(dir, 'node.png') });
  fs.writeFileSync(path.join(dir, 'node.html'), await page.content());

  await browser.close();

  // Check watchdog after render (Backdrop only)
  // bee log always prints a table header row even with 0 results; strip ANSI
  // and count actual data rows (lines starting with | that aren't the header).
  let watchdog = { status: 'n/a', output: '' };
  if (site === 'backdrop') {
    const raw = tryRun(`ddev bee log --count=50 --severity=error --type=php`, cfg.projectDir);
    const stripped = raw.replace(/\x1b\[[0-9;]*m/g, '').trim();
    const dataLines = stripped.split('\n')
      .map(l => l.trim())
      .filter(l => l && l.startsWith('|') && !l.includes('| ID |') && !/^\|[-\s|]+\|$/.test(l));
    watchdog = { status: dataLines.length > 0 ? 'errors' : 'clean', output: dataLines.join('\n') };
  }

  return { site, theme, dir, watchdog };
}

// CLI: node scripts/screenshot.js --site=d7 --theme=academia
if (require.main === module) {
  const args = Object.fromEntries(
    process.argv.slice(2).map(a => a.replace(/^--/, '').split('='))
  );
  captureTheme(args.site, args.theme)
    .then(r => console.log(`Done: ${r.site}/${r.theme} — watchdog: ${r.watchdog.status}`))
    .catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = { captureTheme, config };
