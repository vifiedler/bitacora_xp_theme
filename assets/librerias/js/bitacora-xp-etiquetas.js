(function () {
  'use strict';

  // La capa HTML comparte los bordes del canvas. Un punto del juego se expresa
  // como porcentaje de ese rectángulo, incluso cuando Phaser centra el mapa.
  function puntoEnInterfaz(x, y, tamano) {
    return { izquierda: 100 * x / tamano.width, abajo: 100 * (1 - y / tamano.height) };
  }

  function crearEtiqueta(objeto, hito, objetos, tamano) {
    const centro = objeto.x + objeto.width / 2;
    const punto = puntoEnInterfaz(centro, objeto.y, tamano);
    const ancla = document.createElement('li');
    ancla.className = 'hito-ancla position-absolute translate-middle-x text-center lh-1';
    ancla.dataset.hito = objeto.name;
    ancla.style.left = punto.izquierda + '%';
    ancla.style.bottom = punto.abajo + '%';

    // Limita cada texto al espacio disponible entre hitos de la misma fila.
    let espacio = 2 * Math.min(centro, tamano.width - centro);
    for (const otro of objetos) {
      if (otro === objeto || otro.y + otro.height <= objeto.y || otro.y >= objeto.y + objeto.height) continue;
      espacio = Math.min(espacio, Math.abs(centro - otro.x - otro.width / 2));
    }
    ancla.style.maxWidth = (100 * espacio / tamano.width) + '%';

    const rotulo = document.createElement('span');
    rotulo.className = 'etiqueta-hito d-inline-flex flex-column justify-content-center align-items-center mw-100';
    const fecha = document.createElement('time');
    fecha.dateTime = hito.fecha;
    const [anio, mes, dia] = hito.fecha.split('-');
    fecha.append(dia + '/' + mes);
    const anioVisible = document.createElement('span');
    anioVisible.className = 'visually-hidden';
    anioVisible.textContent = '/' + anio;
    fecha.append(anioVisible);
    const sesion = DOMPurify.sanitize(hito.sesion, { ALLOWED_TAGS: [], RETURN_DOM_FRAGMENT: true }).textContent.trim();
    const titulo = document.createElement('span');
    titulo.className = 'etiqueta-hito-titulo text-truncate w-100';
    titulo.setAttribute('aria-hidden', 'true');
    const palabras = sesion.split(/\s+/);
    titulo.textContent = palabras.slice(0, 2).join(' ') + (palabras.length > 2 ? '…' : '');
    const nombreCompleto = document.createElement('span');
    nombreCompleto.className = 'visually-hidden';
    nombreCompleto.textContent = sesion;
    rotulo.append(fecha, titulo, nombreCompleto);
    ancla.append(rotulo);
    return ancla;
  }

  function mostrar(escena, objetos) {
    if (!objetos.length) return;
    const canvas = escena.game.canvas;
    const contenedor = canvas.parentElement;
    const lista = document.createElement('ul');
    lista.className = 'position-absolute z-1 pe-none list-unstyled m-0 p-0';
    lista.style.transformOrigin = 'top left';
    lista.setAttribute('aria-label', 'Hitos de ' + document.getElementById('bitacora-xp-mundo').textContent);
    contenedor.append(lista);
    let entrada;

    function ajustarCapa() {
      const lienzo = canvas.getBoundingClientRect();
      const marco = contenedor.getBoundingClientRect();
      if (!lienzo.width) return;
      // En pantallas estrechas se reduce la capa completa para conservar espacio entre rótulos.
      const ancho = Math.max(480, lienzo.width);
      const escala = lienzo.width / ancho;
      lista.classList.toggle('hitos-solo-fecha', lienzo.width < 650);
      lista.style.left = (lienzo.left - marco.left) + 'px';
      lista.style.top = (lienzo.top - marco.top) + 'px';
      lista.style.width = ancho + 'px';
      lista.style.height = (lienzo.height / escala) + 'px';
      lista.style.transform = 'scale(' + escala + ')';
    }
    ajustarCapa();
    escena.scale.on('resize', ajustarCapa);

    // El cliente comparte la solicitud en curso y la caché con la carga inicial.
    BitacoraXPData.obtenerTodosHitos().then((hitos) => {
      if (!lista.isConnected) return;
      const rotulos = [];
      for (const objeto of objetos) {
        const hito = hitos.find((fila) => fila.codigo === objeto.name);
        if (!hito?.fecha || !hito.sesion) continue;
        const ancla = crearEtiqueta(objeto, hito, objetos, escena.scale.gameSize);
        lista.append(ancla);
        rotulos.push(ancla.firstElementChild);
      }
      if (rotulos.length) {
        entrada = gsap.from(rotulos, {
          opacity: 0, y: 6, duration: 0.4, ease: 'back.out(1.3)', stagger: 0.06,
        });
      }
    }).catch((error) => console.error('[Bitácora XP] Error al cargar las etiquetas:', error));

    return () => {
      escena.scale.off('resize', ajustarCapa);
      entrada?.kill();
      lista.remove();
    };
  }

  window.BitacoraXPEtiquetas = Object.freeze({ mostrar });
}());
