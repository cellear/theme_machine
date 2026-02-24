<div id="page" class="<?php print $classes; ?>" <?php print $attributes; ?>>

    <!-- HEADER -->
    <div id="header">
        <!-- SITE LOGO -->
        <?php if($logo): ?>
            <a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home" id="logo"></a>
        <?php endif; ?>

        <!-- HEADER REGION -->
        <?php if($page['header']): ?>
            <?php print render($page['header']); ?>
        <?php endif; ?>
    </div>

    <!-- CONTENT -->
    <div id="main">

        <div id="content">

            <!-- CONTENT TOP REGION -->
            <?php if($page['content_top']): ?>
                <?php print render($page['content_top']); ?>
            <?php endif; ?>

            <!-- CONTENT META -->
            <div id="content-header">
                <?php if ($page['highlighted']): ?>
                    <div id="highlighted"><?php print render($page['highlighted']) ?></div>
                <?php endif; ?>

                <?php if($messages): print $messages; endif; ?>

                <?php if(isset($page['help'])): print render($page['help']); endif; ?>

                <?php if ($tabs): ?>
                    <div class="tabs"><?php print render($tabs); ?></div>
                <?php endif; ?>

                <?php if ($action_links): ?>
                    <ul class="action-links"><?php print render($action_links); ?></ul>
                <?php endif; ?>
            </div>

            <!-- SIDEBAR LEFT -->
            <?php if($page['sidebar_first']): ?>
                <?php print render($page['sidebar_first']); ?>
            <?php endif; ?>

            <!-- CONTENT REGION -->
            <?php if($page['content']): ?>
                <?php print render($page['content']); ?>
            <?php endif; ?>

            <!-- SIDEBAR RIGHT REGION -->
            <?php if($page['sidebar_second']): ?>
                <?php print render($page['sidebar_second']); ?>
            <?php endif; ?>

            <!-- CONTENT BOTTOM REGION -->
            <?php if($page['content_bottom']): ?>
                <?php print render($page['content_bottom']); ?>
            <?php endif; ?>

        </div>
    </div>

    <!-- FOOTER REGION -->
    <?php if($page['footer']): ?>
        <?php print render($page['footer']); ?>
    <?php endif; ?>
</div>
