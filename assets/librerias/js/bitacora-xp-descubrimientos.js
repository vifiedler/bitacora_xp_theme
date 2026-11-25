/**
 * Cliente AJAX de la API PHP independiente /api-bitacora/.
 * JavaScript NO accede directamente a MySQL ni necesita conocer sus credenciales.
 * El servicio devuelve { total: number, descubrimientos: [] }.
 */
(function (global) {
  'use strict';

  const config = global.BitacoraXPExtrasConfig || {};
  const mundos = ['gachavault', 'sinapsis', 'entre-versos'];
  const cache = new Map();

  function urlConsulta(parametros = {}) {
    if (!config.endpoint) {
      throw new Error('Bitácora XP: falta configurar la URL de api-bitacora.');
    }

    const url = new URL(config.endpoint, global.location.href);

    // La API y WordPress están en el mismo origen, en carpetas hermanas.
    if (url.origin !== global.location.origin) {
      throw new Error('Bitácora XP: el endpoint debe estar en el mismo dominio.');
    }

    Object.entries(parametros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.set(clave, String(valor));
      }
    });
    return url.toString();
  }

  async function solicitar(parametros = {}) {
    const url = urlConsulta(parametros);
    if (cache.has(url)) return cache.get(url);

    const peticion = fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'omit',
    }).then(async (respuesta) => {
      if (!respuesta.ok) {
        throw new Error(`Bitácora XP: error HTTP ${respuesta.status} en api-bitacora.`);
      }

      const datos = await respuesta.json(); // Convierte JSON en objeto JavaScript.
      if (!datos || !Array.isArray(datos.descubrimientos)
          || typeof datos.total !== 'number') {
        throw new Error('Bitácora XP: la API devolvió un formato inesperado.');
      }
      return datos;
    }).catch((error) => {
      cache.delete(url); // Si falla, la próxima llamada puede reintentar.
      throw error;
    });

    cache.set(url, peticion);
    return peticion;
  }

  function obtenerTodos() {
    return solicitar();
  }

  function obtenerPorMundo(mundo) {
    if (!mundos.includes(mundo)) {
      throw new Error(`Bitácora XP: mundo desconocido: ${mundo}`);
    }
    return solicitar({ mundo });
  }

  function obtenerPorCodigo(codigo) {
    if (!/^extra_(gv|sn|ev)_0[1-7]$/.test(String(codigo))) {
      throw new Error(`Bitácora XP: código inválido: ${codigo}`);
    }
    return solicitar({ codigo });
  }

  function limpiarCache() {
    cache.clear();
  }

  global.BitacoraXPDescubrimientos = Object.freeze({
    obtenerTodos,
    obtenerPorMundo,
    obtenerPorCodigo,
    limpiarCache,
  });
})(window);
