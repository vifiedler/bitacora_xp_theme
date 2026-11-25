# Bitácora XP | Arquitectura base

Estado: primera fase, reorganización técnica. Esta entrega no implementa Phaser,
mapas Tiled, sprites, NPC interactivos, HUD, modales, diario visual ni música.

## Fuentes y responsabilidades

- **WordPress / SCF:** 14 entradas normales (`gv-01` a `gv-06`, `sn-01` a `sn-05`,
  `ev-01` a `ev-03`), categorías `gachavault`, `sinapsis` y `entre-versos`;
  y 3 páginas `mundo-gachavault`, `mundo-sinapsis`, `mundo-entre-versos`.
- **SCF entradas:** `que_hice`, `que_aprendi`, `fecha_entrada`,
  `archivos_multimedia` y `dialogos_extra`.
- **SCF páginas:** `dialogos_npc`, con `npc_id`, `npc_nombre`,
  `npc_dialogo` y `npc_emote`.
- **MySQL independiente:** 21 descubrimientos en `aventura_descubrimientos`.
  No está conectada todavía: no hay credenciales ni endpoint autorizado.
- **Phaser/Tiled:** futura interacción. Los mapas identificarán objetos por
  `codigo`, que se resuelve desde WordPress o el endpoint de descubrimientos.
- **Bootstrap:** diagramación y componentes; se registran recursos visuales
  sin reproducir el estilo ni interfaces de otros proyectos.

## Estructura del tema

```text
bitacora_xp_theme/
├── functions.php                    Configuración y carga de assets/assets.php
├── header.php / footer.php          Estructura estándar WordPress (sin rediseñar)
├── index.php / page.php / single.php y demás plantillas base
├── inc/                             Helpers originales de Underscores
├── template-parts/                  Partes de plantilla existentes
├── assets/
│   ├── assets.php                   Cargador central
│   ├── includes/
│   │   ├── css-functions.php        Bootstrap CSS e iconos
│   │   └── js-functions.php         Bootstrap JS y cliente REST
│   ├── librerias/
│   │   ├── css/                     Reservado para estilos del juego
│   │   └── js/bitacora-xp-rest.js   Cliente REST sin dependencias
│   ├── modulos/                     Reservado para componentes funcionales PHP
│   └── templates/                   Reservado para encabezados/HUD/overlays
└── docs/ARQUITECTURA.md
```

## Cliente REST disponible

```js
await BitacoraXPData.obtenerHito('gv-01');
await BitacoraXPData.obtenerHitosMundo('gachavault');
await BitacoraXPData.obtenerPaginaMundo('sinapsis');
await BitacoraXPData.obtenerNPC('entre-versos', 'npc_luis_felipe');
BitacoraXPData.limpiarCache();
```

`obtenerHito` devuelve `codigo`, `titulo`, `sesion`, `fecha` (ISO),
`queHice`, `queAprendi`, `multimedia`, `dialogosExtra` y `categorias`.
`obtenerNPC` devuelve `id`, `nombre`, `dialogo` y `emote` o `null`.

**Importante:** `queHice` y `queAprendi` pueden contener HTML de SCF WYSIWYG.
El cliente no los inyecta en el DOM. La futura vista debe sanitizar el HTML
según el contexto, mantener el foco y el tamaño mínimo de tipografía.

## Endpoints y acceso

WordPress expone `/wp-json/wp/v2/posts`, `/wp-json/wp/v2/pages` y
`/wp-json/wp/v2/categories`. Los grupos SCF tienen `Show in REST API` activado.
Verificar en JSON público que la propiedad `acf` venga poblada en cada tipo.
El cliente solo obtiene contenido público; los borradores no se leen sin autenticar.

En la BD independiente los descubrimientos deben consumirse mediante una ruta
PHP/REST segura, nunca con credenciales enviadas al navegador. Esa capa queda
pendiente hasta contar con la configuración de conexión en el servidor.

## Instalación y comprobaciones

1. Respaldar la carpeta activa `bitacora_xp_theme` y su base de datos.
2. Reemplazar la carpeta **completa**, no fusionar con la anterior; de otro
   modo persistirán los archivos heredados de Entre Versos.
3. Confirmar que WordPress abre una entrada normal y una página sin errores.
4. En el navegador, consola: `typeof window.BitacoraXPData` debe ser `object`.
5. Comprobar `BitacoraXPData.obtenerHito('gv-01')` y que sus valores no estén vacíos.
6. Comprobar `BitacoraXPData.obtenerNPC('gachavault','npc_paz_gomez')`.
7. En `Network`, comprobar éxito de `wp-json/wp/v2/...` y ausencia de 404/CDN.

Esta fase preserva todo el boilerplate `_s` y no modifica la base de datos.
No se ha verificado la ejecución en el hosting real.
