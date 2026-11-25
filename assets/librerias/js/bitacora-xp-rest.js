/**
 * Capa de acceso a contenido público WordPress para Bitácora XP.
 * No contiene HUD, mapas, colisiones, lógica de desbloqueos ni HTML de modales.
 * Los campos SCF deben estar habilitados en "Show in REST API".
 */
(function (global) {
  'use strict';

  const settings = global.BitacoraXPConfig || {};
  const worlds = ['gachavault', 'sinapsis', 'entre-versos'];
  const cache = new Map();

  function configured(name) {
    if (!settings[name]) {
      throw new Error(`Bitácora XP: falta configurar ${name}.`);
    }
    return settings[name];
  }

  function requestUrl(base, params = {}) {
    const url = new URL(base, global.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }

  async function fetchJSON(url) {
    if (cache.has(url)) {
      return cache.get(url);
    }
    const promise = fetch(url, {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Bitácora XP: error REST ${response.status} en ${url}`);
      }
      return response.json();
    }).catch((error) => {
      cache.delete(url); // Permite reintentar tras un fallo transitorio.
      throw error;
    });
    cache.set(url, promise);
    return promise;
  }

  function fechaISO(fecha) {
    if (typeof fecha !== 'string') return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
    if (/^\d{8}$/.test(fecha)) {
      return `${fecha.slice(0, 4)}-${fecha.slice(4, 6)}-${fecha.slice(6, 8)}`;
    }
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
  }

  function acfOf(item) {
    return item && item.acf && typeof item.acf === 'object' ? item.acf : {};
  }

  function normalizarHito(item) {
    const acf = acfOf(item);
    return {
      id: item.id,
      codigo: item.slug,
      titulo: item.title?.rendered || '',
      sesion: item.excerpt?.rendered || '',
      fecha: fechaISO(acf.fecha_entrada),
      queHice: acf.que_hice || '',
      queAprendi: acf.que_aprendi || '',
      multimedia: Array.isArray(acf.archivos_multimedia) ? acf.archivos_multimedia : [],
      dialogosExtra: Array.isArray(acf.dialogos_extra) ? acf.dialogos_extra : [],
      categorias: Array.isArray(item.categories) ? item.categories : [],
    };
  }

  function validarMundo(mundo) {
    if (!worlds.includes(mundo)) {
      throw new Error(`Bitácora XP: mundo desconocido: ${mundo}`);
    }
    return mundo;
  }

  async function obtenerHito(codigo) {
    const slug = String(codigo || '').trim();
    if (!/^(gv-0[1-6]|sn-0[1-5]|ev-0[1-3])$/.test(slug)) {
      throw new Error(`Bitácora XP: código de hito no válido: ${slug}`);
    }
    const rows = await fetchJSON(requestUrl(configured('postsUrl'), { slug, per_page: 1 }));
    if (!rows.length) throw new Error(`Bitácora XP: no se encontró el hito ${slug}.`);
    return normalizarHito(rows[0]);
  }

  async function obtenerHitosMundo(mundo) {
    const slug = validarMundo(mundo);
    const categorias = await fetchJSON(requestUrl(configured('categoriesUrl'), { slug, per_page: 1 }));
    if (!categorias.length) throw new Error(`Bitácora XP: categoría inexistente: ${slug}.`);
    const rows = await fetchJSON(requestUrl(configured('postsUrl'), {
      categories: categorias[0].id,
      per_page: 100,
    }));
    return rows.map(normalizarHito).sort((a, b) => a.codigo.localeCompare(b.codigo));
  }

  async function obtenerPaginaMundo(mundo) {
    const slug = `mundo-${validarMundo(mundo)}`;
    const rows = await fetchJSON(requestUrl(configured('pagesUrl'), { slug, per_page: 1 }));
    if (!rows.length) throw new Error(`Bitácora XP: página no publicada: ${slug}.`);
    const page = rows[0];
    const personajes = acfOf(page).dialogos_npc;
    return {
      id: page.id,
      slug: page.slug,
      nombre: page.title?.rendered || '',
      personajes: Array.isArray(personajes) ? personajes : [],
    };
  }

  async function obtenerNPC(mundo, npcId) {
    const page = await obtenerPaginaMundo(mundo);
    const npc = page.personajes.find((personaje) => personaje.npc_id === npcId);
    return npc ? {
      id: npc.npc_id,
      nombre: npc.npc_nombre || '',
      dialogo: npc.npc_dialogo || '',
      emote: npc.npc_emote || '',
    } : null;
  }

  function limpiarCache() {
    cache.clear();
  }

  // El endpoint de extras se añadirá cuando se configure la BD independiente.
  global.BitacoraXPData = Object.freeze({
    obtenerHito,
    obtenerHitosMundo,
    obtenerPaginaMundo,
    obtenerNPC,
    limpiarCache,
  });
})(window);
