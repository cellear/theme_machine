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
  return `<span class="badge" style="background:${bg}">${watchdog.status}</span>`;
}

function watchdogSection(watchdog) {
  if (!watchdog || watchdog.status === 'n/a') return '';
  if (watchdog.status === 'clean') {
    return `<div class="wdog wdog-clean">No new log entries.</div>`;
  }
  const msg = (watchdog.output || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div class="wdog wdog-errors"><pre>${msg}</pre></div>`;
}

function buildReport(results) {
  const rows = results.map(({ theme, d7, backdrop }) => {
    const mkCol = (site, data) => {
      const label = site === 'd7' ? 'Drupal 7' : 'Backdrop';
      const wdg = data.watchdog || { status: 'n/a' };
      const header = `<h3>${label} ${badge(wdg)}</h3>`;
      if (data.error) {
        return `${header}<div class="err">FAIL: ${data.error.slice(0, 200)}</div>`;
      }
      const img = `<img src="${imgSrc(`screenshots/${site}/${theme}/node.png`)}" alt="node">`;
      return `${header}${img}${watchdogSection(wdg)}`;
    };

    return `<div class="theme">
  <h2>${theme}</h2>
  <div class="cols">
    <div class="col">${mkCol('d7', d7)}</div>
    <div class="col">${mkCol('backdrop', backdrop)}</div>
  </div>
</div>`;
  });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Theme Machine — D7 vs Backdrop</title>
<style>
  body{font-family:sans-serif;margin:20px;background:#f4f4f4}
  h1{text-align:center}
  .theme{background:#fff;margin:20px 0;padding:16px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.15)}
  .theme h2{margin:0 0 12px}
  .cols{display:flex;gap:20px}
  .col{flex:1}
  .col h3{margin:0 0 8px;display:flex;align-items:center;gap:8px}
  .col img{width:100%;display:block;border:1px solid #ddd}
  .badge{color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:bold}
  .err{color:#d62c2c;font-size:12px;margin-bottom:8px;word-break:break-all}
  .wdog{font-size:11px;margin-top:6px;padding:5px 8px;border-radius:3px}
  .wdog-clean{color:#999}
  .wdog-errors{background:#fff3f3;border:1px solid #f5c2c2;color:#c00}
  .wdog-errors pre{margin:0;white-space:pre-wrap;word-break:break-all;font-size:11px}
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

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = `reports/comparison-${ts}.html`;
  fs.writeFileSync(reportPath, buildReport(results));
  const passed = results.filter(r => !r.d7.error && !r.backdrop.error).length;
  console.log(`\nReport: ${reportPath} (${passed}/${results.length} themes fully rendered)`);
}

main().catch(e => { console.error(e); process.exit(1); });
