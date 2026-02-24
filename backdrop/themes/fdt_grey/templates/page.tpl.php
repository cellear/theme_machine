
  <!-- Layout -->
  <!-- header -->
  <div id="mainwrapper">
	<div id="header" class="container-16 clearfix">
	<div class="grid-16">
	  <div id="cat-menu">
	    <?php if ($page ['secondarymenu']): ?>
			  <?print render($page['secondarymenu']); ?>  
			<?php endif; ?>
	  </div>
	  </div>
	<div class="grid-16">
	  <div class="grid-6 alpha clearfix sitelogo">
	  <h1 id="site-title">
	  <a href="<?php print $base_path; ?>" title="<?php print $site_name; ?>" rel="home"><img src="<?php print $logo; ?>" title="<?php print $site_name; ?>"/><?php print $site_name;?></a></h1>
	  <?php if ($is_front): ?>
	   <div id="site-description"><?php print $site_slogan; ?></div>
	  <?php else: ?>
	   <div id="site-description"><?php print $site_slogan; ?></div>
	  <?php endif ?>
	  </div>
	<div class="grid-10 alpha omega">
	  <div id="top-search-wrap" class="grid-10 omega clearfix">
	      <?php if ($page ['search_box']): ?>
	       <div class="block block-theme">
	         <?print render($page['search_box']); ?>
	       </div>
	      <?php endif; ?>
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
	</div></div>
	<!-- /header -->
	<div id="container" class="container-16 clearfix">
	
		<div id="content" class="<?php print  (($page['sidebar_first']) ? 'grid-12' : 'grid-16') ?> clearfix">
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
    <div id="sidebar" class="grid-4 alpha clearfix">
      <?php if ($page ['sidebar_first']): ?>
        <?print render($page['sidebar_first']); ?>    
      <?php endif; ?>
    </div>
    <!-- /sidebar -->
	</div>
	<div id="footer" >
	 <div class="footer-block container-12 clearfix">
	 <div class="footer1 grid-4 clearfix">
	  <?php if ($page ['footer1']): ?>
      <?print render($page['footer1']); ?>    
    <?php endif; ?>
   </div>
   <div class="footer1 grid-4 clearfix">
    <?php if ($page ['footer2']): ?>
      <?print render($page['footer2']); ?>    
    <?php endif; ?>
    </div>
    <div class="footer1 grid-4 clearfix">
    <?php if ($page ['footer3']): ?>
      <?print render($page['footer3']); ?>    
    <?php endif; ?>
    </div>
	  <div id="footer-content" class="grid-12">
	    <?php if ($page ['footer_message']): ?>
        <?print render($page['footer_message']); ?>   
      <?php endif; ?>
      <div class="footer_zyxware">Theme by <a href="http://www.zyxware.com/" title="Zyxware" target="_blank">Zyxware</a></div>
	  </div>
	 </div>
  </div>
</div>
  <!-- /layout -->
