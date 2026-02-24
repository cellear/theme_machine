<?php
?>
  <div class="node<?php if ($sticky) { print " sticky"; } ?><?php if (!$status) { print " node-unpublished"; } ?><?php if ($page == 0) { print " listed"; } ?>">
    <?php if ($picture) {
      print $picture;
    }?>
    <?php if ($page == 0) { ?>
	  <h2 class="title"><a href="<?php print $node_url?>"><?php print $title?></a></h2>
	  <div class="content"><?php print $content?></div>
	  <div class="taxonomy"><?php print $terms?></div>
	  <?php if ($links) { ?><div class="links">&raquo; <?php print $links?></div><?php }; ?>
	  <?php if ($submitted) { print '<div class="submitted">by <a href="' .url('user/'.$node->uid). '">' .$node->name. '</a> on ' .date('d M y',$node->created). '</div>'; } ?>
	<?php } else { ?>
      <?php if ($submitted) { print '<div class="submitted">by <a href="' .url('user/'.$node->uid). '">' .$node->name. '</a> on ' .date('d M y',$node->created). '</div>'; } ?>
      <div class="taxonomy"><?php print $terms?></div>
      <div class="content"><?php print $content?></div>
      <?php if ($links) { ?><div class="links">&raquo; <?php print $links?></div><?php }; ?>
	<?php } ?>
  </div>