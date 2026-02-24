<?php
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="<?php print $language->language ?>" xml:lang="<?php print $language->language ?>" dir="<?php print $language->dir ?>">

<head>
  <?php print $head ?>
  <title><?php print $head_title ?></title>
  <?php print $styles ?>
  <?php print $scripts ?>
  <script type="text/javascript"><?php /* Needed to avoid Flash of Unstyle Content in IE */ ?> </script>
</head>

<body>
  
  <div id="authorize">
    <div class="mholder">
      <ul><?php global $user; if ($user->uid != 0) { print '<li class="first">' .t('Logged in as&nbsp;'). '<a href="' .url('user/'.$user->uid). '">' .$user->name. '</a></li>'; print '<li><a href="' .url('logout'). '">' .t('Logout'). '</a></li>'; } else { print '<li class="first"><a href="' .url('user'). '">' .t('Login'). '</a></li>'; print '<li><a href="' .url('user/register'). '">' .t('Register'). '</a></li>'; } ?></ul>
	  <?php print $feed_icons; ?>
    </div>
  </div>
  
  <div id="header">
    <?php if ($logo) { ?>
	  <div class="mholder">
	  <div id="logo"><a href="<?php print $front_page ?>" title="<?php print t('Home') ?>"><img src="<?php print $logo ?>" alt="<?php print t('Home') ?>" /></a></div>
	<?php } else { ?>
	  <div class="mholder default">
	<?php } ?>
	  <?php if ($site_name) { ?><h1 class='site-name'><a href="<?php print $front_page ?>" title="<?php print t('Home') ?>"><?php print $site_name ?></a></h1><?php } ?>
      <?php if ($site_slogan) { ?><div class='site-slogan'><?php print $site_slogan ?></div><?php } ?>
    </div>
  </div>
  
  <div id="menu"><div class="mholder"><?php if (isset($primary_links)) { ?><?php print theme('links', $primary_links, array('class' => 'links', 'id' => 'navlist')) ?><?php } ?></div></div>
  
  <div id="content">
    <div class="mholder">
	  <?php print $breadcrumb ?>
	  <div id="main" <?php if (!$right) { ?> class="fullwidth" <?php } ?>>
	    <?php if ($precontent) { ?><div id="precontent"><?php print $precontent ?></div><?php } ?>
        <?php if ($mission) { ?><div id="mission"><div class="mission-in"><?php print $mission ?></div></div><?php } ?>
		<?php if ($title) { ?><h1 class="title"><?php print $title ?></h1><?php } ?>
		<div class="tabs"><?php print $tabs ?></div>
        <?php if ($show_messages) { print $messages; } ?>
		<?php print $help ?>
        <?php print $content; ?>
      </div>
	  <?php if ($right) { ?><div id="sidebar-right"><?php print $right ?></div><?php } ?>
    </div>
  </div>

  <div id="footer">
    <div class="mholder">
      <div class="footer-blocks"><?php print '<div class="footer-block">' .$footer1. '</div><div class="footer-block">' .$footer2. '</div><div class="footer-block">' .$footer3. '</div><div class="footer-block">' .$footer4. '</div>'; ?></div>
      <div class="footer-info"><div class="footer-message"><?php print $footer_message ?></div><div class="copyright"><strong><a href="http://www.adciserver.com" title="Go to adciserver.com">Drupal theme</a></strong> by <a href="http://www.adciserver.com" title="Go to adciserver.com">www.adciserver.com</a></div></div>
	</div>
  </div>
  
<?php print $closure ?>
</body>
</html>
