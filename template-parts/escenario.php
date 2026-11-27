<?php
/**
 * Escenario jugable y lectura de los contenidos de la bitácora.
 *
 * @package bitacora_xp_theme
 */
$mapas = bitacora_xp_mapas();
?>
<h1 id="bitacora-xp-mundo" class="screen-reader-text"><?php echo esc_html( $mapas[ $args['mundo'] ]['nombre'] ); ?></h1>
<p id="bitacora-xp-controles" class="screen-reader-text"><?php esc_html_e( 'Mueve a Vicente con WASD o las flechas. Camina hasta una salida para cambiar de mapa. Interactúa con E o Enter y abre el diario con J.', 'bitacora_xp_theme' ); ?></p>
<div id="bitacora-xp-escenario" class="container-fluid mx-auto p-0 overflow-hidden" tabindex="0" role="region" aria-labelledby="bitacora-xp-mundo" aria-describedby="bitacora-xp-controles" data-mundo="<?php echo esc_attr( $args['mundo'] ); ?>"></div>
<dialog id="bitacora-xp-lectura" class="rounded p-3" aria-labelledby="bitacora-xp-titulo">
	<form id="bitacora-xp-cierre" method="dialog" class="float-end">
		<button class="btn-close" aria-label="<?php esc_attr_e( 'Cerrar', 'bitacora_xp_theme' ); ?>"></button>
	</form>
	<h2 id="bitacora-xp-titulo" class="h4 me-5 d-none"><?php echo get_the_title();?></h2>
	<div class="contenido-lectura" aria-live="polite"></div>
	<section id="bitacora-xp-dialogo" hidden aria-labelledby="bitacora-xp-hablante">
		<h2 id="bitacora-xp-hablante" class="h5 me-5"></h2>
		<p class="dialogo-contador small mb-1" aria-live="polite" hidden></p>
		<div class="dialogo-parrafos d-grid text-break">
			<p class="dialogo-texto mb-0" aria-hidden="true"></p>
		</div>
		<p class="dialogo-anuncio visually-hidden" role="status" aria-atomic="true"></p>
		<button type="button" class="dialogo-avance btn btn-link btn-sm mt-2"></button>
	</section>
</dialog>
