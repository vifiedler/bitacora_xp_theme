(function () {
  'use strict';

  const vista = document.getElementById('bitacora-xp-dialogo');
  if (!vista) return;
  const panel = vista.closest('dialog');
  const nombre = vista.querySelector('h2');
  const texto = vista.querySelector('.dialogo-texto');
  const anuncio = vista.querySelector('.dialogo-anuncio');
  const boton = vista.querySelector('button');
  const tituloOriginal = panel.getAttribute('aria-labelledby');
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tiempos = { escritura: 30, apertura: 0.3, cierre: 0.2, cambio: 0.18 };
  let estado = 'closed';
  let parrafos = [];
  let indice = 0;
  let animacion;
  let escritura;
  let observador;
  let eventos;

  function separarParrafos(cadena) {
    const fuente = cadena.replace(/\r\n?/g, '\n');
    if (!/^\s*(?:<!--[\s\S]*?-->\s*)*<(?:p|div|br)\b/i.test(fuente)) {
      return fuente.split(/[\n\u2029]+/).map(p => p.trim()).filter(Boolean);
    }
    const fragmento = DOMPurify.sanitize(fuente, {
      RETURN_DOM_FRAGMENT: true, ALLOWED_TAGS: ['p', 'div', 'br'], ALLOWED_ATTR: [],
    });
    for (const salto of fragmento.querySelectorAll('br')) salto.replaceWith('\n');
    for (const bloque of fragmento.querySelectorAll('p, div')) {
      bloque.prepend('\u2029');
      bloque.append('\u2029');
    }
    return fragmento.textContent.split('\u2029').map(p => p.trim()).filter(Boolean);
  }

  function detenerEscritura() {
    observador?.disconnect();
    observador = null;
    escritura?.destroy();
    escritura = null;
  }

  function completar() {
    if (estado !== 'typing') return;
    detenerEscritura();
    texto.textContent = parrafos[indice];
    anuncio.textContent = parrafos[indice];
    estado = 'waiting';
    boton.textContent = indice + 1 === parrafos.length ? 'Cerrar · E / Enter' : 'Continuar · E / Enter';
  }

  function escribir() {
    estado = 'typing';
    texto.textContent = '';
    anuncio.textContent = '';
    boton.textContent = 'Completar · E / Enter';
    if (reducido.matches) {
      completar();
      return;
    }
    const original = parrafos[indice];
    // Typed interpreta ^ y el acento grave como órdenes incluso en modo texto.
    // Su progreso marca la longitud visible; solo el texto original llega al panel.
    const progreso = document.createElement('span');
    observador = new MutationObserver(() => {
      texto.textContent = original.slice(0, progreso.textContent.length);
    });
    observador.observe(progreso, { childList: true });
    escritura = new Typed(progreso, {
      strings: [original.replace(/[\x60^]/g, '·')], contentType: 'text',
      typeSpeed: tiempos.escritura, loop: false, showCursor: false,
      autoInsertCss: false, onComplete: completar,
    });
  }

  function finalizar() {
    eventos.abort();
    detenerEscritura();
    animacion?.kill();
    animacion = null;
    gsap.set([panel, texto], { clearProps: 'opacity,transform' });
    if (panel.open) panel.close();
    vista.hidden = true;
    panel.removeAttribute('data-dialogo');
    panel.setAttribute('aria-labelledby', tituloOriginal);
    texto.parentElement.replaceChildren(texto);
    texto.textContent = anuncio.textContent = nombre.textContent = '';
    parrafos = [];
    estado = 'closed';
    panel.dispatchEvent(new CustomEvent('bitacora:dialogo-cerrado', { bubbles: true }));
  }

  function cerrar() {
    if (estado === 'closed' || estado === 'closing') return;
    estado = 'closing';
    detenerEscritura();
    animacion?.kill();
    if (reducido.matches || !panel.open) {
      finalizar();
      return;
    }
    animacion = gsap.to(panel, {
      opacity: 0, y: 6, duration: tiempos.cierre, ease: 'power2.in', onComplete: finalizar,
    });
  }

  function avanzar() {
    if (estado === 'typing') {
      completar();
      return;
    }
    if (estado !== 'waiting') return;
    if (indice + 1 === parrafos.length) {
      cerrar();
      return;
    }
    indice++;
    if (reducido.matches) {
      escribir();
      return;
    }
    estado = 'opening';
    animacion = gsap.to(texto, {
      opacity: 0, duration: tiempos.cambio, ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(texto, { clearProps: 'opacity' });
        escribir();
      },
    });
  }

  function abrir(hablante, cadena) {
    if (estado !== 'closed' || panel.open || typeof cadena !== 'string') return false;
    parrafos = separarParrafos(cadena);
    if (!parrafos.length) return false;
    indice = 0;
    estado = 'opening';
    nombre.textContent = hablante;
    boton.textContent = 'Completar · E / Enter';
    for (const parrafo of parrafos) {
      const medida = document.createElement('p');
      medida.className = 'invisible mb-0';
      medida.setAttribute('aria-hidden', 'true');
      medida.textContent = parrafo;
      texto.parentElement.append(medida);
    }
    vista.hidden = false;
    panel.setAttribute('data-dialogo', '');
    panel.setAttribute('aria-labelledby', nombre.id);
    panel.showModal();
    boton.focus({ preventScroll: true });
    eventos = new AbortController();
    const opciones = { signal: eventos.signal };
    boton.addEventListener('click', avanzar, opciones);
    panel.addEventListener('close', () => { if (!panel.open) finalizar(); }, opciones);
    reducido.addEventListener('change', () => {
      if (!reducido.matches) return;
      animacion?.progress(1);
      completar();
    }, opciones);
    if (reducido.matches) escribir();
    else {
      animacion = gsap.fromTo(panel, { opacity: 0, y: 8 }, {
        opacity: 1, y: 0, duration: tiempos.apertura, ease: 'power3.out', onComplete: escribir,
      });
    }
    panel.dispatchEvent(new CustomEvent('bitacora:dialogo-abierto', { bubbles: true }));
    return true;
  }

  window.BitacoraXPDialogo = Object.freeze({ abrir, avanzar, cerrar, get estado() { return estado; } });
}());
