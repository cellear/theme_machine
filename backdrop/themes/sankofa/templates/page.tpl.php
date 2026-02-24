<div id="page">
	<div id="header-wrap">
		<div id="header" class="clearfix"><div class="section clearfix">
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
				<div class="slogan">
					<h2><?php print $site_slogan; ?></h2>
				</div><!-- /slogan -->
				<?php endif; ?>
			</div><!-- /site-details -->
			<?php endif; ?>
			<div id="header-right">
				<?php if (theme_get_setting('social_options')): ?>
				<div class="social-icons">
					<?php if (theme_get_setting('facebook_username')): ?><a href="http://www.facebook.com/<?php echo theme_get_setting('facebook_username'); ?>" title="Follow me on Facebook!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-facebook.png" width="32" height="32" alt="Follow me on Facebook!" /></a><?php endif; ?>
					<?php if (theme_get_setting('twitter_username')): ?><a href="http://www.twitter.com/<?php echo theme_get_setting('twitter_username'); ?>" title="Follow me on Twitter!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-twitter.png" width="32" height="32" alt="Follow me on Twitter!" /></a><?php endif; ?>
					<?php if (theme_get_setting('google_plus_username')): ?><a href="https://plus.google.com/<?php echo theme_get_setting('google_plus_username'); ?>" title="Follow me on Google Plus!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-googleplus.png" width="32" height="32" alt="Follow me on Google Plus!" /></a><?php endif; ?>					
					<?php if (theme_get_setting('linkedin_username')): ?><a href="http://www.linkedin.com/in/<?php echo theme_get_setting('linkedin_username'); ?>" title="Follow me on Linkedin!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-linkedin.png" width="32" height="32" alt="Follow me on Linkedin!" /></a><?php endif; ?>
					<?php if (theme_get_setting('rss_url')): ?><a href="<?php print $front_page ?><?php echo theme_get_setting('rss_url'); ?>" title="RSS Feed!" target="_blank"><img src="<?php print $base_path . $directory; ?>/images/icon-rss.png" width="32" height="32" alt="RSS Feed!" /></a><?php endif; ?>
				</div>
				<?php endif; ?>	
				<?php if (theme_get_setting('search_options')): ?>
				<div id="site-search">
					<?php
						$block = module_invoke('search', 'block_view', 'search');
						print render($block); 
					?>				
				</div><!-- /site-search -->
				<?php endif; ?>				
			</div>		
			</div><!-- /section -->
		</div><!-- /header -->
		<div id="menu-wrap">
			<div id="menu">
		<?php print theme('links__system_main_menu', array(
          'links' => $main_menu,
          'attributes' => array(
            'id' => 'main-menu-links',
            'class' => array('main-menu', 'clearfix'),
          ),
          'heading' => array(
            'text' => t('Main menu'),
            'level' => 'h2',
            'class' => array('element-invisible'),
          ),
        )); ?>
			</div><!-- /menu -->
		</div><!-- /menu-wrap -->		
	</div><!-- /header-wrap -->

	<div id="container" class="clearfix">
	
    <?php if($is_front && theme_get_setting('slideshow_options')): ?>	
        <div class="slider-wrapper theme-default">
            <div id="slider" class="nivoSlider">
                <img src="<?php print $base_path . $directory; ?>/images/slides/1.jpg" data-thumb="<?php print $base_path . $directory; ?>/images/slides/1.jpg" alt="" />
                <a href="http://samuelayela.com"><img src="<?php print $base_path . $directory; ?>/images/slides/2.jpg" data-thumb="<?php print $base_path . $directory; ?>/images/slides/2.jpg" alt="" title="This is an example of a caption" /></a>
                <img src="<?php print $base_path . $directory; ?>/images/slides/3.jpg" data-thumb="<?php print $base_path . $directory; ?>/images/slides/3.jpg" alt="" data-transition="slideInLeft" />
                <img src="<?php print $base_path . $directory; ?>/images/slides/2.jpg" data-thumb="<?php print $base_path . $directory; ?>/images/slides/2.jpg" alt="" title="#htmlcaption" />
            </div>
            <div id="htmlcaption" class="nivo-html-caption">
                <strong>This</strong> is an example of a <em>HTML</em> caption with <a href="#">a link</a>. 
            </div>
        </div><!-- /slider -->
	<?php endif; ?>
	
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
      <?php print render($page['highlighted']); ?>	
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
	
	<div id="footer-wrap">
		<div id="footer" class="clearfix">
			<div class="slogan">
				<h2><?php print $site_slogan; ?></h2>
			</div>
			<div class="site-credits">
				<p><?php print date('Y') ?> <a href="<?php print $front_page ?>" title="<?php print $site_name ?>"><?php print $site_name ?></a> | Theme by: <a href="http://www.samuelayela.com" alt="Samuel Ayela Themes" target="_blank">Samuel Ayela</a> | <a href="#page">Jump To Top</a></p>
				<?php print render($page['footer']); ?>
			</div><!-- /site-credits -->
		</div><!-- /footer -->
	</div>	
	
</div><!-- /page -->

<?php print render($page['bottom']); ?>

