'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const { captureTheme, config } = require('./screenshot');

const THEMES = [
  'academia', 'biz', 'bluebreeze', 'classic_blog', 'fold',
  'modern_theme', 'plasma', 'simpleclean', 'tarski', 'touch',
];

function tryRun(cmd, cwd) {
  try { return execSync(cmd, { encoding: 'utf8', cwd }).trim(); } catch (e) { return ''; }
}

function getDefaultTheme(site) {
  const cfg = config[site];
  if (site === 'd7') {
    const out = tryRun(`ddev drush vget theme_default`, cfg.projectDir);
    const m = out.match(/:\s*'?(\w+)'?/);
    return m ? m[1] : 'academia';
  } else {
    const out = tryRun(`ddev bee config-get system.core`, cfg.projectDir);
    const m = out.match(/theme_default'\s*=>\s*'([^']+)'/);
    return m ? m[1] : 'academia';
  }
}

function restoreTheme(site, theme) {
  const cfg = config[site];
  if (site === 'd7') {
    tryRun(`ddev drush vset theme_default ${theme}`, cfg.projectDir);
    tryRun(`ddev drush cc all`, cfg.projectDir);
  } else {
    tryRun(`ddev bee config-set system.core theme_default ${theme}`, cfg.projectDir);
    tryRun(`ddev bee cache-clear`, cfg.projectDir);
  }
}

function imgSrc(filePath) {
  if (!fs.existsSync(filePath)) return 'data:image/png;base64,';
  return 'data:image/png;base64,' + fs.readFileSync(filePath).toString('base64');
}

function badge(watchdog) {
  const colors = { clean: '#2a9d2a', errors: '#d62c2c', 'n/a': '#888' };
  const bg = colors[watchdog.status] || '#888';
  const tip = (watchdog.output || '').replace(/"/g, '&quot;').slice(0, 500);
  return `<span class="badge" style="background:${bg}" title="${tip}">${watchdog.status}</span>`;
}

function buildReport(results) {
  const rows = results.map(({ theme, d7, backdrop }) => {
    const mkImgs = (site) => ['home', 'node'].map(p =>
      `<img src="${imgSrc(`screenshots/${site}/${theme}/${p}.png`)}" alt="${p}">`
    ).join('');

    const d7Col = d7.error
      ? `<div class="err">FAIL: ${d7.error.slice(0, 200)}</div>`
      : mkImgs('d7');
    const bdCol = backdrop.error
      ? `<div class="err">FAIL: ${backdrop.error.slice(0, 200)}</div>`
      : mkImgs('backdrop');
    const bdBadge = backdrop.watchdog ? badge(backdrop.watchdog) : '';

    return `<div class="theme">
  <h2>${theme} ${bdBadge}</h2>
  <div class="cols">
    <div class="col"><h3>Drupal 7</h3>${d7Col}</div>
    <div class="col"><h3>Backdrop</h3>${bdCol}</div>
  </div>
</div>`;
  });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Theme Machine — Sprint 1</title>
<style>
  body{font-family:sans-serif;margin:20px;background:#f4f4f4}
  h1{text-align:center}
  .theme{background:#fff;margin:20px 0;padding:16px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.15)}
  .theme h2{margin:0 0 12px}
  .cols{display:flex;gap:20px}
  .col{flex:1}
  .col h3{margin:0 0 8px}
  .col img{width:100%;display:block;margin-bottom:8px;border:1px solid #ddd}
  .badge{color:#fff;padding:2px 8px;border-radius:3px;font-size:12px;font-weight:bold;cursor:default}
  .err{color:#d62c2c;font-size:12px;margin-bottom:8px;word-break:break-all}
</style>
</head><body>
<h1>Theme Machine — D7 vs Backdrop</h1>
<p style="text-align:center">Generated: ${new Date().toISOString()} &nbsp;|&nbsp; ${results.length} themes</p>
${rows.join('\n')}
</body></html>`;
}

async function main() {
  fs.mkdirSync('reports', { recursive: true });

  const origD7 = getDefaultTheme('d7');
  const origBackdrop = getDefaultTheme('backdrop');
  console.log(`Saved defaults — D7: ${origD7}, Backdrop: ${origBackdrop}`);

  const results = [];
  try {
    for (const theme of THEMES) {
      console.log(`\n[${theme}]`);
      const row = { theme, d7: {}, backdrop: {} };

      for (const site of ['d7', 'backdrop']) {
        try {
          const result = await captureTheme(site, theme);
          row[site] = result;
          console.log(`  ${site}: ok — watchdog: ${result.watchdog.status}`);
        } catch (e) {
          row[site] = { error: e.message };
          console.error(`  ${site}: FAIL — ${e.message.slice(0, 100)}`);
        }
      }

      results.push(row);
    }
  } finally {
    console.log('\nRestoring defaults...');
    restoreTheme('d7', origD7);
    restoreTheme('backdrop', origBackdrop);
    console.log('Done.');
  }

  fs.writeFileSync('reports/comparison.html', buildReport(results));
  const passed = results.filter(r => !r.d7.error && !r.backdrop.error).length;
  console.log(`\nReport: reports/comparison.html (${passed}/${results.length} themes fully rendered)`);
}

main().catch(e => { console.error(e); process.exit(1); });
