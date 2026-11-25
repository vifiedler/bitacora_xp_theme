<?php
/**
 * Normaliza los elementos vacíos que WordPress emite en la cabecera y la búsqueda.
 *
 * @package bitacora_xp_theme
 */
class Bitacora_XP_HTML_Tags extends WP_HTML_Tag_Processor {
	/**
	 * Quita la barra de cierre sin reescribir atributos, scripts ni estilos.
	 *
	 * @return string
	 */
	public function sin_barras_finales() {
		while ( $this->next_tag() ) {
			if ( ! $this->has_self_closing_flag() || ! in_array( $this->get_tag(), array( 'META', 'LINK', 'INPUT' ), true ) ) {
				continue;
			}

			$this->set_bookmark( 'etiqueta' );
			$tag = $this->bookmarks['etiqueta'];
			// El analizador ya identificó la barra como parte de "/>", fuera de los atributos.
			$this->lexical_updates[] = new WP_HTML_Text_Replacement( $tag->start + $tag->length - 2, 1, '' );
		}

		return $this->get_updated_html();
	}
}
