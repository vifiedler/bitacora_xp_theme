(function () {
  'use strict';

  const contenedor = document.getElementById('bitacora-xp-escenario');
  if (!contenedor) return;

  const config = window.BitacoraXPEscenario;
  const capasVisibles = ['hitos', 'descubrimientos', 'npc'];
  const interactivos = [];
  const obstaculos = [];
  let fondo;
  let errorCarga = false;
  let vicente;
  let teclas;

  function preload() {
    this.load.on('loaderror', (archivo) => {
      errorCarga = true;
      console.error('[Bitácora XP] No se pudo cargar el recurso:', archivo.url);
    });
    this.load.once('filecomplete-json-mapa', (clave, tipo, mapa) => {
      fondo = mapa.layers.find((capa) => capa.type === 'imagelayer' && capa.name === 'fondo');
      if (fondo) this.load.image('fondo', new URL(fondo.image, config.mapa).href);
    });
    this.load.json('mapa', config.mapa);
    for (const direccion of ['sur', 'norte', 'este', 'oeste']) {
      const clave = 'vicente_' + direccion;
      this.load.image(clave, config.recursos + 'sprites/personajes/' + clave + '.png');
    }
    for (const ruta of new Set(Object.values(config.sprites))) {
      this.load.image(ruta, config.recursos + ruta);
    }
  }

  function create() {
    if (errorCarga) return;
    const mapa = this.cache.json.get('mapa');
    const spawns = mapa.layers.find((capa) => capa.name === 'spawns');
    const inicio = spawns?.objects.find((punto) => punto.point && punto.name === config.spawn);
    if (!fondo || !inicio) {
      console.error('[Bitácora XP] Falta la capa de fondo o el punto de inicio en', config.mapa);
      return;
    }

    this.add.image(fondo.x, fondo.y, 'fondo').setOrigin(0);
    for (const capa of mapa.layers) {
      if (capa.name === 'colisiones') {
        for (const objeto of capa.objects) {
          // Vicente pisa dos tiles de ancho por uno de alto. Su origen está entre los pies.
          obstaculos.push(new Phaser.Geom.Rectangle(
            objeto.x - mapa.tilewidth, objeto.y,
            objeto.width + 2 * mapa.tilewidth, objeto.height + mapa.tileheight
          ));
        }
      }
      if (!capasVisibles.includes(capa.name)) continue;
      for (const objeto of capa.objects) {
        const textura = config.sprites[objeto.name];
        if (!textura) {
          console.error('[Bitácora XP] Falta la asignación de sprite para', objeto.name);
          continue;
        }
        this.add.image(objeto.x, objeto.y, textura).setOrigin(0).setName(objeto.name);
        interactivos.push({ capa: capa.name, objeto });
      }
    }
    vicente = this.add.image(inicio.x, inicio.y, 'vicente_sur').setOrigin(0.5, 1).setName('vicente');
    const teclado = this.input.keyboard;
    teclas = teclado.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT');
    const reiniciarTeclas = () => teclado.resetKeys();
    contenedor.addEventListener('blur', reiniciarTeclas);
    contenedor.addEventListener('keydown', accionar);
    this.events.once('shutdown', () => {
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
    if (!vicente || document.activeElement !== contenedor) return;
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
  }

  function accionar(evento) {
    if (evento.altKey || evento.metaKey || evento.ctrlKey) return;
    const tecla = evento.key.toLowerCase();
    if (!['e', 'enter', 'j'].includes(tecla)) return;
    evento.preventDefault();
    if (evento.repeat) return;
    if (tecla === 'j') {
      window.BitacoraXPLectura.abrirDiario();
      return;
    }

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
    if (cercano) window.BitacoraXPLectura.interactuar(cercano.capa, cercano.objeto.name, config.mundo);
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
