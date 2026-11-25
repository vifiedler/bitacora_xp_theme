<?php
/**
 * Carga centralizada de los recursos propios de Bitácora XP.
 * Los datos se consultan usando la REST API nativa; no registrar CPT extras.
 * @package bitacora_xp_theme
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

require_once get_template_directory() . '/assets/includes/css-functions.php';
require_once get_template_directory() . '/assets/includes/js-functions.php';
