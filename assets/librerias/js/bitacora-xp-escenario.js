(function () {
  'use strict';

  const contenedor = document.getElementById('bitacora-xp-escenario');
  if (!contenedor) return;

  const config = window.BitacoraXPEscenario;
  const mundoInicial = contenedor.dataset.mundo;
  const tituloInicial = document.title;
  const capasVisibles = ['hitos', 'descubrimientos', 'npc'];
  const interactivos = [];
  const obstaculos = [];
  let fondo;
  let mundo;
  let elementos;
  let salidas;
  let pisada;
  let vicente;
  let teclas;
  let retirarEtiquetas;
  const hud = document.getElementById('bitacora-xp-hud');
  const aviso = document.getElementById('bitacora-xp-interaccion');
  const teclaDiario = 'j';
  document.getElementById('bitacora-xp-tecla-diario').textContent = teclaDiario.toUpperCase();
  let objetoIndicado;

  function indicar(objeto, tamano) {
    if (objeto === objetoIndicado) return;
    objetoIndicado = objeto;
    aviso.hidden = !objeto;
    if (objeto) {
      aviso.style.setProperty('--centro', (objeto.x + objeto.width / 2) / tamano.width * 100 + '%');
      aviso.style.bottom = (1 - objeto.y / tamano.height) * 100 + '%';
    }
  }

  function preload() {
    this.load.on('loaderror', (archivo) => {
      console.error('[Bitácora XP] No se pudo cargar el recurso:', archivo.url);
    });
    const texturas = new Set();
    for (const [slug, datos] of Object.entries(config.mapas)) {
      this.load.once('filecomplete-json-' + slug, (clave, tipo, mapa) => {
        const imagen = mapa.layers.find((capa) => capa.type === 'imagelayer' && capa.name === 'fondo');
        if (imagen) this.load.image('fondo-' + slug, new URL(imagen.image, datos.mapa).href);
      });
      this.load.json(slug, datos.mapa);
      for (const ruta of Object.values(datos.sprites)) texturas.add(ruta);
    }
    for (const direccion of ['sur', 'norte', 'este', 'oeste']) {
      const clave = 'vicente_' + direccion;
      this.load.image(clave, config.recursos + 'sprites/personajes/' + clave + '.png');
    }
    for (const ruta of texturas) {
      this.load.image(ruta, config.recursos + ruta);
    }
  }

  function mostrarMapa(escena, slug, spawn) {
    const datos = config.mapas[slug];
    const mapa = escena.cache.json.get(slug);
    const imagen = mapa?.layers.find((capa) => capa.name === 'fondo');
    const spawns = mapa?.layers.find((capa) => capa.name === 'spawns')?.objects;
    const inicio = spawns?.find((punto) => punto.point && punto.name === spawn);
    if (!inicio || !imagen || !escena.textures.exists('fondo-' + slug)) {
      console.error('[Bitácora XP] No se pudo abrir el mapa', slug, spawn);
      return false;
    }

    if (mundo) BitacoraXPLectura.cancelar();
    elementos.clear(true, true);
    interactivos.length = 0;
    obstaculos.length = 0;
    mundo = slug;
    indicar(null);
    hud.dataset.mundo = slug;
    document.getElementById('bitacora-xp-ubicacion').textContent = datos.nombre;
    fondo = imagen;
    salidas = mapa.layers.find((capa) => capa.name === 'salidas').objects;
    pisada = new Phaser.Geom.Rectangle(0, 0, 2 * mapa.tilewidth, mapa.tileheight);
    contenedor.dataset.mundo = slug;
    document.getElementById('bitacora-xp-mundo').textContent = datos.nombre;
    document.title = slug === mundoInicial ? tituloInicial : datos.nombre;
    elementos.add(escena.add.image(fondo.x, fondo.y, 'fondo-' + slug).setOrigin(0));
    for (const capa of mapa.layers) {
      const esInteractiva = capasVisibles.includes(capa.name);
      if (!esInteractiva && capa.name !== 'colisiones') continue;
      for (const objeto of capa.objects) {
        // El origen de Vicente está entre los pies. Su pisada mide dos tiles por uno.
        obstaculos.push(new Phaser.Geom.Rectangle(
          objeto.x - mapa.tilewidth, objeto.y,
          objeto.width + 2 * mapa.tilewidth, objeto.height + mapa.tileheight
        ));
        if (!esInteractiva) continue;
        const textura = datos.sprites[objeto.name];
        if (!textura) {
          console.error('[Bitácora XP] Falta la asignación de sprite para', objeto.name);
          continue;
        }
        elementos.add(escena.add.image(objeto.x, objeto.y, textura).setOrigin(0).setName(objeto.name));
        interactivos.push({ capa: capa.name, objeto });
      }
    }
    vicente = escena.add.image(inicio.x, inicio.y, 'vicente_sur').setOrigin(0.5, 1).setName('vicente');
    elementos.add(vicente);
    retirarEtiquetas?.();
    const hitos = mapa.layers.find((capa) => capa.name === 'hitos');
    retirarEtiquetas = BitacoraXPEtiquetas.mostrar(escena, hitos?.objects || []);
    escena.input.keyboard.resetKeys();
    return true;
  }

  function create() {
    elementos = this.add.group();
    const entrada = history.state?.bitacoraXP;
    const spawn = entrada?.mundo === mundoInicial ? entrada.spawn : config.mapas[mundoInicial].spawn;
    if (!mostrarMapa(this, mundoInicial, spawn)) return;
    const lectura = document.getElementById('bitacora-xp-lectura');
    const ubicarDialogo = () => {
      const rect = this.game.canvas.getBoundingClientRect();
      Object.assign(hud.style, { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' });
      hud.hidden = false;
      const borde = rect.bottom;
      lectura.style.setProperty('--bitacora-bajo-canvas', Math.max(0, document.documentElement.clientHeight - borde) + 'px');
    };
    ubicarDialogo();
    this.scale.on('resize', ubicarDialogo);
    history.replaceState({ ...history.state, bitacoraXP: { mundo, spawn } }, '');
    const volver = (evento) => {
      const destino = evento.state?.bitacoraXP;
      if (!destino || !config.mapas[destino.mundo]) return;
      mostrarMapa(this, destino.mundo, destino.spawn);
    };
    window.addEventListener('popstate', volver);
    const inicio = document.getElementById('bitacora-xp-inicio');
    const irAInicio = evento => {
      if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
      evento.preventDefault();
      const destino = 'plaza-central';
      const llegada = config.mapas[destino].spawn;
      if (mundo !== destino && mostrarMapa(this, destino, llegada)) {
        history.pushState({ bitacoraXP: { mundo: destino, spawn: llegada } }, '', inicio.href);
      }
      contenedor.focus({ preventScroll: true });
    };
    inicio.addEventListener('click', irAInicio);
    const teclado = this.input.keyboard;
    teclas = teclado.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT');
    const reiniciarTeclas = () => teclado.resetKeys();
    contenedor.addEventListener('blur', reiniciarTeclas);
    contenedor.addEventListener('keydown', accionar);
    this.events.once('shutdown', () => {
      BitacoraXPLectura.cancelar();
      this.scale.off('resize', ubicarDialogo);
      retirarEtiquetas?.();
      window.removeEventListener('popstate', volver);
      inicio.removeEventListener('click', irAInicio);
      hud.hidden = true;
      contenedor.removeEventListener('blur', reiniciarTeclas);
      contenedor.removeEventListener('keydown', accionar);
      interactivos.length = 0;
      obstaculos.length = 0;
      vicente = null;
    });
    if (document.activeElement === document.body) contenedor.focus({ preventScroll: true });
  }

  // Recorta el recorrido al primer borde que cruce. El otro eje puede seguir avanzando.
  function limitarPorColision(desde, hasta, transversal, horizontal) {
    for (const zona of obstaculos) {
      const fuera = horizontal
        ? transversal <= zona.top || transversal >= zona.bottom
        : transversal <= zona.left || transversal >= zona.right;
      if (fuera) continue;
      const inicio = horizontal ? zona.left : zona.top;
      const fin = horizontal ? zona.right : zona.bottom;
      if (desde <= inicio && hasta > inicio) hasta = inicio;
      if (desde >= fin && hasta < fin) hasta = fin;
    }
    return hasta;
  }

  function update(tiempo, delta) {
    if (!vicente || document.activeElement !== contenedor) {
      indicar(null);
      return;
    }
    indicar(interactivoCercano()?.objeto, this.scale.gameSize);
    const dx = Number(teclas.D.isDown || teclas.RIGHT.isDown) - Number(teclas.A.isDown || teclas.LEFT.isDown);
    const dy = Number(teclas.S.isDown || teclas.DOWN.isDown) - Number(teclas.W.isDown || teclas.UP.isDown);
    if (!dx && !dy) return;

    const paso = 210 * Math.min(delta, 50) / 1000 / Math.hypot(dx, dy);
    const direccion = dx ? (dx > 0 ? 'este' : 'oeste') : (dy > 0 ? 'sur' : 'norte');
    vicente.setTexture('vicente_' + direccion);
    const x = Phaser.Math.Clamp(vicente.x + dx * paso, vicente.width / 2, fondo.imagewidth - vicente.width / 2);
    const y = Phaser.Math.Clamp(vicente.y + dy * paso, vicente.height, fondo.imageheight);
    vicente.x = limitarPorColision(vicente.x, x, vicente.y, true);
    vicente.y = limitarPorColision(vicente.y, y, vicente.x, false);
    pisada.setPosition(vicente.x - pisada.width / 2, vicente.y - pisada.height);
    const salida = salidas.find(({ x, y, width, height }) =>
      pisada.right >= x && pisada.left <= x + width && pisada.bottom >= y && pisada.top <= y + height
    );
    if (salida) {
      const destino = salida.properties.find((p) => p.name === 'destino').value.replace(/_/g, '-');
      const spawn = salida.properties.find((p) => p.name === 'spawn_destino').value;
      if (mostrarMapa(this, destino, spawn)) {
        history.pushState({ bitacoraXP: { mundo: destino, spawn } }, '', config.mapas[destino].url || location.href);
      }
    }
  }

  function accionar(evento) {
    if (evento.altKey || evento.metaKey || evento.ctrlKey) return;
    const tecla = evento.key.toLowerCase();
    if (!['e', 'enter', teclaDiario].includes(tecla)) return;
    evento.preventDefault();
    if (evento.repeat) return;
    if (tecla === teclaDiario) {
      window.BitacoraXPLectura.abrirDiario();
      return;
    }

    const cercano = interactivoCercano();
    if (cercano) window.BitacoraXPLectura.interactuar(cercano.capa, cercano.objeto.name, mundo);
  }

  function interactivoCercano() {
    let cercano;
    let distanciaMinima = 36;
    for (const candidato of interactivos) {
      const { x, y, width, height } = candidato.objeto;
      const dx = vicente.x - Phaser.Math.Clamp(vicente.x, x, x + width);
      const dy = vicente.y - Phaser.Math.Clamp(vicente.y, y, y + height);
      const distancia = Math.hypot(dx, dy);
      if (distancia <= distanciaMinima) {
        cercano = candidato;
        distanciaMinima = distancia;
      }
    }
    return cercano;
  }

  new Phaser.Game({
    type: Phaser.CANVAS,
    parent: contenedor,
    width: 1440,
    height: 900,
    // Los puntos de Tiled ya son enteros. El redondeo de Canvas ampliaría los PNG medio píxel.
    antialias: false,
    roundPixels: false,
    audio: { noAudio: true },
    input: { keyboard: { target: contenedor }, mouse: false, touch: false, gamepad: false },
    // Escala el mapa y sus sprites juntos, manteniendo visible el escenario completo.
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, expandParent: false },
    scene: { preload, create, update },
  });
}());
