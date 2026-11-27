(() => {
  const boton = document.getElementById('bitacora-xp-alternar-controles');
  if (!boton) return;
  const audio = document.getElementById('bitacora-xp-alternar-audio');
  const ocultar = boton.textContent;
  function mostrar(control, visible) {
    document.getElementById(control.getAttribute('aria-controls')).classList.toggle('d-none', !visible);
    control.setAttribute('aria-expanded', String(visible));
    if (control === boton) boton.textContent = visible ? ocultar : 'Mostrar controles';
  }
  const estrecho = matchMedia('(max-width: 720px), (max-height: 480px)');
  if (estrecho.matches) mostrar(boton, false);
  estrecho.addEventListener('change', () => {
    mostrar(boton, !estrecho.matches);
    mostrar(audio, false);
  });
  [boton, audio].forEach(control => control.addEventListener('click', evento => {
    const abrir = control.getAttribute('aria-expanded') === 'false';
    if (estrecho.matches && abrir) mostrar(control === boton ? audio : boton, false);
    mostrar(control, abrir);
    if (evento.detail) document.getElementById('bitacora-xp-escenario').focus({ preventScroll: true });
  }));
  document.getElementById('bitacora-xp-abrir-diario').addEventListener('click', () => window.BitacoraXPLectura.abrirDiario());
})();
