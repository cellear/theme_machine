<?php

/**
 * Add body classe for Facebook canvas auto resize.
 */
function bartik_fb_preprocess_html(&$variables) {
  array_unshift($variables['classes_array'], 'fb_canvas-resizable');
}
