(function () {
  'use strict';

  const clave = 'bitacora_xp_progreso_v1';
  const encontrados = new Set();
  let catalogo;
  let vista;

  function recuperar() {
    try {
      const datos = JSON.parse(localStorage.getItem(clave));
      if (Array.isArray(datos?.encontrados)) {
        for (const codigo of datos.encontrados) {
          if (typeof codigo === 'string' && /^extra_[a-z]+_\d+$/.test(codigo)) encontrados.add(codigo);
        }
      }
    } catch {
      // El diario sigue disponible en memoria si el almacenamiento falla.
    }
  }

  function actualizar() {
    if (!vista) return;
    for (const panel of vista.querySelectorAll('.tab-pane')) {
      const filas = panel.querySelectorAll('li[data-codigo]');
      let cantidad = 0;
      for (const fila of filas) {
        const encontrado = encontrados.has(fila.dataset.codigo);
        if (encontrado) {
          cantidad++;
          if (!fila.querySelector('.diario-encontrado')) {
            const entrada = catalogo.find(dato => dato.codigo === fila.dataset.codigo);
            fila.replaceChildren(tarjetaDescubrimiento(panel, entrada));
          }
        } else if (!fila.firstElementChild) {
          fila.append(tarjetaDescubrimiento(panel));
        }
      }
      const porcentaje = filas.length ? cantidad * 100 / filas.length : 0;
      const cantidadTexto = cantidad + ' de ' + filas.length + ' descubrimientos';
      const porcentajeTexto = Math.round(porcentaje) + ' %';
      const contadores = panel.querySelector('.diario-contadores');
      contadores.querySelector('p').textContent = cantidadTexto;
      contadores.querySelector('output').value = porcentajeTexto;
      const barra = panel.querySelector('[role="progressbar"]');
      barra.setAttribute('aria-valuenow', porcentaje);
      barra.setAttribute('aria-valuetext', cantidadTexto + ' · ' + porcentajeTexto);
      barra.firstElementChild.style.width = porcentaje + '%';
    }
  }

  function registrar(codigo, registros) {
    if (!registros.some(entrada => entrada.codigo === codigo)) return;
    recuperar();
    if (!encontrados.has(codigo)) {
      encontrados.add(codigo);
      try {
        localStorage.setItem(clave, JSON.stringify({ encontrados: [...encontrados] }));
      } catch {
        // Se conserva la sesión aunque el navegador rechace la escritura.
      }
    }
    actualizar();
  }

  function tarjetaDescubrimiento(panel, entrada) {
    const tarjeta = document.createElement('article');
    tarjeta.className = entrada ? 'diario-encontrado' : 'diario-pendiente';
    const marca = document.createElement('i');
    marca.className = entrada ? 'bi bi-check-lg' : 'bi bi-question';
    marca.setAttribute('aria-hidden', 'true');
    const titulo = document.createElement(panel.id === 'diario-total' ? 'h5' : 'h4');
    const avance = document.createElement('p');
    avance.className = 'mb-0';
    if (!entrada) {
      titulo.className = 'diario-titulo-descubrimiento mb-0';
      titulo.textContent = 'Sin descubrir';
      avance.textContent = 'Explora este mundo para encontrarlo';
      tarjeta.append(marca, titulo, avance);
      return tarjeta;
    }

    const fila = document.createElement('details');
    fila.className = 'text-break';
    const resumen = document.createElement('summary');
    titulo.className = 'diario-titulo-descubrimiento d-flex flex-wrap justify-content-between align-items-baseline gap-1 mb-0';
    const nombre = document.createElement('span');
    nombre.textContent = entrada.titulo;
    const estado = document.createElement('small');
    estado.textContent = 'Descubierto';
    estado.className = 'ms-auto';
    titulo.append(nombre, estado);
    resumen.append(titulo);
    const contenido = entrada.contenido;
    const texto = document.createElement('p');
    texto.className = 'mt-2 mb-0';
    texto.textContent = contenido;
    fila.append(resumen, texto);
    avance.textContent = contenido.match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0] || contenido;

    tarjeta.append(marca, fila, avance);
    return tarjeta;
  }

  async function leer() {
    const { descubrimientos } = await BitacoraXPDescubrimientos.obtenerTodos();
    if (catalogo !== descubrimientos) {
      catalogo = descubrimientos;
      vista = document.querySelector('#bitacora-xp-plantilla-diario').content.firstElementChild.cloneNode(true);
      const total = vista.querySelector('#diario-total .diario-listas');
      for (const panel of vista.querySelectorAll('.tab-pane:not(#diario-total)')) {
        const lista = document.createElement('ul');
        lista.className = 'list-group list-unstyled mb-3';
        for (const entrada of catalogo) {
          if (entrada.mundo !== panel.dataset.mundo) continue;
          const item = document.createElement('li');
          item.dataset.codigo = entrada.codigo;
          lista.append(item);
        }
        panel.querySelector('.diario-listas').append(lista);
        const grupo = document.createElement('section');
        const nombre = document.createElement('h4');
        nombre.id = 'diario-total-grupo-' + panel.dataset.mundo;
        nombre.className = 'diario-titulo-grupo mb-2';
        nombre.textContent = vista.querySelector('#' + panel.getAttribute('aria-labelledby')).textContent;
        grupo.setAttribute('aria-labelledby', nombre.id);
        grupo.append(nombre, lista.cloneNode(true));
        total.append(grupo);
      }
    }
    recuperar();
    actualizar();
    return { titulo: 'Diario de descubrimientos', cuerpo: vista };
  }

  window.BitacoraXPDiario = Object.freeze({ leer, registrar });
}());
