'use strict';

/**
 * build-reviewer.js
 *
 * Reads pre-captured screenshots from screenshots/{d7,backdrop}/<theme>/node.png
 * and generates a self-contained interactive HTML reviewer.
 *
 * Usage:  node scripts/build-reviewer.js
 * Output: reports/reviewer-{timestamp}.html
 */

const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const REPORTS_DIR = path.join(__dirname, '..', 'reports');

// Discover themes that have at least one screenshot
function discoverThemes() {
  const d7Dir = path.join(SCREENSHOTS_DIR, 'd7');
  const bdDir = path.join(SCREENSHOTS_DIR, 'backdrop');

  const d7Themes = fs.existsSync(d7Dir)
    ? fs.readdirSync(d7Dir).filter(n => fs.statSync(path.join(d7Dir, n)).isDirectory())
    : [];
  const bdThemes = fs.existsSync(bdDir)
    ? fs.readdirSync(bdDir).filter(n => fs.statSync(path.join(bdDir, n)).isDirectory())
    : [];

  const all = new Set([...d7Themes, ...bdThemes]);
  return [...all].sort();
}

function imgSrc(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return 'data:image/png;base64,' + fs.readFileSync(filePath).toString('base64');
}

// Read watchdog metadata saved alongside screenshots (if compare.js wrote it)
function readMeta(site, theme) {
  const metaPath = path.join(SCREENSHOTS_DIR, site, theme, 'meta.json');
  if (fs.existsSync(metaPath)) {
    try { return JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (_) {}
  }
  return null;
}

function buildThemeData(themes) {
  return themes.map(theme => {
    const d7Png  = path.join(SCREENSHOTS_DIR, 'd7',      theme, 'node.png');
    const bdPng  = path.join(SCREENSHOTS_DIR, 'backdrop', theme, 'node.png');
    const d7Meta  = readMeta('d7', theme);
    const bdMeta  = readMeta('backdrop', theme);

    return {
      theme,
      d7:  { src: imgSrc(d7Png),  watchdog: d7Meta  ? d7Meta.watchdog  : null },
      bd:  { src: imgSrc(bdPng),  watchdog: bdMeta  ? bdMeta.watchdog  : null },
    };
  });
}

function buildHTML(themeData) {
  // Inline theme data as JSON (images are base64 embedded)
  const dataJson = JSON.stringify(themeData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Theme Machine — Interactive Reviewer</title>
<style>
/* ---- reset / base ---- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; font-family: system-ui, sans-serif; background: #1a1a2e; color: #e0e0e0; }

/* ---- layout ---- */
#app { display: flex; height: 100vh; overflow: hidden; }
#sidebar { width: 220px; min-width: 180px; background: #16213e; display: flex; flex-direction: column; border-right: 1px solid #0f3460; transition: width .2s; }
#sidebar.collapsed { width: 0; overflow: hidden; min-width: 0; }
#main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* ---- sidebar header ---- */
#sidebar-header { padding: 10px 12px; background: #0f3460; font-size: 12px; font-weight: bold; letter-spacing: .5px; color: #a0c4ff; display: flex; justify-content: space-between; align-items: center; }
#progress-text { font-size: 11px; color: #7ec8e3; }

/* ---- progress bar ---- */
#progress-bar-wrap { height: 4px; background: #0f3460; }
#progress-bar { height: 100%; background: #4ade80; width: 0%; transition: width .3s; }

/* ---- theme list ---- */
#theme-list { flex: 1; overflow-y: auto; padding: 6px 0; }
.theme-item { padding: 6px 12px; font-size: 12px; cursor: pointer; border-left: 3px solid transparent; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.theme-item:hover { background: #0f3460; }
.theme-item.active { background: #0f3460; border-left-color: #4ade80; }
.theme-item.v-accept { border-left-color: #4ade80; }
.theme-item.v-reject { border-left-color: #f87171; }
.theme-item.v-needs-work { border-left-color: #fbbf24; }
.verdict-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 6px; background: #444; }
.v-accept .verdict-dot    { background: #4ade80; }
.v-reject .verdict-dot    { background: #f87171; }
.v-needs-work .verdict-dot { background: #fbbf24; }

/* ---- top bar ---- */
#topbar { background: #0f3460; padding: 8px 16px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
#toggle-sidebar { background: none; border: none; color: #a0c4ff; font-size: 18px; cursor: pointer; padding: 2px 6px; }
#theme-title { font-size: 16px; font-weight: bold; flex: 1; }
#nav-prev, #nav-next { background: #1a4080; border: none; color: #e0e0e0; padding: 5px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; }
#nav-prev:hover, #nav-next:hover { background: #2563ab; }
#theme-counter { font-size: 12px; color: #7ec8e3; }

/* ---- watchdog badges in topbar ---- */
.wd-badge { font-size: 10px; font-weight: bold; padding: 2px 7px; border-radius: 3px; color: #fff; }
.wd-clean  { background: #2a9d2a; }
.wd-errors { background: #d62c2c; }
.wd-na     { background: #555; }

/* ---- screenshots area ---- */
#screenshots { flex: none; height: 70vh; display: flex; gap: 0; overflow: hidden; }
.screenshot-panel { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; border-right: 1px solid #0f3460; }
.screenshot-panel:last-child { border-right: none; }
.panel-label { padding: 5px 12px; font-size: 11px; font-weight: bold; background: #16213e; color: #a0c4ff; letter-spacing: .5px; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.screenshot-img-wrap { flex: 1; min-height: 0; overflow: auto; display: flex; align-items: flex-start; justify-content: center; background: #111; }
.screenshot-img-wrap img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
.no-screenshot { color: #555; font-size: 13px; align-self: center; }

/* ---- verdict bar ---- */
#verdict-bar { background: #16213e; border-top: 1px solid #0f3460; padding: 10px 16px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.verdict-btn { border: none; padding: 7px 18px; border-radius: 5px; font-size: 13px; font-weight: bold; cursor: pointer; opacity: .75; transition: opacity .15s, transform .1s; }
.verdict-btn:hover { opacity: 1; }
.verdict-btn.selected { opacity: 1; transform: scale(1.07); outline: 2px solid #fff; }
#btn-accept     { background: #16a34a; color: #fff; }
#btn-reject     { background: #dc2626; color: #fff; }
#btn-needs-work { background: #d97706; color: #fff; }
#btn-skip       { background: #374151; color: #9ca3af; }
#notes-wrap { flex: 1; display: flex; align-items: center; gap: 8px; }
#notes-label { font-size: 12px; color: #7ec8e3; white-space: nowrap; }
#notes-input { flex: 1; background: #0f3460; border: 1px solid #2563ab; color: #e0e0e0; padding: 5px 10px; border-radius: 4px; font-size: 12px; resize: none; height: 34px; }
#notes-input:focus { outline: none; border-color: #4ade80; }
#export-btn, #import-btn { background: #2563ab; border: none; color: #fff; padding: 6px 14px; border-radius: 4px; font-size: 12px; cursor: pointer; }
#export-btn:hover, #import-btn:hover { background: #1d4ed8; }
#import-file { display: none; }

/* ---- keyboard hint ---- */
#kbd-hints { font-size: 10px; color: #555; white-space: nowrap; }
</style>
</head>
<body>
<div id="app">

  <!-- Sidebar: theme list -->
  <div id="sidebar">
    <div id="sidebar-header">
      <span>THEMES</span>
      <span id="progress-text">0 / 0</span>
    </div>
    <div id="progress-bar-wrap"><div id="progress-bar"></div></div>
    <div id="theme-list"></div>
  </div>

  <!-- Main area -->
  <div id="main">
    <div id="topbar">
      <button id="toggle-sidebar" title="Toggle sidebar">☰</button>
      <span id="theme-title">—</span>
      <span id="topbar-badges"></span>
      <span id="theme-counter"></span>
      <button id="nav-prev">◀ Prev</button>
      <button id="nav-next">Next ▶</button>
    </div>

    <div id="screenshots">
      <div class="screenshot-panel" id="panel-d7">
        <div class="panel-label">Drupal 7 <span id="wd-d7"></span></div>
        <div class="screenshot-img-wrap" id="img-d7"></div>
      </div>
      <div class="screenshot-panel" id="panel-bd">
        <div class="panel-label">Backdrop <span id="wd-bd"></span></div>
        <div class="screenshot-img-wrap" id="img-bd"></div>
      </div>
    </div>

    <div id="verdict-bar">
      <button id="btn-accept"     class="verdict-btn" title="A">Accept</button>
      <button id="btn-reject"     class="verdict-btn" title="R">Reject</button>
      <button id="btn-needs-work" class="verdict-btn" title="W">Needs Work</button>
      <button id="btn-skip"       class="verdict-btn" title="S">Skip</button>
      <div id="notes-wrap">
        <label id="notes-label" for="notes-input">N → Notes:</label>
        <textarea id="notes-input" placeholder="Optional notes…"></textarea>
      </div>
      <button id="export-btn">Export JSON</button>
      <button id="import-btn">Import JSON</button>
      <input type="file" id="import-file" accept=".json">
      <span id="kbd-hints">← → navigate &nbsp; A accept &nbsp; R reject &nbsp; W needs-work &nbsp; S skip &nbsp; N notes</span>
    </div>
  </div>
</div>

<script>
(function () {
  // ---- data ----
  const THEMES = ${dataJson};
  const STORAGE_KEY = 'theme-machine-verdicts';

  // ---- state ----
  let current = 0;
  let verdicts = loadVerdicts();

  // ---- DOM refs ----
  const themeList    = document.getElementById('theme-list');
  const themeTitle   = document.getElementById('theme-title');
  const themeCounter = document.getElementById('theme-counter');
  const progressBar  = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const imgD7        = document.getElementById('img-d7');
  const imgBd        = document.getElementById('img-bd');
  const wdD7         = document.getElementById('wd-d7');
  const wdBd         = document.getElementById('wd-bd');
  const notesInput   = document.getElementById('notes-input');
  const btnAccept    = document.getElementById('btn-accept');
  const btnReject    = document.getElementById('btn-reject');
  const btnNeedsWork = document.getElementById('btn-needs-work');
  const sidebar      = document.getElementById('sidebar');

  // ---- localStorage ----
  function loadVerdicts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_) { return {}; }
  }
  function saveVerdicts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(verdicts));
  }

  // ---- build sidebar list ----
  function buildList() {
    themeList.innerHTML = '';
    THEMES.forEach((t, i) => {
      const el = document.createElement('div');
      el.className = 'theme-item';
      el.dataset.index = i;
      el.innerHTML = '<span class="verdict-dot"></span>' + t.theme;
      el.addEventListener('click', () => goTo(i));
      themeList.appendChild(el);
    });
  }

  function updateListItem(idx) {
    const items = themeList.querySelectorAll('.theme-item');
    if (!items[idx]) return;
    const v = verdicts[THEMES[idx].theme];
    items[idx].className = 'theme-item' + (v ? ' v-' + v.verdict : '') + (idx === current ? ' active' : '');
  }

  function updateAllListItems() {
    THEMES.forEach((_, i) => updateListItem(i));
  }

  // ---- watchdog badge helper ----
  function wdBadge(meta) {
    if (!meta || !meta.status || meta.status === 'n/a') return '<span class="wd-badge wd-na">n/a</span>';
    if (meta.status === 'clean') return '<span class="wd-badge wd-clean">clean</span>';
    return '<span class="wd-badge wd-errors">errors</span>';
  }

  // ---- render current theme ----
  function render() {
    const t = THEMES[current];
    themeTitle.textContent = t.theme;
    themeCounter.textContent = (current + 1) + ' / ' + THEMES.length;

    // Screenshots
    function setImg(wrap, src) {
      wrap.innerHTML = src
        ? '<img src="' + src + '" alt="screenshot">'
        : '<span class="no-screenshot">No screenshot</span>';
    }
    setImg(imgD7, t.d7.src);
    setImg(imgBd, t.bd.src);

    // Watchdog badges
    wdD7.innerHTML = wdBadge(t.d7.watchdog);
    wdBd.innerHTML = wdBadge(t.bd.watchdog);

    // Verdict buttons
    const v = verdicts[t.theme];
    const verdict = v ? v.verdict : null;
    btnAccept.classList.toggle('selected',    verdict === 'accept');
    btnReject.classList.toggle('selected',    verdict === 'reject');
    btnNeedsWork.classList.toggle('selected', verdict === 'needs-work');

    // Notes
    notesInput.value = v ? (v.notes || '') : '';

    // Scroll active item into view
    const items = themeList.querySelectorAll('.theme-item');
    if (items[current]) items[current].scrollIntoView({ block: 'nearest' });

    updateAllListItems();
    updateProgress();
  }

  // ---- progress ----
  function updateProgress() {
    const reviewed = Object.keys(verdicts).length;
    const pct = THEMES.length ? (reviewed / THEMES.length) * 100 : 0;
    progressBar.style.width = pct + '%';
    progressText.textContent = reviewed + ' / ' + THEMES.length;
  }

  // ---- navigation ----
  function goTo(idx) {
    current = Math.max(0, Math.min(THEMES.length - 1, idx));
    render();
  }

  function nextUnreviewed() {
    for (let i = current + 1; i < THEMES.length; i++) {
      if (!verdicts[THEMES[i].theme]) return i;
    }
    // wrap from start
    for (let i = 0; i < current; i++) {
      if (!verdicts[THEMES[i].theme]) return i;
    }
    return (current + 1) % THEMES.length;
  }

  // ---- verdicts ----
  function setVerdict(v) {
    const theme = THEMES[current].theme;
    const notes = notesInput.value.trim();
    verdicts[theme] = { theme, verdict: v, notes, timestamp: new Date().toISOString() };
    saveVerdicts();
    updateListItem(current);
    updateProgress();
    // Auto-advance to next unreviewed
    goTo(nextUnreviewed());
  }

  function saveNotes() {
    const theme = THEMES[current].theme;
    if (verdicts[theme]) {
      verdicts[theme].notes = notesInput.value.trim();
      saveVerdicts();
    }
  }

  // ---- export / import ----
  document.getElementById('export-btn').addEventListener('click', () => {
    const data = JSON.stringify(Object.values(verdicts), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'verdicts.json'; a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const arr = JSON.parse(e.target.result);
        verdicts = {};
        arr.forEach(v => { if (v.theme) verdicts[v.theme] = v; });
        saveVerdicts();
        render();
      } catch (_) { alert('Invalid JSON file.'); }
    };
    reader.readAsText(file);
    this.value = '';
  });

  // ---- event listeners ----
  btnAccept.addEventListener('click',    () => setVerdict('accept'));
  btnReject.addEventListener('click',    () => setVerdict('reject'));
  btnNeedsWork.addEventListener('click', () => setVerdict('needs-work'));
  document.getElementById('btn-skip').addEventListener('click', () => goTo(current + 1));
  document.getElementById('nav-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('nav-next').addEventListener('click', () => goTo(current + 1));
  document.getElementById('toggle-sidebar').addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
  notesInput.addEventListener('blur', saveNotes);

  document.addEventListener('keydown', e => {
    if (e.target === notesInput) return; // don't intercept when typing notes
    switch (e.key) {
      case 'ArrowLeft':  goTo(current - 1); break;
      case 'ArrowRight': goTo(current + 1); break;
      case 'a': case 'A': setVerdict('accept'); break;
      case 'r': case 'R': setVerdict('reject'); break;
      case 'w': case 'W': setVerdict('needs-work'); break;
      case 's': case 'S': goTo(current + 1); break;
      case 'n': case 'N': notesInput.focus(); break;
    }
  });

  // ---- init ----
  buildList();
  // Start at first unreviewed theme
  const firstUnreviewed = THEMES.findIndex(t => !verdicts[t.theme]);
  current = firstUnreviewed >= 0 ? firstUnreviewed : 0;
  render();
})();
</script>
</body>
</html>`;
}

function main() {
  const themes = discoverThemes();
  if (themes.length === 0) {
    console.error('No screenshots found in screenshots/d7/ or screenshots/backdrop/');
    console.error('Run node scripts/compare.js first to generate screenshots.');
    process.exit(1);
  }

  console.log(`Found ${themes.length} theme(s) with screenshots.`);
  const themeData = buildThemeData(themes);
  const embedded  = themeData.filter(t => t.d7.src || t.bd.src).length;
  console.log(`Embedded screenshots for ${embedded} theme(s).`);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outPath = path.join(REPORTS_DIR, `reviewer-${ts}.html`);
  fs.writeFileSync(outPath, buildHTML(themeData));
  console.log(`Reviewer: ${outPath}`);
}

main();
