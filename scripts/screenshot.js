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

  // Clear watchdog before theme switch
  if (site === 'backdrop') {
    tryRun(`ddev bee watchdog-clear`, cfg.projectDir);
  } else {
    tryRun(`ddev drush watchdog-delete all -y`, cfg.projectDir);
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
  await page.setViewportSize({ width: 1280, height: 1600 });

  // Content node
  await page.goto(cfg.url + cfg.contentPath, { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: path.join(dir, 'node.png') });
  fs.writeFileSync(path.join(dir, 'node.html'), await page.content());

  await browser.close();

  // Check watchdog after render
  // bee log (Backdrop) always prints a table header even with 0 results; strip ANSI
  // and count actual data rows (lines starting with | that aren't the header/separator).
  let watchdog = { status: 'n/a', output: '' };
  if (site === 'backdrop') {
    const raw = tryRun(`ddev bee log --count=50 --severity=warning --type=php`, cfg.projectDir);
    const stripped = raw.replace(/\x1b\[[0-9;]*m/g, '').trim();
    const dataLines = stripped.split('\n')
      .map(l => l.trim())
      .filter(l => l && l.startsWith('|') && !l.includes('| ID |') && !/^\|[-\s|]+\|$/.test(l));
    watchdog = { status: dataLines.length > 0 ? 'errors' : 'clean', output: dataLines.join('\n') };
  } else if (site === 'd7') {
    const raw = tryRun(`ddev drush watchdog-show --severity=warning --count=50`, cfg.projectDir);
    const stripped = raw.replace(/\x1b\[[0-9;]*m/g, '').trim();
    // No entries: drush outputs nothing or "There are no..." type message
    if (!stripped || /no (log |watchdog )?messages/i.test(stripped) || /there are no/i.test(stripped)) {
      watchdog = { status: 'clean', output: '' };
    } else {
      // Skip the header row (contains "WID") and separator rows (all dashes/spaces)
      const dataLines = stripped.split('\n')
        .map(l => l.trim())
        .filter(l => l && !/^WID\b/.test(l) && !/^-{3,}/.test(l));
      watchdog = { status: dataLines.length > 0 ? 'errors' : 'clean', output: dataLines.join('\n') };
    }
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
