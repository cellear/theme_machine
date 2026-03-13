#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const CATALOG_PATH = path.join(__dirname, '../TOOLING/theme-catalog/catalog.json');
const THEMES_DIR = path.join(__dirname, '../backdrop/themes');
const LOG_PATH = path.join(__dirname, '../TOOLING/harvest-log.json');
const DELAY_MS = 300;

// Parse CLI flags
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
harvest.js — download D7 themes from drupal.org into backdrop/themes/

Reads TOOLING/theme-catalog/catalog.json and downloads themes not yet present.

Usage:
  node scripts/harvest.js [options]

Options:
  --batch N    Number of themes to download in this run (default: 50)
  --help, -h   Show this help

Output:
  backdrop/themes/{theme}/     Extracted theme directory
  TOOLING/harvest-log.json     Log of downloaded themes
`);
  process.exit(0);
}

let batchSize = 50;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--batch' && args[i + 1]) {
    batchSize = parseInt(args[i + 1], 10);
  }
}

function log(msg) {
  console.log(`[harvest] ${msg}`);
}

function readCatalog() {
  const data = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  return data.themes || [];
}

function loadLog() {
  if (fs.existsSync(LOG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
    } catch {
      return { downloaded: [], failed: [], skipped: [] };
    }
  }
  return { downloaded: [], failed: [], skipped: [] };
}

function saveLog(logData) {
  fs.writeFileSync(LOG_PATH, JSON.stringify(logData, null, 2));
}

function themeExists(machineName) {
  // Check exact match first
  const themePath = path.join(THEMES_DIR, machineName);
  if (fs.existsSync(themePath)) return true;

  // Check for any underscore/hyphen variant (drupal.org extracts with mixed naming)
  try {
    const dirs = fs.readdirSync(THEMES_DIR);
    // Normalize both: replace underscores and hyphens with a common char for comparison
    const normalized = machineName.toLowerCase().replace(/[-_]/g, '');
    return dirs.some(d => d.toLowerCase().replace(/[-_]/g, '') === normalized);
  } catch {
    return false;
  }
}

function fetchReleaseHistory(machineName) {
  return new Promise((resolve, reject) => {
    const url = `https://updates.drupal.org/release-history/${machineName}/7.x`;
    https.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const match = data.match(/<download_link>(.*?)<\/download_link>/);
          if (match && match[1]) {
            resolve(match[1]);
          } else {
            reject(new Error('No download link found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).on('timeout', () => {
      reject(new Error('Timeout fetching release history'));
    });
  });
}

function downloadTheme(downloadUrl) {
  return new Promise((resolve, reject) => {
    const filename = path.basename(downloadUrl);
    const filePath = path.join(THEMES_DIR, filename);

    https.get(downloadUrl, { timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      res.on('error', reject);
      file.on('error', reject);
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    }).on('error', reject).on('timeout', () => {
      reject(new Error('Timeout downloading file'));
    });
  });
}

function extractTheme(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const cmd = `cd "${THEMES_DIR}" && tar xzf "${filePath}"`;
      execSync(cmd, { stdio: 'pipe' });
      fs.unlinkSync(filePath);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

async function harvestTheme(theme, logData) {
  const { machine_name } = theme;

  if (themeExists(machine_name)) {
    logData.skipped.push(machine_name);
    return { status: 'skipped', machine_name };
  }

  try {
    const downloadUrl = await fetchReleaseHistory(machine_name);
    const filePath = await downloadTheme(downloadUrl);
    await extractTheme(filePath);
    logData.downloaded.push(machine_name);
    return { status: 'ok', machine_name };
  } catch (err) {
    logData.failed.push({ machine_name, error: err.message });
    return { status: 'failed', machine_name, error: err.message };
  }
}

async function main() {
  const catalog = readCatalog();
  const logData = loadLog();

  log(`Catalog has ${catalog.length} themes`);
  log(`Batch size: ${batchSize}`);

  // Find themes that need downloading
  const needsDownload = catalog.filter(t => !themeExists(t.machine_name));
  log(`Need to download: ${needsDownload.length} themes`);

  // Limit to batch size
  const toDownload = needsDownload.slice(0, batchSize);
  log(`Attempting ${toDownload.length} themes`);

  let succeeded = 0, failed = 0, skipped = 0;

  for (let i = 0; i < toDownload.length; i++) {
    const theme = toDownload[i];
    const result = await harvestTheme(theme, logData);

    if (result.status === 'ok') {
      succeeded++;
      log(`✓ ${result.machine_name}`);
    } else if (result.status === 'skipped') {
      skipped++;
      log(`- ${result.machine_name} (already exists)`);
    } else {
      failed++;
      log(`✗ ${result.machine_name}: ${result.error}`);
    }

    // Delay before next download (except on last)
    if (i < toDownload.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  saveLog(logData);
  log(`\nDone! Succeeded: ${succeeded}, Failed: ${failed}, Skipped: ${skipped}`);
  log(`Log saved to ${LOG_PATH}`);

  if (succeeded > 0) {
    log(`\nRun: node scripts/compare.js to test newly installed themes`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
