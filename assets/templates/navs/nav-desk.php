<nav class="navbar navbar-expand-lg d-none d-lg-flex" aria-label="<?php esc_attr_e( 'Menú superior', 'bitacora_xp_theme' ); ?>">
  <div class="container">
    <?php if ( has_custom_logo() ) : ?>
      <?php the_custom_logo(); ?>
    <?php else : ?>
      <a class="navbar-brand site-title" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a>
    <?php endif; ?>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="<?php esc_attr_e( 'Alternar menú', 'bitacora_xp_theme' ); ?>">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavDropdown">
      <?php
      wp_nav_menu(array(
          'theme_location' => bitacora_xp_ubicacion_menu(),
          'menu_id'        => 'menu-superior',
          'menu_class'     => 'navbar-nav mb-2 mb-lg-0',
          'container'      => false,
          'depth'          => 2,
          'walker'         => new Bitacora_XP_Nav_Menu_Walker(),
          'fallback_cb'    => array( 'Bitacora_XP_Nav_Menu_Walker', 'fallback' ),
      ));
      ?>
    </div>
  </div>
</nav>
