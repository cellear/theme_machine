<div id="block-<?php print $block->module . '-' . $block->delta ?>" class="<?php print $classes; ?>"<?php print $attributes; ?>>
  <?php
    print render($title_prefix);

    if($block->subject):
        print '<h2 class="block-title"' . $title_attributes . '>' . $block->subject . '</h2>';
    endif;

    print render($title_suffix);
  ?>

  <div class="box"<?php print $content_attributes; ?>>
    <?php print $content; ?>
  </div>
</div>
