# Integración narrativa de Bitácora XP

La máquina de cada hito abre «¿Qué hice?» con el campo `que_hice`. El botón, Escape, E y Enter pasan por el mismo cierre. Al terminar GSAP, el cuadro inferior recibe `que_aprendi` de la misma publicación. Los NPC abren directamente el cuadro inferior con el nombre y el diálogo SCF del mundo actual.

## Problemas corregidos y archivos

| Archivo en `assets/librerias/js/` | Problema detectado | Ajuste |
| --- | --- | --- |
| `bitacora-xp-lectura.js` | J podía sustituir la modal activa. Si REST tardaba, el escenario recuperaba el teclado entre la modal y la reflexión. | La lectura activa tiene prioridad. El cierre entrega al cuadro inferior la consulta que ya estaba en curso. Al cancelar se invalidan la lectura y su animación. |
| `bitacora-xp-dialogo.js` | El cuadro inferior de los NPC también activaba la modalidad nativa y el backdrop. | El cuadro usa `show()`. Mientras está abierto, el escenario queda inactivo mediante `inert`. Escape cierra la conversación y el juego recupera el foco. |
| `bitacora-xp-escenario.js` | Al volver por el historial, la limpieza dependía de un evento de cierre posterior al cambio de mundo. | Antes de sustituir un mapa y al terminar la escena, se cancela la lectura, se destruye Typed.js y se detiene GSAP. Una respuesta tardía pierde su destinatario. |

## Regresión de los cuatro mundos

Pruebas en Chrome con las plantillas y los scripts locales del tema y las dos API publicadas. Se recorrieron las diez salidas definidas en Tiled.

| Mundo | Hitos | Interacciones NPC | Descubrimientos |
| --- | ---: | ---: | ---: |
| Plaza Central | 0 | 0 | 0 |
| GachaVault | 6 | 3 | 7 |
| SINAPSIS | 5 | 4 | 7 |
| Entre Versos | 3 | 4 | 7 |

- En cada hito se compararon el contenido de la modal y los párrafos de la reflexión con la publicación correspondiente. Se probaron el botón, Escape, E y Enter, incluido el cierre durante la animación.
- En los tres mundos narrativos se comprobó el nombre de cada NPC y el título de cada descubrimiento. Una sola pulsación completa el párrafo o avanza, según el estado del cuadro.
- En Plaza Central se verificaron la recuperación del movimiento y los accesos a los tres mundos. Se usaron Atrás y Adelante entre la plaza y GachaVault durante la escritura, durante el cierre y con una consulta retenida para simular una respuesta lenta.
- Se comprobó que J conserva la lectura activa, un doble clic produce una sola reflexión y una respuesta recibida después de volver al mundo de origen no reabre el cuadro. Tras la cancelación se verificaron el foco del juego, el recuento de instancias Typed.js y las animaciones activas del panel.
