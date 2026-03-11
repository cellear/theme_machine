<?php
/**
 * @file
 * Admin settings form for D7 Theme Compatibility.
 */

/**
 * Form builder: D7 Theme Compatibility global and per-theme settings.
 */
function d7_theme_compat_settings_form($form, &$form_state) {
  $config = config('d7_theme_compat.settings');

  $form['global'] = array(
    '#type' => 'fieldset',
    '#title' => t('Global settings'),
    '#description' => t('These settings apply to all D7 themes unless overridden per-theme below.'),
  );

  $form['global']['inject_d7_core_css'] = array(
    '#type' => 'checkbox',
    '#title' => t('Inject Drupal 7 core CSS'),
    '#default_value' => $config->get('inject_d7_core_css'),
    '#description' => t('Load bundled D7 system stylesheets (system.base.css, node.css, comment.css, etc.). Most D7 themes depend on these for basic formatting. Recommended: enabled.'),
  );

  $form['global']['region_labels'] = array(
    '#type' => 'checkbox',
    '#title' => t('Show region labels overlay'),
    '#default_value' => $config->get('region_labels'),
    '#description' => t('Display dashed outlines and machine-name badges on each page region. Useful for debugging theme layout. Recommended: disabled on production.'),
  );

  $form['global']['auto_layout_sync'] = array(
    '#type' => 'checkbox',
    '#title' => t('Auto-sync layout templates'),
    '#default_value' => $config->get('auto_layout_sync'),
    '#description' => t("Automatically update the Default and Front Page layout templates to match the active D7 theme's declared regions when the theme changes. Disable to manage layout templates manually."),
  );

  // Per-theme overrides — one collapsible fieldset per enabled D7 theme.
  $d7_themes = _d7_theme_compat_get_enabled_d7_themes();

  if (!empty($d7_themes)) {
    $form['per_theme_wrapper'] = array(
      '#type' => 'fieldset',
      '#title' => t('Per-theme overrides'),
      '#description' => t('Override the global settings for individual D7 themes. <em>Global default</em> inherits the global setting above.'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
    );

    $per_theme = $config->get('per_theme') ?: array();

    $options = array(
      '' => t('Global default'),
      '1' => t('Enabled'),
      '0' => t('Disabled'),
    );

    foreach ($d7_themes as $theme_name => $info) {
      // Collapse per-theme fieldset unless this theme has stored overrides.
      $has_overrides = !empty($per_theme[$theme_name]);

      $form['per_theme_wrapper'][$theme_name] = array(
        '#type' => 'fieldset',
        '#title' => check_plain($info['name']),
        '#collapsible' => TRUE,
        '#collapsed' => !$has_overrides,
      );

      foreach (array('inject_d7_core_css', 'region_labels', 'auto_layout_sync') as $key) {
        // Represent the saved value: TRUE→'1', FALSE→'0', absent→''.
        $saved = '';
        if (isset($per_theme[$theme_name][$key])) {
          $saved = $per_theme[$theme_name][$key] ? '1' : '0';
        }

        $form['per_theme_wrapper'][$theme_name][$theme_name . '__' . $key] = array(
          '#type' => 'select',
          '#title' => _d7_theme_compat_setting_label($key),
          '#options' => $options,
          '#default_value' => $saved,
        );
      }
    }
  }

  $form['actions']['#type'] = 'actions';
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save configuration'),
  );

  return $form;
}

/**
 * Form submission handler for d7_theme_compat_settings_form().
 *
 * Saves global settings directly. Builds the per_theme config array from the
 * per-theme select elements, storing only explicit overrides (not "inherit").
 * Per-theme entries with no overrides are dropped to keep config clean.
 */
function d7_theme_compat_settings_form_submit($form, &$form_state) {
  $config = config('d7_theme_compat.settings');

  // Save global settings.
  $config->set('inject_d7_core_css', (bool) $form_state['values']['inject_d7_core_css']);
  $config->set('region_labels', (bool) $form_state['values']['region_labels']);
  $config->set('auto_layout_sync', (bool) $form_state['values']['auto_layout_sync']);

  // Build per-theme overrides. Only store explicit values (non-empty string).
  $per_theme = array();
  foreach (_d7_theme_compat_get_enabled_d7_themes() as $theme_name => $info) {
    foreach (array('inject_d7_core_css', 'region_labels', 'auto_layout_sync') as $key) {
      $field = $theme_name . '__' . $key;
      if (isset($form_state['values'][$field]) && $form_state['values'][$field] !== '') {
        $per_theme[$theme_name][$key] = (bool) $form_state['values'][$field];
      }
    }
  }
  $config->set('per_theme', $per_theme);

  $config->save();
  backdrop_set_message(t('D7 Theme Compatibility settings saved.'));
}

/**
 * Returns a human-readable label for a setting key.
 */
function _d7_theme_compat_setting_label($key) {
  $labels = array(
    'inject_d7_core_css' => t('Inject Drupal 7 core CSS'),
    'region_labels'      => t('Show region labels overlay'),
    'auto_layout_sync'   => t('Auto-sync layout templates'),
  );
  return isset($labels[$key]) ? $labels[$key] : check_plain($key);
}

/**
 * Returns enabled D7 themes, keyed by machine name.
 *
 * @return array
 *   [machine_name => ['name' => human_label]]
 */
function _d7_theme_compat_get_enabled_d7_themes() {
  $d7_themes = array();
  foreach (list_themes() as $name => $theme) {
    if ($theme->status && isset($theme->info['core']) && $theme->info['core'] === '7.x') {
      $d7_themes[$name] = array('name' => $theme->info['name']);
    }
  }
  return $d7_themes;
}
