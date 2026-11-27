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
      const filas = panel.querySelectorAll('details');
      let cantidad = 0;
      for (const fila of filas) {
        const encontrado = encontrados.has(fila.dataset.codigo);
        if (encontrado) cantidad++;
        fila.classList.toggle('bg-success', encontrado);
        fila.classList.toggle('text-white', encontrado);
        const estado = encontrado ? 'Descubierto' : 'Pendiente';
        const marca = fila.querySelector('small');
        if (marca.textContent !== estado) marca.textContent = estado;
      }
      const porcentaje = filas.length ? cantidad * 100 / filas.length : 0;
      const resumen = cantidad + ' / ' + filas.length + ' descubrimientos · ' + Math.round(porcentaje) + ' %';
      panel.querySelector('p').textContent = resumen;
      const barra = panel.querySelector('[role="progressbar"]');
      barra.setAttribute('aria-valuenow', porcentaje);
      barra.setAttribute('aria-valuetext', resumen);
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

  function detalle(entrada) {
    const fila = document.createElement('details');
    fila.className = 'list-group-item text-break';
    fila.dataset.codigo = entrada.codigo;
    const titulo = document.createElement('summary');
    const estado = document.createElement('small');
    estado.className = 'ms-2';
    titulo.append(entrada.titulo, estado);
    const texto = document.createElement('p');
    texto.className = 'mt-2 mb-0';
    texto.textContent = entrada.contenido;
    fila.append(titulo, texto);
    return fila;
  }

  async function leer() {
    const { descubrimientos } = await BitacoraXPDescubrimientos.obtenerTodos();
    if (catalogo !== descubrimientos) {
      catalogo = descubrimientos;
      vista = document.querySelector('#bitacora-xp-plantilla-diario').content.firstElementChild.cloneNode(true);
      const total = vista.querySelector('#diario-total');
      for (const panel of vista.querySelectorAll('.tab-pane:not(#diario-total)')) {
        const lista = document.createElement('div');
        lista.className = 'list-group mb-3';
        for (const entrada of catalogo) {
          if (entrada.mundo === panel.dataset.mundo) lista.append(detalle(entrada));
        }
        panel.append(lista);
        const nombre = document.createElement('h4');
        nombre.className = 'h6';
        nombre.textContent = vista.querySelector('#' + panel.getAttribute('aria-labelledby')).textContent;
        total.append(nombre, lista.cloneNode(true));
      }
    }
    recuperar();
    actualizar();
    return { titulo: 'Diario de descubrimientos', cuerpo: vista };
  }

  window.BitacoraXPDiario = Object.freeze({ leer, registrar });
}());
