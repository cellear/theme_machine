<?php
/**
 * @file Simple Clean theme settings.
 */

/**
 * Implements hook_form_system_theme_settings_alter().
 *
 * @param $form
 * @param $form_state
 */
function simpleclean_form_system_theme_settings_alter(&$form, $form_state) {
  $form['simpleclean_mission'] = array(
    '#type' => 'textfield',
    '#title' => t('Mission statement'),
    '#default_value' => theme_get_setting('simpleclean_mission'),
    '#size' => 128,
    '#description' => t('Specify the text for the mission statement visable on frontpage. Leave it empty if you dont want a mission statement or if you want to use blocks instead.'),
    '#weight' => -2,
  );

  $form['additional_settings'] = array(
    '#type' => 'fieldset',
    '#title' => t('Additional settings')
  );

  $form['additional_settings']['simpleclean_appreciation'] = array(
    '#type' => 'checkbox',
    '#title' => t('Say Thanks to !author_profile @ !author_company_site for the !theme_page theme.',
      array(
        '!theme_page'           => l('Simple Clean', 'http://drupal.org/project/simpleclean', array('attributes' => array('target' => '_blank'))),
        '!author_profile'       => l('acke', 'http://drupal.org/user/765764', array('attributes' => array('target' => '_blank'))),
        '!author_company_site'  => l('happiness', 'http://www.happiness.se/', array('attributes' => array('target' => '_blank')))
      )),
    '#default_value' => theme_get_setting('simpleclean_appreciation'),
    '#description' => t('Please demonstrate your appreciation for the developer by including credits into the footer of the site.')
  );
}
