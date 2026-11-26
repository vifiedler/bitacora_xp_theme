(function () {
  'use strict';

  const contenedor = document.getElementById('bitacora-xp-escenario');
  if (!contenedor) return;

  const config = window.BitacoraXPEscenario;
  const capasVisibles = ['hitos', 'descubrimientos', 'npc'];
  let fondo;
  let errorCarga = false;

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
    this.load.image('vicente_sur', config.recursos + 'sprites/personajes/vicente_sur.png');
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

    // Al recortar los laterales en móvil, mantener visible la posición inicial de Vicente.
    contenedor.style.setProperty('--spawn-x', (inicio.x / (mapa.width * mapa.tilewidth) * 100) + '%');
    this.add.image(fondo.x, fondo.y, 'fondo').setOrigin(0);
    for (const capa of mapa.layers) {
      if (!capasVisibles.includes(capa.name)) continue;
      for (const objeto of capa.objects) {
        const textura = config.sprites[objeto.name];
        if (!textura) {
          console.error('[Bitácora XP] Falta la asignación de sprite para', objeto.name);
          continue;
        }
        this.add.image(objeto.x, objeto.y, textura).setOrigin(0).setName(objeto.name);
      }
    }
    this.add.image(inicio.x, inicio.y, 'vicente_sur').setOrigin(0.5, 1).setName('vicente_sur');
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
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    scale: { mode: Phaser.Scale.ENVELOP, expandParent: false },
    scene: { preload, create },
  });
}());
