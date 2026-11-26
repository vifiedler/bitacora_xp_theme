<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package bitacora_xp_theme
 */

?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">

	<?php
	ob_start();
	wp_head();
	echo bitacora_xp_theme_html5_tags( ob_get_clean() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- HTML generado por wp_head().
	?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site">
	<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', 'bitacora_xp_theme' ); ?></a>

	<header id="masthead" class="site-header">
		<?php get_template_part( 'assets/templates/navs/nav', 'desk' ); ?>
		<?php get_template_part( 'assets/templates/navs/nav', 'mobile' ); ?>
	</header><!-- #masthead -->
