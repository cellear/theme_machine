<?php
/*===================================================================

    Developed By: Samuel Ayela
	Company: Rocom Solutions
	Website: http://localhost/drupal//
	
\------------------------------------------------------------------*/
?>
<div id="page">
		<div class="page-inner">
		<div id="header" class="clearfix">
			<?php if ($logo): ?>
			<div id="logo">
				<a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>"><img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" /></a>
			</div><!-- /site-logo -->
			<?php endif; ?>			

			<?php if ($site_name || $site_slogan): ?>
			<div id="site-details">
				<?php if ($site_name): ?>
				<h1 class="site-name">
					<a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home"><span><?php print $site_name; ?></span></a>
				</h1><!-- /site-name -->
				<?php endif; ?>

				<?php if ($site_slogan): ?>
				<div class="slogan"><?php print $site_slogan; ?></div><!-- /slogan -->
				<?php endif; ?>
			</div><!-- /site-details -->
			<?php endif; ?>

			<?php if (theme_get_setting('social_options')): ?>
			<div id="social-icons">
				<?php if (theme_get_setting('social_title')): ?><h2><?php echo theme_get_setting('social_title'); ?></h2><?php endif; ?>	
				<?php if (theme_get_setting('linkedin_username')): ?><a href="http://www.linkedin.com/in/<?php echo theme_get_setting('linkedin_username'); ?>" title="Follow me on Linkedin!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-linkedin.png" width="32" height="32" alt="Follow me on Linkedin!" /></a><?php endif; ?>
				<?php if (theme_get_setting('google_plus_username')): ?><a href="https://plus.google.com/<?php echo theme_get_setting('google_plus_username'); ?>" title="Follow me on Google Plus!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-googleplus.png" width="32" height="32" alt="Follow me on Google Plus!" /></a><?php endif; ?>
				<?php if (theme_get_setting('twitter_username')): ?><a href="http://www.twitter.com/<?php echo theme_get_setting('twitter_username'); ?>" title="Follow me on Twitter!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-twitter.png" width="32" height="32" alt="Follow me on Twitter!" /></a><?php endif; ?>
				<?php if (theme_get_setting('facebook_username')): ?><a href="http://www.facebook.com/<?php echo theme_get_setting('facebook_username'); ?>" title="Follow me on Facebook!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-facebook.png" width="32" height="32" alt="Follow me on Facebook!" /></a><?php endif; ?>
				<?php if (theme_get_setting('rss_url')): ?><a href="<?php print $front_page ?><?php echo theme_get_setting('rss_url'); ?>" title="RSS Feed!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-rss.png" width="32" height="32" alt="RSS Feed!" /></a><?php endif; ?>
			</div>
			<?php endif; ?>			
			
		</div><!-- /header -->	
	
	<div id="container" class="clearfix">

	<?php if ($messages): ?>
	<div id="site-messages"> 
		<?php print $messages; ?>
	</div>
	<?php endif; ?>

	<div id="content-wrap" class="clearfix">	
	<?php if ($page['sidebar_first']): ?>
    <div id="sidebar-first" class="column sidebar"><div class="section">
        <?php print render($page['sidebar_first']); ?>
    </div></div><!-- /sidebar-first -->
    <?php endif; ?>
	
    <div id="content" class="column"><div class="section">
      <?php print $breadcrumb; ?>
      <a id="main-content"></a>
      <?php print render($title_prefix); ?>
      <?php if ($title): ?>
        <h1 class="title" id="page-title"><?php print $title; ?></h1>
      <?php endif; ?>
      <?php print render($title_suffix); ?>	  
      <?php if ($tabs): ?>
        <div class="tabs"><?php print render($tabs); ?></div>
      <?php endif; ?>
      <?php print render($page['help']); ?>
      <?php if ($action_links): ?>
        <ul class="action-links"><?php print render($action_links); ?></ul>
      <?php endif; ?>
      <?php print render($page['content']); ?>
      <?php print $feed_icons; ?>
    </div></div><!-- /content -->
    <?php if ($page['sidebar_second']): ?>
    <div id="sidebar-second" class="column sidebar"><div class="section">
        <?php print render($page['sidebar_second']); ?>
    </div></div><!-- /sidebar-second -->
    <?php endif; ?>
  </div><!-- /content-wrap -->
  </div><!-- /container inner -->
	
	  </div><!-- /page inner -->	
</div><!-- /page -->

	<div id="footer" class="clearfix">
		<div class="site-credits">
			<p><?php print date('Y') ?> | <a href="<?php print $front_page ?>" title="<?php print $site_name ?>"><?php print $site_name ?></a></p>
			<?php print render($page['footer']); ?>
		</div><!-- /site-credits -->
	</div><!-- /footer -->

<?php print render($page['bottom']); ?>

