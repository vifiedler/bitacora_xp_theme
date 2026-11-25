<?php
/**
 * Librerías de front-end y cliente REST sin renderizado ni lógica de Phaser.
 * @package bitacora_xp_theme
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function bitacora_xp_cargar_js() {
    wp_enqueue_script(
        'bitacora-xp-bootstrap',
        'https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/js/bootstrap.bundle.min.js',
        array(),
        '5.3.9',
        true
    );

    $ruta_rest = get_template_directory() . '/assets/librerias/js/bitacora-xp-rest.js';
    wp_enqueue_script(
        'bitacora-xp-rest',
        get_template_directory_uri() . '/assets/librerias/js/bitacora-xp-rest.js',
        array(),
        (string) filemtime( $ruta_rest ),
        true
    );

    // Valores públicos. NUNCA incluir credenciales de la base de datos externa.
    wp_add_inline_script(
        'bitacora-xp-rest',
        'window.BitacoraXPConfig = ' . wp_json_encode(
            array(
                'postsUrl'      => esc_url_raw( rest_url( 'wp/v2/posts' ) ),
                'pagesUrl'      => esc_url_raw( rest_url( 'wp/v2/pages' ) ),
                'categoriesUrl' => esc_url_raw( rest_url( 'wp/v2/categories' ) ),
            ),
            JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
        ) . ';',
        'before'
    );
}
add_action( 'wp_enqueue_scripts', 'bitacora_xp_cargar_js' );
