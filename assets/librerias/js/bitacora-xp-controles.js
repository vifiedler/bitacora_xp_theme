(() => {
  const boton = document.getElementById('bitacora-xp-alternar-controles');
  if (!boton) return;
  const instrucciones = document.getElementById(boton.getAttribute('aria-controls'));
  const ocultar = boton.textContent;

  boton.addEventListener('click', () => {
    const ocultas = instrucciones.classList.toggle('d-none');
    boton.setAttribute('aria-expanded', String(!ocultas));
    boton.textContent = ocultas ? 'Mostrar controles' : ocultar;
    document.getElementById('bitacora-xp-escenario').focus({ preventScroll: true });
  });
})();
