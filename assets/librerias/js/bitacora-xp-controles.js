(() => {
  const boton = document.getElementById('bitacora-xp-alternar-controles');
  if (!boton) return;
  const audio = document.getElementById('bitacora-xp-alternar-audio');
  const ocultar = boton.textContent;
  const nombreOcultar = boton.getAttribute('aria-label');
  function mostrar(control, visible) {
    document.getElementById(control.getAttribute('aria-controls')).classList.toggle('d-none', !visible);
    control.setAttribute('aria-expanded', String(visible));
    if (control === boton) {
      boton.textContent = visible ? ocultar : 'Mostrar controles';
      boton.setAttribute('aria-label', visible ? nombreOcultar : 'Mostrar controles');
    }
  }
  let estrecho;
  const observarCanvas = new ResizeObserver(([entrada]) => {
    const ancho = entrada.contentRect.width;
    if (!ancho || estrecho === (ancho <= 720)) return;
    estrecho = ancho <= 720;
    mostrar(boton, !estrecho);
    mostrar(audio, false);
  });
  observarCanvas.observe(document.getElementById('bitacora-xp-hud'));
  [boton, audio].forEach(control => control.addEventListener('click', evento => {
    const abrir = control.getAttribute('aria-expanded') === 'false';
    if (estrecho && abrir) mostrar(control === boton ? audio : boton, false);
    mostrar(control, abrir);
    if (evento.detail) document.getElementById('bitacora-xp-escenario').focus({ preventScroll: true });
  }));
  document.getElementById('bitacora-xp-abrir-diario').addEventListener('click', () => window.BitacoraXPLectura.abrirDiario());
})();
