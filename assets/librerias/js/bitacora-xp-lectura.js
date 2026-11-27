(function () {
  'use strict';

  const panel = document.getElementById('bitacora-xp-lectura');
  if (!panel) return;
  const titulo = panel.querySelector('h2');
  const contenido = panel.querySelector('.contenido-lectura');
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const movimiento = {
    apertura: { y: 10, duration: 0.6, ease: 'power2.out' },
    cierre: { y: 6, duration: 0.6, ease: 'power2.in' },
  };
  let animacion;
  let cerrando = false;
  let tipoLectura;
  let lecturaActual;
  let consulta = 0;

  function limpiarAnimacion() {
    if (!animacion) return;
    animacion.kill();
    animacion = null;
    gsap.set(panel, { clearProps: 'opacity,transform' });
  }

  function solicitarCierre(evento) {
    if (panel.hasAttribute('data-dialogo')) {
      evento.preventDefault();
      BitacoraXPDialogo.cerrar();
      return;
    }
    if (tipoLectura !== 'hitos') return;
    evento.preventDefault();
    if (cerrando || !panel.open) return;
    cerrando = true;
    const turno = ++consulta;
    const pendiente = lecturaActual;
    const escenario = document.getElementById('bitacora-xp-escenario');
    const mundo = escenario.dataset.mundo;
    async function terminarCierre() {
      if (!panel.open || turno !== consulta) return;
      limpiarAnimacion();
      panel.close();
      cerrando = false;
      const lectura = await pendiente.catch(() => null);
      if (turno === consulta && mundo === escenario.dataset.mundo && !panel.open && lectura?.reflexion) {
        contenido.replaceChildren();
        BitacoraXPDialogo.abrir('¿Qué aprendí?', lectura.reflexion);
      }
    }
    if (movimientoReducido.matches) {
      terminarCierre();
      return;
    }
    // Si la entrada sigue activa, la salida parte de su posición y opacidad actuales.
    animacion?.kill();
    animacion = gsap.to(panel, {
      ...movimiento.cierre, opacity: 0, onComplete: terminarCierre,
    });
  }

  panel.addEventListener('cancel', solicitarCierre);
  panel.querySelector('form[method="dialog"]').addEventListener('submit', solicitarCierre);
  panel.addEventListener('close', () => {
    if (panel.open) return;
    limpiarAnimacion();
    cerrando = false;
  });
  movimientoReducido.addEventListener('change', () => {
    if (movimientoReducido.matches) animacion?.progress(1);
  });

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

  async function mostrar(tituloInicial, tipo, cargar) {
    if (panel.hasAttribute('data-dialogo')) return;
    if (panel.open && (cerrando || tipo !== 'diario' || tipoLectura === 'diario')) return;
    limpiarAnimacion();
    cerrando = false;
    const turno = ++consulta;
    tipoLectura = tipo;
    titulo.textContent = tituloInicial;
    contenido.textContent = 'Cargando…';
    if (!panel.open) panel.showModal();
    panel.scrollTop = 0;
    if (tipo === 'hitos' && !movimientoReducido.matches) {
      const { y, duration, ease } = movimiento.apertura;
      animacion = gsap.fromTo(panel, { opacity: 0, y }, {
        opacity: 1, y: 0, duration, ease, clearProps: 'opacity,transform',
      });
    }
    try {
      lecturaActual = cargar();
      const lectura = await lecturaActual;
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
    mostrar('Diario de descubrimientos', 'diario', async () => {
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
    if (panel.open) return;
    if (capa === 'npc' || capa === 'descubrimientos') {
      ++consulta;
      BitacoraXPDialogo.abrir(capa === 'npc' ? 'Personaje' : 'Descubrimiento', async () => {
        if (capa === 'npc') {
          const npc = await BitacoraXPData.obtenerNPC(mundo, codigo);
          if (!npc) throw new Error('NPC sin datos: ' + codigo);
          return { hablante: npc.nombre, texto: npc.dialogo };
        }
        const { descubrimientos } = await BitacoraXPDescubrimientos.obtenerTodos();
        const entrada = descubrimientos.find((extra) => extra.codigo === codigo);
        if (!entrada) throw new Error('Descubrimiento sin datos: ' + codigo);
        return { hablante: entrada.titulo, texto: entrada.contenido };
      });
      return;
    }
    mostrar('Interacción', capa, async () => {
      const hitos = await BitacoraXPData.obtenerTodosHitos();
      const hito = hitos.find((entrada) => entrada.codigo === codigo);
      if (!hito) throw new Error('Hito sin datos: ' + codigo);
      const cuerpo = document.createElement('section');
      const relato = textoWordPress(hito.queHice);
      cuerpo.append(elemento('h2', '¿Qué hice?'));
      if (relato.querySelector('p, ul, ol')) cuerpo.append(relato);
      else {
        const parrafo = document.createElement('p');
        parrafo.append(relato);
        cuerpo.append(parrafo);
      }
      const cerrar = elemento('button', 'Cerrar - E / Enter');
      cerrar.type = 'submit';
      cerrar.setAttribute('form', 'bitacora-xp-cierre');
      cerrar.className = 'btn btn-link btn-sm mt-2';
      cuerpo.append(cerrar);
      return { titulo: textoWordPress(hito.titulo).textContent, cuerpo, reflexion: hito.queAprendi };
    });
  }

  panel.addEventListener('keydown', (evento) => {
    if (evento.ctrlKey || evento.altKey || evento.metaKey || evento.isComposing) return;
    const narrativo = panel.hasAttribute('data-dialogo');
    const tecla = evento.key.toLowerCase();
    if (narrativo && tecla === 'escape' && evento.repeat) evento.preventDefault();
    if ((narrativo || tipoLectura === 'hitos') && (tecla === 'e' || tecla === 'enter')) {
      evento.preventDefault();
      evento.stopPropagation();
      if (evento.repeat) return;
      if (narrativo) BitacoraXPDialogo.avanzar();
      else solicitarCierre(evento);
      return;
    }
    if (narrativo || tecla !== 'j') return;
    evento.preventDefault();
    if (evento.repeat) return;
    if (tipoLectura === 'diario') panel.close();
    else abrirDiario();
  });

  window.BitacoraXPLectura = Object.freeze({ abrirDiario, interactuar });
}());
