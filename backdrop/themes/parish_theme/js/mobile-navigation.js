/**
 * @file
 * Responsive navigation behaviors.
 */

(function ($, Drupal, window, document) {

  'use strict';

  Drupal.behaviors.parishThemeResponsiveNavigation = {
    attach: function (context, settings) {
      $('#navigation .section').children('.menu').slicknav({
        nestedParentLinks: true,
        allowParentLinks: true,
        prependTo: 'body',
        showChildren: false
      });
    }
  };

})(jQuery, Drupal, this, this.document);
