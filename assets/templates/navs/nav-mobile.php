<nav id="site-navigation" class="navbar navbar-expand-lg navbar-light nav-mobile d-lg-none" aria-label="<?php esc_attr_e( 'Menú móvil', 'bitacora_xp_theme' ); ?>">
    <!---conatiner-->
    <div class="container-fluid">
        <!---row-->
        <div class="row w-100 d-flex justify-content-between align-items-center">
            <!---navbrand-->
            <div class="navbar-brand col-7">

                <?php
                the_custom_logo();
                
                if (is_front_page() && is_home()) :
                ?>
                <h1 class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>"
                        rel="home"><?php bloginfo('name'); ?></a></h1>
                <?php
                else :
                ?>
                <p class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>"
                        rel="home"><?php bloginfo('name'); ?></a></p>
                <?php 
                endif;
                $descripcion = get_bloginfo('description', 'display');
                if ($descripcion || is_customize_preview()) :
                ?>
                <p class="site-description"><?php echo esc_html( $descripcion ); ?></p>
                <?php endif; ?>
            </div>


            <button class="navbar-toggler col-2" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="<?php esc_attr_e( 'Alternar menú', 'bitacora_xp_theme' ); ?>">
                <span class="boton-hamburguesa navbar-toggler-icon" aria-hidden="true">
                    <span class="linea-hamburguesa"></span>
                    <span class="linea-hamburguesa"></span>
                    <span class="linea-hamburguesa"></span>
                </span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">


                <?php //OPCIÓN MENU 1 SIMPLE CON BOOTSTRAP
                wp_nav_menu(
                    array(
                        'theme_location' => bitacora_xp_ubicacion_menu( true ),
                        'menu_id'        => 'navbar',
                        'menu_class'     => 'navbar-nav me-auto mb-2 mb-lg-0',
                        'container_class' => 'menu-mobile nav col-12 col-md-8 d-block',
                        'depth'          => 2,
                        'walker'         => new Bitacora_XP_Nav_Menu_Walker(),
                        'fallback_cb'    => array( 'Bitacora_XP_Nav_Menu_Walker', 'fallback' ),
                    )
                );
                ?>

                <?php if ( function_exists( 'aws_get_search_form' ) ) { aws_get_search_form( true ); } ?>
            </div>
        </div>
    </div>
</nav>
