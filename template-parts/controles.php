<?php
/** Panel compartido por los cuatro escenarios. */
$pagina = get_page_by_path( 'controles', OBJECT, array( 'page' ) );
$textos = array(
	'titulo_movimiento'          => 'Movimiento e interacción',
	'descripcion_movimiento'     => 'Camina hasta una salida para cambiar de mapa.',
	'etiqueta_movimiento'        => 'WASD / Flechas',
	'etiqueta_interactuar'       => 'E / Enter',
	'etiqueta_diario'            => 'J',
	'etiqueta_cerrar'            => 'Escape',
	'etiqueta_ocultar_controles' => 'Ocultar controles',
	'titulo_audio'               => 'Audio',
	'descripcion_audio'          => 'Opciones de audio',
	'etiqueta_volumen'           => 'Volumen',
	'etiqueta_silenciar'         => 'Silenciar',
	'etiqueta_activar_audio'     => 'Activar audio',
);
if ( $pagina && 'publish' === $pagina->post_status && function_exists( 'get_field' ) ) {
	foreach ( array_keys( $textos ) as $campo ) {
		$valor = get_field( $campo, $pagina->ID );
		if ( is_string( $valor ) && '' !== trim( wp_strip_all_tags( $valor ) ) ) {
			$textos[ $campo ] = $valor;
		}
	}
}
?>
<aside id="bitacora-xp-panel-controles" aria-label="Controles" class="position-fixed start-0 z-1 mw-100 d-flex align-items-start gap-1 p-1 small pe-none">
	<section class="bg-body rounded p-2 overflow-auto pe-auto" aria-labelledby="bitacora-xp-titulo-movimiento">
		<h2 id="bitacora-xp-titulo-movimiento" class="h6"><i class="bi bi-controller" aria-hidden="true"></i> <?php echo esc_html( $textos['titulo_movimiento'] ); ?></h2>
		<button type="button" id="bitacora-xp-alternar-controles" class="btn btn-outline-secondary btn-sm pe-auto" aria-expanded="true" aria-controls="bitacora-xp-controles"><?php echo esc_html( $textos['etiqueta_ocultar_controles'] ); ?></button>
		<div id="bitacora-xp-controles" class="mt-1">
			<p class="mb-1"><?php echo esc_html( $textos['descripcion_movimiento'] ); ?></p>
			<ul class="list-unstyled mb-0">
				<li>Mover a Vicente <kbd><?php echo esc_html( $textos['etiqueta_movimiento'] ); ?></kbd></li>
				<li>Interactuar <kbd><?php echo esc_html( $textos['etiqueta_interactuar'] ); ?></kbd></li>
				<li>Abrir el diario <kbd><?php echo esc_html( $textos['etiqueta_diario'] ); ?></kbd></li>
				<li>Cerrar <kbd><?php echo esc_html( $textos['etiqueta_cerrar'] ); ?></kbd></li>
			</ul>
		</div>
	</section>
	<section class="bg-body rounded p-2 overflow-auto pe-auto" aria-labelledby="bitacora-xp-titulo-audio">
		<h2 id="bitacora-xp-titulo-audio" class="h6"><i class="bi bi-volume-up" aria-hidden="true"></i> <?php echo esc_html( $textos['titulo_audio'] ); ?></h2>
		<p class="mb-1"><?php echo esc_html( $textos['descripcion_audio'] ); ?></p>
		<ul class="list-inline mb-0">
			<?php foreach ( array( 'etiqueta_volumen', 'etiqueta_silenciar', 'etiqueta_activar_audio' ) as $campo ) : ?>
				<li class="list-inline-item"><?php echo esc_html( $textos[ $campo ] ); ?></li>
			<?php endforeach; ?>
		</ul>
	</section>
</aside>
