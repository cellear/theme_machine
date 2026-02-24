<?php
/**
 * @file
 * Template file, allows you to hook into theme functions
 */

/***************************************
 * Sir Bones Theme
 ***************************************/


/***************************************
 * Implements theme_preprocess_page().
 ***************************************/
function sirbones_preprocess_page(&$vars, $hook) {
  // Add content type template override.
  if (isset($vars['node']) && $vars['node']->type != "") {
    $vars['template_files'][] = "page-" . $vars['node']->type;
  }
}
