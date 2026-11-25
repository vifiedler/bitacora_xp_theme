# Bitácora XP: integración AJAX de las dos fuentes (fase 3)

## Alcance

Este ZIP es **incremental**. Contiene únicamente estos cinco archivos:

- `assets/includes/js-functions.php` (modificado)
- `assets/librerias/js/bitacora-xp-rest.js` (modificado)
- `assets/librerias/js/bitacora-xp-descubrimientos.js` (nuevo)
- `assets/librerias/js/bitacora-xp-carga-inicial.js` (nuevo)
- `docs/INTEGRACION_AJAX.md` (nuevo, esta guía)

**No sustituir el tema completo, no volver a importar MySQL, no modificar `/api-bitacora/`.**
La base usada para este parche es el tema `bitacora_xp_theme_organizado_fase1.zip`.
Si cambiaste `js-functions.php` o `bitacora-xp-rest.js` después de esa versión, compara los cambios antes de reemplazarlos.

## Qué hace cada archivo

1. `js-functions.php`: registra los dos clientes JS usando `wp_enqueue_script`. Entrega al navegador **solo** la ruta pública `/api-bitacora/lista_descubrimientos.php`, no usuario/contraseña MySQL. Encola un tercer JS únicamente en la portada.
2. `bitacora-xp-rest.js`: mantiene las consultas SCF existentes. Agrega `obtenerTodosHitos()` para recuperar las 14 entradas de una sola vez usando `/wp-json/wp/v2/posts?per_page=100`.
3. `bitacora-xp-descubrimientos.js`: hace `fetch()` a la API PHP independiente, comprueba `HTTP 200`, convierte el JSON con `.json()`, valida la estructura `{total, descubrimientos}` y ofrece filtros por mundo y código. Cachea solicitudes exitosas durante la vida de la página.
4. `bitacora-xp-carga-inicial.js`: cuando se abre la portada, hace **dos consultas en paralelo**, una a cada fuente, y guarda ambos resultados en `BitacoraXPCargaInicial.estado`. No modifica el HTML de la página.

## Instalación FTP / cPanel

1. Respaldar los archivos existentes `assets/includes/js-functions.php` y `assets/librerias/js/bitacora-xp-rest.js`.
2. Abrir la carpeta del tema activo: `public_html/bitacora-xp/wp-content/themes/bitacora_xp_theme/` (o la ruta real de tu WordPress si es diferente).
3. Copiar los cinco archivos del ZIP, manteniendo la estructura de directorios. Dos archivos se actualizan y tres se agregan.
4. No tocar `api-bitacora` en `public_html/api-bitacora/` ni las tablas de MySQL.
5. Cargar la **portada** de Bitácora XP con las herramientas del navegador abiertas en Red/Network, filtro **Fetch/XHR** y opción **Disable cache** activada. Recargar con Ctrl+F5.

### Solicitudes esperadas en Network

- `https://vifiedler.laboratoriodiseno.cl/bitacora-xp/wp-json/wp/v2/posts?per_page=100` (origen WordPress)
- `https://vifiedler.laboratoriodiseno.cl/api-bitacora/lista_descubrimientos.php` (origen independiente PHP)

Ambas deberían responder `HTTP 200`. El navegador no consulta las bases MySQL directamente; ve las solicitudes a los dos endpoints PHP. En **Preview** o **Response** podrás inspeccionar sus respectivos JSON.

### Consola: inspeccionar lo cargado automáticamente

```js
const datos = await BitacoraXPCargaInicial.iniciar();
console.table(datos.hitos.map(({ codigo, titulo, fecha }) => ({ codigo, titulo, fecha })));
console.table(datos.descubrimientos.map(({ codigo, mundo, titulo }) => ({ codigo, mundo, titulo })));
```

Se esperan 14 hitos del CMS y 21 descubrimientos externos si las publicaciones son públicas y la API está disponible. En caso de error, `datos.errores` identifica cuál fuente falló. Una petición exitosa no garantiza que el juego ya renderice sus contenidos: **solo conecta las fuentes**.

### Consola: consultas adicionales a demanda

```js
// WordPress + SCF
await BitacoraXPData.obtenerHito('gv-01');
await BitacoraXPData.obtenerNPC('gachavault', 'npc_paz_gomez');

// API independiente PHP + MySQL
await BitacoraXPDescubrimientos.obtenerPorMundo('sinapsis');
await BitacoraXPDescubrimientos.obtenerPorCodigo('extra_sn_03');
```

Los métodos de descubrimientos devuelven el objeto JSON completo `{total, descubrimientos}`. Para tomar el primer resultado:

```js
const respuesta = await BitacoraXPDescubrimientos.obtenerPorCodigo('extra_sn_03');
const descubrimiento = respuesta.descubrimientos[0] ?? null;
```

**Caché:** las funciones guardan cada URL consultada; para ver una nueva petición después de llamar otra vez al mismo método, ejecuta `BitacoraXPDescubrimientos.limpiarCache()` (o `BitacoraXPData.limpiarCache()` para WordPress), o recarga la página.

**Ruta**: el valor `'/api-bitacora/lista_descubrimientos.php'` presupone que WordPress y `api-bitacora` están en el **mismo dominio** y que `api-bitacora` es una carpeta hermana del directorio WordPress dentro de `public_html`, tal como se acordó. Si el sitio cambia de dominio o de estructura, actualiza la ruta en `js-functions.php`.

**Seguridad:** mantener la protección de `api-bitacora/config/` y no publicar las credenciales. Los descubrimientos se exponen públicamente a través del PHP diseñado para ello.

## Alcance no cubierto

No se conecta todavía con Phaser/Tiled ni se añaden plantillas, componentes de interfaz o HUD. La API externa no se convierte en una ruta REST de WordPress.
