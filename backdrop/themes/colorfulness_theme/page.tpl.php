<div id="pagewidth">
<div id="header">
		<div id="HeaderWidth">
		<div id="HeaderWrapper" class="clearfix">
			<div id="HeaderTwocols" class="clearfix">
				<div id="HeaderMenu">
					
					<?php print theme('links', array('links' => $main_menu, 'attributes' => array('id' => 'navlist', 'class' => array('linksTop', 'clearfix')), 'header' => array('text' => t('Main menu'), 'level' => 'h2', 'class' => array('element-invisible'))));  ?></div>
			</div>
		</div>
		<div id="logo">
			<?php if ($site_name) { ?><h1 class='site-name'><a href="<?php print $base_path ?>" title="<?php print $site_name ?>"><?php print $site_name ?></a></h1><?php } ?>
			<?php if ($site_slogan) { ?><div class='site-slogan'><?php print $site_slogan ?></div><?php } ?></div>
		</div>
	</div>
	<div id="wrapper" class="clearfix">
		<div id="twocols<?php if (!$page['sidebar_first']) {print "NoLeft";}?>" class="clearfix">
			<div id="maincol">
				<?php print $breadcrumb ?>
		        <?php if ($title): ?><h1 class="title" id="page-title"><?php print $title; ?></h1><?php endif; ?>
		        <?php print render($title_suffix); ?>
				<?php if ($tabs): ?><div class="tabs"><?php print render($tabs); ?></div><?php endif; ?>
				<?php print $messages ?>
        		<?php print render($page['help']); ?>
        		<?php print render($page['content']); ?>
				<?php print $feed_icons; ?>
			</div>
				
		<?php if ($page['sidebar_second']) { ?>
			<div id="rightcol">
				 <?php print render($page['sidebar_second']); ?>
			</div>
		<?php } ?>
		</div>
		
	<?php if ($page['sidebar_first']) { ?>
		<div id="leftcol">
      		<?php print render($page['sidebar_first']); ?>
    	</div>
	<?php } ?>
	</div>
	<div id="footer">
		 <?php print render($page['footer']); ?> 
		<br/>
		 <a href="http://www.nigraphic.com" title="Web Design &amp; Photography">Design by niGraphic</a></div>
</div>