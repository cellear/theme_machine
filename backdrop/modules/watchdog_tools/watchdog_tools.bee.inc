<?php

/**
 * @file
 * Bee commands for managing the watchdog log.
 */

/**
 * Implements hook_bee_command().
 */
function watchdog_tools_bee_command() {
  $items['watchdog-clear'] = array(
    'description' => bt('Clear all watchdog log entries.'),
    'callback' => 'watchdog_tools_clear_callback',
    'group' => 'watchdog_tools',
    'aliases' => array('wc', 'wd-clear'),
    'bootstrap' => BEE_BOOTSTRAP_FULL,
    'examples' => array(
      'bee watchdog-clear' => bt('Delete all entries from the watchdog log.'),
    ),
  );

  $items['watchdog-count'] = array(
    'description' => bt('Show the number of watchdog log entries, optionally filtered by severity.'),
    'callback' => 'watchdog_tools_count_callback',
    'group' => 'watchdog_tools',
    'aliases' => array('wcount', 'wd-count'),
    'options' => array(
      'severity' => bt('Filter by severity level (e.g. error, warning, notice).'),
      'type' => bt('Filter by log type (e.g. php, cron, access denied).'),
    ),
    'bootstrap' => BEE_BOOTSTRAP_FULL,
    'examples' => array(
      'bee watchdog-count' => bt('Show the total number of log entries.'),
      'bee watchdog-count --severity=error' => bt('Show the number of error-level entries.'),
      'bee watchdog-count --type=php' => bt('Show the number of PHP log entries.'),
    ),
  );

  return $items;
}

/**
 * Callback for watchdog-clear.
 */
function watchdog_tools_clear_callback($arguments, $options) {
  $count = db_query('SELECT COUNT(*) FROM {watchdog}')->fetchField();

  if ($count == 0) {
    bee_message(bt('The watchdog log is already empty.'), 'info');
    return;
  }

  db_truncate('watchdog')->execute();
  bee_message(bt('Cleared @count watchdog log entries.', array('@count' => $count)), 'success');
}

/**
 * Callback for watchdog-count.
 */
function watchdog_tools_count_callback($arguments, $options) {
  $severity_map = array(
    'emergency' => WATCHDOG_EMERGENCY,
    'alert' => WATCHDOG_ALERT,
    'critical' => WATCHDOG_CRITICAL,
    'error' => WATCHDOG_ERROR,
    'warning' => WATCHDOG_WARNING,
    'notice' => WATCHDOG_NOTICE,
    'info' => WATCHDOG_INFO,
    'debug' => WATCHDOG_DEBUG,
  );

  $query = db_select('watchdog', 'w');
  $query->addExpression('COUNT(*)', 'count');

  $filters = array();

  if (!empty($options['severity'])) {
    $sev = strtolower($options['severity']);
    if (!isset($severity_map[$sev])) {
      bee_message(bt('Unknown severity "@sev". Valid values: @list', array(
        '@sev' => $sev,
        '@list' => implode(', ', array_keys($severity_map)),
      )), 'error');
      return;
    }
    $query->condition('w.severity', $severity_map[$sev]);
    $filters[] = bt('severity=@sev', array('@sev' => $sev));
  }

  if (!empty($options['type'])) {
    $query->condition('w.type', $options['type']);
    $filters[] = bt('type=@type', array('@type' => $options['type']));
  }

  $count = $query->execute()->fetchField();
  $filter_text = count($filters) ? ' (' . implode(', ', $filters) . ')' : '';
  bee_message(bt('Watchdog entries@filters: @count', array(
    '@filters' => $filter_text,
    '@count' => $count,
  )), 'info');
}
