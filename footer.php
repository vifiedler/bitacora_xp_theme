<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #content div and all content after.
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package bitacora_xp_theme
 */

?>

	<?php
	if ( ! bitacora_xp_mundo_actual() ) {
		get_template_part( 'assets/templates/footers/template-footer' );
	}
	?>
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>
