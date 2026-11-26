(function () {
  'use strict';

  const panel = document.getElementById('bitacora-xp-lectura');
  if (!panel) return;
  const titulo = panel.querySelector('h2');
  const contenido = panel.querySelector('.contenido-lectura');
  let consulta = 0;
  let diarioAbierto = false;

  function elemento(etiqueta, texto) {
    const nodo = document.createElement(etiqueta);
    nodo.textContent = texto;
    return nodo;
  }

  function textoWordPress(html) {
    return DOMPurify.sanitize(html, {
      RETURN_DOM_FRAGMENT: true,
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
    });
  }

  async function mostrar(tituloInicial, esDiario, cargar) {
    const turno = ++consulta;
    diarioAbierto = esDiario;
    titulo.textContent = tituloInicial;
    contenido.textContent = 'Cargando…';
    if (!panel.open) panel.showModal();
    panel.scrollTop = 0;
    try {
      const lectura = await cargar();
      if (turno !== consulta || !panel.open) return;
      titulo.textContent = lectura.titulo;
      contenido.replaceChildren(lectura.cuerpo);
    } catch (error) {
      if (turno !== consulta || !panel.open) return;
      contenido.textContent = 'No se pudo cargar el contenido. Cierra y vuelve a intentarlo.';
      console.error('[Bitácora XP] Error de lectura:', error);
    }
  }

  function abrirDiario() {
    mostrar('Diario de descubrimientos', true, async () => {
      const { descubrimientos } = await BitacoraXPDescubrimientos.obtenerTodos();
      const cuerpo = document.createDocumentFragment();
      for (const entrada of descubrimientos) {
        const detalle = document.createElement('details');
        detalle.append(elemento('summary', entrada.titulo), elemento('p', entrada.contenido));
        cuerpo.append(detalle);
      }
      if (!descubrimientos.length) cuerpo.append('Todavía no hay descubrimientos publicados.');
      return { titulo: 'Diario de descubrimientos', cuerpo };
    });
  }

  function interactuar(capa, codigo, mundo) {
    mostrar('Interacción', false, async () => {
      if (capa === 'npc') {
        const npc = await BitacoraXPData.obtenerNPC(mundo, codigo);
        if (!npc) throw new Error('NPC sin datos: ' + codigo);
        return { titulo: npc.nombre, cuerpo: textoWordPress(npc.dialogo) };
      }
      if (capa === 'descubrimientos') {
        const { descubrimientos } = await BitacoraXPDescubrimientos.obtenerTodos();
        const entrada = descubrimientos.find((extra) => extra.codigo === codigo);
        if (!entrada) throw new Error('Descubrimiento sin datos: ' + codigo);
        return { titulo: entrada.titulo, cuerpo: elemento('p', entrada.contenido) };
      }
      const hitos = await BitacoraXPData.obtenerTodosHitos();
      const hito = hitos.find((entrada) => entrada.codigo === codigo);
      if (!hito) throw new Error('Hito sin datos: ' + codigo);
      const cuerpo = document.createDocumentFragment();
      cuerpo.append(elemento('h3', '¿Qué hice?'), textoWordPress(hito.queHice),
        elemento('h3', '¿Qué aprendí?'), textoWordPress(hito.queAprendi));
      return { titulo: textoWordPress(hito.titulo).textContent, cuerpo };
    });
  }

  panel.addEventListener('keydown', (evento) => {
    if (evento.key.toLowerCase() !== 'j' || evento.ctrlKey || evento.altKey || evento.metaKey) return;
    evento.preventDefault();
    if (evento.repeat) return;
    if (diarioAbierto) panel.close();
    else abrirDiario();
  });

  window.BitacoraXPLectura = Object.freeze({ abrirDiario, interactuar });
}());
