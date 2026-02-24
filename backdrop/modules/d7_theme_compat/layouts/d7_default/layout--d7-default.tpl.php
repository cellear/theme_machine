<?php
/**
 * @file
 * Template for the D7 Default layout.
 *
 * This template is provided for the Layout admin UI (Manage Blocks page).
 * When a D7 theme is active, the Layout system is suppressed and page
 * rendering goes through the D7 theme's page.tpl.php instead. Blocks placed
 * into these regions via the Layout UI are rendered by
 * d7_theme_compat_preprocess_page().
 *
 * Variables:
 * - $content: An array of content keyed by region name:
 *   - $content['header']
 *   - $content['highlighted']
 *   - $content['help']
 *   - $content['content']
 *   - $content['sidebar_first']
 *   - $content['sidebar_second']
 *   - $content['footer']
 */
?>
<div class="layout--d7-default <?php print implode(' ', $classes); ?>"<?php print backdrop_attributes($attributes); ?>>

  <?php if ($content['header']): ?>
    <header class="l-header" role="banner" aria-label="<?php print t('Site header'); ?>">
      <div class="l-header-inner container container-fluid">
        <?php print $content['header']; ?>
      </div>
    </header>
  <?php endif; ?>

  <?php if (!empty($content['highlighted'])): ?>
    <div class="l-highlighted">
      <div class="container container-fluid">
        <?php print $content['highlighted']; ?>
      </div>
    </div>
  <?php endif; ?>

  <div class="l-wrapper">
    <div class="l-wrapper-inner container container-fluid">

      <?php if (!empty($content['help'])): ?>
        <div class="l-help">
          <?php print $content['help']; ?>
        </div>
      <?php endif; ?>

      <div class="l-middle row">
        <div class="l-sidebar l-sidebar-first col-md-3">
          <?php print $content['sidebar_first']; ?>
        </div>
        <main class="l-content col-md-6" role="main" aria-label="<?php print t('Main content'); ?>">
          <?php print $content['content']; ?>
        </main>
        <div class="l-sidebar l-sidebar-second col-md-3">
          <?php print $content['sidebar_second']; ?>
        </div>
      </div>

    </div>
  </div>

  <?php if ($content['footer']): ?>
    <footer class="l-footer">
      <div class="l-footer-inner container container-fluid">
        <?php print $content['footer']; ?>
      </div>
    </footer>
  <?php endif; ?>

</div>
