<div id="node-<?php print $node->nid; ?>" class="<?php print $classes; ?>">
    <?php if($title): ?>
        <h2<?php print $title_attributes; ?>><?php print $title; ?></h2>
    <?php endif; ?>

    <div class="content">
        <?php print render($content); ?>
    </div>
</div>
