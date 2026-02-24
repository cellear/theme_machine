<div id="node-<?php print $node->nid; ?>" class="node<?php if ($sticky) { print ' sticky'; } ?><?php if (!$status) {print ' node-unpublished'; } ?><?php if($teaser) {print 'node-teaser';} ?>">

<?php if($teaser): ?>
  <h2><a href="<?php print $node_url ?>" title="<?php print $title ?>"><?php print $title ?></a></h2>
<?php endif; ?>

<?php if($submitted) { ?>
	<div class="submitted">
   	 <?php print $submitted ?>
	</div>
<?php } ?>

<div class="content clear-block">
    <?php print $content ?>
</div>

<?php if($terms) { ?>
	<div class="terms">
		<?php print $terms ?>
	</div>
<?php } ?>

<?php if($links) { ?>
    <div class="node-links clear-block">
        <?php print $links ?>
    </div>
<?php } ?>

</div>