<?php

function zebilla_form_system_theme_settings_alter(&$form, $form_state) {
  $form['social'] = array(
    '#type'          => 'fieldset',
    '#title'         => t('Social icons settings'),
  );
  $form['social']['social_options'] = array(
    '#type'          => 'checkbox',
    '#title'         => t('Show/hide social icons'),
    '#default_value' => theme_get_setting('social_options'),
    '#description'   => t("Check to show social icons or uncheck to hide them."),
  );  
  $form['social']['social_title'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Title'),
    '#default_value' => theme_get_setting('social_title'),
    '#description'   => t("Set a custom title or leave empty to hide."),
  );  
  $form['social']['twitter_username'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Twitter Username'),
    '#default_value' => theme_get_setting('twitter_username'),
    '#description'   => t("Enter your Twitter username or leave empty to hide."),
  );
    $form['social']['facebook_username'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Facebook Username'),
    '#default_value' => theme_get_setting('facebook_username'),
    '#description'   => t("Enter your Facebook username or leave empty to hide."),
  );
    $form['social']['linkedin_username'] = array(
    '#type'          => 'textfield',
    '#title'         => t('LinkedIn Username'),
    '#default_value' => theme_get_setting('linkedin_username'),
    '#description'   => t("Enter your LinkedIn username or leave empty to hide"),
  );
    $form['social']['google_plus_username'] = array(
    '#type'          => 'textfield',
    '#title'         => t('Google Plus Username'),
    '#default_value' => theme_get_setting('google_plus_username'),
    '#description'   => t("Enter your Google Plus username or leave empty to hide."),
  );
    $form['social']['rss_url'] = array(
    '#type'          => 'textfield',
    '#title'         => t('RSS'),
    '#default_value' => theme_get_setting('rss_url'),
    '#description'   => t("Enter a custom RSS URL or leave empty to hide"),
  );  
}