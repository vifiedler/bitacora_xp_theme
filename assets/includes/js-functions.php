<?php
/**
 * Librerías de front-end, clientes AJAX y escenarios del juego.
 * @package bitacora_xp_theme
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/** Relaciona los nombres de Tiled con los PNG del inventario de este mundo. */
function bitacora_xp_sprites_del_mundo( $mundo ) {
    static $inventario = null;
    if ( null !== $inventario ) {
        return $inventario[ $mundo ] ?? array();
    }
    $archivo = fopen( get_template_directory() . '/assets/librerias/recursos/sprites/asignaciones_objetos.csv', 'r' );
    $inventario = array();
    if ( false !== $archivo ) {
        fgetcsv( $archivo, 0, ',', '"', '\\' ); // Encabezado del inventario.
        while ( false !== ( $fila = fgetcsv( $archivo, 0, ',', '"', '\\' ) ) ) {
            $slug = str_replace( '_', '-', $fila[0] );
            $inventario[ $slug ][ $fila[2] ] = $fila[4];
        }
        fclose( $archivo );
    }
    return $inventario[ $mundo ] ?? array();
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

    // Segunda fuente: API PHP independiente de WordPress alojada en /api-bitacora/.
    // Se entrega una URL pública, nunca las credenciales MySQL.
    $ruta_descubrimientos = '/assets/librerias/js/bitacora-xp-descubrimientos.js';
    wp_enqueue_script(
        'bitacora-xp-descubrimientos',
        get_template_directory_uri() . $ruta_descubrimientos,
        array(),
        (string) filemtime( get_template_directory() . $ruta_descubrimientos ),
        true
    );

    wp_add_inline_script(
        'bitacora-xp-descubrimientos',
        'window.BitacoraXPExtrasConfig = ' . wp_json_encode(
            array(
                // Ruta ABSOLUTA desde la raíz del dominio, NO desde /bitacora-xp/.
                'endpoint' => '/api-bitacora/lista_descubrimientos.php',
            ),
            JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
        ) . ';',
        'before'
    );

    if ( bitacora_xp_mundo_actual() ) {
        $ruta_carga = '/assets/librerias/js/bitacora-xp-carga-inicial.js';
        wp_enqueue_script(
            'bitacora-xp-carga-inicial',
            get_template_directory_uri() . $ruta_carga,
            array( 'bitacora-xp-rest', 'bitacora-xp-descubrimientos' ),
            (string) filemtime( get_template_directory() . $ruta_carga ),
            true
        );

        // Cada módulo futuro de la SPA declarará como dependencia el handle de la librería que utilice.
        wp_enqueue_script(
            'bitacora-xp-phaser',
            'https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.min.js',
            array(),
            '4.2.1',
            true
        );
        $ruta_dialogo = '/assets/librerias/js/bitacora-xp-dialogo.js';
        wp_enqueue_script(
            'bitacora-xp-dialogo',
            get_template_directory_uri() . $ruta_dialogo,
            array( 'bitacora-xp-typed', 'bitacora-xp-gsap', 'bitacora-xp-dompurify' ),
            (string) filemtime( get_template_directory() . $ruta_dialogo ),
            true
        );
        $ruta_lectura = '/assets/librerias/js/bitacora-xp-lectura.js';
        $ruta_diario = '/assets/librerias/js/bitacora-xp-diario.js';
        wp_enqueue_script(
            'bitacora-xp-diario',
            get_template_directory_uri() . $ruta_diario,
            array( 'bitacora-xp-descubrimientos', 'bitacora-xp-bootstrap' ),
            (string) filemtime( get_template_directory() . $ruta_diario ),
            true
        );
        wp_enqueue_script(
            'bitacora-xp-lectura',
            get_template_directory_uri() . $ruta_lectura,
            array( 'bitacora-xp-rest', 'bitacora-xp-descubrimientos', 'bitacora-xp-dompurify', 'bitacora-xp-gsap', 'bitacora-xp-dialogo', 'bitacora-xp-diario' ),
            (string) filemtime( get_template_directory() . $ruta_lectura ),
            true
        );
        $ruta_etiquetas = '/assets/librerias/js/bitacora-xp-etiquetas.js';
        wp_enqueue_script(
            'bitacora-xp-etiquetas',
            get_template_directory_uri() . $ruta_etiquetas,
            array( 'bitacora-xp-rest', 'bitacora-xp-dompurify', 'bitacora-xp-gsap' ),
            (string) filemtime( get_template_directory() . $ruta_etiquetas ),
            true
        );
        $ruta_escenario = '/assets/librerias/js/bitacora-xp-escenario.js';
        wp_enqueue_script(
            'bitacora-xp-escenario',
            get_template_directory_uri() . $ruta_escenario,
            array( 'bitacora-xp-phaser', 'bitacora-xp-lectura', 'bitacora-xp-etiquetas' ),
            (string) filemtime( get_template_directory() . $ruta_escenario ),
            true
        );
        $mapas = bitacora_xp_mapas();
        foreach ( $mapas as $mundo => $datos ) {
            $mapas[ $mundo ]['mapa']   = get_template_directory_uri() . '/assets/librerias/mapas/' . $datos['archivo'];
            $mapas[ $mundo ]['url']    = bitacora_xp_enlace_mapa( $mundo );
            $mapas[ $mundo ]['sprites'] = bitacora_xp_sprites_del_mundo( $mundo );
        }
        wp_add_inline_script(
            'bitacora-xp-escenario',
            'window.BitacoraXPEscenario = ' . wp_json_encode(
                array(
                    'mapas'    => $mapas,
                    'recursos' => get_template_directory_uri() . '/assets/librerias/recursos/',
                ),
                JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
            ) . ';',
            'before'
        );
        wp_enqueue_script(
            'bitacora-xp-gsap',
            'https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js',
            array(),
            '3.15.1',
            true
        );
        wp_enqueue_script(
            'bitacora-xp-typed',
            'https://cdn.jsdelivr.net/npm/typed.js@2.1.0/dist/typed.umd.js',
            array(),
            '2.1.0',
            true
        );
        wp_enqueue_script(
            'bitacora-xp-howler',
            'https://cdn.jsdelivr.net/npm/howler@2.2.4/dist/howler.min.js',
            array(),
            '2.2.4',
            true
        );
        wp_enqueue_script(
            'bitacora-xp-dompurify',
            'https://cdn.jsdelivr.net/npm/dompurify@3.5.0/dist/purify.min.js',
            array(),
            '3.5.0',
            true
        );
    }
}
add_action( 'wp_enqueue_scripts', 'bitacora_xp_cargar_js' );
