<?php
/**
 * Registro y carga de las hojas de estilo de Bitácora XP.
 */
if (!defined('ABSPATH')) {
    exit;
}

function bitacora_xp_cargar_css()
{
    $uri = get_template_directory_uri();
    $directorio = get_template_directory();
    $general = '/assets/librerias/css/general.css';
    $escenario = '/assets/librerias/css/bitacora-xp-escenario.css';
    $diario = '/assets/librerias/css/bitacora-xp-diario.css';

    wp_register_style('bitacora-xp-bootstrap', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/css/bootstrap.min.css', array(), '5.3.9', 'all');
    wp_register_style('bitacora-xp-iconos', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.2/font/bootstrap-icons.min.css', array(), '1.13.2', 'all');
    wp_register_style('bitacora-xp-general', $uri . $general, array('bitacora_xp_theme-style', 'bitacora-xp-bootstrap', 'bitacora-xp-fuentes-hud'), (string) filemtime($directorio . $general), 'all');
    wp_register_style('bitacora-xp-fuentes-hud', 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600;700&family=Roboto+Mono:wght@400;500;700&display=swap', array(), null, 'all');
    wp_register_style('bitacora-xp-escenario', $uri . $escenario, array('bitacora-xp-bootstrap', 'bitacora-xp-general', 'bitacora-xp-iconos', 'bitacora-xp-fuentes-hud'), (string) filemtime($directorio . $escenario), 'all');

    wp_enqueue_style('bitacora-xp-bootstrap');
    wp_enqueue_style('bitacora-xp-iconos');
    wp_enqueue_style('bitacora-xp-general');
    if (bitacora_xp_mundo_actual()) {
        wp_enqueue_style('bitacora-xp-escenario');
        wp_enqueue_style('bitacora-xp-diario', $uri . $diario, array('bitacora-xp-escenario'), (string) filemtime($directorio . $diario), 'all');
    }
}
add_action('wp_enqueue_scripts', 'bitacora_xp_cargar_css', 5);
