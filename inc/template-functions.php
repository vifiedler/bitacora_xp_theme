<?php
/**
 * Functions which enhance the theme by hooking into WordPress
 *
 * @package bitacora_xp_theme
 */

/**
 * Adds custom classes to the array of body classes.
 *
 * @param array $classes Classes for the body element.
 * @return array
 */
function bitacora_xp_theme_body_classes( $classes ) {
	// Adds a class of hfeed to non-singular pages.
	if ( ! is_singular() ) {
		$classes[] = 'hfeed';
	}

	// Adds a class of no-sidebar when there is no sidebar present.
	if ( ! is_active_sidebar( 'sidebar-1' ) ) {
		$classes[] = 'no-sidebar';
	}

	return $classes;
}
add_filter( 'body_class', 'bitacora_xp_theme_body_classes' );

/**
 * Add a pingback url auto-discovery header for single posts, pages, or attachments.
 */
function bitacora_xp_theme_pingback_header() {
	if ( is_singular() && pings_open() ) {
		printf( '<link rel="pingback" href="%s">', esc_url( get_bloginfo( 'pingback_url' ) ) );
	}
}
add_action( 'wp_head', 'bitacora_xp_theme_pingback_header' );

/**
 * Usa cierres HTML5 en la cabecera y en los formularios de búsqueda de WordPress.
 *
 * @param string $html Fragmento generado por WordPress.
 * @return string
 */
function bitacora_xp_theme_html5_tags( $html ) {
	if ( false === strpos( $html, '/>' ) || ! property_exists( 'WP_HTML_Span', 'length' ) ) {
		return $html;
	}

	require_once __DIR__ . '/class-bitacora-xp-html-tags.php';
	$tags = new Bitacora_XP_HTML_Tags( $html );
	return $tags->sin_barras_finales();
}
add_filter( 'get_search_form', 'bitacora_xp_theme_html5_tags' );
add_filter( 'render_block_core/search', 'bitacora_xp_theme_html5_tags' );
