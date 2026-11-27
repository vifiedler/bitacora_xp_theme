(function () {
  'use strict';

  const panel = document.getElementById('bitacora-xp-lectura');
  if (!panel) return;
  const titulo = panel.querySelector('h2');
  const cabecera = panel.querySelector('.diario-cabecera');
  const formulario = panel.querySelector('form[method="dialog"]');
  const botonCerrar = formulario.querySelector('button');
  const nombreCerrar = botonCerrar.getAttribute('aria-label');
  const contenido = panel.querySelector('.contenido-lectura');
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const movimiento = {
    apertura: { y: 10, duration: 0.4, ease: 'power3.out' },
    cierre: { y: 6, duration: 0.25, ease: 'power2.in' },
  };
  let animacion;
  let desplazamiento;
  function detenerScroll() {
    desplazamiento?.kill();
    desplazamiento = null;
  }

  function prepararScroll(region) {
    let destino = 0;
    region.addEventListener('wheel', evento => {
      if (cerrando || movimientoReducido.matches || evento.ctrlKey || !evento.deltaY ||
          Math.abs(evento.deltaX) > Math.abs(evento.deltaY)) return;
      const limite = region.scrollHeight - region.clientHeight;
      if (!limite || (evento.deltaY < 0 && region.scrollTop <= 0) ||
          (evento.deltaY > 0 && region.scrollTop >= limite - 1)) {
        detenerScroll();
        return;
      }
      const unidad = evento.deltaMode === 1 ? parseFloat(getComputedStyle(region).lineHeight)
        : evento.deltaMode === 2 ? region.clientHeight : 1;
      destino = Math.min(limite, Math.max(0, (desplazamiento ? destino : region.scrollTop) + evento.deltaY * unidad));
      evento.preventDefault();
      detenerScroll();
      desplazamiento = gsap.to(region, {
        scrollTop: destino, duration: 0.3, ease: 'power2.out',
        onComplete: () => { desplazamiento = null; },
      });
    }, { passive: false });
    region.addEventListener('keydown', detenerScroll);
    region.addEventListener('pointerdown', detenerScroll);
  }
  let cerrando = false;
  let tipoLectura;
  let lecturaActual;
  let consulta = 0;

  function mostrarCabeceraDiario(visible) {
    if (visible === panel.hasAttribute('data-diario')) return;
    const conservarFoco = panel.open && document.activeElement === botonCerrar;
    panel.toggleAttribute('data-diario', visible);
    contenido.setAttribute('aria-live', visible ? 'off' : 'polite');
    cabecera.hidden = !visible;
    cabecera.classList.toggle('d-flex', visible);
    botonCerrar.type = visible ? 'button' : 'submit';
    botonCerrar.classList.toggle('btn-close', !visible);
    botonCerrar.textContent = visible ? 'Cerrar' : '';
    botonCerrar.setAttribute('aria-label', visible ? 'Cerrar diario de descubrimientos' : nombreCerrar);
    panel.setAttribute('aria-labelledby', visible ? 'diario-encabezado' : titulo.id);
    if (visible) cabecera.append(formulario);
    else panel.prepend(formulario);
    if (conservarFoco) botonCerrar.focus({ preventScroll: true });
  }

  function limpiarAnimacion() {
    if (!animacion) return;
    animacion.kill();
    animacion = null;
    gsap.set(panel, { clearProps: 'opacity,transform' });
  }

  function limpiarLectura() {
    ++consulta;
    limpiarAnimacion();
    detenerScroll();
    delete panel.dataset.hito;
    mostrarCabeceraDiario(false);
    lecturaActual = null;
    tipoLectura = null;
    cerrando = false;
    contenido.replaceChildren();
  }

  function cancelar() {
    limpiarLectura();
    BitacoraXPDialogo.cancelar();
    if (panel.open) panel.close();
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
    detenerScroll();
    const turno = ++consulta;
    const pendiente = lecturaActual;
    function terminarCierre() {
      if (!panel.open || turno !== consulta) return;
      limpiarLectura();
      panel.close();
      if (!pendiente) return;
      BitacoraXPDialogo.abrir('Vicente', async () => {
        const lectura = await pendiente.catch(() => null);
        return lectura?.reflexion ? { hablante: 'Vicente', texto: lectura.reflexion } : null;
      }, '¿Qué aprendí?');
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
  formulario.addEventListener('submit', solicitarCierre);
  botonCerrar.addEventListener('click', () => {
    if (botonCerrar.type === 'button') formulario.requestSubmit();
  });
  panel.addEventListener('close', () => {
    if (!panel.open) limpiarLectura();
  });
  movimientoReducido.addEventListener('change', () => {
    if (movimientoReducido.matches) {
      detenerScroll();
      animacion?.progress(1);
    }
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
    if (panel.open) return;
    limpiarAnimacion();
    cerrando = false;
    const turno = ++consulta;
    tipoLectura = tipo;
    if (tipo === 'hitos') panel.dataset.hito = '';
    titulo.textContent = tituloInicial;
    contenido.textContent = 'Cargando…';
    mostrarCabeceraDiario(tipo === 'diario');
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
      if (tipo === 'diario') {
        bootstrap.Tab.getOrCreateInstance(contenido.querySelector('[role="tab"]')).show();
      }
    } catch (error) {
      if (turno !== consulta || !panel.open) return;
      mostrarCabeceraDiario(false);
      lecturaActual = null;
      contenido.textContent = 'No se pudo cargar el contenido. Cierra y vuelve a intentarlo.';
      console.error('[Bitácora XP] Error de lectura:', error);
    }
  }

  function abrirDiario() {
    mostrar('Diario de descubrimientos', 'diario', BitacoraXPDiario.leer);
  }

  function interactuar(capa, codigo, mundo) {
    if (panel.open) return;
    if (capa === 'npc' || capa === 'descubrimientos') {
      mostrarCabeceraDiario(false);
      ++consulta;
      BitacoraXPDialogo.abrir(capa === 'npc' ? 'Personaje' : 'Descubrimiento', async () => {
        if (capa === 'npc') {
          const npc = await BitacoraXPData.obtenerNPC(mundo, codigo);
          if (!npc) throw new Error('NPC sin datos: ' + codigo);
          return { hablante: npc.nombre, texto: npc.dialogo };
        }
        const { descubrimientos } = await BitacoraXPDescubrimientos.obtenerTodos();
        const entrada = descubrimientos.find((extra) => extra.codigo === codigo && extra.mundo === mundo);
        if (!entrada) throw new Error('Descubrimiento sin datos: ' + codigo);
        return { hablante: entrada.titulo, texto: entrada.contenido,
          alPresentar: () => BitacoraXPDiario.registrar(entrada.codigo, descubrimientos) };
      });
      return;
    }
    mostrar('Interacción', capa, async () => {
      const hitos = await BitacoraXPData.obtenerTodosHitos();
      const hito = hitos.find((entrada) => entrada.codigo === codigo);
      if (!hito) throw new Error('Hito sin datos: ' + codigo);
      const cuerpo = document.createElement('section');
      cuerpo.className = 'hito-ventana d-flex flex-column h-100';
      const datos = elemento('p', window.BitacoraXPEscenario.mapas[mundo]?.nombre || '');
      datos.className = 'hito-datos text-uppercase';
      if (hito.fecha) {
        const fecha = elemento('time', new Intl.DateTimeFormat('es-CL', {
          dateStyle: 'long', timeZone: 'UTC',
        }).format(new Date(hito.fecha + 'T00:00:00Z')));
        fecha.dateTime = hito.fecha;
        datos.append(' / ', fecha);
      }
      const sesion = textoWordPress(hito.titulo).textContent;
      const subtitulo = elemento('h3', sesion);
      subtitulo.id = 'bitacora-xp-sesion';
      const region = document.createElement('div');
      region.className = 'hito-relato';
      region.tabIndex = 0;
      region.setAttribute('role', 'region');
      region.setAttribute('aria-labelledby', subtitulo.id);
      const relato = textoWordPress(hito.queHice);
      if (relato.querySelector('p, ul, ol')) region.append(relato);
      else {
        const parrafo = document.createElement('p');
        parrafo.append(relato);
        region.append(parrafo);
      }
      prepararScroll(region);
      const cerrar = elemento('button', 'Cerrar y leer reflexión');
      cerrar.title = 'Cerrar con E o Enter';
      const flecha = elemento('span', '→');
      flecha.setAttribute('aria-hidden', 'true');
      cerrar.append(' ', flecha);
      cerrar.type = 'submit';
      cerrar.setAttribute('form', 'bitacora-xp-cierre');
      cerrar.className = 'btn hito-cerrar align-self-end mt-auto';
      cuerpo.append(datos, elemento('h2', '¿Qué hice?'), subtitulo, region, cerrar);
      return { titulo: '¿Qué hice? ' + sesion, cuerpo, reflexion: hito.queAprendi };
    });
  }

  document.addEventListener('keydown', (evento) => {
    if (!panel.open || evento.ctrlKey || evento.altKey || evento.metaKey || evento.isComposing) return;
    const narrativo = panel.hasAttribute('data-dialogo');
    const tecla = evento.key.toLowerCase();
    if (narrativo && tecla === 'escape') {
      evento.preventDefault();
      evento.stopPropagation();
      if (!evento.repeat) BitacoraXPDialogo.cerrar();
      return;
    }
    if ((narrativo || tipoLectura === 'hitos') && (tecla === 'e' || tecla === 'enter')) {
      evento.preventDefault();
      evento.stopPropagation();
      if (evento.repeat) return;
      if (narrativo) BitacoraXPDialogo.avanzar();
      else solicitarCierre(evento);
      return;
    }
    if (tecla !== 'j') return;
    evento.preventDefault();
    evento.stopPropagation();
    if (evento.repeat) return;
    if (!narrativo && tipoLectura === 'diario') panel.close();
  }, true);

  window.BitacoraXPLectura = Object.freeze({ abrirDiario, interactuar, cancelar });
}());
