<?php
// $Id$

/**
 * Return a themed breadcrumb trail.
 *
 * @param $breadcrumb
 *   An array containing the breadcrumb links.
 * @return a string containing the breadcrumb output.
 */
function phptemplate_breadcrumb($breadcrumb) {
  if (!empty($breadcrumb)) {
    return '<div class="breadcrumb">'. implode(' › ', $breadcrumb) .'</div>';
  }
}

/**
 * Override or insert PHPTemplate variables into the templates.
 */
function phptemplate_preprocess_page(&$vars) {
  $vars['tabs2'] = menu_secondary_local_tasks();

  // Hook into color.module
  if (module_exists('color')) {
    _color_page_alter($vars);
  }
}

/**
 * Add a "Comments" heading above comments except on forum pages.
 */
function garland_preprocess_comment_wrapper(&$vars) {
  if ($vars['content'] && $vars['node']->type != 'forum') {
    $vars['content'] = '<h2 class="comments">'. t('Comments') .'</h2>'.  $vars['content'];
  }
}

/**
 * Returns the rendered local tasks. The default implementation renders
 * them as tabs. Overridden to split the secondary tasks.
 *
 * @ingroup themeable
 */
function phptemplate_menu_local_tasks() {
  return menu_primary_local_tasks();
}

function phptemplate_comment_submitted($comment) {
  return t('!datetime — !username',
    array(
      '!username' => theme('username', $comment),
      '!datetime' => format_date($comment->timestamp)
    ));
}

function phptemplate_node_submitted($node) {
  return t('!datetime — !username',
    array(
      '!username' => theme('username', $node),
      '!datetime' => format_date($node->created),
    ));
}

/**
 * Generates IE CSS links for LTR and RTL languages.
 */
function phptemplate_get_ie_styles() {
  global $language;

  $iecss = '<link type="text/css" rel="stylesheet" media="all" href="'. base_path() . path_to_theme() .'/fix-ie.css" />';
  if ($language->direction == LANGUAGE_RTL) {
    $iecss .= '<style type="text/css" media="all">@import "'. base_path() . path_to_theme() .'/fix-ie-rtl.css";</style>';
  }

  return $iecss;
}
function fdt_yellow_fdt_yellow_primary_links($links) {
  global $language;
  $output = '';

  if (count($links) > 0) {
  	$output = '<ul>';
    
    $num_links = count($links);
    $i = 1;
    
    foreach ($links as $key => $link) {
      $class = $key;
      if (isset($link['href']) && ($link['href'] == $_GET['q'] || ($link['href'] == '<front>' && drupal_is_front_page()))
          && (empty($link['language']) || $link['language']->language == $language->language)) {
        $class .= ' current_page_item';
      }
      $output .= '<li'. drupal_attributes(array('class' => "page-item-". $class)) .'>';

      if (isset($link['href'])) {
        // Pass in $link as $options, they share the same keys.
        $output .= l($link['title'], $link['href'], $link);
      }
      else if (!empty($link['title'])) {
        // Some links are actually not links, but we wrap these in <span> for adding title and class attributes
        if (empty($link['html'])) {
          $link['title'] = check_plain($link['title']);
        }
        $span_attributes = '';
        if (isset($link['attributes'])) {
          $span_attributes = drupal_attributes($link['attributes']);
        }
        $output .= '<span'. $span_attributes .'>'. $link['title'] .'</span>';
      }
      $i++;
      $output .= "</li>\n";
    }
    $output .= '</ul>';
  }
  return $output;
}
function fdt_yellow_fdt_yellow_secondary_links($links) {
 global $language;
  $output = '';
  if (count($links) > 0) {
    $output = '<ul>';

    $num_links = count($links);
    $i = 1;

    foreach ($links as $key => $link) {
      $class = $key;
      $output .= '<li'. drupal_attributes(array('class' => "cat-item cat-item-". $class)) .'>';
      if (isset($link['href'])) {
        // Pass in $link as $options, they share the same keys.
        $output .= l($link['title'], $link['href'], $link);
      }
      else if (!empty($link['title'])) {
        // Some links are actually not links, but we wrap these in <span> for adding title and class attributes
        if (empty($link['html'])) {
          $link['title'] = check_plain($link['title']);
        }
        $span_attributes = '';
        if (isset($link['attributes'])) {
          $span_attributes = drupal_attributes($link['attributes']);
        }
        $output .= '<span'. $span_attributes .'>'. $link['title'] .'</span>';
      }

      $i++;
      $output .= "</li>\n";
    }

    $output .= '</ul>';
  }

  return $output;
}
function fdt_yellow_theme($existing, $type, $theme, $path) {
	return array(
   'fdt_yellow_primary_links' => array(
        'arguments' => array('primary_links' => NULL),
      ),
   'fdt_yellow_secondary_links' => array(
        'arguments' => array('secondary_links' => NULL),
      ),
  );
}

function fdt_yellow_preprocess_search_theme_form(&$vars, $hook) {
  // Modify elements of the search form
  $vars['form']['search_theme_form']['#title'] = t('');

  // Set a default value for the search box
  $vars['form']['search_theme_form']['#value'] = t('Type text to search');

  // Add a custom class to the search box
  $vars['form']['search_theme_form']['#attributes'] = array('onblur' => "if (this.value == '') {this.value = 'Type text to search';}", 'onfocus' => "if (this.value == 'Type text to search') {this.value = '';}");
  
  // Change the text on the submit button
  $vars['form']['submit']['#value'] = t('');
  
  // Rebuild the rendered version (search form only, rest remains unchanged)
  unset($vars['form']['search_theme_form']['#printed']);
  $vars['search']['search_theme_form'] = drupal_render($vars['form']['search_theme_form']);
   /*THIS IS TO REPLACE SUBMIT BUTTON WITH AN IMAGE*/
  unset($vars['form']['submit']);
  $vars['form']['submit']['#type'] = 'image_button';
  $vars['form']['submit']['#src'] = drupal_get_path('theme', 'fdt_grey') . '/images/search_button.png';

  unset($vars['form']['submit']['#printed']);
  $vars['search']['submit'] = drupal_render($vars['form']['submit']);

  // Collect all form elements to make it easier to print the whole form.
  $vars['search_form'] = implode($vars['search']);
}
