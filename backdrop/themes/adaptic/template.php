<?php
/**
 * @file
 * adaptIC's template.php file.
 * File is currently empty, nothing to see here for now.
 */

 /**
  * Implements hook_preprocess_html().
  */
function adaptic_preprocess_html(&$variables) {

  /* Path variables */
  $variables['base_path'] = base_path();
  $variables['adaptic_path'] = drupal_get_path('theme', 'adaptic');

}
