
  <!-- Layout -->
  <!-- header -->
  <div id="mainwrapper">
	<div id="header" class="container-16 clearfix">
	  	  <!-- secondery -->
	  <div id="cat-menu" class="grid-16 clearfix">
	    <?php if ($page ['secondarymenu']): ?>
			  <?print render($page['secondarymenu']); ?>  
			<?php endif; ?>
	  </div>
	  <!-- /secondery -->
	  
	  <div class="grid-16">
	  <div class="grid-6 alpha">
	  <h2 id="site-title"><a href="<?php print $base_path; ?>" title="<?php print $site_name; ?>" rel="home"><?php print $site_name;?></a></h2>
	  <?php if ($is_front): ?>
	   <div id="site-description"><?php print $site_slogan; ?></div>
	  <?php else: ?>
	   <div id="site-description"><?php print $site_slogan; ?></div>
	  <?php endif ?>
	  </div>
	  <!-- navigation -->
  <!--<div id="navigation" class="menu grid-10 omega clearfix">
	    <?php if ($page ['primarynav']): ?>
				<?print render($page['primarynav']); ?>  
			<?php endif; ?>
	  </div>-->
	           <div id="nav">
           
            <?php 
          if (module_exists('i18n')) { 
            $main_menu_tree = i18n_menu_translated_tree(variable_get('menu_main_links_source', 'main-menu'));
          } else {
            $main_menu_tree = menu_tree(variable_get('menu_main_links_source', 'main-menu'));
          }
          print drupal_render($main_menu_tree);
        ?>
          </div>
    </div>
	    <div id="top-search-wrap" class="grid-16">
	      <?php if ($page ['search_box']): ?>
	       <div class="block block-theme">
	         <?print render($page['search_box']); ?>
	       </div>
	      <?php endif; ?>
	    </div>
	    <!-- /top-search-wrap -->
	</div>
	<!-- /header -->
	<div id="container" class="container-16 clearfix">
	  <div class="grid-16">
		<div id="content" class="<?php print (($page['right']) ? 'grid-10' : 'grid-16') ?> alpha">
			<?php print $breadcrumb; ?>
			<?php print render($title_prefix); ?>
      <?php if ($title): ?>
      <h2 class="with-tabs"><?php print $title ?></h2>
      <?php endif; ?>
      <?php print render($title_suffix); ?>
      <?php print $messages; ?>
      <?php if ($tabs): ?>
        <div id="tabs-wrapper" class="clearfix">
        <?php print render($tabs); ?>
        </div>
      <?php endif; ?>             
      <?php print render($page['content']); ?>                
      <?php if ($feed_icons): ?><?php print $feed_icons; ?><?php endif; ?>
	  </div>
	  <!-- /content -->
	  <!-- sidebar -->
    <?php if ($page ['right']): ?>
      <div id="sidebar" class="grid-6 omega">
        <?print render($page['right']); ?>    
      </div>
    <?php endif; ?>
    <!-- /sidebar -->
	</div></div>
	<div id="footer">
	  <div class="container-16">
	  <?php if ($page ['footer']): ?>
	      <div class="grid-16">
        <?print render($page['footer']); ?>   
        </div>
      <?php endif; ?>
	  <div id="footer-content" class="grid-16">
	    <?php if ($page ['footer_message']): ?>
        <?print render($page['footer_message']); ?>  
      <?php endif; ?>
      <div class="footer_zyxware">Theme by <a href="http://www.zyxware.com/" title="Zyxware" target="_blank">Zyxware</a></div>
	  </div>
	  </div>
  </div>
</div>

  <!-- /layout -->

