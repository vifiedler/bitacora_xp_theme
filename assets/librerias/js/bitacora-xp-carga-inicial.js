/**
 * Carga inicial de los mapas mediante dos HTTP GET independientes y en paralelo.
 * Petición 1: WordPress REST (/wp-json/wp/v2/posts)
 * Petición 2: API PHP (/api-bitacora/lista_descubrimientos.php)
 * No dibuja la interfaz del juego ni altera la página.
 */
(function (global) {
  'use strict';

  let promesa = null;
  let estado = null;

  function iniciar() {
    if (promesa) return promesa;

    // Iniciar ambas solicitudes ANTES de esperar cualquiera de sus respuestas.
    const cms = global.BitacoraXPData.obtenerTodosHitos();
    const extras = global.BitacoraXPDescubrimientos.obtenerTodos();

    promesa = Promise.allSettled([cms, extras]).then(([resultadoCMS, resultadoExtras]) => {
      estado = {
        hitos: resultadoCMS.status === 'fulfilled' ? resultadoCMS.value : [],
        descubrimientos: resultadoExtras.status === 'fulfilled'
          ? resultadoExtras.value.descubrimientos : [],
        errores: {},
      };

      if (resultadoCMS.status === 'rejected') {
        estado.errores.cms = resultadoCMS.reason;
        console.error('[Bitácora XP] Falló la consulta a WordPress:', resultadoCMS.reason);
      } else {
        console.info(`[Bitácora XP] WordPress: ${estado.hitos.length} entradas recibidas.`);
      }

      if (resultadoExtras.status === 'rejected') {
        estado.errores.externa = resultadoExtras.reason;
        console.error('[Bitácora XP] Falló la consulta a api-bitacora:', resultadoExtras.reason);
      } else {
        console.info(`[Bitácora XP] API externa: ${estado.descubrimientos.length} descubrimientos recibidos.`);
      }

      return estado;
    });

    return promesa;
  }

  global.BitacoraXPCargaInicial = Object.freeze({
    iniciar,
    get estado() { return estado; },
  });

  // PHP encola este archivo al entrar en cualquiera de los mapas.
  iniciar();
})(window);
