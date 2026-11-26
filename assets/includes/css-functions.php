<?php
/**
 * Framework de diagramación. El CSS original de Underscores se carga
 * después desde functions.php. Los estilos propios se definirán cuando
 * estén aprobadas las pantallas de Bitácora XP.
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function bitacora_xp_cargar_css() {
    wp_enqueue_style(
        'bitacora-xp-bootstrap',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/css/bootstrap.min.css',
        array(),
        '5.3.9'
    );
    wp_enqueue_style(
        'bitacora-xp-iconos',
        'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/font/bootstrap-icons.min.css',
        array(),
        '1.13.2'
    );
    if ( is_front_page() ) {
        $ruta = '/assets/librerias/css/bitacora-xp-escenario.css';
        wp_enqueue_style(
            'bitacora-xp-escenario',
            get_template_directory_uri() . $ruta,
            array( 'bitacora-xp-bootstrap' ),
            (string) filemtime( get_template_directory() . $ruta )
        );
    }
}
// Cargar antes de style.css para mantener sus estilos existentes.
add_action( 'wp_enqueue_scripts', 'bitacora_xp_cargar_css', 5 );
