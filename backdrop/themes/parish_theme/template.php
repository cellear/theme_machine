<?php

/**
 * @file
 * Theme functions for Parish Theme.
 */

/**
 * Implements hook_page_alter().
 */
function parish_theme_page_alter($page) {
  // Add meta tag for viewport, for easier responsive theme design.
  $viewport = array(
    '#type' => 'html_tag',
    '#tag' => 'meta',
    '#attributes' => array(
      'name' => 'viewport',
      'content' => 'width=device-width, initial-scale=1',
    ),
  );
  drupal_add_html_head($viewport, 'viewport');
}

/**
 * Implements theme_process_html().
 */
function parish_theme_process_html(&$variables) {
  // Color.module integration.
  if (module_exists('color')) {
    _color_html_alter($variables);
  }
}

/**
 * Implements hook_preprocess_page().
 */
function parish_theme_preprocess_page(&$variables) {
  // Add markup for including the Google font API.
  $element = array(
    '#tag' => 'link',
    '#attributes' => array(
      'href' => '//fonts.googleapis.com/css?family=Merriweather',
      'rel' => 'stylesheet',
      'type' => 'text/css',
    ),
  );
  // Since we use the $key, this can be overridden to use a different font.
  // @see hook_html_head_alter().
  drupal_add_html_head($element, 'google_font_stylesheet');

  // Allow for dropdown menus by placing the entire menu tree in the page.
  $variables['main_menu_expanded'] = menu_tree_output(menu_tree_all_data('main-menu'));

  // Color.module integration.
  if (module_exists('color')) {
    _color_page_alter($variables);
  }
}

/**
 * Implements theme_filter_tips_more_info().
 *
 * Open filter tips link in new page. Prevents data loss.
 */
function parish_theme_filter_tips_more_info() {
  return '<p>' . l(t('More information about text formats'), 'filter/tips', array('attributes' => array('target' => '_blank'))) . '</p>';
}
