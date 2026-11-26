<?php
/** Menús Bootstrap del tema Bitácora XP. */

function bitacora_xp_estilos_menus() {
    if ( is_front_page() ) {
        return;
    }
    $ruta = '/assets/templates/navs/nav.css';
    wp_enqueue_style( 'bitacora-xp-nav', get_template_directory_uri() . $ruta, array( 'bitacora-xp-bootstrap' ), (string) filemtime( get_template_directory() . $ruta ) );
}
add_action( 'wp_enqueue_scripts', 'bitacora_xp_estilos_menus' );

function bitacora_xp_menus() {
    register_nav_menus( array(
        'menu-superior' => __( 'Menú superior', 'bitacora_xp_theme' ),
        'menu-mobile'   => __( 'Menú móvil', 'bitacora_xp_theme' ),
    ) );
}
add_action( 'after_setup_theme', 'bitacora_xp_menus' );

// Conservar la asignación anterior mientras se configura cada ubicación nueva.
function bitacora_xp_ubicacion_menu( $movil = false ) {
    if ( $movil && has_nav_menu( 'menu-mobile' ) ) {
        return 'menu-mobile';
    }
    return has_nav_menu( 'menu-superior' ) ? 'menu-superior' : 'menu-1';
}


/*menu wordpress*/
class Bitacora_XP_Nav_Menu_Walker extends Walker_Nav_Menu
{

    private $dropdown_icon = '<i class="bi bi-chevron-down" aria-hidden="true"></i>';

    // La portada también ofrece la lista de páginas cuando aún no hay un menú asignado.
    public static function fallback($args)
    {
        $args['walker'] = '';
        $args['container'] = 'ul';
        $args['before'] = '';
        $args['after'] = '';
        $args['depth'] = -1;
        return wp_page_menu($args);
    }

    public function start_lvl(&$output, $depth = 0, $args = null)
    {
        $indent = str_repeat("\t", $depth);
        $submenu = ($depth > 0) ? ' sub-menu' : '';
        $output .= "\n$indent<ul class=\"dropdown-menu$submenu depth_$depth\">\n";
    }

    public function start_el(&$output, $item, $depth = 0, $args = null, $id = 0)
    {
        $indent = ($depth) ? str_repeat("\t", $depth) : '';

        $classes = empty($item->classes) ? array() : (array) $item->classes;
        $classes[] = 'nav-item';
        $dropdown = $this->has_children && (0 === $args->depth || $depth + 1 < $args->depth);
        if ($dropdown) {
            $classes[] = 'dropdown';
        }
        if (in_array('current-menu-item', $classes)) {
            $classes[] = 'active';
        }
        $classes = array_filter($classes);
        $class_names = join(' ', apply_filters('nav_menu_css_class', $classes, $item, $args, $depth));
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';

        $id = apply_filters('nav_menu_item_id', $args->menu_id . '-item-' . $item->ID, $item, $args, $depth);
        $id = $id ? ' id="' . esc_attr($id) . '"' : '';

        $output .= $indent . '<li' . $id . $class_names . '>';

        $atts = array();
        $atts['title'] = !empty($item->attr_title) ? $item->attr_title : '';
        $atts['target'] = !empty($item->target) ? $item->target : '';
        $atts['rel'] = !empty($item->xfn) ? $item->xfn : '';
        $atts['href'] = !empty($item->url) ? $item->url : '';

        if ($item->current) {
            $atts['aria-current'] = 'page';
        }
        if ($dropdown) {
            $atts['data-bs-toggle'] = 'dropdown';
            $atts['class'] = 'nav-link dropdown-toggle';
            $atts['aria-expanded'] = 'false';
        } else {
            $atts['class'] = $depth ? 'dropdown-item' : 'nav-link';
        }

        $atts = apply_filters('nav_menu_link_attributes', $atts, $item, $args, $depth);
        $attributes = '';
        foreach ($atts as $attr => $value) {
            if (!empty($value)) {
                $value = ('href' === $attr) ? esc_url($value) : esc_attr($value);
                $attributes .= ' ' . $attr . '="' . $value . '"';
            }
        }

        $item_output = $args->before;
        $item_output .= '<a' . $attributes . '>';
        $title = apply_filters('the_title', $item->title, $item->ID);
        $item_output .= $args->link_before . apply_filters('nav_menu_item_title', $title, $item, $args, $depth) . $args->link_after;
        $item_output .= $dropdown ? ' ' . $this->dropdown_icon : '';
        $item_output .= '</a>';
        $item_output .= $args->after;

        $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
    }
}
/*menu wordpress*/
