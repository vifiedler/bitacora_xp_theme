<?php
/** Panel compartido por los cuatro escenarios. */
$pagina = get_page_by_path( 'controles', OBJECT, array( 'page' ) );
$textos = array(
	'titulo_movimiento'          => 'Controles',
	'descripcion_movimiento'     => 'Camina hasta una salida para cambiar de mapa.',
	'etiqueta_movimiento'        => 'WASD / Flechas',
	'etiqueta_interactuar'       => 'E / Enter',
	'etiqueta_diario'            => 'Abrir diario de descubrimiento',
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
// Las primeras versiones de la página guardaban la tecla en esta etiqueta.
if ( 'J' === strtoupper( trim( $textos['etiqueta_diario'] ) ) ) {
	$textos['etiqueta_diario'] = 'Abrir diario de descubrimiento';
}
?>
<div id="bitacora-xp-hud" class="position-fixed pe-none z-2" hidden>
	<aside id="bitacora-xp-panel-controles" class="hud-caja" aria-labelledby="bitacora-xp-titulo-movimiento">
		<div class="hud-titulo-controles d-flex align-items-center justify-content-between gap-1">
			<h2 id="bitacora-xp-titulo-movimiento"><?php echo esc_html( $textos['titulo_movimiento'] ); ?></h2>
			<button type="button" id="bitacora-xp-alternar-controles" aria-controls="bitacora-xp-controles" aria-expanded="true" aria-label="<?php echo esc_attr( $textos['etiqueta_ocultar_controles'] ); ?>"><?php echo esc_html( 'Ocultar controles' === $textos['etiqueta_ocultar_controles'] ? 'Ocultar' : $textos['etiqueta_ocultar_controles'] ); ?></button>
		</div>
		<div id="bitacora-xp-controles" class="text-start">
			<p class="visually-hidden"><?php echo esc_html( $textos['descripcion_movimiento'] ); ?></p>
			<p class="row row-cols-2 g-0 align-items-center m-0 py-1 lh-sm"><span class="col d-flex flex-wrap align-items-center hud-movimiento"><?php foreach ( array_filter( array_map( 'trim', explode( '/', $textos['etiqueta_movimiento'] ) ) ) as $teclas ) : ?>
					<kbd><?php if ( 'flechas' === strtolower( $teclas ) ) : ?><span aria-hidden="true">↑↓←→</span><span class="visually-hidden"><?php echo esc_html( $teclas ); ?></span><?php else : ?><?php echo esc_html( $teclas ); ?><?php endif; ?></kbd>
				<?php endforeach; ?></span> <span class="col">Mover</span></p>
			<p class="row row-cols-2 g-0 align-items-center m-0 py-1 lh-sm"><span class="col pe-1"><kbd><?php echo esc_html( $textos['etiqueta_interactuar'] ); ?></kbd></span> <span class="col">Interactuar</span></p>
			<p class="row row-cols-2 g-0 align-items-center m-0 py-1 lh-sm"><span class="col pe-1"><kbd id="bitacora-xp-tecla-diario"></kbd></span> <span class="col"><?php if ( 'Abrir diario de descubrimiento' === $textos['etiqueta_diario'] ) : ?><span aria-hidden="true">Diario</span><span class="visually-hidden"><?php echo esc_html( $textos['etiqueta_diario'] ); ?></span><?php else : ?><?php echo esc_html( $textos['etiqueta_diario'] ); ?><?php endif; ?></span></p>
			<p class="row row-cols-2 g-0 align-items-center m-0 py-1 lh-sm"><span class="col pe-1"><kbd><?php echo esc_html( $textos['etiqueta_cerrar'] ); ?></kbd></span> <span class="col">Cerrar</span></p>
		</div>
	</aside>
	<nav class="hud-barra hud-caja d-flex align-items-stretch" aria-label="Navegación del escenario">
		<a id="bitacora-xp-inicio" href="<?php echo esc_url( bitacora_xp_enlace_mapa( 'plaza-central' ) ); ?>"><i class="bi bi-house-fill" aria-hidden="true"></i> Inicio</a>
		<button type="button" id="bitacora-xp-abrir-diario" aria-label="Abrir diario de descubrimiento"><i class="bi bi-book" aria-hidden="true"></i> Diario</button>
		<button type="button" id="bitacora-xp-alternar-audio" aria-expanded="false" aria-controls="bitacora-xp-audio"><i class="bi bi-volume-up-fill" aria-hidden="true"></i> Audio</button>
	</nav>
	<section id="bitacora-xp-audio" class="hud-caja p-2 d-none" aria-labelledby="bitacora-xp-titulo-audio">
		<h2 id="bitacora-xp-titulo-audio"><?php echo esc_html( $textos['titulo_audio'] ); ?></h2>
		<p><?php echo esc_html( $textos['descripcion_audio'] ); ?></p>
		<ul class="mb-0">
			<?php foreach ( array( 'etiqueta_volumen', 'etiqueta_silenciar', 'etiqueta_activar_audio' ) as $campo ) : ?>
				<li><?php echo esc_html( $textos[ $campo ] ); ?></li>
			<?php endforeach; ?>
		</ul>
	</section>
	<p id="bitacora-xp-ubicacion" class="hud-caja m-0" aria-hidden="true"></p>
	<p id="bitacora-xp-interaccion" class="hud-caja m-0" aria-hidden="true" hidden><kbd>E / Enter</kbd> Interactuar</p>
</div>
