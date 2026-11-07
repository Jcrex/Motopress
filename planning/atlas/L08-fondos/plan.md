# L08-fondos · Fondos

backdrop, data-painter y todos los pintores de portada.

Deck: `atlas/completo/index.html`. Diapositivas con id `l08-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l08-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l08-backdrop`: Efecto backdrop
3. `l08-data-painter`: Elección de pintor (data-painter)
4. `l08-motor-painters`: Registro de pintores
5. `l08-pintor-rice`: Pintor rice
6. `l08-pintor-noche`: Pintor noche
7. `l08-pintor-suizo`: Pintor suizo
8. `l08-pintor-aurora`: Pintor aurora
9. `l08-pintor-cromo`: Pintor cromo
10. `l08-pintor-arcilla`: Pintor arcilla
11. `l08-pintor-nube`: Pintor nube
12. `l08-pintor-termica`: Pintor termica
13. `l08-pintor-celula`: Pintor celula
14. `l08-pintor-matriz`: Pintor matriz
15. `l08-pintor-grano`: Pintor grano
16. `l08-pintor-hilos`: Pintor hilos
17. `l08-pintor-radar`: Pintor radar
18. `l08-pintor-topo`: Pintor topo
19. `l08-pintor-isolineas`: Pintor isolineas
20. `l08-pintor-escaner`: Pintor escaner
21. `l08-pintor-velo`: Pintor velo
22. `l08-pintor-none`: Pintor none
23. `l08-q-floatinglines`: FloatingLines · **quizás**
24. `l08-q-gradientascii`: GradientASCII · **quizás**
25. `l08-q-faultyterminal`: FaultyTerminal · **quizás**
26. `l08-q-elasticmesh`: ElasticMesh · **quizás**
27. `l08-q-acidsquares`: AcidSquares · **quizás**
28. `l08-q-beams`: Beams · **quizás**
29. `l08-q-crtwarp`: CRTWarp · **quizás**
30. `l08-q-darkveil`: DarkVeil · **quizás**
31. `l08-q-dither`: Dither · **quizás**
32. `l08-q-ferrofluid`: Ferrofluid · **quizás**
33. `l08-q-galaxy`: Galaxy · **quizás**
34. `l08-q-ghostfibers`: GhostFibers · **quizás**
35. `l08-q-gradientwaves`: GradientWaves · **quizás**
36. `l08-q-gridmotion`: GridMotion · **quizás**
37. `l08-q-iridescence`: Iridescence · **quizás**
38. `l08-q-scanner`: Scanner · **quizás**
39. `l08-q-patternwaves`: PatternWaves · **quizás**
40. `l08-q-pixelblast`: PixelBlast · **quizás**
41. `l08-q-ripplegrid`: RippleGrid · **quizás**
42. `l08-q-softaurora`: SoftAurora · **quizás**
43. `l08-q-waves`: Waves · **quizás**
44. `l08-q-linewaves`: LineWaves · **quizás**
45. `l08-q-lightrays`: LightRays · **quizás**
46. `l08-q-moltenmetal`: MoltenMetal · **quizás**
47. `l08-q-slicedwaves`: SlicedWaves · **quizás**
48. `l08-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **48 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ficha` de L00)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro
- En los «quizás»: etiqueta visible «experimental · quizás»; datos de ejemplo marcados como «sintéticos»

## Componentes

### `backdrop` · Efecto backdrop

- **Diapositiva:** `l08-backdrop`
- **Propósito (texto de la ficha):** Dibujar el fondo generativo de portadas y separadores con el pintor que toque
- **Archivo fuente:** `fx/sistema.js Motor.fx('backdrop')`
- **En el Atlas original:** `#portada` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `data-seed`: número; `host`: .fx-bg
- **Uso observado en decks** (arquitectura-g1-haiku, arquitectura-g1-opus, atlas, motor-pruebas, rai-g1, vc-base, vc-examen, vc-lab1, vc-lab2, vc-lab3, vc-lab4, vc-t1-realce, vc-t2-filtrado-espacial, vc-t3-frecuencia, vc-t4-bordes, vc-t5-contornos): atributos `data-painter`, `data-seed`, `data-style`, `data-title-fx`; roles —
- **Demo:** Portada con data-fx="backdrop" y dos semillas en botones (data-seed) que redibujan el fondo
- **Aceptación propia:** Cambiar la semilla cambia el dibujo de forma determinista

### `data-painter` · Elección de pintor (data-painter)

- **Diapositiva:** `l08-data-painter`
- **Propósito (texto de la ficha):** Cambiar el fondo por diapositiva, por deck o solo para ciertos estilos
- **Archivo fuente:** `fx/sistema.js painterOf()`
- **Parámetros que muestra la ficha:** `sintaxis`: ["\"nombre\"", "\"estilo:nombre …\"", "\"none\""]; `ambito`: sección o <html>
- **Demo:** Portada con data-painter="noche:escaner aurora:hilos" y el texto que explica qué pintor toca en el estilo activo
- **Aceptación propia:** El texto coincide con el pintor dibujado en cada estilo

### `motor-painters` · Registro de pintores

- **Diapositiva:** `l08-motor-painters`
- **Propósito (texto de la ficha):** Interfaz para añadir un pintor de fondo nuevo
- **Archivo fuente:** `fx/sistema.js Motor.painters`
- **Parámetros que muestra la ficha:** `firma`: { init(s, api), frame(s, api, t, still) }
- **Demo:** Pintor mínimo de ejemplo atlas-ejemplo registrado en la diapositiva (init + frame) dibujando un degradado con tokens
- **Aceptación propia:** Aparece en Motor.painters y respeta api.reduced

### `pintor-rice` · Pintor rice

- **Diapositiva:** `l08-pintor-rice`
- **Propósito (texto de la ficha):** Halos que derivan y grafo de nodos con mensajes en portadas
- **Archivo fuente:** `fx/sistema.js painters.rice`
- **En el Atlas original:** `#portada` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="rice"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-noche` · Pintor noche

- **Diapositiva:** `l08-pintor-noche`
- **Propósito (texto de la ficha):** Horizonte de neón con rejilla en perspectiva
- **Archivo fuente:** `fx/sistema.js painters.noche`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="noche"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-suizo` · Pintor suizo

- **Diapositiva:** `l08-pintor-suizo`
- **Propósito (texto de la ficha):** Geometría de arcos editorial
- **Archivo fuente:** `fx/sistema.js painters.suizo`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="suizo"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-aurora` · Pintor aurora

- **Diapositiva:** `l08-pintor-aurora`
- **Propósito (texto de la ficha):** Campo de flujo de partículas
- **Archivo fuente:** `fx/sistema.js painters.aurora`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="aurora"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-cromo` · Pintor cromo

- **Diapositiva:** `l08-pintor-cromo`
- **Propósito (texto de la ficha):** Metabolas cromadas por raymarching
- **Archivo fuente:** `fx/fondos.js P.cromo`
- **Parámetros que muestra la ficha:** `tecnica`: WebGL con respaldo 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="cromo"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-arcilla` · Pintor arcilla

- **Diapositiva:** `l08-pintor-arcilla`
- **Propósito (texto de la ficha):** Brazo robótico de plastilina con sombras suaves y oclusión
- **Archivo fuente:** `fx/fondos.js P.arcilla`
- **Parámetros que muestra la ficha:** `tecnica`: WebGL con respaldo 2D, 20 fps
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="arcilla"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-nube` · Pintor nube

- **Diapositiva:** `l08-pintor-nube`
- **Propósito (texto de la ficha):** Unos 40 000 puntos de un escaneo simulado con mapa Turbo
- **Archivo fuente:** `fx/fondos.js P.nube`
- **Parámetros que muestra la ficha:** `tecnica`: WebGL con respaldo 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="nube"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-termica` · Pintor termica

- **Diapositiva:** `l08-pintor-termica`
- **Propósito (texto de la ficha):** Robot móvil en ironbow o negro caliente con isotermas
- **Archivo fuente:** `fx/fondos.js P.termica`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="termica"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-celula` · Pintor celula

- **Diapositiva:** `l08-pintor-celula`
- **Propósito (texto de la ficha):** Tejido en fluorescencia (oscuro) o tinción H&E (claro)
- **Archivo fuente:** `fx/fondos.js P.celula`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="celula"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-matriz` · Pintor matriz

- **Diapositiva:** `l08-pintor-matriz`
- **Propósito (texto de la ficha):** Globo de LED con anillo de glifos
- **Archivo fuente:** `fx/fondos.js P.matriz`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="matriz"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-grano` · Pintor grano

- **Diapositiva:** `l08-pintor-grano`
- **Propósito (texto de la ficha):** Degradado con grano
- **Archivo fuente:** `fx/fondos.js P.grano`
- **Parámetros que muestra la ficha:** `tecnica`: WebGL
- **Origen en react-bits:** [Grainient](../../../../../react-bits/src/content/Backgrounds/Grainient/Grainient.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="grano"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-hilos` · Pintor hilos

- **Diapositiva:** `l08-pintor-hilos`
- **Propósito (texto de la ficha):** Haz de líneas que se deshilacha
- **Archivo fuente:** `fx/fondos.js P.hilos`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Origen en react-bits:** [Threads](../../../../../react-bits/src/content/Backgrounds/Threads/Threads.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="hilos"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-radar` · Pintor radar

- **Diapositiva:** `l08-pintor-radar`
- **Propósito (texto de la ficha):** Pantalla PPI con barrido y contactos
- **Archivo fuente:** `fx/fondos.js P.radar`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Origen en react-bits:** [Radar](../../../../../react-bits/src/content/Backgrounds/Radar/Radar.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="radar"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-topo` · Pintor topo

- **Diapositiva:** `l08-pintor-topo`
- **Propósito (texto de la ficha):** Terreno con curvas de nivel en perspectiva
- **Archivo fuente:** `fx/fondos.js P.topo`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D, marching squares
- **Origen en react-bits:** [Topography](../../../../../react-bits/src/content/Backgrounds/Topography/Topography.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="topo"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-isolineas` · Pintor isolineas

- **Diapositiva:** `l08-pintor-isolineas`
- **Propósito (texto de la ficha):** Curvas de nivel que fluyen en cat-1…3
- **Archivo fuente:** `fx/fondos.js P.isolineas`
- **Parámetros que muestra la ficha:** `tecnica`: GLSL 3.00 con respaldo 2D
- **Origen en react-bits:** [FluxLines](../../../../../react-bits/src/content/Backgrounds/FluxLines/FluxLines.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="isolineas"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-escaner` · Pintor escaner

- **Diapositiva:** `l08-pintor-escaner`
- **Propósito (texto de la ficha):** Sala de rejilla recorrida por un plano láser
- **Archivo fuente:** `fx/fondos.js P.escaner`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Origen en react-bits:** [GridScan](../../../../../react-bits/src/content/Backgrounds/GridScan/GridScan.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="escaner"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-velo` · Pintor velo

- **Diapositiva:** `l08-pintor-velo`
- **Propósito (texto de la ficha):** Banda de aurora en la parte superior
- **Archivo fuente:** `fx/fondos.js P.velo`
- **Parámetros que muestra la ficha:** `tecnica`: canvas 2D
- **Origen en react-bits:** [Aurora](../../../../../react-bits/src/content/Backgrounds/Aurora/Aurora.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="velo"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `pintor-none` · Pintor none

- **Diapositiva:** `l08-pintor-none`
- **Propósito (texto de la ficha):** Sin fondo: diapositiva lisa
- **Archivo fuente:** `fx/sistema.js painters.none`
- **Parámetros que muestra la ficha:** `tecnica`: —
- **Demo:** Portada a sangre con data-fx="backdrop" y data-painter="none"; ficha lateral sobre panel; en los pintores de estilo, una nota indica que es el fondo por defecto de ese estilo
- **Aceptación propia:** Se dibuja en suizo y noche, claro y oscuro, sin tapar la columna del título

### `q-floatinglines` · FloatingLines · quizás

- **Diapositiva:** `l08-q-floatinglines`
- **Propósito (texto de la ficha):** Haces de líneas finas luminosas que ondulan en tres bandas con profundidad de campo
- **Archivo fuente:** `react-bits/src/content/Backgrounds/FloatingLines/FloatingLines.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/FloatingLines/FloatingLines.jsx](../../../../../react-bits/src/content/Backgrounds/FloatingLines/FloatingLines.jsx) (596 líneas), CSS [FloatingLines.css](../../../../../react-bits/src/content/Backgrounds/FloatingLines/FloatingLines.css), props en [FloatingLinesDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/FloatingLinesDemo.jsx), presets en [FloatingLines.js](../../../../../react-bits/src/demo/Backgrounds/presets/FloatingLines.js), uso en [floatingLinesCode.js](../../../../../react-bits/src/constants/code/Backgrounds/floatingLinesCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** IMPLEMENTAR · coste M · valor 2,5 · estilos: aurora, rice, noche (suizo, matriz)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-floatinglines.js` (+ `fx/experimental/exp-floatinglines.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-floatinglines`. Antes, buscar `exp-floatinglines` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-floatinglines`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (30):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `linesGradient` | string[] | ['#e945f5', '#ffffff'] | Up to 8 colors blended across the lines of each wave. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `enabledWaves` | Array<'top' \| 'middle' \| 'bottom'> | ['top', 'middle', 'bottom'] | Which waves to show. | `data-enabled-waves` |
  | `lineCount` | number \| number[] | 10 | Lines per wave, from 1 to 24. Pass an array to set each enabled wave separately. | `data-line-count` |
  | `lineDistance` | number \| number[] | 6 | Spacing between the lines of a wave. Pass an array to set each enabled wave separately. | `data-line-distance` |
  | `lineStyle` | 'solid' \| 'dotted' \| 'dashed' | 'solid' | Draws the lines as solid strands, rows of dots or dashes. | `data-line-style` |
  | `lineWidth` | number | 1 | Width of each line in pixels. | `data-line-width` |
  | `glow` | number | 1 | Strength of the glow around the lines. | `data-glow` |
  | `brightness` | number | 1 | Overall brightness of the lines. | `data-brightness` |
  | `animationSpeed` | number | 1 | Speed of the wave motion. | `data-animation-speed` |
  | `amplitude` | number | 1 | Height of the waves. | `data-amplitude` |
  | `depthOfField` | number | 0.5 | How much the waves in the back soften out of focus, from 0 to 1. | `data-depth-of-field` |
  | `edgeFade` | number | 0 | Fades the lines out toward the left and right edges, from 0 to 1. | `data-edge-fade` |
  | `topWavePosition` | { x: number; y: number; rotate: number } | { x: 10, y: 0.5, rotate: -0.4 } | Offset, height and curl of the top wave. | `data-top-wave-position` |
  | `middleWavePosition` | { x: number; y: number; rotate: number } | { x: 5, y: 0, rotate: 0.2 } | Offset, height and curl of the middle wave. | `data-middle-wave-position` |
  | `bottomWavePosition` | { x: number; y: number; rotate: number } | { x: 2, y: -0.7, rotate: -1 } | Offset, height and curl of the bottom wave. | `data-bottom-wave-position` |
  | `interactive` | boolean | true | Bends the lines around the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `bendRadius` | number | 5 | Size of the area around the cursor that bends the lines. | `data-bend-radius` |
  | `bendStrength` | number | -0.5 | How strongly the lines bend. Negative values part them around the cursor, positive values pull them in. | `data-bend-strength` |
  | `mouseDamping` | number | 0.05 | How smoothly the bend follows the cursor, from 0 (frozen) to 1 (instant). | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `parallax` | boolean | true | Shifts the waves in depth as the cursor moves. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `parallaxStrength` | number | 0.2 | Strength of the parallax shift. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickSwirl` | boolean | true | Clicking stirs the lines into a curl that slowly unwinds, turning in the direction the cursor was moving. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Swells the waves in from flat lines on mount. | `data-intro` |
  | `mixBlendMode` | CSSProperties['mixBlendMode'] | 'screen' | CSS mix-blend-mode of the container in dark mode. | `data-mix-blend-mode` |
  | `backgroundColor` | string | - | Paints an opaque background behind the lines. Leave it unset for a transparent canvas. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `lightMode` | boolean | false | Draws the lines as ink for light backgrounds. | `data-light-mode` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-gradientascii` · GradientASCII · quizás

- **Diapositiva:** `l08-q-gradientascii`
- **Propósito (texto de la ficha):** Brillos en degradado dibujados con caracteres ASCII
- **Archivo fuente:** `react-bits/src/content/Backgrounds/GradientASCII/GradientASCII.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/GradientASCII/GradientASCII.jsx](../../../../../react-bits/src/content/Backgrounds/GradientASCII/GradientASCII.jsx) (848 líneas), CSS [GradientASCII.css](../../../../../react-bits/src/content/Backgrounds/GradientASCII/GradientASCII.css), props en [GradientASCIIDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/GradientASCIIDemo.jsx), presets en [GradientASCII.js](../../../../../react-bits/src/demo/Backgrounds/presets/GradientASCII.js), uso en [gradientASCIICode.js](../../../../../react-bits/src/constants/code/Backgrounds/gradientASCIICode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** IMPLEMENTAR · coste M · valor 2,5 · estilos: noche, **rice** (terminal de Hyprland), matriz
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-gradientascii.js` (+ `fx/experimental/exp-gradientascii.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-gradientascii`. Antes, buscar `exp-gradientascii` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-gradientascii`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (25):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `colors` | string[] | ['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8'] | Two to eight colors for the light, from the edge of the shadow to the brightest or farthest point. Dark areas stay transparent. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `shape` | 'horizon' \| 'pinch' \| 'rise' \| 'eclipse' | 'horizon' | Horizon glows over a dark curve, pinch is a band of light squeezed in the middle, rise glows up from the bottom and eclipse rings a dark disc. | `data-shape` |
  | `characters` | string | ' =+xX0S8#@' | Characters from dimmest to brightest. Brighter parts of the gradient use characters further along. | `data-characters` |
  | `cellSize` | number | 18 | Height of each character cell in px. | `data-cell-size` |
  | `density` | number | 0.8 | Share of cells that show a character, from 0 to 1. Brighter areas fill in first. | `data-density` |
  | `glyphOpacity` | number | 0.85 | How strongly the characters stand out from the gradient. | `data-glyph-opacity` |
  | `gradientOpacity` | number | 0.9 | Opacity of the gradient behind the characters. At 0 only the characters are left. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `glow` | number | 0.2 | Soft glow around the characters, from 0 to 1.5. | `data-glow` |
  | `depthOfField` | number | 0 | Share of characters drawn out of focus, from 0 to 1. | `data-depth-of-field` |
  | `flicker` | number | 0.2 | How often characters swap with their neighbors in brightness, from 0 to 1. | `data-flicker` |
  | `softness` | number | 0.5 | How soft the edges of the shape are, from 0 to 1. | `data-softness` |
  | `scale` | number | 1 | Size of the shape, from 0.4 to 2.5. | `data-scale` |
  | `flow` | number | 0.5 | How much the light wavers as it drifts, from 0 to 2. | `data-flow` |
  | `speed` | number | 1 | Speed of the drift. 0 holds the shape still. | `data-speed` |
  | `grain` | number | 0.08 | Strength of the film grain, from 0 to 0.4. | `data-grain` |
  | `variation` | number | 0 | Picks a different drift and a different pattern of characters. | `data-variation` |
  | `mouseInteraction` | boolean | true | Scrambles the characters under the cursor as it moves. They settle back a moment later. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `scrambleRadius` | number | 0.1 | Size of the scrambled area around the cursor, relative to the container height. | `data-scramble-radius` |
  | `clickEffect` | 'wave' \| 'burst' \| 'none' | 'wave' | Wave sends a ring of scrambled characters out from the click, burst scrambles a patch under it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Fades the light in from its source while the characters decode. | `data-intro` |
  | `lightMode` | boolean | false | Draws the gradient as a wash on light backgrounds, with characters a shade darker. | `data-light-mode` |
  | `fontFamily` | string | \'"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace\' | Font used for the characters. Monospaced fonts keep the grid even. | `data-font-family` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-faultyterminal` · FaultyTerminal · quizás

- **Diapositiva:** `l08-q-faultyterminal`
- **Propósito (texto de la ficha):** Terminal CRT de glifos que parpadean, con glitches y persistencia
- **Archivo fuente:** `react-bits/src/content/Backgrounds/FaultyTerminal/FaultyTerminal.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/FaultyTerminal/FaultyTerminal.jsx](../../../../../react-bits/src/content/Backgrounds/FaultyTerminal/FaultyTerminal.jsx) (871 líneas), CSS [FaultyTerminal.css](../../../../../react-bits/src/content/Backgrounds/FaultyTerminal/FaultyTerminal.css), props en [FaultyTerminalDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/FaultyTerminalDemo.jsx), presets en [FaultyTerminal.js](../../../../../react-bits/src/demo/Backgrounds/presets/FaultyTerminal.js), uso en [faultyTerminalCode.js](../../../../../react-bits/src/constants/code/Backgrounds/faultyTerminalCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** IMPLEMENTAR · coste M · valor 2,5 · estilos: noche, matriz (suizo, arcilla, celula)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-faultyterminal.js` (+ `fx/experimental/exp-faultyterminal.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-faultyterminal`. Antes, buscar `exp-faultyterminal` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-faultyterminal`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (29):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `tint` | string | '#ffffff' | Phosphor color of the glyphs. In light mode, light colors are deepened so they print clearly. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `glyphs` | 'blocks' \| 'dots' \| 'characters' | 'blocks' | What each cell draws: squares of lit pixels, round LED dots, or terminal characters that keep changing. | `data-glyphs` |
  | `scale` | number | 1 | Zoom of the pattern. Higher values show more, smaller glyphs. | `data-scale` |
  | `gridMul` | [number, number] | [2, 1] | Glyph density across and down, multiplied with scale. | `data-grid-mul` |
  | `digitSize` | number | 1.5 | Space around each glyph. 1 packs them edge to edge, higher values leave wider gaps. | `data-digit-size` |
  | `timeScale` | number | 0.3 | Speed of the animation. | `data-time-scale` |
  | `brightness` | number | 1 | Overall brightness of the screen, or ink strength in light mode. | `data-brightness` |
  | `glow` | number | 0.5 | Phosphor bloom around the glyphs, with richer color in the halo and paler bright cores. | `data-glow` |
  | `persistence` | number | 0.5 | How long glyphs keep glowing after they switch off, like real phosphor. Leaves trails behind the cursor. | `data-persistence` |
  | `mouseReact` | boolean | true | Lights up the glyphs around the cursor. The light rests in the middle while the cursor is away. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 0.2 | How many glyphs the cursor lights up around it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseGlow` | number | 0.6 | How much the glyphs under the cursor heat up toward white while you move. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `scramble` | number | 0.5 | How fast characters change near the cursor. Only used with characters. | `data-scramble` |
  | `clickEffect` | 'glitch' \| 'degauss' \| 'none' | 'glitch' | What a click does: tear the screen into shifting bands, or send a wobbling degauss wave from the click. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `scanlineIntensity` | number | 0.3 | Strength of the soft halo and the bright band that rolls down the screen. | `data-scanline-intensity` |
  | `glitchAmount` | number | 1 | How far the faulty bands of the screen shift sideways. | `data-glitch-amount` |
  | `flickerAmount` | number | 1 | How often the faulty bands appear. | `data-flicker-amount` |
  | `noiseAmp` | number | 1 | Strength of the swirling pattern that decides which glyphs light up. | `data-noise-amp` |
  | `chromaticAberration` | number | 0 | Splits the red and blue channels apart, in pixels. | `data-chromatic-aberration` |
  | `curvature` | number | 0.2 | Bulge of the screen, like the glass of an old tube. | `data-curvature` |
  | `vignette` | number | 0.25 | Darkens the edges of the screen so it fades into the page. | `data-vignette` |
  | `dither` | number \| boolean | 0 | Fine noise that smooths color banding. | `data-dither` |
  | `pageLoadAnimation` | boolean | true | Switches the glyphs on one by one, each with a short phosphor flash, on mount. | `data-page-load-animation` |
  | `pause` | boolean | false | Freezes the animation. The cursor still lights up glyphs. | `data-pause` |
  | `variation` | number | random | Picks a fixed pattern. Leave it out for a different one on every mount. | `data-variation` |
  | `lightMode` | boolean | false | Prints the glyphs as crisp ink on a light page. | `data-light-mode` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-elasticmesh` · ElasticMesh · quizás

- **Diapositiva:** `l08-q-elasticmesh`
- **Propósito (texto de la ficha):** Texto o logo inflado que se aplasta y rebota
- **Archivo fuente:** `react-bits/src/content/Animations/ElasticMesh/ElasticMesh.jsx (aún no portado al motor)`
- **Nota:** solo portada de arcilla
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/ElasticMesh/ElasticMesh.jsx](../../../../../react-bits/src/content/Animations/ElasticMesh/ElasticMesh.jsx) (1391 líneas), CSS [ElasticMesh.css](../../../../../react-bits/src/content/Animations/ElasticMesh/ElasticMesh.css), props en [ElasticMeshDemo.jsx](../../../../../react-bits/src/demo/Animations/ElasticMeshDemo.jsx), uso en [elasticMeshCode.js](../../../../../react-bits/src/constants/code/Animations/elasticMeshCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (solo portada de arcilla; baja prioridad) · coste L · valor 1 · estilos: arcilla (plastilina) / el resto
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-elasticmesh.js` (+ `fx/experimental/exp-elasticmesh.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-elasticmesh`. Antes, buscar `exp-elasticmesh` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-elasticmesh`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (19):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `text` | string | 'Squish' | Text to inflate. Use \\n for more lines. | `data-text` |
  | `src` | string | '' | URL of an SVG or PNG to inflate instead of text. Its transparent pixels define the shape. | `data-src` |
  | `fontFamily` | string | 'system-ui, sans-serif' | Font used for the text. Heavy, rounded faces inflate best. | `data-font-family` |
  | `fontWeight` | number | 900 | Weight of the text. | `data-font-weight` |
  | `color` | string | '#3b5bff' | Base color of the material. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `imageColors` | boolean | true | Keeps the colors of the image passed to src instead of using color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `material` | 'balloon' \| 'chrome' \| 'jelly' \| 'clay' | 'balloon' | Surface finish: glossy balloon, mirror chrome, glowing jelly or soft matte clay. | `data-material` |
  | `inflate` | number | 1 | How puffy the shape is. 1 gives round tubes. | `data-inflate` |
  | `stiffness` | number | 0.5 | How firm the material feels, from 0 for soft and stretchy to 1 for firm and quick. | `data-stiffness` |
  | `wobble` | number | 0.6 | How long it jiggles after a poke or a pull, from 0 to 1. | `data-wobble` |
  | `grabRadius` | number | 70 | Size of the area the cursor grabs and presses, in pixels. | `data-grab-radius` |
  | `stretch` | number | 0.5 | How far the material can be pulled, from 0 to 1. | `data-stretch` |
  | `press` | number | 0.5 | Depth of the dent under the cursor and of a poke. | `data-press` |
  | `shadow` | number | 0.5 | Strength of the soft drop shadow. | `data-shadow` |
  | `intro` | boolean | true | Inflates the shape letter by letter on mount. | `data-intro` |
  | `theme` | 'dark' \| 'light' | 'dark' | Lighting setup for dark or light pages. | `data-theme` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-acidsquares` · AcidSquares · quizás

- **Diapositiva:** `l08-q-acidsquares`
- **Propósito (texto de la ficha):** Campo de baldosas brillantes que ondula bajo dos luces de color
- **Archivo fuente:** `react-bits/src/content/Backgrounds/AcidSquares/AcidSquares.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/AcidSquares/AcidSquares.jsx](../../../../../react-bits/src/content/Backgrounds/AcidSquares/AcidSquares.jsx) (961 líneas), CSS [AcidSquares.css](../../../../../react-bits/src/content/Backgrounds/AcidSquares/AcidSquares.css), props en [AcidSquaresDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/AcidSquaresDemo.jsx), presets en [AcidSquares.js](../../../../../react-bits/src/demo/Backgrounds/presets/AcidSquares.js), uso en [acidSquaresCode.js](../../../../../react-bits/src/constants/code/Backgrounds/acidSquaresCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste L · valor 2 · estilos: cromo, arcilla (suizo, celula)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-acidsquares.js` (+ `fx/experimental/exp-acidsquares.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-acidsquares`. Antes, buscar `exp-acidsquares` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-acidsquares`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (38):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color` | string | '#120f17' | Base color of the squares. Set it to your page background, the gaps show the page through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `accentColor` | string | '#ff4fb8' | Color of the first light that drifts across the squares. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `secondaryColor` | string | '#3b6bff' | Color of the second light. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `tileSize` | number | 1 | Size of the squares. | `data-tile-size` |
  | `gap` | number | 0.12 | Width of the gaps between the squares. | `data-gap` |
  | `roundness` | number | 0.25 | Corner radius, from sharp squares at 0 to circles at 1. | `data-roundness` |
  | `softness` | number | 0.5 | How softly the edges of each square round off into the gaps. | `data-softness` |
  | `bulge` | number | 0.3 | How much each square domes up like a cushion. 0 keeps the tops flat. | `data-bulge` |
  | `rotation` | number | 35 | Rotation of the grid, in degrees. | `data-rotation` |
  | `gloss` | number | 0.6 | From soft satin at 0 to glossy at 1, with tighter highlights along the edges. | `data-gloss` |
  | `waves` | number | 1 | Height of the slow swells. 0 lays the surface flat. | `data-waves` |
  | `waveScale` | number | 1 | Size of the swells. Higher makes them broader. | `data-wave-scale` |
  | `speed` | number | 0.6 | Speed of the swells and the drifting lights. | `data-speed` |
  | `shape` | 'square' \| 'round' | 'square' | Shape of the ripples that travel across the surface. | `data-shape` |
  | `pulse` | number | 1 | Height of the ripples. 0 turns them off. | `data-pulse` |
  | `pulseSpeed` | number | 0.45 | How fast the ripples travel. | `data-pulse-speed` |
  | `pulseSpacing` | number | 1 | Time between ripples. | `data-pulse-spacing` |
  | `pulseWidth` | number | 1 | Width of each ripple. | `data-pulse-width` |
  | `pulseOrigin` | 'center' \| 'random' | 'center' | Start every ripple from the center, or from random spots on the surface. | `data-pulse-origin` |
  | `lighting` | 'split' \| 'backlit' \| 'overhead' | 'split' | Placement of the two lights: from either side, low behind the surface, or from above. | `data-lighting` |
  | `brightness` | number | 1 | Overall brightness. | `data-brightness` |
  | `tilt` | number | 0.7 | View angle, from straight down at 0 to low across the surface at 1. | `data-tilt` |
  | `zoom` | number | 1 | Zoom. Higher brings the squares closer. | `data-zoom` |
  | `depth` | number | 10 | How far the surface reaches before it fades into the page. | `data-depth` |
  | `grain` | number | 0.12 | Strength of the film grain. | `data-grain` |
  | `fade` | number | 0 | Fades the edges into the page, from 0 to 1. | `data-fade` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `intro` | boolean | true | Switches the squares on from the center outward when the effect first appears. | `data-intro` |
  | `mouseInteraction` | boolean | true | Lets the cursor shape the surface and the view follow it slightly. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `hoverEffect` | 'press' \| 'lift' \| 'none' | 'press' | Whether the cursor presses the surface down or lifts it up. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 1 | Depth of the cursor press or lift. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseRadius` | number | 0.35 | Size of the area the cursor shapes. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `pulseOnClick` | boolean | true | Sends a ripple out from wherever you click. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `detail` | 'low' \| 'medium' \| 'high' | 'medium' | Smoothness of the surface. Lower it for weaker devices. | `data-detail` |
  | `lightMode` | boolean | false | Draws pale squares with soft tints for light backgrounds. | `data-light-mode` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-beams` · Beams · quizás

- **Diapositiva:** `l08-q-beams`
- **Propósito (texto de la ficha):** Cintas satinadas que ondulan en la oscuridad con brillo especular
- **Archivo fuente:** `react-bits/src/content/Backgrounds/Beams/Beams.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/Beams/Beams.jsx](../../../../../react-bits/src/content/Backgrounds/Beams/Beams.jsx) (626 líneas), CSS [Beams.css](../../../../../react-bits/src/content/Backgrounds/Beams/Beams.css), props en [BeamsDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/BeamsDemo.jsx), presets en [Beams.js](../../../../../react-bits/src/demo/Backgrounds/presets/Beams.js), uso en [beamsCode.js](../../../../../react-bits/src/constants/code/Backgrounds/beamsCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste M · valor 2 · estilos: cromo, noche (suizo, celula)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-beams.js` (+ `fx/experimental/exp-beams.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-beams`. Antes, buscar `exp-beams` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-beams`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (24):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color` | string | '#ffffff' | Color of the light that glints off the beams. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `beamWidth` | number | 140 | Width of each beam, in px. | `data-beam-width` |
  | `rotation` | number | 30 | Angle of the beams, in degrees. | `data-rotation` |
  | `speed` | number | 1 | How fast the ripples move. | `data-speed` |
  | `waveLength` | number | 233 | Length of the ripples along each beam, in px. | `data-wave-length` |
  | `depth` | number | 1 | How deep the ripples are. Deeper ripples catch the light in more places. | `data-depth` |
  | `sharpness` | number | 0.6 | How crisp the glints are, from 0 for soft satin to 1 for sharp, glossy streaks. | `data-sharpness` |
  | `twist` | number | 0 | Turns each beam slightly on its own axis, so glints show up on more beams. | `data-twist` |
  | `fillLight` | number | 0.3 | Strength of a dimmer second light from the other side, for fuller, more metallic beams. | `data-fill-light` |
  | `brightness` | number | 1.6 | Strength of the light. | `data-brightness` |
  | `glow` | number | 0.6 | Soft glow around the brightest glints. | `data-glow` |
  | `grain` | number | 0.35 | Strength of the film grain, from 0 to 1. | `data-grain` |
  | `variation` | number | 0 | Picks a different ripple pattern. Any number works. | `data-variation` |
  | `mouseInteraction` | boolean | true | The cursor moves the light along the beams and brightens the glints near it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 1 | How strongly the cursor moves the light. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Sweeps the light in on mount. | `data-intro` |
  | `fade` | number | 0 | Fades the edges into the page, from 0 to 1. | `data-fade` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `lightMode` | boolean | false | Prints the glints as soft ink, for light backgrounds. | `data-light-mode` |
  | `backgroundColor` | string | undefined | Optional solid background. By default the canvas is transparent and the page shows through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `quality` | number | 0.75 | Render resolution, from 0.25 to 1. Lower values run faster. | `data-quality` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-crtwarp` · CRTWarp · quizás

- **Diapositiva:** `l08-q-crtwarp`
- **Propósito (texto de la ficha):** Plasma en bloques sobre un CRT curvo con scanlines, máscara de fósforo y persistencia
- **Archivo fuente:** `react-bits/src/content/Backgrounds/CRTWarp/CRTWarp.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/CRTWarp/CRTWarp.jsx](../../../../../react-bits/src/content/Backgrounds/CRTWarp/CRTWarp.jsx) (831 líneas), CSS [CRTWarp.css](../../../../../react-bits/src/content/Backgrounds/CRTWarp/CRTWarp.css), props en [CRTWarpDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/CRTWarpDemo.jsx), presets en [CRTWarp.js](../../../../../react-bits/src/demo/Backgrounds/presets/CRTWarp.js), uso en [crtWarpCode.js](../../../../../react-bits/src/constants/code/Backgrounds/crtWarpCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste M–L · valor 2 · estilos: noche, matriz (suizo, arcilla)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-crtwarp.js` (+ `fx/experimental/exp-crtwarp.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-crtwarp`. Antes, buscar `exp-crtwarp` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-crtwarp`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (33):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color` | string | '#c755f7' | Phosphor color of the picture. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `backgroundColor` | string | '#120f17' | Color of the dark tube behind the picture. Use 'transparent' to let the page show through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `lightMode` | boolean | false | Prints the picture as ink on a light background instead of glowing phosphor. | `data-light-mode` |
  | `mask` | 'aperture' \| 'shadow' \| 'slot' \| 'none' | 'aperture' | The phosphor pattern of the tube: vertical stripes, dot triads, slots, or a plain mono tube. | `data-mask` |
  | `speed` | number | 0.5 | How fast the plasma flows. | `data-speed` |
  | `variation` | number | 0 | Picks a different plasma pattern. Each whole number is a new one. | `data-variation` |
  | `waveAmplitude` | number | 0.3 | How tightly the plasma folds into bands. | `data-wave-amplitude` |
  | `waveFrequency` | number | 2.5 | How many blobs fit on screen. | `data-wave-frequency` |
  | `levels` | number | 3 | Number of brightness steps in the picture. | `data-levels` |
  | `columns` | number | 80 | Width of the low resolution picture in blocks. Fewer columns make chunkier blocks. | `data-columns` |
  | `persistence` | number | 0.4 | How long the phosphor keeps glowing after the picture moves on, leaving soft trails. | `data-persistence` |
  | `curvature` | number | 0.25 | Bulge of the curved glass. | `data-curvature` |
  | `corners` | number | 0 | Rounds the corners of the tube and shows its edge. 0 keeps the picture edge to edge. | `data-corners` |
  | `scanlineStrength` | number | 0.6 | Depth of the dark gaps between scanlines. Bright lines widen and fill the gaps. | `data-scanline-strength` |
  | `scanlineFrequency` | number | 200 | Number of scanlines from top to bottom. | `data-scanline-frequency` |
  | `maskStrength` | number | 0.3 | Visibility of the phosphor mask. | `data-mask-strength` |
  | `bloom` | number | 1.5 | Glow that spills from bright areas. | `data-bloom` |
  | `bloomRadius` | number | 1 | How far the glow spreads. | `data-bloom-radius` |
  | `rgbShift` | number | 0.003 | Misalignment of the red and blue beams, which fringes edges with color. | `data-rgb-shift` |
  | `noise` | number | 0.1 | Grain in the lit picture. | `data-noise` |
  | `flicker` | number | 0.15 | Brightness flicker of the tube. | `data-flicker` |
  | `interference` | number | 0.2 | A slow hum bar rolling down the screen and jitter along the lines. | `data-interference` |
  | `vignette` | number | 0.3 | Darkening toward the edges of the tube. | `data-vignette` |
  | `brightness` | number | 1 | Overall brightness, or ink strength in light mode. | `data-brightness` |
  | `intro` | boolean | true | Warms the tube up when it first comes into view: the plasma grows out of the dark and pulls into focus. | `data-intro` |
  | `mouseReact` | boolean | true | The cursor acts like a magnet held to the glass, twisting the picture with color fringes. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 0.5 | Strength of the magnet. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `changeOnClick` | boolean | true | Clicking changes the channel: the picture rolls through static and comes back with a new pattern. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `dpr` | number | 2 | Maximum device pixel ratio of the canvas. | `data-dpr` |
  | `fps` | number | 60 | Maximum frame rate. | `data-fps` |
  | `paused` | boolean | false | Freezes the plasma. | `data-paused` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-darkveil` · DarkVeil · quizás

- **Diapositiva:** `l08-q-darkveil`
- **Propósito (texto de la ficha):** Velo sedoso generado por una **CPPN** (red neuronal de pesos fijos)
- **Archivo fuente:** `react-bits/src/content/Backgrounds/DarkVeil/DarkVeil.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/DarkVeil/DarkVeil.jsx](../../../../../react-bits/src/content/Backgrounds/DarkVeil/DarkVeil.jsx) (564 líneas), CSS [DarkVeil.css](../../../../../react-bits/src/content/Backgrounds/DarkVeil/DarkVeil.css), props en [DarkVeilDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/DarkVeilDemo.jsx), presets en [DarkVeil.js](../../../../../react-bits/src/demo/Backgrounds/presets/DarkVeil.js), uso en [darkVeilCode.js](../../../../../react-bits/src/constants/code/Backgrounds/darkVeilCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (colores fijos y pesos con licencia) · coste S–M · valor 2 (en charlas de ML) · estilos: noche, aurora
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-darkveil.js` (+ `fx/experimental/exp-darkveil.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-darkveil`. Antes, buscar `exp-darkveil` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-darkveil`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color` | string | '#6b12ff' | Color of the veil. Highlights are derived from it. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `speed` | number | 0.5 | Animation speed. | `data-speed` |
  | `scale` | number | 1 | Zoom of the veil. Higher values zoom in. | `data-scale` |
  | `rotation` | number | 0 | Turns the veil around the center, in degrees. | `data-rotation` |
  | `flow` | number | 1 | How much the veil drifts and changes shape over time. | `data-flow` |
  | `warp` | number | 0 | Adds a gentle ripple to the veil. | `data-warp` |
  | `variation` | number | 0 | Picks a different veil shape. Any number works. | `data-variation` |
  | `brightness` | number | 1 | Overall brightness. | `data-brightness` |
  | `sheen` | number | 0 | Strength of the silky highlights along the folds. They follow the cursor like a light. | `data-sheen` |
  | `glow` | number | 0.4 | Soft glow around the brightest parts. | `data-glow` |
  | `grain` | number | 0.03 | Strength of the film grain. | `data-grain` |
  | `quality` | number | 0.5 | Render resolution, from 0.25 to 1. The veil is soft, so lower values look almost the same and run faster. | `data-quality` |
  | `mouseInteraction` | boolean | true | The veil swirls, morphs and lights up around the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 1 | How strongly the cursor bends the veil. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Fades the veil in as it unfolds. | `data-intro` |
  | `fade` | number | 0 | Fades the edges into the page, from 0 to 1. | `data-fade` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `lightMode` | boolean | false | Draws the veil as soft tinted ink for light backgrounds. | `data-light-mode` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-dither` · Dither · quizás

- **Diapositiva:** `l08-q-dither`
- **Propósito (texto de la ficha):** Ondas con tramado Bayer, semitono o ruido en paleta reducida
- **Archivo fuente:** `react-bits/src/content/Backgrounds/Dither/Dither.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/Dither/Dither.jsx](../../../../../react-bits/src/content/Backgrounds/Dither/Dither.jsx) (669 líneas), CSS [Dither.css](../../../../../react-bits/src/content/Backgrounds/Dither/Dither.css), props en [DitherDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/DitherDemo.jsx), presets en [Dither.js](../../../../../react-bits/src/demo/Backgrounds/presets/Dither.js), uso en [ditherCode.js](../../../../../react-bits/src/constants/code/Backgrounds/ditherCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste M · valor 2 · estilos: matriz, noche, termica (aurora, cromo)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-dither.js` (+ `fx/experimental/exp-dither.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-dither`. Antes, buscar `exp-dither` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-dither`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (23):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `waveColor` | string \| [number, number, number] | [0.5, 0.5, 0.5] | Color of the waves. Accepts any CSS color, or a linear RGB array from 0 to 1. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `backgroundColor` | string \| [number, number, number] | [0, 0, 0] | Color behind the waves. Use 'transparent' to dither the waves over your own background. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `ditherMode` | 'bayer' \| 'bayer4' \| 'bayer2' \| 'halftone' \| 'lines' \| 'crosshatch' \| 'noise' \| 'none' | 'bayer' | Pattern used to dither the shades. | `data-dither-mode` |
  | `palette` | string[] | - | Two to eight colors from dark to light. Replaces the wave and background colors with an indexed palette. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `colorNum` | number | 4 | Number of shades per color channel. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `pixelSize` | number | 2 | Size of each dither pixel, in px. | `data-pixel-size` |
  | `scale` | number | 1 | Size of the wave pattern. | `data-scale` |
  | `waveSpeed` | number | 0.05 | Speed of the wave animation. | `data-wave-speed` |
  | `waveFrequency` | number | 3 | How much finer each layer of detail gets. | `data-wave-frequency` |
  | `waveAmplitude` | number | 0.3 | How strongly the finer layers of detail show. | `data-wave-amplitude` |
  | `contrast` | number | 1 | Contrast of the waves before dithering. | `data-contrast` |
  | `brightness` | number | 0 | Brightens or darkens the waves. | `data-brightness` |
  | `enableMouseInteraction` | boolean | true | Lets the cursor interact with the waves. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseEffect` | 'erase' \| 'reveal' \| 'ripple' | 'erase' | Erase darkens the waves under the cursor, reveal lights them up and ripple bends them. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseRadius` | number | 1 | Radius of the cursor effect. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 1 | Strength of the cursor effect. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `trail` | number | 0.5 | How long the cursor leaves a fading trail, from 0 to 1. | `data-trail` |
  | `clickRipple` | boolean | true | Clicking sends a ring through the waves. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Resolves from chunky pixels to full detail on mount. | `data-intro` |
  | `disableAnimation` | boolean | false | Freezes the wave animation. | `data-disable-animation` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-ferrofluid` · Ferrofluid · quizás

- **Diapositiva:** `l08-q-ferrofluid`
- **Propósito (texto de la ficha):** Mar brillante de ferrofluido con picos
- **Archivo fuente:** `react-bits/src/content/Backgrounds/Ferrofluid/Ferrofluid.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/Ferrofluid/Ferrofluid.jsx](../../../../../react-bits/src/content/Backgrounds/Ferrofluid/Ferrofluid.jsx) (908 líneas), CSS [Ferrofluid.css](../../../../../react-bits/src/content/Backgrounds/Ferrofluid/Ferrofluid.css), props en [FerrofluidDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/FerrofluidDemo.jsx), presets en [Ferrofluid.js](../../../../../react-bits/src/demo/Backgrounds/presets/Ferrofluid.js), uso en [ferrofluidCode.js](../../../../../react-bits/src/constants/code/Backgrounds/ferrofluidCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste L · valor 2,5 · estilos: **cromo** (resto)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-ferrofluid.js` (+ `fx/experimental/exp-ferrofluid.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-ferrofluid`. Antes, buscar `exp-ferrofluid` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-ferrofluid`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (27):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `colors` | string[] | ['#ffffff', '#ffffff', '#ffffff'] | Colors of the studio lights reflected in the fluid: key light, side lights and fill light. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `brightness` | number | 1 | Strength of the reflections. | `data-brightness` |
  | `scale` | number | 1.6 | Zoom of the fluid. Higher values show bigger, fewer spikes. | `data-scale` |
  | `spikeHeight` | number | 1 | How tall the spikes grow in a strong field. | `data-spike-height` |
  | `sharpness` | number | 2.5 | How peaked the spikes are. Low values give soft mounds, high values taller cones. Tips always stay rounded. | `data-sharpness` |
  | `tilt` | number | 48 | Viewing angle in degrees. Low values look down from above, high values look across the fluid. | `data-tilt` |
  | `turbulence` | number | 1 | How much the spike pattern sways and drifts out of its regular grid. | `data-turbulence` |
  | `fluidity` | number | 0.5 | How loosely the spikes respond, from 0 (thick and slow) to 1 (bouncy). | `data-fluidity` |
  | `speed` | number | 0.5 | How fast the swells roll across the surface. | `data-speed` |
  | `magnetism` | number | 1 | Strength of the magnetic field that raises swells of spikes across the surface. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `variation` | number | 0 | Picks a different arrangement of swells. | `data-variation` |
  | `flowDirection` | 'down' \| 'up' \| 'left' \| 'right' \| 'none' | 'down' | Direction the swells roll. None keeps them morphing in place. | `data-flow-direction` |
  | `mouseInteraction` | boolean | true | Turns the cursor into a magnet that raises a crown of spikes. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 1 | Strength of the cursor magnet. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseRadius` | number | 0.22 | Reach of the cursor magnet, as a fraction of the height. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseDampening` | number | 0.15 | Time in seconds the crown takes to catch up with the cursor. 0 follows instantly. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickPulse` | boolean | true | Clicking sends a magnetic pulse through the fluid. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Raises the spikes when the field switches on. | `data-intro` |
  | `lightMode` | boolean | false | Renders the fluid as glossy white liquid for light backgrounds. | `data-light-mode` |
  | `transparent` | boolean | true | Lets the page show through. When off, the fluid sits on the color below. | `data-transparent` |
  | `color` | string | '#120f17' | Background color when transparent is off. Defaults to white in light mode. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `paused` | boolean | false | Freezes the fluid. | `data-paused` |
  | `mixBlendMode` | string | - | CSS mix-blend-mode applied to the container. | `data-mix-blend-mode` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-galaxy` · Galaxy · quizás

- **Diapositiva:** `l08-q-galaxy`
- **Propósito (texto de la ficha):** Vuelo por un campo de estrellas en capas con saltos warp
- **Archivo fuente:** `react-bits/src/content/Backgrounds/Galaxy/Galaxy.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/Galaxy/Galaxy.jsx](../../../../../react-bits/src/content/Backgrounds/Galaxy/Galaxy.jsx) (592 líneas), CSS [Galaxy.css](../../../../../react-bits/src/content/Backgrounds/Galaxy/Galaxy.css), props en [GalaxyDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/GalaxyDemo.jsx), presets en [Galaxy.js](../../../../../react-bits/src/demo/Backgrounds/presets/Galaxy.js), uso en [galaxyCode.js](../../../../../react-bits/src/constants/code/Backgrounds/galaxyCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste M · valor 2 · estilos: noche (suizo, arcilla)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-galaxy.js` (+ `fx/experimental/exp-galaxy.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-galaxy`. Antes, buscar `exp-galaxy` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-galaxy`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (29):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `starColors` | string[] | - | Up to four colors the stars are picked from. Replaces the hue shift and saturation coloring. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `hueShift` | number | 140 | Shifts the hue of the stars, in degrees. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `saturation` | number | 0 | Color saturation of the stars, from 0 to 1. | `data-saturation` |
  | `density` | number | 1 | How densely the stars are packed. | `data-density` |
  | `glowIntensity` | number | 0.3 | Brightness of the glow around each star. | `data-glow-intensity` |
  | `starSize` | number | 1 | Size of each star glow. | `data-star-size` |
  | `flareIntensity` | number | 1 | Strength of the cross flares on the brightest stars. | `data-flare-intensity` |
  | `twinkleIntensity` | number | 0.3 | How much the stars twinkle, from 0 to 1. | `data-twinkle-intensity` |
  | `starSpeed` | number | 0.5 | How fast you travel through the stars. | `data-star-speed` |
  | `speed` | number | 1 | Overall speed of the animation. | `data-speed` |
  | `rotationSpeed` | number | 0.1 | How fast the starfield rotates. | `data-rotation-speed` |
  | `layers` | number | 4 | Number of star layers, from 2 to 8. | `data-layers` |
  | `direction` | 'forward' \| 'backward' | 'forward' | Whether you fly into the stars or drift back out of them. | `data-direction` |
  | `mouseInteraction` | boolean | true | Lets the cursor interact with the stars. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseRepulsion` | boolean | true | Pushes the stars away from the cursor. When off, the field shifts with the cursor instead. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `repulsionStrength` | number | 2 | Strength of the push away from the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `autoCenterRepulsion` | number | 0 | Pushes the stars away from the center without the cursor. 0 turns it off. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickWarp` | boolean | true | Clicking jumps forward at warp speed. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Drops out of warp speed on mount. | `data-intro` |
  | `focal` | [number, number] | [0.5, 0.5] | Center of the starfield, from 0 to 1. | `data-focal` |
  | `rotation` | [number, number] | [1, 0] | Fixed rotation of the starfield as a [cos, sin] pair. | `data-rotation` |
  | `transparent` | boolean | true | Shows the page behind the stars. When off, the stars sit on the background color. | `data-transparent` |
  | `backgroundColor` | string | '#000000' | Background behind the stars when transparent is off, or the paper color in light mode. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `lightMode` | boolean | false | Draws the stars as ink for light backgrounds. | `data-light-mode` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `disableAnimation` | boolean | false | Freezes the animation. | `data-disable-animation` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-ghostfibers` · GhostFibers · quizás

- **Diapositiva:** `l08-q-ghostfibers`
- **Propósito (texto de la ficha):** Cintas de fibras luminosas con profundidad de campo y partículas
- **Archivo fuente:** `react-bits/src/content/Backgrounds/GhostFibers/GhostFibers.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/GhostFibers/GhostFibers.jsx](../../../../../react-bits/src/content/Backgrounds/GhostFibers/GhostFibers.jsx) (1093 líneas), CSS [GhostFibers.css](../../../../../react-bits/src/content/Backgrounds/GhostFibers/GhostFibers.css), props en [GhostFibersDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/GhostFibersDemo.jsx), presets en [GhostFibers.js](../../../../../react-bits/src/demo/Backgrounds/presets/GhostFibers.js), uso en [ghostFibersCode.js](../../../../../react-bits/src/constants/code/Backgrounds/ghostFibersCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste L · valor 2 · estilos: aurora, cromo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-ghostfibers.js` (+ `fx/experimental/exp-ghostfibers.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-ghostfibers`. Antes, buscar `exp-ghostfibers` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-ghostfibers`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (38):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `glowColor` | string | '#8b5cf6' | Main color of the fibers. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `lineColor` | string | - | Color of the bright folds, sparkles and tips. Leave it out to use a pale tint of the glow color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `secondaryColor` | string | - | Second color the gradient blends toward. Leave it out to use a deeper shade of the glow color. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `gradient` | 'depth' \| 'along' \| 'across' | 'depth' | How the two colors blend: by distance, along the length of the ribbons, or across their width. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `layers` | number | 3 | Number of ribbons, from 1 to 3. | `data-layers` |
  | `waves` | number | 1 | How much the ribbons undulate. 0 keeps them straight. | `data-waves` |
  | `twist` | number | 1.2 | How often the ribbons turn over along their length. | `data-twist` |
  | `volume` | number | 0.7 | Thickness of each ribbon, from a single flat sheet at 0 to a layered bundle. | `data-volume` |
  | `spread` | number | 1 | Width of the ribbons. | `data-spread` |
  | `scale` | number | 1 | Size of the whole effect. | `data-scale` |
  | `rotation` | number | 18 | Tilt of the whole effect, in degrees. | `data-rotation` |
  | `perspective` | number | 0.65 | How far the ribbons turn into the distance, from side-on at 0 to steeply receding at 1. | `data-perspective` |
  | `threads` | number | 72 | Number of fibers in each ribbon. | `data-threads` |
  | `density` | number | 1 | Number of dots along each fiber. | `data-density` |
  | `thickness` | number | 1 | Size of the dots. | `data-thickness` |
  | `fiberStyle` | 'dots' \| 'dashes' \| 'lines' | 'dots' | Draws the fibers as rows of dots, short dashes or continuous lines. | `data-fiber-style` |
  | `tips` | number | 0 | Cuts the fibers at different lengths and lights their ends, like fiber optics. | `data-tips` |
  | `foldGlow` | number | 1 | Brightness of the light where the ribbons fold edge-on. | `data-fold-glow` |
  | `speed` | number | 0.5 | Speed of the waves and the twist. 0 holds them still. | `data-speed` |
  | `flow` | number | 0.4 | Speed of the dots along the fibers. Negative values reverse them. | `data-flow` |
  | `rollSpeed` | number | 0.15 | How fast the ribbons roll around their length. | `data-roll-speed` |
  | `depthOfField` | number | 0.85 | Strength of the camera blur away from the focus. 0 keeps everything sharp. | `data-depth-of-field` |
  | `focusDepth` | number | 0 | Moves the focus nearer with negative values or farther with positive ones. | `data-focus-depth` |
  | `particles` | number | 0.5 | Amount of dust floating around the ribbons. | `data-particles` |
  | `sparkle` | number | 0.5 | How often single dots twinkle. | `data-sparkle` |
  | `glow` | number | 0.8 | Strength of the bloom around the bright areas. | `data-glow` |
  | `brightness` | number | 1 | Overall brightness. | `data-brightness` |
  | `vignette` | number | 0.3 | How much the edges fade out, from 0 to 1. | `data-vignette` |
  | `grain` | number | 0.06 | Strength of the film grain. | `data-grain` |
  | `mouseInteraction` | boolean | true | Lets the view follow the cursor slightly and turns on the hover effect. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `hoverEffect` | 'focus' \| 'part' \| 'none' | 'focus' | Pulls the focus to the ribbon under the cursor, parts the fibers around it, or does nothing. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 1 | Strength of the hover effect. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `pulseOnClick` | boolean | true | Sends a pulse of light along the ribbon you click. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Draws the ribbons in from one end when the effect first appears. | `data-intro` |
  | `lightMode` | boolean | false | Draws the fibers as colored ink for light backgrounds. | `data-light-mode` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-gradientwaves` · GradientWaves · quizás

- **Diapositiva:** `l08-q-gradientwaves`
- **Propósito (texto de la ficha):** Olas satinadas que avanzan desde un horizonte con bruma (heightfield con raymarch)
- **Archivo fuente:** `react-bits/src/content/Backgrounds/GradientWaves/GradientWaves.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/GradientWaves/GradientWaves.jsx](../../../../../react-bits/src/content/Backgrounds/GradientWaves/GradientWaves.jsx) (634 líneas), CSS [GradientWaves.css](../../../../../react-bits/src/content/Backgrounds/GradientWaves/GradientWaves.css), props en [GradientWavesDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/GradientWavesDemo.jsx), presets en [GradientWaves.js](../../../../../react-bits/src/demo/Backgrounds/presets/GradientWaves.js), uso en [gradientWavesCode.js](../../../../../react-bits/src/constants/code/Backgrounds/gradientWavesCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ · coste L · valor 2 · estilos: noche (ya tiene horizonte), aurora
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-gradientwaves.js` (+ `fx/experimental/exp-gradientwaves.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-gradientwaves`. Antes, buscar `exp-gradientwaves` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-gradientwaves`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (31):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `horizonColor` | string | '#5227FF' | Haze the waves fade into toward the horizon, and the tint of their shadows. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `waveColor` | string | '#FF9FFC' | Main color of the wave bodies. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `crestColor` | string | '#FFFFFF' | Color of the crests and the light they catch. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `backgroundColor` | string | 'transparent' | Fills the canvas behind the waves. Transparent lets the page show through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `lightMode` | boolean | false | Draws the waves as soft colored ink for light pages. | `data-light-mode` |
  | `speed` | number | 0.4 | How fast the waves roll in. | `data-speed` |
  | `amplitude` | number | 2.5 | Height of the waves. | `data-amplitude` |
  | `waveScale` | number | 0.6 | How many waves fit in view. Higher is choppier. | `data-wave-scale` |
  | `waveRatio` | number | 0.9 | Balance between the long rolling waves and the shorter cross waves. | `data-wave-ratio` |
  | `swell` | number | 35 | How much the long waves bend and meander. | `data-swell` |
  | `turbulence` | number | 20 | How much the cross waves wander. | `data-turbulence` |
  | `tilt` | number | 64 | Camera angle in degrees, from looking down to facing the horizon. | `data-tilt` |
  | `zoom` | number | 1 | Field of view. Higher zooms in. | `data-zoom` |
  | `height` | number | 5.5 | Water level. Higher brings the waves closer. | `data-height` |
  | `fogDepth` | number | 15 | How far you can see before the waves fade out. | `data-fog-depth` |
  | `relief` | number | 1 | Depth of the light and shadow on the waves. 0 gives flat gradient waves. | `data-relief` |
  | `lightAngle` | number | 120 | Direction the light comes from, in degrees. 0 lights the waves from behind you, 180 from the horizon. | `data-light-angle` |
  | `sheen` | number | 0 | Strength of a soft highlight on the crests. | `data-sheen` |
  | `brightness` | number | 1 | Overall brightness. | `data-brightness` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `grain` | number | 0.2 | Film grain on the waves, up to 0.5. 0 turns it off. | `data-grain` |
  | `quality` | 'low' \| 'medium' \| 'high' | 'medium' | Rendering precision. Lower is faster on weak devices. | `data-quality` |
  | `intro` | boolean | true | Starts from calm water and lets the waves rise from the horizon toward you. | `data-intro` |
  | `mouseInteraction` | boolean | true | The light follows the cursor across the waves and the view turns gently toward it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `parallaxStrength` | number | 0.5 | How far the view turns toward the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 0.6 | How far the light turns to follow the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `swellOnClick` | boolean | true | Clicking sends a swell rolling in from that point. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `paused` | boolean | false | Freezes the waves. | `data-paused` |
  | `dpr` | number | 2 | Maximum device pixel ratio of the canvas. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-gridmotion` · GridMotion · quizás

- **Diapositiva:** `l08-q-gridmotion`
- **Propósito (texto de la ficha):** Muro inclinado de baldosas (texto o imágenes) que se desliza
- **Archivo fuente:** `react-bits/src/content/Backgrounds/GridMotion/GridMotion.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/GridMotion/GridMotion.jsx](../../../../../react-bits/src/content/Backgrounds/GridMotion/GridMotion.jsx) (340 líneas), CSS [GridMotion.css](../../../../../react-bits/src/content/Backgrounds/GridMotion/GridMotion.css), props en [GridMotionDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/GridMotionDemo.jsx), presets en [GridMotion.js](../../../../../react-bits/src/demo/Backgrounds/presets/GridMotion.js), uso en [gridMotionCode.js](../../../../../react-bits/src/constants/code/Backgrounds/gridMotionCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (alto) · coste S · valor 2 · estilos: suizo, rice, matriz
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-gridmotion.js` (+ `fx/experimental/exp-gridmotion.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-gridmotion`. Antes, buscar `exp-gridmotion` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-gridmotion`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (19):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `items` | Array<string \| ReactNode \| { src: string; alt?: string }> | [] | Tile content. Image URLs and paths render as photos, other strings as text, and JSX as is. Items repeat to fill the wall. | `data-items` |
  | `rows` | number | 4 | Rows of tiles. More rows means smaller tiles. | `data-rows` |
  | `aspectRatio` | number | 1.33 | Width of each tile divided by its height. Below 1 gives portrait tiles. | `data-aspect-ratio` |
  | `gap` | number | 16 | Space between tiles in pixels. | `data-gap` |
  | `radius` | number | 14 | Corner radius of the tiles in pixels. Large values give pills. | `data-radius` |
  | `angle` | number | -12 | Rotation of the whole wall in degrees. | `data-angle` |
  | `tilt` | number | 0 | Leans the wall back in 3D, in degrees. 0 keeps it flat. | `data-tilt` |
  | `speed` | number | 24 | Drift speed of the rows in pixels per second. 0 keeps them still. | `data-speed` |
  | `direction` | 'alternate' \| 'left' \| 'right' | 'alternate' | Which way the rows drift. Alternate sends neighbouring rows in opposite directions. | `data-direction` |
  | `parallax` | number | 0.5 | How far the rows slide against each other as the pointer moves across the page, from 0 to 1. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `spotlight` | number | 0.6 | Size of the area around the pointer where dimmed or grayscale tiles come back to full color, from 0 to 1. 0 turns it off. | `data-spotlight` |
  | `dim` | number | 0.35 | Fades the tiles outside the spotlight, which keeps text on top readable. From 0 to 1. | `data-dim` |
  | `grayscale` | boolean | false | Shows the tiles in grayscale until the spotlight brings their color back. | `data-grayscale` |
  | `fade` | number | 0.5 | Fades the edges of the wall into the page, from 0 to 1. | `data-fade` |
  | `tileColor` | string | - | Background of text and empty tiles. Follows the theme when not set. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `textColor` | string | - | Color of text tiles. Follows the theme when not set. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `theme` | 'dark' \| 'light' | 'dark' | Picks the default tile and text colors. | `data-theme` |
  | `className` | string | '' | Extra class names for the root. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the root. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-iridescence` · Iridescence · quizás

- **Diapositiva:** `l08-q-iridescence`
- **Propósito (texto de la ficha):** Superficie líquida iridiscente con pliegues
- **Archivo fuente:** `react-bits/src/content/Backgrounds/Iridescence/Iridescence.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/Iridescence/Iridescence.jsx](../../../../../react-bits/src/content/Backgrounds/Iridescence/Iridescence.jsx) (525 líneas), CSS [Iridescence.css](../../../../../react-bits/src/content/Backgrounds/Iridescence/Iridescence.css), props en [IridescenceDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/IridescenceDemo.jsx), presets en [Iridescence.js](../../../../../react-bits/src/demo/Backgrounds/presets/Iridescence.js), uso en [iridescenceCode.js](../../../../../react-bits/src/constants/code/Backgrounds/iridescenceCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (bajo: la rotación de tono no casa con los tokens) · coste S–M · valor 1,5 · estilos: cromo (Y3K)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-iridescence.js` (+ `fx/experimental/exp-iridescence.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-iridescence`. Antes, buscar `exp-iridescence` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-iridescence`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (22):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color` | string \| number[] | [1, 1, 1] | Tint multiplied over the colors. Any CSS color, or an RGB array from 0 to 1. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `hueShift` | number | 0 | Rotates the hues, in degrees. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `saturation` | number | 1 | Color intensity. 0 gives a monochrome chrome look. | `data-saturation` |
  | `brightness` | number | 1.5 | Overall brightness. | `data-brightness` |
  | `contrast` | number | 1 | Contrast between the folds. | `data-contrast` |
  | `speed` | number | 1 | Animation speed. 0 holds the pattern still. | `data-speed` |
  | `scale` | number | 1 | Size of the pattern. Higher values give broader folds. | `data-scale` |
  | `detail` | number | 8 | How many layers of folds are stacked. Lower is softer, higher is more intricate. | `data-detail` |
  | `warp` | number | 1 | How strongly the folds bend into each other. | `data-warp` |
  | `rotation` | number | 0 | Rotation of the pattern in degrees. | `data-rotation` |
  | `mouseReact` | boolean | true | Turns the pointer interactions on or off: parallax, stir and sheen. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `amplitude` | number | 0.1 | How far the pattern drifts toward the pointer. | `data-amplitude` |
  | `stir` | number | 0.5 | Drags the folds along with the pointer like a liquid. 0 turns it off. | `data-stir` |
  | `sheen` | number | 0.3 | Brightens the surface softly around the pointer. | `data-sheen` |
  | `clickSwirl` | boolean | true | Stirs a swirl into the surface wherever you click, which slowly unwinds. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `grain` | number | 0 | Film grain over the surface, from 0 to 1. | `data-grain` |
  | `fade` | number | 0 | Fades the edges into the page, from 0 to 1. The canvas is transparent where it fades. | `data-fade` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `resolution` | number | 1 | Render scale. Lower values trade sharpness for speed on large screens. | `data-resolution` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-scanner` · Scanner · quizás

- **Diapositiva:** `l08-q-scanner`
- **Propósito (texto de la ficha):** Líneas de interferencia (suma de senos en contornos), haz de barrido con estela, scanlines CRT, grano y viñeta. WebGL2 en una sola pasada
- **Archivo fuente:** `react-bits/src/content/Backgrounds/Scanner/Scanner.jsx (aún no portado al motor)`
- **Nota:** pintor alternativo de noche
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/Scanner/Scanner.jsx](../../../../../react-bits/src/content/Backgrounds/Scanner/Scanner.jsx) (511 líneas), CSS [Scanner.css](../../../../../react-bits/src/content/Backgrounds/Scanner/Scanner.css), props en [ScannerDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/ScannerDemo.jsx), presets en [Scanner.js](../../../../../react-bits/src/demo/Backgrounds/presets/Scanner.js), uso en [scannerCode.js](../../../../../react-bits/src/constants/code/Backgrounds/scannerCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (pintor alternativo de noche) · coste M (bajar a GLSL 1.0; encaja en `glLayer`) · valor 2 · estilos: noche (alternativa al horizonte), termica (barrido); choca con suizo y arcilla
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-scanner.js` (+ `fx/experimental/exp-scanner.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-scanner`. Antes, buscar `exp-scanner` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-scanner`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (33):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color1` | string | '#5227FF' | Color of the resting lines. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color2` | string | '#FF9FFC' | Color the lines take as the scan lights them. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color3` | string | '#FFFFFF' | Color of the hot scan head itself. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `speed` | number | 0.5 | How fast the wave moves through the lines. | `data-speed` |
  | `sweepSpeed` | number | 0.25 | How fast the scan travels across. | `data-sweep-speed` |
  | `sweepWidth` | number | 1.6 | Distance between one scan and the next. Larger values leave longer dark gaps. | `data-sweep-width` |
  | `trail` | number | 0.5 | Length of the afterglow the scan leaves behind, from 0 to 1. | `data-trail` |
  | `reverse` | boolean | false | Runs the scan in the opposite direction. | `data-reverse` |
  | `scale` | number | 1.5 | Zooms the whole pattern in or out. | `data-scale` |
  | `frequency` | number | 2 | How many waves fit across the field. | `data-frequency` |
  | `ripple` | number | 0.22 | How tall the waves are. 0 keeps the lines straight. | `data-ripple` |
  | `bandDensity` | number | 11 | How many lines fill the field. | `data-band-density` |
  | `lineWidth` | number | 1.2 | Width of the resting lines, in px. Lit lines get thicker. | `data-line-width` |
  | `glow` | number | 0.6 | Soft glow around the lit lines. | `data-glow` |
  | `scanDirection` | 'vertical' \| 'horizontal' \| 'diagonal' | 'vertical' | Direction the scan travels in. The lines run across it. | `data-scan-direction` |
  | `colorSpread` | number | 0.7 | Fine color fringes on the edges of lit lines, from 0 to 1. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `brightness` | number | 1 | Overall brightness of the lines. | `data-brightness` |
  | `vignette` | number | 0.3 | Fades the lines out toward the edges, from 0 to 1. | `data-vignette` |
  | `scanline` | boolean | true | Turns on the CRT look: fine horizontal scanlines across the field. | `data-scanline` |
  | `scanlineIntensity` | number | 0.5 | How dark the scanlines are, from 0 to 1. | `data-scanline-intensity` |
  | `grain` | boolean | true | Adds a little film grain. | `data-grain` |
  | `grainIntensity` | number | 0.04 | Strength of the grain. | `data-grain-intensity` |
  | `opacity` | number | 1 | Overall opacity of the effect. | `data-opacity` |
  | `mouseInteraction` | boolean | true | The lines bend around the cursor and light up near it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseMode` | 'repel' \| 'attract' | 'repel' | Lines part around the cursor, or pinch in toward it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseRadius` | number | 0.5 | Size of the area around the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 0.7 | How strongly the cursor bends the lines. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickEffect` | 'ping' \| 'none' | 'ping' | Clicking sends a ring of light rippling out through the lines. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | The lines power on with a first scan on mount. | `data-intro` |
  | `lightMode` | boolean | false | Draws the lines as crisp ink for light backgrounds instead of glowing light. | `data-light-mode` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-patternwaves` · PatternWaves · quizás

- **Diapositiva:** `l08-q-patternwaves`
- **Propósito (texto de la ficha):** Superficie iluminada en semitono (puntos, líneas o glifos) que ondula como seda. ogl, 3 FBO
- **Archivo fuente:** `react-bits/src/content/Backgrounds/PatternWaves/PatternWaves.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/PatternWaves/PatternWaves.jsx](../../../../../react-bits/src/content/Backgrounds/PatternWaves/PatternWaves.jsx) (896 líneas), CSS [PatternWaves.css](../../../../../react-bits/src/content/Backgrounds/PatternWaves/PatternWaves.css), props en [PatternWavesDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/PatternWavesDemo.jsx), presets en [PatternWaves.js](../../../../../react-bits/src/demo/Backgrounds/presets/PatternWaves.js), uso en [patternWavesCode.js](../../../../../react-bits/src/constants/code/Backgrounds/patternWavesCode.js).
- **Dependencias del original:** `ogl`
- **Informe:** QUIZÁ (fondo de portada o pintor alternativo de matriz) · coste L tal cual · S–M rehecho como LED de tamaño o brillo variable con `ledSprite` · valor 2 · estilos: matriz (semitono = rejilla LED), suizo en claro
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-patternwaves.js` (+ `fx/experimental/exp-patternwaves.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-patternwaves`. Antes, buscar `exp-patternwaves` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-patternwaves`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (25):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `preset` | 'silk' \| 'ocean' \| 'pond' \| 'lines' \| 'terminal' \| 'mesh' | 'silk' | A complete starting look. Every pattern, wave and light prop below overrides the preset value when you pass it. | `data-preset` |
  | `pattern` | 'dot' \| 'square' \| 'plus' \| 'line' \| 'glyph' | from preset | The mark that draws the surface. Line traces it as flowing contour lines, glyph uses characters picked by brightness. | `data-pattern` |
  | `wave` | 'silk' \| 'swell' \| 'ripple' | from preset | The shape of the moving surface. Silk is draped fabric folds, swell is rolling parallel waves, ripple is rings travelling in from off screen. | `data-wave` |
  | `color` | string | '#ffffff' | The one color of the pattern. Shadows, midtones and highlights are all derived from it. A color darker than the background prints like ink. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `backgroundColor` | string | '#000000' | Color behind the pattern. Pass transparent to show the page through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `spacing` | number | from preset | Distance between marks in CSS pixels. Smaller values give a finer print. | `data-spacing` |
  | `markSize` | number | from preset | Largest mark as a fraction of the spacing. | `data-mark-size` |
  | `depth` | number | from preset | How tall the surface is. Deeper surfaces cast stronger shading and lift the marks along the crests. | `data-depth` |
  | `light` | number | from preset | Angle of the light across the waves in degrees, from -90 to 90. 0 lights the folds head on, larger values graze them. | `data-light` |
  | `shine` | number | from preset | Strength of the glints where the surface catches the light. | `data-shine` |
  | `contrast` | number | from preset | Spread between the quiet shadows and the lit areas. | `data-contrast` |
  | `speed` | number | from preset | How fast the surface moves. 0 freezes it while the cursor keeps working. | `data-speed` |
  | `scale` | number | from preset | Size of the waves. Larger values give broader, calmer forms. | `data-scale` |
  | `direction` | number | from preset | Direction the waves travel in degrees. The light turns with it. | `data-direction` |
  | `opacity` | number | 1 | Overall opacity of the pattern, from 0 to 1. | `data-opacity` |
  | `fade` | 'edges' \| 'center' \| 'bottom' \| 'top' \| 'none' | 'edges' | Where the pattern fades into the background. Center keeps the middle calm for a headline, bottom and top fade towards that edge. | `data-fade` |
  | `fadeSize` | number | 0.5 | How far the fade reaches, from 0.05 to 1. | `data-fade-size` |
  | `characters` | string | '.:-=+*#%@' | Characters for the glyph pattern, ordered from the lightest to the densest. | `data-characters` |
  | `interactive` | boolean | true | Lets the cursor disturb the surface. Moving it leaves a wake of ripples that catch the light, a click drops a splash. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `cursorSize` | number | 50 | Radius of the patch of surface the cursor pushes, in CSS pixels. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `cursorStrength` | number | 0.6 | How hard the cursor pushes the surface, from 0 to 1. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | On mount the marks fade in from the center, then the surface rises and the light sweeps across it. | `data-intro` |
  | `paused` | boolean | false | Freezes the surface. The cursor ripples keep working. | `data-paused` |
  | `className` | string | '' | Extra class names for the root element. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the root element. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-pixelblast` · PixelBlast · quizás

- **Diapositiva:** `l08-q-pixelblast`
- **Propósito (texto de la ficha):** Nubes de píxeles con tramado Bayer 8×8 que derivan y titilan; suelo en perspectiva; ondas al clic. WebGL2 (341 líneas de GLSL)
- **Archivo fuente:** `react-bits/src/content/Backgrounds/PixelBlast/PixelBlast.jsx (aún no portado al motor)`
- **Nota:** se solapa con PatternWaves
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/PixelBlast/PixelBlast.jsx](../../../../../react-bits/src/content/Backgrounds/PixelBlast/PixelBlast.jsx) (966 líneas), CSS [PixelBlast.css](../../../../../react-bits/src/content/Backgrounds/PixelBlast/PixelBlast.css), props en [PixelBlastDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/PixelBlastDemo.jsx), presets en [PixelBlast.js](../../../../../react-bits/src/demo/Backgrounds/presets/PixelBlast.js), uso en [pixelBlastCode.js](../../../../../react-bits/src/constants/code/Backgrounds/pixelBlastCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (se solapa con PatternWaves: elegir uno de los dos) · coste M · valor 2 · estilos: matriz, noche (retro); el resto no
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-pixelblast.js` (+ `fx/experimental/exp-pixelblast.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-pixelblast`. Antes, buscar `exp-pixelblast` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-pixelblast`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (33):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color` | string | '#B497CF' | Color of the pixels. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `accentColor` | string | color | Color the densest areas, ripples and the area under the cursor shift toward. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `variant` | 'square' \| 'circle' \| 'triangle' \| 'diamond' \| 'cross' \| 'ring' | 'square' | Shape of each pixel. | `data-variant` |
  | `pixelSize` | number | 3 | Size of each pixel, in px. | `data-pixel-size` |
  | `patternScale` | number | 2 | Zoom of the cloud pattern. Higher values make smaller, busier clouds. | `data-pattern-scale` |
  | `patternDensity` | number | 1 | How many pixels light up. Higher values fill more of the area. | `data-pattern-density` |
  | `pixelSizeJitter` | number | 0 | Random size variation between pixels, from 0 to 1. | `data-pixel-size-jitter` |
  | `softness` | number | 0.6 | Lets pixels grow and shrink smoothly as the pattern moves, instead of popping on and off. | `data-softness` |
  | `smoothing` | number | 1 | Smooths the edges of the clouds. 0 keeps the original blocky steps. | `data-smoothing` |
  | `glow` | number | 0.4 | Soft light behind the densest areas, and a hot core in ripples. | `data-glow` |
  | `twinkle` | number | 0.25 | Lets pixels shimmer at their own pace, from 0 to 1. | `data-twinkle` |
  | `speed` | number | 0.5 | How fast the clouds change shape. | `data-speed` |
  | `drift` | number | 0.2 | How fast the clouds slide across the area. 0 keeps them in place. | `data-drift` |
  | `driftAngle` | number | 30 | Direction of the drift, in degrees. | `data-drift-angle` |
  | `hoverEffect` | 'reveal' \| 'grow' \| 'none' | 'reveal' | What the cursor does: light up more pixels around it, or make nearby pixels swell and brighten. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `hoverRadius` | number | 140 | Size of the area the cursor affects, in px. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `enableRipples` | boolean | true | Clicking sends a ring of pixels out from the click. | `data-enable-ripples` |
  | `rippleSpeed` | number | 0.3 | How fast ripples spread. | `data-ripple-speed` |
  | `rippleThickness` | number | 0.1 | Width of the ripple ring. | `data-ripple-thickness` |
  | `rippleIntensityScale` | number | 1 | Brightness of ripples. | `data-ripple-intensity-scale` |
  | `autoRipple` | number | 0 | Sends a ripple from a random spot about this many seconds apart. 0 turns it off. | `data-auto-ripple` |
  | `tiltX` | number | 0 | Tilts the pixels back into a floor that fades toward the horizon, in degrees. | `data-tilt-x` |
  | `tiltY` | number | 0 | Turns the pixels sideways in perspective, in degrees. | `data-tilt-y` |
  | `edgeFade` | number | 0.5 | Fades the pixels out toward the edges, from 0 to 1. | `data-edge-fade` |
  | `intro` | boolean | true | Blasts the pixels out from the center in a ring on mount. | `data-intro` |
  | `noiseAmount` | number | 0 | Film grain on the pixels. | `data-noise-amount` |
  | `transparent` | boolean | true | Shows the page behind the pixels. Turn off for a solid black, or white in light mode, backdrop. | `data-transparent` |
  | `lightMode` | boolean | false | Darkens hot pixels instead of brightening them, for light pages. | `data-light-mode` |
  | `variation` | number | random | Picks a fixed pattern. Leave it out for a different one on every mount. | `data-variation` |
  | `autoPauseOffscreen` | boolean | true | Stops rendering while the background is scrolled out of view. | `data-auto-pause-offscreen` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | - | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-ripplegrid` · RippleGrid · quizás

- **Diapositiva:** `l08-q-ripplegrid`
- **Propósito (texto de la ficha):** Rejilla nítida en perspectiva con ondas que salen solas del centro (`autoRipple`) cada 2,6 s. WebGL2 en una sola pasada
- **Archivo fuente:** `react-bits/src/content/Backgrounds/RippleGrid/RippleGrid.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/RippleGrid/RippleGrid.jsx](../../../../../react-bits/src/content/Backgrounds/RippleGrid/RippleGrid.jsx) (497 líneas), CSS [RippleGrid.css](../../../../../react-bits/src/content/Backgrounds/RippleGrid/RippleGrid.css), props en [RippleGridDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/RippleGridDemo.jsx), presets en [RippleGrid.js](../../../../../react-bits/src/demo/Backgrounds/presets/RippleGrid.js), uso en [rippleGridCode.js](../../../../../react-bits/src/constants/code/Backgrounds/rippleGridCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (el `noche` actual ya tiene rejilla en perspectiva) · coste M (o S en 2D desplazando las líneas) · valor 2 · estilos: suizo (retícula), nube, noche
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-ripplegrid.js` (+ `fx/experimental/exp-ripplegrid.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-ripplegrid`. Antes, buscar `exp-ripplegrid` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-ripplegrid`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color` | string | '#ffffff' | Color of the grid. Light mode derives its ink from it. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `variant` | 'lines' \| 'dots' \| 'cross' | 'lines' | Draws the grid as lines, dots at each crossing, or small crosses. | `data-variant` |
  | `cellSize` | number | 48 | Size of each grid cell, in px. | `data-cell-size` |
  | `lineWidth` | number | 1 | Width of the lines, in px. | `data-line-width` |
  | `glow` | number | 0.6 | Soft glow around the lines. | `data-glow` |
  | `rippleStrength` | number | 1 | How far ripples bend the grid and how brightly their crests light it. | `data-ripple-strength` |
  | `rippleSpeed` | number | 1 | How fast ripples travel outward. | `data-ripple-speed` |
  | `rippleSize` | number | 1 | Wavelength of the ripples. | `data-ripple-size` |
  | `autoRipple` | 'center' \| 'random' \| 'none' | 'center' | Where idle ripples start: from the center, at random spots, or not at all. | `data-auto-ripple` |
  | `rippleInterval` | number | 2.6 | Seconds between idle ripples. | `data-ripple-interval` |
  | `tilt` | number | 0 | Lays the grid back in perspective, like a floor, in degrees. | `data-tilt` |
  | `rotation` | number | 0 | Turns the grid, in degrees. | `data-rotation` |
  | `mouseInteraction` | boolean | true | The cursor leaves a wake of small ripples and lights up the lines nearby. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickRipple` | boolean | true | Clicking sends a strong ripple. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Reveals the grid with a ripple from the center. | `data-intro` |
  | `fade` | number | 0.5 | Fades the edges into the page, from 0 to 1. | `data-fade` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `lightMode` | boolean | false | Draws the grid as ink for light backgrounds. | `data-light-mode` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-softaurora` · SoftAurora · quizás

- **Diapositiva:** `l08-q-softaurora`
- **Propósito (texto de la ficha):** Bandas de aurora boreal con ruido 3D y paleta coseno. WebGL2 en una sola pasada
- **Archivo fuente:** `react-bits/src/content/Backgrounds/SoftAurora/SoftAurora.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/SoftAurora/SoftAurora.jsx](../../../../../react-bits/src/content/Backgrounds/SoftAurora/SoftAurora.jsx) (533 líneas), CSS [SoftAurora.css](../../../../../react-bits/src/content/Backgrounds/SoftAurora/SoftAurora.css), props en [SoftAuroraDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/SoftAuroraDemo.jsx), presets en [SoftAurora.js](../../../../../react-bits/src/demo/Backgrounds/presets/SoftAurora.js), uso en [softAuroraCode.js](../../../../../react-bits/src/constants/code/Backgrounds/softAuroraCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (fondo de portada genérico) · coste M · valor 2 · estilos: aurora, rice; con la paleta coseno no se respetan los tokens, habría que cambiarla por mezcla `accent`/`accent-2`
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-softaurora.js` (+ `fx/experimental/exp-softaurora.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-softaurora`. Antes, buscar `exp-softaurora` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-softaurora`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (22):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color1` | string | '#f7f7f7' | Tint of the first aurora layer. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color2` | string | '#e100ff' | Tint of the second aurora layer. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `spectrum` | number | 1 | How much of the shifting rainbow shows through the tints, from 0 to 1. 0 uses the two colors as they are. | `data-spectrum` |
  | `speed` | number | 0.6 | Overall animation speed. | `data-speed` |
  | `colorSpeed` | number | 1 | How fast the colors drift along the band. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `scale` | number | 1.5 | Scale of the noise that shapes the band. | `data-scale` |
  | `brightness` | number | 1 | Overall brightness. | `data-brightness` |
  | `noiseFrequency` | number | 2.5 | How tightly the band ripples. | `data-noise-frequency` |
  | `noiseAmplitude` | number | 1 | How far the band waves up and down. | `data-noise-amplitude` |
  | `bandHeight` | number | 0.5 | Vertical position of the band, from 0 at the bottom to 1 at the top. | `data-band-height` |
  | `bandSpread` | number | 1 | How tight and bright the band is. Lower values spread it into a wide, soft glow. | `data-band-spread` |
  | `tilt` | number | 0 | Tilts the band by this many degrees. | `data-tilt` |
  | `octaveDecay` | number | 0.1 | How much fine ripple sits on top of the large waves. | `data-octave-decay` |
  | `layerOffset` | number | 0 | Shifts the second layer in time so the two separate. | `data-layer-offset` |
  | `enableMouseInteraction` | boolean | true | The aurora drifts with the cursor and reaches toward it when it comes close. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseInfluence` | number | 0.25 | Strength of the cursor drift and reach. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickPulse` | boolean | true | Clicking sends a soft pulse of light along the band. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | The band starts as a thin line and blooms in on mount. | `data-intro` |
  | `lightMode` | boolean | false | Prints the aurora as soft colored ink so it sits on light pages. | `data-light-mode` |
  | `opacity` | number | 1 | Overall opacity, from 0 to 1. | `data-opacity` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-waves` · Waves · quizás

- **Diapositiva:** `l08-q-waves`
- **Propósito (texto de la ficha):** Muchas líneas paralelas que ondulan como seda; se apartan del cursor y vuelven con un muelle. WebGL2
- **Archivo fuente:** `react-bits/src/content/Backgrounds/Waves/Waves.jsx (aún no portado al motor)`
- **Nota:** duplica a hilos
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/Waves/Waves.jsx](../../../../../react-bits/src/content/Backgrounds/Waves/Waves.jsx) (720 líneas), CSS [Waves.css](../../../../../react-bits/src/content/Backgrounds/Waves/Waves.css), props en [WavesDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/WavesDemo.jsx), presets en [Waves.js](../../../../../react-bits/src/demo/Backgrounds/presets/Waves.js), uso en [wavesCode.js](../../../../../react-bits/src/constants/code/Backgrounds/wavesCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (duplica a Threads; se queda Threads) · coste S en 2D · valor 2 · estilos: aurora, suizo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-waves.js` (+ `fx/experimental/exp-waves.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-waves`. Antes, buscar `exp-waves` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-waves`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (26):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `lineColor` | string | '#ffffff' | Color of the lines. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `accentColor` | string | lineColor | Color the lines take on where the cursor or a click pushes them. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `backgroundColor` | string | 'transparent' | Background behind the lines. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `lineStyle` | 'solid' \| 'dashed' | 'solid' | Draws solid lines, or dashes that stream along them. | `data-line-style` |
  | `spacing` | number | 10 | Space between the lines, in px. | `data-spacing` |
  | `lineWidth` | number | 1 | Width of the lines, in px. | `data-line-width` |
  | `rotation` | number | 0 | Turns the lines, in degrees. 90 lays them flat. | `data-rotation` |
  | `amplitude` | number | 32 | How far the lines sway, in px. | `data-amplitude` |
  | `scale` | number | 1 | Size of the wave pattern. Higher values make broader, calmer waves. | `data-scale` |
  | `twist` | number | 1 | How much the waves twist the lines, gathering them into bright folds. | `data-twist` |
  | `speed` | number | 1 | How fast the waves flow. 0 holds them still. | `data-speed` |
  | `variation` | number | 0 | Picks a different wave pattern. | `data-variation` |
  | `mouseInteraction` | boolean | true | Moving the cursor drags the lines along with it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseRadius` | number | 175 | Radius around the cursor that drags the lines, in px. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 1 | How hard a moving cursor drags the lines. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `bounce` | number | 0.5 | How much the lines overshoot and wobble as they settle, from 0 to 1. | `data-bounce` |
  | `returnDuration` | number | 1.4 | Roughly how long the lines take to settle back, in seconds. | `data-return-duration` |
  | `clickRipple` | boolean | true | Clicking parts the lines in a soft ripple. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Opens the lines from the center and swells the waves in on mount. | `data-intro` |
  | `fade` | number | 0 | Fades the edges into the page, from 0 to 1. | `data-fade` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `lightMode` | boolean | false | Draws the lines as ink for light backgrounds. | `data-light-mode` |
  | `paused` | boolean | false | Freezes the waves. | `data-paused` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-linewaves` · LineWaves · quizás

- **Diapositiva:** `l08-q-linewaves`
- **Propósito (texto de la ficha):** Líneas finas deformadas en ondas con una banda de luz que las recorre y ciclo de 3 colores. WebGL2
- **Archivo fuente:** `react-bits/src/content/Backgrounds/LineWaves/LineWaves.jsx (aún no portado al motor)`
- **Nota:** familia de hilos
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/LineWaves/LineWaves.jsx](../../../../../react-bits/src/content/Backgrounds/LineWaves/LineWaves.jsx) (517 líneas), CSS [LineWaves.css](../../../../../react-bits/src/content/Backgrounds/LineWaves/LineWaves.css), props en [LineWavesDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/LineWavesDemo.jsx), presets en [LineWaves.js](../../../../../react-bits/src/demo/Backgrounds/presets/LineWaves.js), uso en [lineWavesCode.js](../../../../../react-bits/src/constants/code/Backgrounds/lineWavesCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (misma familia que Threads/Waves) · coste M · valor 1–2 · estilos: aurora, rice
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-linewaves.js` (+ `fx/experimental/exp-linewaves.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-linewaves`. Antes, buscar `exp-linewaves` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-linewaves`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (24):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color1` | string | '#ffffff' | First color the lines blend through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color2` | string | '#ffffff' | Second color the lines blend through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color3` | string | '#ffffff' | Third color the lines blend through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `colorCycleSpeed` | number | 1 | How fast the colors drift across the lines. 0 keeps them in place. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `speed` | number | 0.3 | How fast the waves flow. 0 freezes them. | `data-speed` |
  | `lineCount` | number | 72 | Number of lines across the height of the container. | `data-line-count` |
  | `lineWidth` | number | 1.3 | Thickness of the lines, in px. | `data-line-width` |
  | `glow` | number | 0.6 | Strength of the soft glow around each line. | `data-glow` |
  | `brightness` | number | 1 | Overall brightness of the lines. | `data-brightness` |
  | `highlight` | number | 1 | Strength of the band of light that drifts through the lines, from 0 to 1. At 0 every line is lit evenly. | `data-highlight` |
  | `highlightWidth` | number | 1 | Width of the band of light. Higher values light more lines at once. | `data-highlight-width` |
  | `warpIntensity` | number | 1 | How strongly the lines bend into waves. | `data-warp-intensity` |
  | `warpScale` | number | 1 | Size of the waves. Higher values give broad, sweeping curves. | `data-warp-scale` |
  | `rotation` | number | -33 | Angle of the lines, in degrees. | `data-rotation` |
  | `edgeFade` | number | 0 | Fades the lines out toward the edges of the container, from 0 to 1. | `data-edge-fade` |
  | `enableMouseInteraction` | boolean | true | The lines spread apart and light up around the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseInfluence` | number | 2 | How strongly the lines react to the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickRipple` | boolean | true | Clicking sends a smooth wave rolling out through the lines. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | The lines draw in across the container on mount. | `data-intro` |
  | `lightMode` | boolean | false | Draws the lines as ink for light backgrounds. Colors turn into deeper inks of the same hue. | `data-light-mode` |
  | `opacity` | number | 1 | Overall opacity, from 0 to 1. | `data-opacity` |
  | `maxDevicePixelRatio` | number | 2 | Highest pixel ratio the canvas renders at. | `data-max-device-pixel-ratio` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-lightrays` · LightRays · quizás

- **Diapositiva:** `l08-q-lightrays`
- **Propósito (texto de la ficha):** Rayos volumétricos desde un borde, con halo y bruma. WebGL2 en una sola pasada
- **Archivo fuente:** `react-bits/src/content/Backgrounds/LightRays/LightRays.jsx (aún no portado al motor)`
- **Nota:** capa de foco sobre portada
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/LightRays/LightRays.jsx](../../../../../react-bits/src/content/Backgrounds/LightRays/LightRays.jsx) (557 líneas), CSS [LightRays.css](../../../../../react-bits/src/content/Backgrounds/LightRays/LightRays.css), props en [LightRaysDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/LightRaysDemo.jsx), presets en [LightRays.js](../../../../../react-bits/src/demo/Backgrounds/presets/LightRays.js), uso en [lightRaysCode.js](../../../../../react-bits/src/constants/code/Backgrounds/lightRaysCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (capa de «foco» sobre una portada) · coste M · valor 2 · estilos: cromo y arcilla (luz de estudio), celula en claro (iluminación de campo claro)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-lightrays.js` (+ `fx/experimental/exp-lightrays.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-lightrays`. Antes, buscar `exp-lightrays` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-lightrays`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (27):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `raysOrigin` | RaysOrigin | 'top-center' | Where the light comes from: 'top-center', 'top-left', 'top-right', 'left', 'right', 'bottom-center', 'bottom-left' or 'bottom-right'. | `data-rays-origin` |
  | `raysColor` | string | '#ffffff' | Color of the light. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `raysSpeed` | number | 1 | Animation speed. 0 freezes the rays. | `data-rays-speed` |
  | `lightSpread` | number | 0.5 | How wide the beam opens. Lower values give a tight spotlight. | `data-light-spread` |
  | `rayLength` | number | 3 | How far the rays reach, in container widths. | `data-ray-length` |
  | `rayDensity` | number | 1 | How many separate shafts the beam splits into. | `data-ray-density` |
  | `tilt` | number | 0 | Turns the beam by this many degrees. | `data-tilt` |
  | `raySharpness` | number | 0.35 | How crisp the edges of the shafts are, from 0 to 1. | `data-ray-sharpness` |
  | `glow` | number | 0.6 | Brightness of the glow around the light source. | `data-glow` |
  | `haze` | number | 0.25 | Drifting haze that breaks the shafts up, like dust in the air, from 0 to 1. | `data-haze` |
  | `atmosphere` | number | 1 | How much the light cools toward blue as it travels away from the source, from 0 to 1. | `data-atmosphere` |
  | `intensity` | number | 1 | Overall brightness of the light. | `data-intensity` |
  | `pulsating` | boolean | false | The rays slowly breathe brighter and dimmer. | `data-pulsating` |
  | `fadeDistance` | number | 1 | How far the rays travel before they dim, in container widths. | `data-fade-distance` |
  | `saturation` | number | 1 | Color saturation of the light. | `data-saturation` |
  | `followMouse` | boolean | true | The beam turns toward the cursor. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseInfluence` | number | 0.1 | How far the beam turns toward the cursor, from 0 to 1. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `cursorShadow` | boolean | true | The cursor blocks the light and casts a soft shadow down the rays. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickPulse` | boolean | true | Clicking sends a wave of light down the rays. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `noiseAmount` | number | 0 | Film grain over the rays, from 0 to 1. | `data-noise-amount` |
  | `distortion` | number | 0 | Makes the rays waver as if seen through heat. | `data-distortion` |
  | `intro` | boolean | true | The rays grow out from the source on mount. | `data-intro` |
  | `lightMode` | boolean | false | Prints the light as soft colored ink so it sits on light pages. | `data-light-mode` |
  | `opacity` | number | 1 | Overall opacity, from 0 to 1. | `data-opacity` |
  | `maxDevicePixelRatio` | number | 2 | Highest pixel ratio the canvas renders at. | `data-max-device-pixel-ratio` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-moltenmetal` · MoltenMetal · quizás

- **Diapositiva:** `l08-q-moltenmetal`
- **Propósito (texto de la ficha):** Filamentos cáusticos con núcleos al blanco. WebGL2 en una sola pasada
- **Archivo fuente:** `react-bits/src/content/Backgrounds/MoltenMetal/MoltenMetal.jsx (aún no portado al motor)`
- **Nota:** alternativa de termica
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/MoltenMetal/MoltenMetal.jsx](../../../../../react-bits/src/content/Backgrounds/MoltenMetal/MoltenMetal.jsx) (605 líneas), CSS [MoltenMetal.css](../../../../../react-bits/src/content/Backgrounds/MoltenMetal/MoltenMetal.css), props en [MoltenMetalDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/MoltenMetalDemo.jsx), presets en [MoltenMetal.js](../../../../../react-bits/src/demo/Backgrounds/presets/MoltenMetal.js), uso en [moltenMetalCode.js](../../../../../react-bits/src/constants/code/Backgrounds/moltenMetalCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (alternativa de termica; se aleja del mood «cámara térmica de un robot») · coste M · valor 2 · estilos: termica (pasado por la LUT ironbow parece metal al rojo), cromo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-moltenmetal.js` (+ `fx/experimental/exp-moltenmetal.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-moltenmetal`. Antes, buscar `exp-moltenmetal` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-moltenmetal`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (28):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `colors` | string[] | ['#5227FF', '#FF9FFC'] | Gradient the metal heats through, from the dim glow to the hot body. Up to five colors. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `coreColor` | string | '#FFFFFF' | Color of the white-hot cores at the end of the gradient. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `backgroundColor` | string | 'transparent' | Fills the canvas behind the metal. Transparent lets the page show through. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `lightMode` | boolean | false | Draws the flow as colored ink for light pages. Pair it with mid-tone colors that deepen toward the core. | `data-light-mode` |
  | `speed` | number | 0.35 | How fast the metal flows. | `data-speed` |
  | `scale` | number | 4 | Zoom of the flow. Higher fits more of it on screen. | `data-scale` |
  | `detail` | number | 3 | Layers of folded filaments, from 1 to 8. Fractions blend between layers. | `data-detail` |
  | `glow` | number | 1.6 | How much heat the filaments carry. | `data-glow` |
  | `thickness` | number | 1 | Width of the filaments and their white-hot cores. | `data-thickness` |
  | `swirl` | number | 1 | How tightly the flow spirals. | `data-swirl` |
  | `turbulence` | number | 0.2 | How strongly each layer folds the flow. | `data-turbulence` |
  | `haze` | number | 0.75 | Soft glow between the filaments. 0 leaves only the filaments. | `data-haze` |
  | `brightness` | number | 1.3 | Overall brightness. | `data-brightness` |
  | `colorMode` | 'molten' \| 'ember' \| 'frost' | 'molten' | Balance of the gradient. Ember runs hotter, frost stays cooler. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `rotation` | number | 0 | Rotation of the whole flow in degrees. | `data-rotation` |
  | `offsetX` | number | 0 | Moves the flow sideways, as a fraction of the width. | `data-offset-x` |
  | `offsetY` | number | 0 | Moves the flow up or down, as a fraction of the height. | `data-offset-y` |
  | `drift` | number | 0.3 | How far the flow drifts as the cursor moves. 0 keeps it still. | `data-drift` |
  | `grain` | number | 0.05 | Film grain in the glow. 0 turns it off. | `data-grain` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `intro` | boolean | true | Ignites the metal from its hottest cores outward the first time it comes into view. | `data-intro` |
  | `mouseInteraction` | boolean | true | The cursor heats the filaments it passes over, leaving a trail that slowly cools. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `mouseStrength` | number | 0.5 | How hot the cursor runs. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `flareOnClick` | boolean | true | Clicking flares the nearby filaments white-hot before they cool back down. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `paused` | boolean | false | Freezes the flow. | `data-paused` |
  | `dpr` | number | 2 | Maximum device pixel ratio of the canvas. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-slicedwaves` · SlicedWaves · quizás

- **Diapositiva:** `l08-q-slicedwaves`
- **Propósito (texto de la ficha):** Cintas de color en ondas cortadas en barras luminosas, vistas en profundidad con desenfoque. WebGL2 + FBO
- **Archivo fuente:** `react-bits/src/content/Backgrounds/SlicedWaves/SlicedWaves.jsx (aún no portado al motor)`
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/SlicedWaves/SlicedWaves.jsx](../../../../../react-bits/src/content/Backgrounds/SlicedWaves/SlicedWaves.jsx) (632 líneas), CSS [SlicedWaves.css](../../../../../react-bits/src/content/Backgrounds/SlicedWaves/SlicedWaves.css), props en [SlicedWavesDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/SlicedWavesDemo.jsx), presets en [SlicedWaves.js](../../../../../react-bits/src/demo/Backgrounds/presets/SlicedWaves.js), uso en [slicedWavesCode.js](../../../../../react-bits/src/constants/code/Backgrounds/slicedWavesCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (bonito, pero las barras parecen un gráfico sin serlo, y eso confunde en charlas de datos) · coste M · valor 1–2 · estilos: rice (pasteles), aurora
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-slicedwaves.js` (+ `fx/experimental/exp-slicedwaves.css` si hace falta) como pintor de `data-painter` (`Motor.painters`) con el nombre `exp-slicedwaves`. Antes, buscar `exp-slicedwaves` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l08-q-slicedwaves`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (28):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color1` | string | '#ffd9a8' | First color of the light. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color2` | string | '#ff5fa2' | Second color of the light. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `color3` | string | '#5b8cff' | Third color of the light. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `ribbons` | number | 3 | Number of waves of light, from 1 to 6. | `data-ribbons` |
  | `spacing` | number | 28 | Distance between the bars in the middle of the view, in px. | `data-spacing` |
  | `barWidth` | number | 0.5 | Width of each bar, as a share of the spacing. | `data-bar-width` |
  | `ribbonHeight` | number | 0.26 | Height of each wave, as a fraction of the view height. | `data-ribbon-height` |
  | `spread` | number | 0.1 | Vertical distance between the waves, as a fraction of the view height. | `data-spread` |
  | `amplitude` | number | 0.1 | How far the waves rise and fall, as a fraction of the view height. | `data-amplitude` |
  | `frequency` | number | 1 | How many waves fit across the view. | `data-frequency` |
  | `speed` | number | 1 | Animation speed. Negative values reverse the waves. | `data-speed` |
  | `perspective` | number | 0.45 | How much the strip of bars turns away from you, from 0 to 1. | `data-perspective` |
  | `curve` | number | 0.5 | How much the strip bends in depth, from 0 to 1. | `data-curve` |
  | `blur` | number | 0.6 | Depth of field. Bars away from the focus soften, and the focus follows the cursor. | `data-blur` |
  | `glow` | number | 1 | Strength of the soft light around each bar. | `data-glow` |
  | `brightness` | number | 1.25 | Overall brightness. Where waves overlap, the light burns to white. | `data-brightness` |
  | `position` | number | 0.78 | Vertical position of the waves, from 0 at the top to 1 at the bottom. | `data-position` |
  | `rotation` | number | 0 | Rotation of the whole effect, in degrees. | `data-rotation` |
  | `slices` | number | 0 | Cuts the bars into segments like an LED display. 0 keeps them solid. | `data-slices` |
  | `grain` | number | 0.08 | Strength of the film grain. | `data-grain` |
  | `mouseInteraction` | boolean | true | Pulls the focus to the bars under the cursor and lights them up. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Grows the bars in across the view on mount. | `data-intro` |
  | `fade` | number | 0 | Fades the edges into the page, from 0 to 1. | `data-fade` |
  | `opacity` | number | 1 | Opacity of the whole effect. | `data-opacity` |
  | `lightMode` | boolean | false | Draws the bars as colored ink for light backgrounds. | `data-light-mode` |
  | `paused` | boolean | false | Freezes the animation. | `data-paused` |
  | `dpr` | number | auto | Maximum device pixel ratio, capped at 2. | `data-dpr` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa
