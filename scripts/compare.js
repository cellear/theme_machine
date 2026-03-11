'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const { captureTheme, config } = require('./screenshot');

const THEMES = [
  'academia', 'adaptic', 'addari', 'adelante', 'arti',
  'b2_drupal_plus', 'bartik_fb', 'biz', 'black_lagoon', 'bluebreeze',
  'bluefreedom3', 'changeme', 'classic_blog', 'clean_theme', 'colorfulness_theme',
  'elegant_blue', 'fdt_grey', 'fdt_yellow', 'fold', 'havasu',
  'icandy', 'jq_theme', 'lexi_responsive_theme', 'lightword', 'mfirst',
  'modern_theme', 'nigraphic', 'parish_theme', 'plasma', 'professional_pro',
  'professional_responsive_theme', 'redsalute', 'responsive_green', 'sankofa', 'shakennotstirred',
  'simpleclean', 'simpler', 'sirbones', 'superclean', 'talata',
  'tarski', 'templist', 'themage', 'touch', 'zebilla',
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
  // Compute summary counts
  let clean = 0, errors = 0, failed = 0;
  results.forEach(({ d7, backdrop }) => {
    if (d7.error || backdrop.error) {
      failed++;
    } else {
      const d7w = (d7.watchdog || {}).status;
      const bdw = (backdrop.watchdog || {}).status;
      if (d7w === 'errors' || bdw === 'errors') errors++;
      else clean++;
    }
  });

  const tocItems = results.map(({ theme }) =>
    `<li><a href="#theme-${theme}">${theme}</a></li>`
  ).join('\n      ');

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

    return `<div class="theme" id="theme-${theme}">
  <div class="theme-sticky-header"><span class="theme-name">${theme}</span></div>
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
  h1{text-align:center;margin-bottom:4px}
  .summary{text-align:center;margin:0 0 16px;font-size:14px;color:#555}
  .summary .c-clean{color:#2a9d2a;font-weight:bold}
  .summary .c-errors{color:#d68a00;font-weight:bold}
  .summary .c-failed{color:#d62c2c;font-weight:bold}
  .toc{background:#fff;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.12);padding:16px 20px;margin-bottom:20px}
  .toc h2{margin:0 0 10px;font-size:15px;color:#333}
  .toc ol{margin:0;padding-left:20px;columns:4;column-gap:20px;font-size:13px}
  .toc ol li{break-inside:avoid}
  .toc a{color:#1a6bb5;text-decoration:none}
  .toc a:hover{text-decoration:underline}
  .theme{background:#fff;margin:20px 0;padding:0;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.15);overflow:hidden}
  .theme-sticky-header{position:sticky;top:0;z-index:10;background:#2c3e50;color:#fff;padding:8px 16px;font-weight:bold;font-size:15px}
  .theme-name{display:inline-block}
  .cols{display:flex;gap:20px;padding:16px}
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
<p class="summary">
  Generated: ${new Date().toISOString()} &nbsp;|&nbsp; ${results.length} themes &nbsp;|&nbsp;
  <span class="c-clean">${clean} clean</span> /
  <span class="c-errors">${errors} errors</span> /
  <span class="c-failed">${failed} failed</span>
</p>
<nav class="toc">
  <h2>Themes</h2>
  <ol>
      ${tocItems}
  </ol>
</nav>
${rows.join('\n')}
</body></html>`;
}

async function main() {
  fs.mkdirSync('reports', { recursive: true });

  // --limit N  runs only the first N themes (handy for quick iteration)
  const limitArg = process.argv.indexOf('--limit');
  const themes = limitArg !== -1
    ? THEMES.slice(0, parseInt(process.argv[limitArg + 1], 10))
    : THEMES;

  const origD7 = getDefaultTheme('d7');
  const origBackdrop = getDefaultTheme('backdrop');
  console.log(`Saved defaults — D7: ${origD7}, Backdrop: ${origBackdrop}`);

  const results = [];
  try {
    for (let i = 0; i < themes.length; i++) {
      const theme = themes[i];
      console.log(`\n[${i + 1}/${themes.length}] Processing: ${theme}...`);
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
