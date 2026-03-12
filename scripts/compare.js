'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const { captureTheme, config, setBackdropTheme } = require('./screenshot');

const THEMES = [
  'a_cloudy_day', 'abaca', 'abarre', 'aberdeen', 'abessive', 'ablock',
  'abstract', 'academia', 'acquia_marina', 'acquia_prosper', 'acta', 'active_n_rebuild',
  'ad_agency', 'ad_blueprint', 'ad_novus', 'ad_the_morning_after', 'adaptic', 'adaptivetheme',
  'addari', 'adelante', 'admire_grunge', 'airyblue', 'alina', 'alphorn',
  'andreas', 'andreas02', 'andreas1024px', 'arthemia', 'arti', 'async',
  'at_panels_everywhere', 'aurora', 'austin', 'b2_drupal_plus', 'bartik', 'bartik_d7',
  'bartik_fb', 'basic', 'beach', 'beginning', 'beta', 'biz',
  'black_lagoon', 'blank', 'blogbuzz', 'blue_zinfandel', 'bluebreeze', 'bluecheese',
  'bluefreedom3', 'bluelake', 'bluemarine', 'bluemarine_ets', 'blueprint', 'bookstore',
  'bootstrap', 'busy', 'camsel', 'chameleon', 'chamfer', 'changeme',
  'charity', 'cherryblossom', 'chocotheme', 'classic_blog', 'clean', 'clean_theme',
  'colorfulness_theme', 'colourise', 'conch', 'contented7', 'corolla', 'cti_flex',
  'daleri_structure', 'danland', 'darkblue', 'decayed', 'deco', 'dessert',
  'diary', 'dingus', 'dropshadow', 'earthish', 'easybreeze', 'ebizon_exotic_red',
  'ebizon_redfire', 'eldir', 'elegant_blue', 'elements_theme', 'energetic', 'eve_igb',
  'fdt_grey', 'fdt_yellow', 'fold', 'forest_floor', 'fourseasons', 'framework',
  'fueldeluxe', 'fusion', 'gardening', 'garland_d7', 'gateway', 'genesis',
  'glossyblue', 'grassland', 'green', 'havasu', 'hexagon', 'html5',
  'icandy', 'inkribbon', 'interactive_media', 'internet_services', 'ishalist', 'jp_mobile',
  'jq4dat', 'jq_theme', 'koi', 'layoutstudio', 'lexi_responsive_theme', 'lightword',
  'litejazz', 'marinelli', 'mfirst', 'mobi', 'mobile', 'modern_theme',
  'moleskine', 'mothership', 'mulpo', 'multiflex3', 'newsflash', 'newswire',
  'nifty50', 'nigraphic', 'ninesixty', 'ninesixtyrobots', 'nitobe', 'noprob',
  'ocadia', 'omega', 'orange', 'painted', 'panels_960gs', 'parish_theme',
  'pixture_reloaded', 'plasma', 'pockett', 'polpo', 'professional_pro', 'professional_responsive_theme',
  'pushbutton', 'redsalute', 'responsive_green', 'rootcandy', 'sankofa', 'scaccarium',
  'scratch', 'shakennotstirred', 'shallowgrunge', 'simpleclean', 'simpler', 'sirbones',
  'sky', 'smashing_dilectio', 'spring_bloom', 'stark', 'starkish', 'summertime',
  'superclean', 'talata', 'tapestry', 'tarski', 'templist', 'themage',
  'tma', 'touch', 'travel', 'waffles', 'web110', 'wilderness',
  'yui_grid', 'zebilla', 'zen', 'zeropoint'
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
    setBackdropTheme(theme, cfg.projectDir);
  }
}

// Reports live in reports/, screenshots in screenshots/ — path goes up one level.
function imgSrc(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return '../' + filePath;
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
      const src = imgSrc(`screenshots/${site}/${theme}/node.png`);
      const img = src ? `<img src="${src}" alt="node">` : '<p style="color:#999;font-size:12px">No screenshot</p>';
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

  // --theme=NAME     run a single theme by machine name
  // --triage         use only the "ok" list from TOOLING/theme-triage.json
  // --limit N        run N themes (default: 10; overrides default)
  // --offset N       start at position N in the theme list (default: 0)
  // --all            run every theme (ignores --limit)
  // --skip-existing  skip themes that already have a backdrop screenshot
  let themes = [...THEMES];

  // Catch common typo: theme=NAME instead of --theme=NAME
  const typo = process.argv.find(arg => /^theme=/.test(arg));
  if (typo) {
    console.error(`Error: did you mean --${typo} ?`);
    process.exit(1);
  }

  // --theme=NAME  or  --theme NAME  (both forms accepted)
  let themeName = null;
  const themeEq = process.argv.find(arg => arg.startsWith('--theme='));
  if (themeEq) {
    themeName = themeEq.replace(/^--theme=/, '').replace(/^["']|["']$/g, '');
  } else {
    const themeIdx = process.argv.indexOf('--theme');
    if (themeIdx !== -1) themeName = process.argv[themeIdx + 1];
  }

  const themeArg = themeName !== null;
  if (themeArg) {
    if (THEMES.includes(themeName)) {
      themes = [themeName];
      console.log(`--theme: running single theme: ${themeName}`);
    } else {
      console.error(`--theme: "${themeName}" not found in THEMES list`);
      process.exit(1);
    }
  }

  if (process.argv.includes('--skip-existing')) {
    const before = themes.length;
    themes = themes.filter(t => !fs.existsSync(`screenshots/backdrop/${t}/meta.json`));
    console.log(`--skip-existing: ${themes.length} new / ${before - themes.length} already captured`);
  }
  if (process.argv.includes('--triage')) {
    const triagePath = 'TOOLING/theme-triage.json';
    if (fs.existsSync(triagePath)) {
      const { ok } = JSON.parse(fs.readFileSync(triagePath, 'utf8'));
      themes = themes.filter(t => ok.includes(t));
      console.log(`Triage filter: ${themes.length} / ${THEMES.length} themes pass.`);
    } else {
      console.warn('--triage: TOOLING/theme-triage.json not found, run scripts/triage.js first.');
    }
  }
  // Skip offset/limit if --theme was specified (single theme mode)
  if (!themeArg) {
    const offsetArg = process.argv.indexOf('--offset');
    const offset = offsetArg !== -1 ? parseInt(process.argv[offsetArg + 1], 10) : 0;
    if (offset) themes = themes.slice(offset);

    if (!process.argv.includes('--all')) {
      const limitArg = process.argv.indexOf('--limit');
      const limit = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : 10;
      themes = themes.slice(0, limit);
    }

    if (offset || themes.length < THEMES.length) {
      console.log(`Running ${themes.length} themes (offset: ${offset}, total in list: ${THEMES.length})`);
    }
  }

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
          // Persist watchdog data so triage.js and build-reviewer.js can read it
          fs.writeFileSync(
            `screenshots/${site}/${theme}/meta.json`,
            JSON.stringify({ watchdog: result.watchdog, capturedAt: new Date().toISOString() })
          );
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
