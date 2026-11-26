<?php
/** Mapas de Tiled y páginas que los presentan en WordPress. */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function bitacora_xp_mapas() {
    return array(
        'plaza-central' => array( 'nombre' => 'Plaza Central', 'archivo' => 'PlazaCentral.tmj', 'spawn' => 'spawn_plaza_inicio' ),
        'gachavault'    => array( 'nombre' => 'GachaVault', 'archivo' => 'GachaVault.tmj', 'spawn' => 'spawn_gv_inicio' ),
        'sinapsis'      => array( 'nombre' => 'SINAPSIS', 'archivo' => 'SINAPSIS.tmj', 'spawn' => 'spawn_sinapsis_inicio' ),
        'entre-versos'  => array( 'nombre' => 'Entre Versos', 'archivo' => 'EntreVersos.tmj', 'spawn' => 'spawn_ev_inicio' ),
    );
}

function bitacora_xp_mundo_actual() {
    if ( is_front_page() ) {
        return 'plaza-central';
    }
    if ( is_page() ) {
        $plantilla = get_page_template_slug();
        $slug      = preg_replace( '/^mundo-/', '', get_queried_object()->post_name );
        foreach ( array_keys( bitacora_xp_mapas() ) as $mundo ) {
            if ( 'plaza-central' === $mundo ) {
                continue;
            }
            if ( 'page-' . $mundo . '.php' === $plantilla || ( ! $plantilla && $slug === $mundo ) ) {
                return $mundo;
            }
        }
    }
    return '';
}

// Las páginas mundo-* que contienen los diálogos SCF usan las mismas plantillas.
function bitacora_xp_plantilla_mundo( $plantillas ) {
    $mundo = bitacora_xp_mundo_actual();
    if ( $mundo && 'plaza-central' !== $mundo ) {
        array_unshift( $plantillas, 'page-' . $mundo . '.php' );
    }
    return $plantillas;
}
add_filter( 'page_template_hierarchy', 'bitacora_xp_plantilla_mundo' );

function bitacora_xp_enlace_mapa( $mundo ) {
    if ( 'plaza-central' === $mundo ) {
        return home_url( '/' );
    }
    foreach ( array( $mundo, 'mundo-' . $mundo ) as $slug ) {
        $pagina = get_page_by_path( $slug, OBJECT, array( 'page' ) );
        if ( ! $pagina || 'publish' !== $pagina->post_status ) {
            continue;
        }
        $plantilla = get_page_template_slug( $pagina );
        if ( ! $plantilla || 'page-' . $mundo . '.php' === $plantilla ) {
            return get_permalink( $pagina );
        }
    }
    $paginas = get_posts( array(
        'post_type'      => 'page',
        'posts_per_page' => 1,
        'meta_key'       => '_wp_page_template',
        'meta_value'     => 'page-' . $mundo . '.php',
    ) );
    return $paginas ? get_permalink( $paginas[0] ) : '';
}
