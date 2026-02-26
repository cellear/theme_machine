<?php

/**
 * @file
 * Bee command for automated theme smoke testing.
 */

/**
 * Implements hook_bee_command().
 */
function theme_tester_bee_command() {
  $items['theme-test'] = array(
    'description' => bt('Smoke-test enabled themes: switch each to default, load a page, check for errors and missing regions.'),
    'callback' => 'theme_tester_test_callback',
    'group' => 'theme_tester',
    'aliases' => array('tt'),
    'options' => array(
      'path' => bt('Internal path to request for each theme. Default: node/1.'),
      'base-url' => bt('Base URL of the site. Default: auto-detect from global $base_url.'),
      'themes' => bt('Comma-separated list of theme machine names to test. Default: all enabled.'),
      'report' => bt('Path to save a markdown report file. Default: no file output.'),
    ),
    'bootstrap' => BEE_BOOTSTRAP_FULL,
    'examples' => array(
      'bee theme-test' => bt('Test all enabled themes against /node/1.'),
      'bee theme-test --path=node/5' => bt('Test all themes against /node/5.'),
      'bee theme-test --themes=bartik_d7,garland_d7' => bt('Test only specific themes.'),
      'bee theme-test --report=DOC/theme-test-results.md' => bt('Save results to a markdown file.'),
    ),
  );
  return $items;
}

/**
 * Callback for theme-test: run smoke tests across enabled themes.
 */
function theme_tester_test_callback($arguments, $options) {
  $base_url = !empty($options['base-url']) ? rtrim($options['base-url'], '/') : $GLOBALS['base_url'];
  $test_path = !empty($options['path']) ? $options['path'] : 'node/1';
  $test_url = $base_url . '/' . $test_path;

  $themes = list_themes();
  $enabled = array();
  foreach ($themes as $name => $theme) {
    if ($theme->status) {
      $enabled[$name] = $theme;
    }
  }

  if (!empty($options['themes'])) {
    $requested = array_map('trim', explode(',', $options['themes']));
    $enabled = array_intersect_key($enabled, array_flip($requested));
    if (empty($enabled)) {
      bee_message(bt('None of the requested themes are enabled.'), 'error');
      return;
    }
  }

  ksort($enabled);

  $original_theme = config_get('system.core', 'theme_default');

  // The D7 default layout defines these regions. Themes missing any of them
  // will have blocks silently dropped unless lost_regions is active.
  $standard_regions = array(
    'content', 'header', 'footer',
    'sidebar_first', 'sidebar_second',
    'highlighted', 'help',
  );

  $results = array();
  $total = count($enabled);
  $current = 0;

  bee_message(bt('Testing @count themes against @url', array(
    '@count' => $total,
    '@url' => $test_url,
  )), 'info');
  _theme_tester_flush_messages();

  foreach ($enabled as $name => $theme) {
    $current++;
    $human_name = $theme->info['name'];

    bee_message(bt('[@num/@total] @name (@machine)...', array(
      '@num' => $current,
      '@total' => $total,
      '@name' => $human_name,
      '@machine' => $name,
    )), 'info');
    _theme_tester_flush_messages();

    // Clear watchdog before this theme's test.
    db_truncate('watchdog')->execute();

    // Switch default theme and clear caches.
    config_set('system.core', 'theme_default', $name);
    cache_clear_all();

    // Make HTTP request.
    $response = backdrop_http_request($test_url);
    $http_code = isset($response->code) ? $response->code : 'N/A';

    // Collect errors (severity <= WATCHDOG_ERROR = 3).
    $errors = db_select('watchdog', 'w')
      ->fields('w', array('severity', 'type', 'message', 'variables'))
      ->condition('w.severity', WATCHDOG_ERROR, '<=')
      ->execute()
      ->fetchAll();

    $error_messages = array();
    foreach ($errors as $error) {
      $variables = @unserialize($error->variables);
      $msg = is_array($variables) ? strtr($error->message, $variables) : $error->message;
      $msg = strip_tags(html_entity_decode($msg, ENT_QUOTES, 'UTF-8'));
      if (strlen($msg) > 200) {
        $msg = substr($msg, 0, 200) . '...';
      }
      $error_messages[] = $msg;
    }

    // Collect warnings separately (WATCHDOG_WARNING = 4).
    $warning_count = db_select('watchdog', 'w')
      ->condition('w.severity', WATCHDOG_WARNING)
      ->countQuery()
      ->execute()
      ->fetchField();

    // Check theme's declared regions against the standard set.
    $theme_regions = isset($theme->info['regions']) ? array_keys($theme->info['regions']) : array();
    $missing_regions = array_diff($standard_regions, $theme_regions);
    // Themes with no declared regions get D7 defaults, so don't flag them.
    if (empty($theme_regions)) {
      $missing_regions = array();
    }

    $results[] = array(
      'machine' => $name,
      'name' => $human_name,
      'http' => $http_code,
      'error_count' => count($errors),
      'warning_count' => (int) $warning_count,
      'errors' => $error_messages,
      'missing_regions' => $missing_regions,
      'declared_regions' => $theme_regions,
    );
  }

  // Restore original theme.
  config_set('system.core', 'theme_default', $original_theme);
  db_truncate('watchdog')->execute();
  cache_clear_all();

  // Print summary.
  bee_message('', 'info');
  bee_message(bt('=== THEME TEST RESULTS ==='), 'info');
  bee_message(bt('Test URL: @url', array('@url' => $test_url)), 'info');
  bee_message('', 'info');

  $pass_count = 0;
  $fail_count = 0;

  foreach ($results as $r) {
    $status = ($r['http'] == 200 && $r['error_count'] == 0) ? 'PASS' : 'FAIL';
    if ($status === 'PASS') {
      $pass_count++;
    }
    else {
      $fail_count++;
    }

    $missing = count($r['missing_regions']) ? implode(', ', $r['missing_regions']) : 'none';
    $msg_type = ($status === 'PASS') ? 'success' : 'error';

    $summary = bt("[@status] @name (@machine) — HTTP @http, @errs errors, @warns warnings, missing regions: @missing", array(
      '@status' => $status,
      '@name' => $r['name'],
      '@machine' => $r['machine'],
      '@http' => $r['http'],
      '@errs' => $r['error_count'],
      '@warns' => $r['warning_count'],
      '@missing' => $missing,
    ));
    bee_message($summary, $msg_type);

    if ($r['error_count'] > 0) {
      foreach ($r['errors'] as $err) {
        bee_message(bt('  -> @err', array('@err' => $err)), 'warning');
      }
    }
  }

  bee_message('', 'info');
  bee_message(bt('Total: @total tested, @pass passed, @fail failed. Default theme restored to @theme.', array(
    '@total' => count($results),
    '@pass' => $pass_count,
    '@fail' => $fail_count,
    '@theme' => $original_theme,
  )), 'info');

  // Save report file if requested.
  if (!empty($options['report'])) {
    $report = _theme_tester_build_report($results, $test_url, $original_theme);
    $report_path = $options['report'];
    if (file_put_contents($report_path, $report) !== FALSE) {
      bee_message(bt('Report saved to @path', array('@path' => $report_path)), 'success');
    }
    else {
      bee_message(bt('Failed to write report to @path', array('@path' => $report_path)), 'error');
    }
  }
}

/**
 * Build a markdown report string from test results.
 */
function _theme_tester_build_report($results, $test_url, $restored_theme) {
  $date = date('Y-m-d H:i:s');
  $lines = array();
  $lines[] = '# Theme Test Results';
  $lines[] = '';
  $lines[] = '- **Date**: ' . $date;
  $lines[] = '- **Test URL**: `' . $test_url . '`';
  $lines[] = '- **Restored default**: `' . $restored_theme . '`';
  $lines[] = '';

  // Summary table.
  $lines[] = '## Summary';
  $lines[] = '';
  $lines[] = '| Status | Theme | Machine Name | HTTP | Errors | Warnings | Missing Regions |';
  $lines[] = '|--------|-------|-------------|------|--------|----------|-----------------|';

  $pass = 0;
  $fail = 0;

  foreach ($results as $r) {
    $status = ($r['http'] == 200 && $r['error_count'] == 0) ? 'PASS' : 'FAIL';
    if ($status === 'PASS') {
      $pass++;
    }
    else {
      $fail++;
    }
    $missing = count($r['missing_regions']) ? implode(', ', $r['missing_regions']) : '—';
    $lines[] = sprintf('| %s | %s | `%s` | %s | %d | %d | %s |',
      $status, $r['name'], $r['machine'], $r['http'],
      $r['error_count'], $r['warning_count'], $missing);
  }

  $lines[] = '';
  $lines[] = sprintf('**Total**: %d tested, %d passed, %d failed.', count($results), $pass, $fail);
  $lines[] = '';

  // Error details for failures.
  $has_errors = FALSE;
  foreach ($results as $r) {
    if ($r['error_count'] > 0) {
      if (!$has_errors) {
        $lines[] = '## Error Details';
        $lines[] = '';
        $has_errors = TRUE;
      }
      $lines[] = '### ' . $r['name'] . ' (`' . $r['machine'] . '`)';
      $lines[] = '';
      foreach ($r['errors'] as $i => $err) {
        $lines[] = ($i + 1) . '. ' . $err;
      }
      $lines[] = '';
    }
  }

  // Region details.
  $has_missing = FALSE;
  foreach ($results as $r) {
    if (count($r['missing_regions']) > 0) {
      if (!$has_missing) {
        $lines[] = '## Missing Standard Regions';
        $lines[] = '';
        $lines[] = 'Standard D7 layout regions: content, header, footer, sidebar_first, sidebar_second, highlighted, help.';
        $lines[] = '';
        $has_missing = TRUE;
      }
      $lines[] = '- **' . $r['name'] . '** (`' . $r['machine'] . '`): ' . implode(', ', $r['missing_regions']);
    }
  }
  if ($has_missing) {
    $lines[] = '';
  }

  $lines[] = 'Last updated: ' . date('Y-m-d') . ' by theme_tester';
  $lines[] = '';

  return implode("\n", $lines);
}

/**
 * Flush bee messages to stdout immediately (for progress feedback).
 */
function _theme_tester_flush_messages() {
  global $_bee_messages;
  bee_print_messages();
  $_bee_messages = array();
}
