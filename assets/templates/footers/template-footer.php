<footer id="colophon" class="footer pt-5 pb-5">
    <div class="container">
        <?php if ( is_active_sidebar( 'footer_5' ) ) : ?>
        <div class="row mb-5 pb-4">
            <div class="col-md-7">
                <h2 class="fs-5">Join our newsletter</h2>
                <p>Stay updated with our latest templates and offers—join our newsletter today!</p>
            </div>
                    <!-- columna 5 correo -->
                    <?php dynamic_sidebar('footer_5'); ?>
                    <!-- columna 5 correo -->
        </div>
        <?php endif; ?>

        <?php if ( is_active_sidebar( 'footer_1' ) || is_active_sidebar( 'footer_2' ) || is_active_sidebar( 'footer_3' ) || is_active_sidebar( 'footer_4' ) ) : ?>
        <div class="row justify-content-between mb-5 g-xl-5">
            <?php if (is_active_sidebar('footer_2')):
                dynamic_sidebar('footer_2');
            endif; ?>
            <div class="col-md-7">
                <div class="row g-2">

                    <!-- columna 1 company -->
                    <?php if (is_active_sidebar('footer_1')):
                        dynamic_sidebar('footer_1');
                    endif; ?>
                    <!-- columna 1 company -->
                    <!-- columna 3 accounts -->
                    <?php if (is_active_sidebar('footer_3')):
                        dynamic_sidebar('footer_3');
                    endif; ?>
                    <!-- columna 3 accounts -->
                    <!-- columna 4 contacto -->
                    <?php if (is_active_sidebar('footer_4')):
                        dynamic_sidebar('footer_4');
                    endif; ?>
                </div>
            </div>
        </div>
        <?php endif; ?>
        <?php get_template_part( 'assets/templates/footers/footer-creditos' ); ?>
    </div>
</footer>
