# L09-piezas · Piezas de interfaz

Piezas por clase de fx/piezas.js y componentes de interfaz candidatos.

Deck: `atlas/completo/index.html`. Diapositivas con id `l09-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l09-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l09-etapas`: Etapas (.etapas)
3. `l09-checklist`: Lista de hitos (.checklist)
4. `l09-agenda`: Agenda (.agenda)
5. `l09-reticula`: Retícula (.reticula)
6. `l09-bento`: Bento (.bento)
7. `l09-mazo`: Mazo (.mazo)
8. `l09-chispa`: Chispa (.chispa)
9. `l09-rayo`: Borde eléctrico (.rayo)
10. `l09-deposito`: Depósito (.deposito)
11. `l09-tarea`: tarea (CallChip) · **quizás**
12. `l09-rejilla`: rejilla (LatticeLoader) · **quizás**
13. `l09-campo`: campo (MagnetLines) · **quizás**
14. `l09-q-crosshair`: Crosshair · **quizás**
15. `l09-q-logoloop`: LogoLoop · **quizás**
16. `l09-q-orbit`: OrbitImages · **quizás**
17. `l09-q-accordion`: AccordionGallery · **quizás**
18. `l09-q-borderglow`: BorderGlow · **quizás**
19. `l09-q-bouncecards`: BounceCards · **quizás**
20. `l09-q-driftwall`: DriftWall · **quizás**
21. `l09-q-flowingmenu`: FlowingMenu · **quizás**
22. `l09-q-pixelcard`: PixelCard · **quizás**
23. `l09-q-stack`: Stack · **quizás**
24. `l09-q-staggered`: StaggeredMenu · **quizás**
25. `l09-q-tilted`: TiltedCard · **quizás**
26. `l09-q-cometdial`: CometDial · **quizás**
27. `l09-q-thoughtline`: ThoughtLine · **quizás**
28. `l09-q-refineframe`: RefineFrame · **quizás**
29. `l09-q-springcheck`: SpringCheck · **quizás**
30. `l09-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **30 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ficha` de L00)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro
- En los «quizás»: etiqueta visible «experimental · quizás»; datos de ejemplo marcados como «sintéticos»

## Componentes

### `etapas` · Etapas (.etapas)

- **Diapositiva:** `l09-etapas`
- **Propósito (texto de la ficha):** Proceso lineal en el que cada paso marca una fase como hecha y la siguiente en curso
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .etapas`
- **Parámetros que muestra la ficha:** `variantes`: ["horizontal", ".etapas.v (vertical)"]; `hijos`: <li data-step><b>…</b><small>…</small>
- **Origen en react-bits:** [Stepper](../../../../../react-bits/src/content/Components/Stepper/Stepper.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** .etapas horizontal de cinco fases y .etapas.v vertical de tres, con data-step
- **Aceptación propia:** Cada → marca una fase como hecha y la siguiente en curso

### `checklist` · Lista de hitos (.checklist)

- **Diapositiva:** `l09-checklist`
- **Propósito (texto de la ficha):** Hitos con marca y palabra de estado
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .checklist`
- **Parámetros que muestra la ficha:** `data-end`: ["ok", "warn", "err"]; `palabras`: ["pendiente", "en curso", "hecho", "revisar", "falló"]; `variante`: .checklist.tacha
- **Origen en react-bits:** [SpringCheck](../../../../../react-bits/src/content/Micro/SpringCheck/SpringCheck.jsx) (inspiracion), [StatusMark](../../../../../react-bits/src/content/Micro/StatusMark/StatusMark.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** .checklist con cuatro hitos (ok, warn, err) y .checklist.tacha
- **Aceptación propia:** Cada estado lleva su palabra

### `agenda` · Agenda (.agenda)

- **Diapositiva:** `l09-agenda`
- **Propósito (texto de la ficha):** Índice generado con las secciones del deck y la actual destacada
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .agenda`
- **Parámetros que muestra la ficha:** `data-current`: sección; `data-skip`: sección; `variante`: .agenda.banda
- **Origen en react-bits:** [FlowingMenu](../../../../../react-bits/src/content/Components/FlowingMenu/FlowingMenu.jsx) (inspiracion), [LineSidebar](../../../../../react-bits/src/content/Components/LineSidebar/LineSidebar.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** .agenda del deck con la sección actual destacada y .agenda.banda
- **Aceptación propia:** La sección destacada es L09

### `reticula` · Retícula (.reticula)

- **Diapositiva:** `l09-reticula`
- **Propósito (texto de la ficha):** Cuatro esquinas de mira que saltan al objetivo de cada paso
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .reticula`
- **Parámetros que muestra la ficha:** `hijos`: data-target="0\|1\|…" data-label
- **Origen en react-bits:** [Crosshair](../../../../../react-bits/src/content/Animations/Crosshair/Crosshair.jsx) (inspiracion), [TargetCursor](../../../../../react-bits/src/content/Animations/TargetCursor/TargetCursor.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** .reticula sobre una imagen sintética con tres objetivos data-target y data-label
- **Aceptación propia:** Las esquinas saltan al objetivo de cada paso

### `bento` · Bento (.bento)

- **Diapositiva:** `l09-bento`
- **Propósito (texto de la ficha):** Rejilla de resumen con celdas de distinto tamaño y foco por pasos
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .bento`
- **Parámetros que muestra la ficha:** `celdas`: ["w2", "w3", "h2"]; `pasos`: data-step en celdas
- **Origen en react-bits:** [ChromaGrid](../../../../../react-bits/src/content/Components/ChromaGrid/ChromaGrid.jsx) (inspiracion), [MagicBento](../../../../../react-bits/src/content/Components/MagicBento/MagicBento.jsx) (base), [SpotlightCard](../../../../../react-bits/src/content/Components/SpotlightCard/SpotlightCard.jsx) (inspiracion). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** .bento con celdas w2, h2 y foco por pasos
- **Aceptación propia:** Cada → enfoca una celda

### `mazo` · Mazo (.mazo)

- **Diapositiva:** `l09-mazo`
- **Propósito (texto de la ficha):** Tarjetas apiladas: cada paso manda la delantera al fondo
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .mazo`
- **Parámetros que muestra la ficha:** `variante`: .mazo.plana (sin 3D; siempre en suizo y matriz)
- **Origen en react-bits:** [CardSwap](../../../../../react-bits/src/content/Components/CardSwap/CardSwap.jsx) (base), [Stack](../../../../../react-bits/src/content/Components/Stack/Stack.jsx) (inspiracion). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** .mazo de cuatro tarjetas y .mazo.plana
- **Aceptación propia:** Cada → manda la delantera al fondo

### `chispa` · Chispa (.chispa)

- **Diapositiva:** `l09-chispa`
- **Propósito (texto de la ficha):** Una chispa que recorre el borde de un panel para señalarlo
- **Archivo fuente:** `fx/piezas.js canvas.bordes`
- **Parámetros que muestra la ficha:** `capa`: un canvas 2D por diapositiva
- **Origen en react-bits:** [StarBorder](../../../../../react-bits/src/content/Animations/StarBorder/StarBorder.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Tres paneles; uno con .chispa
- **Aceptación propia:** La chispa recorre el borde; con movimiento reducido no se mueve

### `rayo` · Borde eléctrico (.rayo)

- **Diapositiva:** `l09-rayo`
- **Propósito (texto de la ficha):** Borde eléctrico para la alerta o el punto clave
- **Archivo fuente:** `fx/piezas.js canvas.bordes`
- **Parámetros que muestra la ficha:** `capa`: un canvas 2D por diapositiva
- **Origen en react-bits:** [ElectricBorder](../../../../../react-bits/src/content/Animations/ElectricBorder/ElectricBorder.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Tres paneles; uno con .rayo
- **Aceptación propia:** El borde se ve también en noche, que recorta con clip-path

### `deposito` · Depósito (.deposito)

- **Diapositiva:** `l09-deposito`
- **Propósito (texto de la ficha):** Nivel vertical con lectura grande y palabra de estado
- **Archivo fuente:** `fx/piezas.js · engine/engine.css .deposito`
- **Parámetros que muestra la ficha:** `data-value`: 0–100; `data-label`: texto; `data-umbral`: número; `data-critico`: número; `estados`: ["normal", "bajo", "crítico"]
- **Origen en react-bits:** [SloshGauge](../../../../../react-bits/src/content/Micro/SloshGauge/SloshGauge.jsx) (base). La ficha cita el origen y la diferencia principal con el original.
- **Demo:** Tres .deposito: normal, bajo y crítico
- **Aceptación propia:** Cada estado lleva su palabra

### `tarea` · tarea (CallChip) · quizás

- **Diapositiva:** `l09-tarea`
- **Propósito (texto de la ficha):** Ficha de llamada a herramienta (`bash · npm test`). Se rellena mientras corre un cronómetro y termina en «done» verde o en «failed» rojo con sacudida. Estados con palabra (`queued/running/done/failed`). React, CSS, iconos hugeicons
- **Archivo fuente:** `react-bits/src/content/Micro/CallChip/CallChip.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Micro/CallChip/CallChip.jsx](../../../../../react-bits/src/content/Micro/CallChip/CallChip.jsx) (212 líneas), CSS [CallChip.css](../../../../../react-bits/src/content/Micro/CallChip/CallChip.css), props en [CallChipDemo.jsx](../../../../../react-bits/src/demo/Micro/CallChipDemo.jsx), uso en [callChipCode.js](../../../../../react-bits/src/constants/code/Micro/callChipCode.js).
- **Dependencias del original:** `@hugeicons/core-free-icons`, `@hugeicons/react`
- **Informe:** IMPLEMENTAR · coste S · valor 3 · estilos: todos; sobre todo noche, matriz, rice y suizo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/tarea.js` (+ `fx/experimental/tarea.css` si hace falta) como pieza por clase con el nombre `tarea`. Antes, buscar `tarea` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-tarea`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (19):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `icon` | "terminal" \| "file" \| "search" \| "edit" \| ReactNode | "terminal" | The tool glyph. It rolls out when the call resolves. | `data-icon` |
  | `name` | string | "bash" | The tool name. | `data-name` |
  | `argument` | string | "npm test" | The argument. | `data-argument` |
  | `status` | "idle" \| "running" \| "done" \| "error" | "running" | Running wipes the fill across and ticks the counter. Done completes it with a wash. Error stops it, tints and shakes. | `data-status` |
  | `expectedMs` | number | 2500 | Milliseconds the fill takes to reach its 90% park, the time you expect the call to take. | `data-expected-ms` |
  | `size` | number | 34 | Chip height in pixels. Font, padding and glyph follow. | `data-size` |
  | `radius` | number | 10 | Corner radius in pixels. Half the height is a pill. | `data-radius` |
  | `color` | string | "currentColor" | Ink for the text and the tool glyph. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `surfaceColor` | string | "#27272a" | The chip surface. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `progressColor` | string | "currentColor" | The fill that wipes across while running. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `progressOpacity` | number | 0.08 | How strong that fill is. | `data-progress-opacity` |
  | `doneColor` | string | "#22c55e" | The success wash and the check. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `errorColor` | string | "#ef4444" | The stopped fill and the retry glyph on error. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `washOpacity` | number | 0.14 | Strength of the success wash and of the error tint. | `data-wash-opacity` |
  | `shake` | number | 6 | Error shake amplitude in pixels. 0 tints only. | `data-shake` |
  | `showTimer` | boolean | true | Shows the millisecond counter. | `data-show-timer` |
  | `onRetry` | () => void | - | When set, the failed chip becomes a retry button. | no aplica (React) |
  | `className` | string | "" | Extra classes for the root. | no aplica (React) |
  | `style` | CSSProperties | undefined | Inline styles merged onto the root. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `rejilla` · rejilla (LatticeLoader) · quizás

- **Diapositiva:** `l09-rejilla`
- **Propósito (texto de la ficha):** Rejilla de 3×3 o 4×4 celdas que se encienden en onda (orbit, snake, ripple…), con etiqueta y cronómetro. Al acabar, las celdas dibujan ✓ o ✗. Solo CSS con animation-delay
- **Archivo fuente:** `react-bits/src/content/Micro/LatticeLoader/LatticeLoader.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Micro/LatticeLoader/LatticeLoader.jsx](../../../../../react-bits/src/content/Micro/LatticeLoader/LatticeLoader.jsx) (164 líneas), CSS [LatticeLoader.css](../../../../../react-bits/src/content/Micro/LatticeLoader/LatticeLoader.css), props en [LatticeLoaderDemo.jsx](../../../../../react-bits/src/demo/Micro/LatticeLoaderDemo.jsx), uso en [latticeLoaderCode.js](../../../../../react-bits/src/constants/code/Micro/latticeLoaderCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** IMPLEMENTAR · coste S · valor 3 · estilos: matriz (encaja de forma natural con los LED), noche, termica, suizo; choca poco
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/rejilla.js` (+ `fx/experimental/rejilla.css` si hace falta) como pieza por clase con el nombre `rejilla`. Antes, buscar `rejilla` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-rejilla`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `label` | string | "Thinking" | The verb while working. | `data-label` |
  | `doneLabel` | string | "Done in" | The verb after status turns to done; the frozen time follows it. | `data-done-label` |
  | `errorLabel` | string | "Failed after" | The verb after status turns to error. | `data-error-label` |
  | `status` | "working" \| "done" \| "error" | "working" | Drives everything: the wave runs, or freezes and dissolves into a check or a cross while the stopwatch stops. | `data-status` |
  | `pattern` | string \| { cells, loop?, scale? } | "orbit" | The wave geometry. At 3 x 3: arrow, dots, orbit, ripple, snake, spiral. At 4 x 4: sweep, spin, rain, pulse, orbit, snake. A custom object gives one delay per cell in step units (null for a hole), an optional loop and scale, and lit: the share of the cycle a cell stays bright, 0.25, 0.35, 0.45 or 0.62. | `data-pattern` |
  | `grid` | 3 \| 4 | 3 | Cells per side. Each size has its own set of patterns and its own check and cross. | `data-grid` |
  | `shape` | "square" \| "round" | "round" | Rounded tiles or dots. | `data-shape` |
  | `color` | string | "currentColor" | Ink for the cells, the verb and the stopwatch. Inherits the page colour by default. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `doneColor` | string | "#22c55e" | Colour of the check. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `errorColor` | string | "#ef4444" | Colour of the cross. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `cellSize` | number | 6 | Cell side in pixels; the lattice is three cells and two gaps. | `data-cell-size` |
  | `gap` | number | 2 | Seam between cells in pixels. | `data-gap` |
  | `fontSize` | number | 14 | Verb size in pixels; the stopwatch and row gap scale with it. | `data-font-size` |
  | `step` | number | 90 | Milliseconds between neighbouring cells lighting; the whole loop scales with it. | `data-step` |
  | `idleOpacity` | number | 0.15 | How visible the dark silhouette is. | `data-idle-opacity` |
  | `glow` | boolean | false | A halo on the lit cells and the mark. | `data-glow` |
  | `glowColor` | string | "" | The halo colour. Empty follows the ink, and the mark colour for the mark. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `showTimer` | boolean | true | Shows the live stopwatch. | `data-show-timer` |
  | `elapsed` | number | undefined | Controlled elapsed seconds. When set, the internal clock never runs. | `data-elapsed` |
  | `className` | string | "" | Extra classes for the row. | no aplica (React) |
  | `style` | CSSProperties | undefined | Inline styles merged onto the row. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `campo` · campo (MagnetLines) · quizás

- **Diapositiva:** `l09-campo`
- **Propósito (texto de la ficha):** Rejilla de segmentos que se orientan hacia el cursor (modos orbit, attract…), con inercia y onda. Canvas 2D y WebGL2
- **Archivo fuente:** `react-bits/src/content/Backgrounds/MagnetLines/MagnetLines.jsx (aún no portado al motor)`
- **Nota:** recomendado sin implementar (fx campo, sin ratón)
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Backgrounds/MagnetLines/MagnetLines.jsx](../../../../../react-bits/src/content/Backgrounds/MagnetLines/MagnetLines.jsx) (980 líneas), CSS [MagnetLines.css](../../../../../react-bits/src/content/Backgrounds/MagnetLines/MagnetLines.css), props en [MagnetLinesDemo.jsx](../../../../../react-bits/src/demo/Backgrounds/MagnetLinesDemo.jsx), presets en [MagnetLines.js](../../../../../react-bits/src/demo/Backgrounds/presets/MagnetLines.js), uso en [magnetLinesCode.js](../../../../../react-bits/src/constants/code/Backgrounds/magnetLinesCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** IMPLEMENTAR (como fx `campo`, sin ratón) · coste S · valor 2 (no como fondo: como **diagrama de campo vectorial**: gradiente, campo de potencial, costmap) · estilos: todos (es un diagrama); quiver con `seq` por magnitud
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/campo.js` (+ `fx/experimental/campo.css` si hace falta) como pieza por clase con el nombre `campo`. Antes, buscar `campo` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-campo`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (29):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `spacing` | number | 30 | Distance between lines in px. The grid fills the area with as many lines as fit. | `data-spacing` |
  | `rows` | number | - | Exact number of rows. Overrides spacing. | `data-rows` |
  | `columns` | number | - | Exact number of columns. Overrides spacing. | `data-columns` |
  | `containerSize` | number \| string | - | Draws a square field of this width instead of filling the parent. Numbers are in px; strings take any CSS length. | `data-container-size` |
  | `lineColor` | string | '#efefef' | Color of the lines. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `accentColor` | string | - | Color lines take on near the cursor. Compass needles use it for their north half. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `lineWidth` | number \| string | 2 | Thickness of each line. Numbers are in px; strings take any CSS length. | `data-line-width` |
  | `lineHeight` | number \| string | 18 | Length of each line. Numbers are in px; strings take any CSS length. | `data-line-height` |
  | `baseAngle` | number | -10 | Resting angle of the lines in degrees, used before the intro and outside the reach. | `data-base-angle` |
  | `mode` | 'orbit' \| 'attract' \| 'spiral' \| 'dipole' | 'orbit' | Shape of the field: rings around the cursor, lines aiming at it, a vortex, or a bar magnet that turns with your movement. | `data-mode` |
  | `shape` | 'line' \| 'arrow' \| 'needle' | 'line' | Draws each line as a rounded bar, an arrow showing the field direction, or a two-tone compass needle. | `data-shape` |
  | `rainbow` | boolean | false | Colors every line by the direction it points, so the field becomes a color wheel. | `data-rainbow` |
  | `radius` | number | 200 | Size of the area around the cursor where lines are brightest and longest, in px. | `data-radius` |
  | `fade` | number | 0.65 | How much lines dim away from the cursor, from 0 to 1. 0 keeps every line at full strength. | `data-fade` |
  | `edgeFade` | number | 0 | Fades the edges into the page, from 0 to 1. | `data-edge-fade` |
  | `stretch` | number | 0.4 | How much lines grow near the cursor, from 0 to 2. | `data-stretch` |
  | `reach` | number | 0 | Distance in px within which lines follow the cursor. Lines farther out settle back to their resting angle. 0 means every line follows. | `data-reach` |
  | `scatter` | number | 0 | Randomizes the resting angle of each line, from 0 to 1, like loose iron filings. Pairs well with reach. | `data-scatter` |
  | `inertia` | number | 0.35 | How slowly the lines swing into place, from 0 to 1. 0 snaps them instantly. | `data-inertia` |
  | `bounce` | number | 0.3 | How much the lines overshoot and wobble as they settle, from 0 to 1. | `data-bounce` |
  | `ripple` | number | 0.3 | Delays lines by their distance from the cursor so movement ripples outward, from 0 to 1. | `data-ripple` |
  | `clickPulse` | boolean | true | Clicking sends a ring that spins the lines as it travels outward. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Lines fade in from the center and swing into place when the field mounts. | `data-intro` |
  | `idle` | boolean | false | Moves the field on its own when the cursor is away. | `data-idle` |
  | `tiltX` | number | 0 | Tilts the field back in 3D around the horizontal axis, in degrees. A full-size field stretches to the horizon. | `data-tilt-x` |
  | `tiltY` | number | 0 | Tilts the field in 3D around the vertical axis, in degrees. | `data-tilt-y` |
  | `maxDevicePixelRatio` | number | 2 | Highest pixel ratio the canvas renders at. | `data-max-device-pixel-ratio` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-crosshair` · Crosshair · quizás

- **Diapositiva:** `l09-q-crosshair`
- **Propósito (texto de la ficha):** Cruz con coordenadas que mide lo que hay bajo el cursor
- **Archivo fuente:** `react-bits/src/content/Animations/Crosshair/Crosshair.jsx (aún no portado al motor)`
- **Nota:** lectura de coordenadas en reticula
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/Crosshair/Crosshair.jsx](../../../../../react-bits/src/content/Animations/Crosshair/Crosshair.jsx) (434 líneas), props en [CrosshairDemo.jsx](../../../../../react-bits/src/demo/Animations/CrosshairDemo.jsx), uso en [crosshairCode.js](../../../../../react-bits/src/constants/code/Animations/crosshairCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (solo como lectura de coordenadas dentro de `reticula`) · coste S · valor 1 · estilos: noche, termica (medidor de punto) / suizo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-crosshair.js` (+ `fx/experimental/exp-crosshair.css` si hace falta) como pieza por clase con el nombre `exp-crosshair`. Antes, buscar `exp-crosshair` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-crosshair`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (16):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `color` | string | '#ffffff' | Color of the lines, labels and brackets. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `containerRef` | RefObject<HTMLElement> | null | Keeps the crosshair inside this element, which needs a position other than static. Without it the crosshair covers the whole viewport. | `data-container-ref` |
  | `thickness` | number | 1 | Line thickness in px. | `data-thickness` |
  | `opacity` | number | 0.85 | Opacity of everything the crosshair draws. | `data-opacity` |
  | `lineStyle` | 'solid' \| 'dashed' \| 'dotted' | 'solid' | Stroke style of the two lines. | `data-line-style` |
  | `gap` | number | 0 | Empty space in px left around the pointer where the lines would cross. | `data-gap` |
  | `fade` | number | 0 | How much the lines fade out toward the edges, from 0 to 1. | `data-fade` |
  | `smoothing` | number | 0.35 | How far the lines trail behind the pointer. 0 sticks to it. | `data-smoothing` |
  | `showCoordinates` | boolean | true | Shows the pointer position where the lines meet the edges, and the size of a locked target. | `data-show-coordinates` |
  | `targetEffect` | 'lock' \| 'glitch' \| 'none' | 'lock' | What happens over a target. Lock frames it with corner brackets and measures it, glitch shakes the lines like a bad signal. | `data-target-effect` |
  | `targetSelector` | string | 'a, button, [data-crosshair-target]' | CSS selector for the elements the crosshair reacts to. | `data-target-selector` |
  | `clickPulse` | boolean | true | Sends a ring out from the pointer on every click or tap. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `hideCursor` | boolean | false | Hides the system cursor inside the crosshair area and marks the pointer with a dot instead. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `blendMode` | 'normal' \| 'difference' | 'normal' | Difference inverts whatever is under the lines, so they stay visible on any background. | `data-blend-mode` |
  | `className` | string | '' | Extra class names for the canvas. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the canvas. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-logoloop` · LogoLoop · quizás

- **Diapositiva:** `l09-q-logoloop`
- **Propósito (texto de la ficha):** Cinta infinita de logos; también en ola, arco y órbita 3D, con lupa
- **Archivo fuente:** `react-bits/src/content/Animations/LogoLoop/LogoLoop.jsx (aún no portado al motor)`
- **Nota:** diapositiva de stack
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/LogoLoop/LogoLoop.jsx](../../../../../react-bits/src/content/Animations/LogoLoop/LogoLoop.jsx) (1099 líneas), CSS [LogoLoop.css](../../../../../react-bits/src/content/Animations/LogoLoop/LogoLoop.css), props en [LogoLoopDemo.jsx](../../../../../react-bits/src/demo/Animations/LogoLoopDemo.jsx), uso en [logoLoopCode.js](../../../../../react-bits/src/constants/code/Animations/logoLoopCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (diapositiva de «stack») · coste S–M · valor 2 · estilos: todos menos suizo (ahí mejor una rejilla quieta)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-logoloop.js` (+ `fx/experimental/exp-logoloop.css` si hace falta) como pieza por clase con el nombre `exp-logoloop`. Antes, buscar `exp-logoloop` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-logoloop`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (27):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `logos` | LogoItem[] | required | Logos to show. Each item is either { node } for any React node, like an icon, or { src, alt } for an image. Both accept an optional title, href and hoverColor, the brand color a logo takes on when hovered. | `data-logos` |
  | `speed` | number | 120 | Speed in pixels per second. Negative values reverse the direction. | `data-speed` |
  | `direction` | 'left' \| 'right' \| 'up' \| 'down' | 'left' | Which way the logos travel. | `data-direction` |
  | `width` | number \| string | '100%' | Width of the loop. | `data-width` |
  | `logoHeight` | number | 28 | Height of each logo in pixels. | `data-logo-height` |
  | `gap` | number | 32 | Space between logos in pixels. | `data-gap` |
  | `hoverSpeed` | number | undefined | Speed while the loop is hovered or a logo has keyboard focus. 0 pauses it and a small value slows it down. By default it pauses. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `pauseOnHover` | boolean | undefined | Set to false to keep full speed on hover. Ignored when hoverSpeed is set. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `fadeOut` | boolean | true | Fades the logos out softly at both ends. It is a transparent mask, so it works on any background. | `data-fade-out` |
  | `fadeOutWidth` | number | 0.12 | Size of each fade as a fraction of the length, from 0 to 0.5. | `data-fade-out-width` |
  | `scaleOnHover` | boolean | false | Grows the hovered logo slightly. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `layout` | 'line' \| 'wave' \| 'arc' \| 'orbit' | 'line' | Path the logos travel along: a straight line, a wave, an arc, or a ring that turns in 3D. | `data-layout` |
  | `bend` | number | 0.5 | How strongly the path bends, from -1 to 1. It sets the height of the wave, the curve of the arc or the tilt of the orbit. Negative values flip it. | `data-bend` |
  | `focus` | number | 0 | A lens in the middle, from 0 to 1. Logos grow and make room as they pass the center while the outer ones dim. | `data-focus` |
  | `magnify` | number | 0 | Dock-style magnification under the cursor, from 0 to 1. Nearby logos move aside to make room. | `data-magnify` |
  | `tiltX` | number | 0 | Tilts the loop back or forward in 3D, in degrees. | `data-tilt-x` |
  | `tiltY` | number | 0 | Turns the loop to the side in 3D, in degrees. | `data-tilt-y` |
  | `step` | boolean | false | Moves one logo at a time and pauses, centering each logo in turn. Speed sets the pace. | `data-step` |
  | `muted` | number | 0 | Greys out and dims the logos until one is hovered or centered, from 0 to 1. | `data-muted` |
  | `labels` | 'none' \| 'inline' \| 'below' \| 'hover' | 'none' | Shows each logo's title beside it, below it, or as a small caption when it is hovered or centered. | `data-labels` |
  | `draggable` | boolean | true | Lets people drag or swipe the loop and fling it. Links still open with a normal click. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `scrollBoost` | number | 0 | Speeds the loop up while the page scrolls and reverses it when scrolling up, from 0 to 1. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Logos fade and rise in from left to right the first time the loop comes into view. | `data-intro` |
  | `renderItem` | (item: LogoItem, key: React.Key) => React.ReactNode | undefined | Custom render function for each logo, for full control over how it looks. | `data-render-item` |
  | `ariaLabel` | string | 'Partner logos' | Accessible name for the loop. | `data-aria-label` |
  | `className` | string | undefined | Extra class names for the container. | no aplica (React) |
  | `style` | React.CSSProperties | undefined | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-orbit` · OrbitImages · quizás

- **Diapositiva:** `l09-q-orbit`
- **Propósito (texto de la ficha):** Imágenes que orbitan una trayectoria y pasan por delante y por detrás de un centro
- **Archivo fuente:** `react-bits/src/content/Animations/OrbitImages/OrbitImages.jsx (aún no portado al motor)`
- **Nota:** diagrama de ecosistema
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Animations/OrbitImages/OrbitImages.jsx](../../../../../react-bits/src/content/Animations/OrbitImages/OrbitImages.jsx) (838 líneas), CSS [OrbitImages.css](../../../../../react-bits/src/content/Animations/OrbitImages/OrbitImages.css), props en [OrbitImagesDemo.jsx](../../../../../react-bits/src/demo/Animations/OrbitImagesDemo.jsx), uso en [orbitImagesCode.js](../../../../../react-bits/src/constants/code/Animations/orbitImagesCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (diagrama «ecosistema») · coste M · valor 2 · estilos: rice, nube, aurora / suizo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-orbit.js` (+ `fx/experimental/exp-orbit.css` si hace falta) como pieza por clase con el nombre `exp-orbit`. Antes, buscar `exp-orbit` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-orbit`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (35):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `images` | Array<string \| { src: string; alt?: string }> | [] | Images that travel along the path, as URLs or objects with their own alt text. | `data-images` |
  | `altPrefix` | string | 'Orbiting image' | Prefix for the alt text of images given as plain URLs. | `data-alt-prefix` |
  | `shape` | 'ellipse' \| 'circle' \| 'square' \| 'rectangle' \| 'triangle' \| 'star' \| 'heart' \| 'infinity' \| 'wave' \| 'custom' | 'ellipse' | Shape of the path the images follow. | `data-shape` |
  | `customPath` | string | undefined | Your own SVG path, drawn in a baseWidth by baseWidth space. Used when shape is custom. | `data-custom-path` |
  | `baseWidth` | number | 1400 | Size of the coordinate space for the radii, the item size and custom paths. | `data-base-width` |
  | `radiusX` | number | 700 | Horizontal radius for the ellipse, rectangle, infinity and wave. | `data-radius-x` |
  | `radiusY` | number | 170 | Vertical radius for the ellipse, rectangle, infinity and wave. | `data-radius-y` |
  | `radius` | number | 300 | Radius for the circle, square, triangle, star and heart. | `data-radius` |
  | `starPoints` | number | 5 | Number of points on the star. | `data-star-points` |
  | `starInnerRatio` | number | 0.5 | Inner radius of the star as a fraction of the outer one. | `data-star-inner-ratio` |
  | `rotation` | number | -8 | Rotation of the whole path in degrees. Images stay upright. | `data-rotation` |
  | `duration` | number | 40 | Seconds for one full lap. | `data-duration` |
  | `itemSize` | number | 64 | Size of each image, in the same units as the radii. | `data-item-size` |
  | `direction` | 'normal' \| 'reverse' | 'normal' | Which way the images travel. | `data-direction` |
  | `fill` | boolean | true | Spreads the images evenly around the whole path. Turn it off to make them follow each other in a train. | `data-fill` |
  | `depth` | number | 0.5 | Sense of depth, from 0 to 1. Images at the back get smaller, dimmer and pass behind the center content, and images at the front grow and pass in front of it. | `data-depth` |
  | `alignToPath` | boolean | false | Turns each image to follow the curve instead of staying upright. | `data-align-to-path` |
  | `itemRadius` | number \| string | 12 | Corner radius of the images, in the same units as itemSize, or any CSS length. Half of itemSize makes circles. | `data-item-radius` |
  | `shadow` | number | 0.3 | Strength of the soft shadow under each image, from 0 to 1. | `data-shadow` |
  | `hoverScale` | number | 1.08 | How much an image grows when hovered. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `hoverSpeed` | number | 0.3 | Speed while the orbit is hovered, as a fraction of the normal speed. 0 pauses it and 1 keeps full speed. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `draggable` | boolean | true | Lets people drag or swipe sideways to spin the orbit, and fling it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `clickToFront` | boolean | true | Clicking an image glides it around to the front. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `onItemClick` | (index: number, src: string) => void | undefined | Called when an image is clicked. When set, the images become keyboard-focusable buttons. | no aplica (React) |
  | `showPath` | boolean | false | Draws the path the images follow. | `data-show-path` |
  | `pathColor` | string | 'rgba(128,128,128,0.35)' | Color of the path line. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `pathWidth` | number | 2 | Width of the path line in pixels. | `data-path-width` |
  | `pathDash` | number | 0 | Dash length of the path line in pixels. 0 draws a solid line. | `data-path-dash` |
  | `easing` | 'linear' \| 'easeIn' \| 'easeOut' \| 'easeInOut' | 'linear' | Easing applied to each lap. | `data-easing` |
  | `paused` | boolean | false | Stops the orbit. Dragging still works. | `data-paused` |
  | `intro` | boolean | true | Images fan out from the front around the path, and the line draws in, when the orbit first comes into view. | `data-intro` |
  | `centerContent` | ReactNode | undefined | Content in the middle of the orbit. With depth, images pass behind and in front of it. | `data-center-content` |
  | `width` | number \| string | '100%' | Width of the container. The orbit scales to fit. | `data-width` |
  | `height` | number \| string | 'auto' | Height of the container. Auto matches the shape of the orbit, any other value fits the orbit inside. | `data-height` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-accordion` · AccordionGallery · quizás

- **Diapositiva:** `l09-q-accordion`
- **Propósito (texto de la ficha):** GSAP, flex; paneles de imagen que se expanden con hover
- **Archivo fuente:** `react-bits/src/content/Components/AccordionGallery/AccordionGallery.jsx (aún no portado al motor)`
- **Nota:** acordeón por pasos
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/AccordionGallery/AccordionGallery.jsx](../../../../../react-bits/src/content/Components/AccordionGallery/AccordionGallery.jsx) (236 líneas), CSS [AccordionGallery.css](../../../../../react-bits/src/content/Components/AccordionGallery/AccordionGallery.css), props en [AccordionGalleryDemo.jsx](../../../../../react-bits/src/demo/Components/AccordionGalleryDemo.jsx), uso en [accordionGalleryCode.js](../../../../../react-bits/src/constants/code/Components/accordionGalleryCode.js).
- **Dependencias del original:** `gsap`
- **Informe:** QUIZÁ (como «acordeón por pasos») · coste S · valor 2 · estilos: suizo, nube, matriz, noche / arcilla
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-accordion.js` (+ `fx/experimental/exp-accordion.css` si hace falta) como pieza por clase con el nombre `exp-accordion`. Antes, buscar `exp-accordion` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-accordion`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (18):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `items` | Array<{ image: string; label?: string; link?: string; alt?: string }> | 5 sample panels | The panels to render. Each needs an image, and optionally a label, link and alt text. | `data-items` |
  | `defaultIndex` | number | 2 | Index of the panel that is expanded on load, so the gallery never looks dead. | `data-default-index` |
  | `accentColor` | string | "#ffffff" | Colour of the caption accent bar and the focus ring. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `overlayColor` | string | "#060010" | Colour used for the bottom legibility gradient and the dimming of collapsed panels. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `textColor` | string | "#ffffff" | Colour of the caption text. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `grayscale` | boolean | true | Desaturate collapsed panels and restore full colour on the expanded one. | `data-grayscale` |
  | `showLabels` | boolean | true | Whether captions reveal on the expanded panel. | `data-show-labels` |
  | `duration` | number | 0.6 | Duration of the expand / collapse transition in seconds. | `data-duration` |
  | `ease` | string | "power3.out" | GSAP easing used for every transition. | `data-ease` |
  | `parallax` | number | 0.5 | Strength of the internal image drift as panels resize (0 disables it). | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `tilt` | number | 8 | Degrees of 3D rotation applied to collapsed panels, easing to flat on the open one. | `data-tilt` |
  | `stagger` | number | 0.06 | Delay between the caption bar and text reveal, in seconds. | `data-stagger` |
  | `trigger` | "hover" \| "click" | "hover" | How a panel expands on pointer devices. Focus and tap always expand too. | `data-trigger` |
  | `height` | number | 460 | Height of the row in pixels (width of the column when vertical). | `data-height` |
  | `gap` | number | 10 | Gap between panels in pixels. | `data-gap` |
  | `radius` | number | 16 | Corner radius of each panel in pixels. | `data-radius` |
  | `expandRatio` | number | 0.52 | Fraction of the row the expanded panel occupies (0.2 – 0.9). | `data-expand-ratio` |
  | `orientation` | "horizontal" \| "vertical" | "horizontal" | Lay the accordion out as a row or a column. | `data-orientation` |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-borderglow` · BorderGlow · quizás

- **Diapositiva:** `l09-q-borderglow`
- **Propósito (texto de la ficha):** CSS con degradado en malla en el borde, que sigue al puntero
- **Archivo fuente:** `react-bits/src/content/Components/BorderGlow/BorderGlow.jsx (aún no portado al motor)`
- **Nota:** generalizar focus-border de rice
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/BorderGlow/BorderGlow.jsx](../../../../../react-bits/src/content/Components/BorderGlow/BorderGlow.jsx) (170 líneas), CSS [BorderGlow.css](../../../../../react-bits/src/content/Components/BorderGlow/BorderGlow.css), props en [BorderGlowDemo.jsx](../../../../../react-bits/src/demo/Components/BorderGlowDemo.jsx), uso en [borderGlowCode.js](../../../../../react-bits/src/constants/code/Components/borderGlowCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (generalizar el `focus-border` de rice) · coste S · valor 1 · estilos: aurora, cromo, rice / suizo, matriz
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-borderglow.js` (+ `fx/experimental/exp-borderglow.css` si hace falta) como pieza por clase con el nombre `exp-borderglow`. Antes, buscar `exp-borderglow` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-borderglow`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (11):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `children` | ReactNode | - | Content rendered inside the card. | no aplica (React) |
  | `className` | string | "" | Additional CSS classes for the outer wrapper. | no aplica (React) |
  | `edgeSensitivity` | number | 30 | How close the pointer must be to the edge for the glow to appear (0-100). | `data-edge-sensitivity` |
  | `glowColor` | string | "40 80 80" | HSL values for the glow color, as "H S L" (e.g. "40 80 80"). | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `backgroundColor` | string | "#120F17" | Background color of the card. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `borderRadius` | number | 28 | Corner radius of the card in pixels. | `data-border-radius` |
  | `glowRadius` | number | 40 | How far the outer glow extends beyond the card in pixels. | `data-glow-radius` |
  | `glowIntensity` | number | 1.0 | Multiplier for glow opacity (0.1-3.0). | `data-glow-intensity` |
  | `coneSpread` | number | 25 | Width of the directional cone mask as a percentage (5-45). | `data-cone-spread` |
  | `animated` | boolean | false | Play an intro sweep animation on mount. | `data-animated` |
  | `colors` | string[] | [...] | Array of 3 hex colors for the mesh gradient border, distributed across positions. | fijo con tokens (`api.cats()`, `api.tok()`) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-bouncecards` · BounceCards · quizás

- **Diapositiva:** `l09-q-bouncecards`
- **Propósito (texto de la ficha):** CSS transform + rAF con muelles; abanico de fotos que entra rebotando
- **Archivo fuente:** `react-bits/src/content/Components/BounceCards/BounceCards.jsx (aún no portado al motor)`
- **Nota:** abanico de capturas
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/BounceCards/BounceCards.jsx](../../../../../react-bits/src/content/Components/BounceCards/BounceCards.jsx) (319 líneas), CSS [BounceCards.css](../../../../../react-bits/src/content/Components/BounceCards/BounceCards.css), props en [BounceCardsDemo.jsx](../../../../../react-bits/src/demo/Components/BounceCardsDemo.jsx), uso en [bounceCardsCode.js](../../../../../react-bits/src/constants/code/Components/bounceCardsCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (abanico de capturas) · coste S · valor 2 · estilos: rice, arcilla, aurora, nube / suizo, matriz
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-bouncecards.js` (+ `fx/experimental/exp-bouncecards.css` si hace falta) como pieza por clase con el nombre `exp-bouncecards`. Antes, buscar `exp-bouncecards` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-bouncecards`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `images` | Array<string \| { src: string; alt?: string }> | [] | Images for the cards, from left to right. | `data-images` |
  | `containerWidth` | number | 400 | Width of the container in pixels. | `data-container-width` |
  | `containerHeight` | number | 400 | Height of the container in pixels. | `data-container-height` |
  | `cardSize` | number | 200 | Width and height of each card in pixels. | `data-card-size` |
  | `spread` | number | 85 | Horizontal distance between cards in pixels. | `data-spread` |
  | `rotation` | number | 10 | Largest tilt in degrees. Each card leans by a different share of it, like a loose pile. | `data-rotation` |
  | `arc` | number | 0 | Drops the outer cards by this many pixels so the fan curves. Negative values curve it up. | `data-arc` |
  | `pushDistance` | number | 160 | How far the other cards slide away from the hovered one, in pixels. | `data-push-distance` |
  | `hoverScale` | number | 1.06 | Scale of the hovered card as it straightens and comes to the front. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `bounciness` | number | 0.6 | How much the cards overshoot as they pop in, from 0 to 1. | `data-bounciness` |
  | `animationDelay` | number | 0.5 | Seconds before the first card pops in. | `data-animation-delay` |
  | `animationStagger` | number | 0.06 | Seconds between cards popping in. | `data-animation-stagger` |
  | `enableHover` | boolean | true | Spreads the cards apart on hover. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `borderWidth` | number | 5 | Width of the card border in pixels. | `data-border-width` |
  | `borderColor` | string | '#ffffff' | Color of the card border. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `radius` | number | 25 | Corner radius of the cards in pixels. | `data-radius` |
  | `shadow` | boolean | true | Soft drop shadow that deepens on hover. | `data-shadow` |
  | `onCardClick` | (index: number) => void | - | Called with the card index on click or Enter. Cards become focusable buttons when it is set. | no aplica (React) |
  | `transformStyles` | string[] | - | Optional custom positions such as "rotate(5deg) translate(-150px)". Overrides spread, rotation and arc. | `data-transform-styles` |
  | `className` | string | '' | Extra class names for the container. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the container. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-driftwall` · DriftWall · quizás

- **Diapositiva:** `l09-q-driftwall`
- **Propósito (texto de la ficha):** CSS 3D + rAF; muro inclinado de baldosas que se desplaza
- **Archivo fuente:** `react-bits/src/content/Components/DriftWall/DriftWall.jsx (aún no portado al motor)`
- **Nota:** muro de portada o separador
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/DriftWall/DriftWall.jsx](../../../../../react-bits/src/content/Components/DriftWall/DriftWall.jsx) (292 líneas), CSS [DriftWall.css](../../../../../react-bits/src/content/Components/DriftWall/DriftWall.css), props en [DriftWallDemo.jsx](../../../../../react-bits/src/demo/Components/DriftWallDemo.jsx), uso en [driftWallCode.js](../../../../../react-bits/src/constants/code/Components/driftWallCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (muro de portada o separador) · coste S · valor 2 · estilos: noche, matriz, nube, cromo, termica / suizo, arcilla
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-driftwall.js` (+ `fx/experimental/exp-driftwall.css` si hace falta) como pieza por clase con el nombre `exp-driftwall`. Antes, buscar `exp-driftwall` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-driftwall`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (21):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `items` | array | 15 demo tiles | Tiles to display. Each item has { image, title?, href? }. | `data-items` |
  | `columns` | number | 5 | Number of drifting columns. | `data-columns` |
  | `tileWidth` | number | 200 | Width of each tile in pixels. | `data-tile-width` |
  | `tileHeight` | number | 132 | Height of each tile in pixels. | `data-tile-height` |
  | `gap` | number | 18 | Spacing between tiles and columns in pixels. | `data-gap` |
  | `radius` | number | 14 | Corner radius of each tile in pixels. | `data-radius` |
  | `tilt` | number | 16 | Perspective pitch of the wall (rotateX, degrees). | `data-tilt` |
  | `turn` | number | -14 | Perspective yaw of the wall (rotateY, degrees). | `data-turn` |
  | `roll` | number | 0 | In-plane rotation of the wall (rotateZ, degrees). | `data-roll` |
  | `perspective` | number | 1200 | Perspective distance in pixels — smaller is more dramatic. | `data-perspective` |
  | `depth` | number | 120 | How far the wall sits back from the viewer in pixels. | `data-depth` |
  | `speed` | number | 42 | Base drift speed in pixels per second. | `data-speed` |
  | `direction` | "up" \| "down" | "up" | Primary drift direction; columns alternate around it. | `data-direction` |
  | `variance` | number | 0.45 | How much column speeds differ from each other (0–1). | `data-variance` |
  | `parallax` | number | 0.6 | Pointer-follow tilt strength (0 disables it). | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `pauseOnHover` | boolean | false | Pause the whole wall while the pointer is over it. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `lift` | number | 64 | How far a hovered tile lifts toward the viewer in pixels. | `data-lift` |
  | `fade` | number | 0.6 | Strength of the edge and depth dissolve (0–1). | `data-fade` |
  | `dim` | number | 0.55 | Resting opacity of unhovered tiles (0–1). | `data-dim` |
  | `grayscale` | boolean | false | Desaturate resting tiles; hover restores colour. | `data-grayscale` |
  | `overlayColor` | string | "#060010" | Tint laid over resting tiles, cleared on hover. | fijo con tokens (`api.cats()`, `api.tok()`) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-flowingmenu` · FlowingMenu · quizás

- **Diapositiva:** `l09-q-flowingmenu`
- **Propósito (texto de la ficha):** CSS; menú a pantalla completa con banda y marquesina
- **Archivo fuente:** `react-bits/src/content/Components/FlowingMenu/FlowingMenu.jsx (aún no portado al motor)`
- **Nota:** variante de agenda
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/FlowingMenu/FlowingMenu.jsx](../../../../../react-bits/src/content/Components/FlowingMenu/FlowingMenu.jsx) (661 líneas), CSS [FlowingMenu.css](../../../../../react-bits/src/content/Components/FlowingMenu/FlowingMenu.css), props en [FlowingMenuDemo.jsx](../../../../../react-bits/src/demo/Components/FlowingMenuDemo.jsx), uso en [flowingMenuCode.js](../../../../../react-bits/src/constants/code/Components/flowingMenuCode.js).
- **Dependencias del original:** `@hugeicons/core-free-icons`, `@hugeicons/react`
- **Informe:** QUIZÁ (variante de `agenda`) · coste S · valor 1 · estilos: noche, suizo, matriz
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-flowingmenu.js` (+ `fx/experimental/exp-flowingmenu.css` si hace falta) como pieza por clase con el nombre `exp-flowingmenu`. Antes, buscar `exp-flowingmenu` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-flowingmenu`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (27):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `items` | Array<{ text, link?, image?, marquee?, meta? }> | [] | Menu rows. marquee changes the text that scrolls in the band and meta adds a note at the end of the row. | `data-items` |
  | `speed` | number | 60 | Marquee speed in px per second. | `data-speed` |
  | `direction` | 'left' \| 'right' \| 'alternate' | 'left' | Which way the marquee runs. Alternate flips every other row. | `data-direction` |
  | `followCursor` | number | 0.4 | How much moving the cursor sideways speeds up or reverses the marquee, from 0 to 1. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `duration` | number | 0.5 | Time in seconds the band takes to glide to a row. | `data-duration` |
  | `stretch` | number | 0.6 | How much the band stretches like liquid while it moves, from 0 for rigid to 1. | `data-stretch` |
  | `magnet` | number | 0.25 | How much the band leans toward the cursor inside a row, from 0 to 1. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `bandInset` | number | 0 | Gap in px between the band and the row edges. | `data-band-inset` |
  | `carryContent` | boolean | false | Moves the marquee with the band instead of keeping it fixed in each row. | `data-carry-content` |
  | `bandRadius` | number | 0 | Corner radius of the band in px. Use a large value for a pill. | `data-band-radius` |
  | `textColor` | string | '#ffffff' | Color of the menu text. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `bgColor` | string | '#120F17' | Background color of the menu. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `marqueeBgColor` | string | '#ffffff' | Background color of the band. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `marqueeTextColor` | string | '#120F17' | Text color inside the band. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `borderColor` | string | 'rgba(255, 255, 255, 0.14)' | Color of the lines between rows. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `dividers` | boolean | true | Draws lines between rows. | `data-dividers` |
  | `dimInactive` | boolean | false | Fades the other rows while the band is on one. | `data-dim-inactive` |
  | `align` | 'center' \| 'left' | 'center' | Alignment of the row labels. | `data-align` |
  | `showIndex` | boolean | false | Numbers each row. | `data-show-index` |
  | `showArrow` | boolean | false | Adds an arrow to the end of each row. | `data-show-arrow` |
  | `imageShape` | 'pill' \| 'rounded' \| 'circle' | 'pill' | Shape of the images in the band. | `data-image-shape` |
  | `intro` | boolean | true | Rows rise in, the lines draw and the band sweeps once down the menu on mount. | `data-intro` |
  | `activeIndex` | number | - | Marks the current page row. | `data-active-index` |
  | `onItemClick` | (item, index, event) => void | - | Called when a row is clicked. | no aplica (React) |
  | `ariaLabel` | string | 'Menu' | Accessible name of the navigation. | `data-aria-label` |
  | `className` | string | '' | Extra class names for the menu. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the menu. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-pixelcard` · PixelCard · quizás

- **Diapositiva:** `l09-q-pixelcard`
- **Propósito (texto de la ficha):** Canvas 2D; píxeles que centellean y llenan la tarjeta
- **Archivo fuente:** `react-bits/src/content/Components/PixelCard/PixelCard.jsx (aún no portado al motor)`
- **Nota:** revelado de panel por píxeles
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/PixelCard/PixelCard.jsx](../../../../../react-bits/src/content/Components/PixelCard/PixelCard.jsx) (592 líneas), CSS [PixelCard.css](../../../../../react-bits/src/content/Components/PixelCard/PixelCard.css), props en [PixelCardDemo.jsx](../../../../../react-bits/src/demo/Components/PixelCardDemo.jsx), uso en [pixelCardCode.js](../../../../../react-bits/src/constants/code/Components/pixelCardCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (revelado de panel por píxeles) · coste S–M · valor 2 · estilos: matriz, termica, noche / suizo, arcilla
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-pixelcard.js` (+ `fx/experimental/exp-pixelcard.css` si hace falta) como pieza por clase con el nombre `exp-pixelcard`. Antes, buscar `exp-pixelcard` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-pixelcard`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (23):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `variant` | 'default' \| 'blue' \| 'yellow' \| 'pink' | 'default' | A ready-made palette with its own gap and speed. Any prop you pass overrides it. | `data-variant` |
  | `colors` | string \| string[] | From variant | Pixel colors, as an array or a comma-separated string. Each pixel picks one at random. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `glowColor` | string | From variant | Color of the soft light that follows the cursor across the card. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `gap` | number | From variant | Distance between pixels, in px. | `data-gap` |
  | `pixelSize` | number | 2 | Largest size a pixel grows to, in px. | `data-pixel-size` |
  | `speed` | number | From variant | How fast the pixels twinkle, from 0 to 100. 0 holds them still. | `data-speed` |
  | `shape` | 'square' \| 'circle' \| 'diamond' | 'square' | Shape of each pixel. | `data-shape` |
  | `origin` | 'center' \| 'pointer' | 'center' | Where the reveal wave starts: the middle of the card, or wherever the pointer enters. | `data-origin` |
  | `revealDuration` | number | 600 | How long the wave takes to sweep across the card, in ms. | `data-reveal-duration` |
  | `spotlight` | number | 0.5 | How much pixels near the cursor swell and brighten, from 0 to 1. | `data-spotlight` |
  | `glow` | number | 0.5 | Strength of the soft light under the pixels. | `data-glow` |
  | `opacity` | number | 1 | Opacity of the pixels and glow. Lower it to keep text on the card easy to read. | `data-opacity` |
  | `fade` | number | 0 | Fades the pixels out toward the middle so they frame your content, from 0 to 1. | `data-fade` |
  | `trigger` | 'hover' \| 'click' \| 'always' | 'hover' | What turns the effect on: hovering or focusing the card, clicking it on and off, or always on. | `data-trigger` |
  | `clickPulse` | boolean | true | Clicking sends a ripple of brighter pixels out from the click. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `intro` | boolean | true | Plays the reveal once when the card first scrolls into view. | `data-intro` |
  | `introDelay` | number | 0 | Wait before the intro, in ms. Stagger it across a row of cards. | `data-intro-delay` |
  | `noFocus` | boolean | From variant | Stops keyboard focus from triggering the effect. | `data-no-focus` |
  | `theme` | 'dark' \| 'light' | 'dark' | Color theme of the card. | `data-theme` |
  | `radius` | number | 24 | Corner radius of the card, in px. | `data-radius` |
  | `className` | string | '' | Extra class names for the card. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the card. | no aplica (React) |
  | `children` | ReactNode | - | Card content. It is centered and sits above the pixels. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-stack` · Stack · quizás

- **Diapositiva:** `l09-q-stack`
- **Propósito (texto de la ficha):** motion/react; pila con drag y flick
- **Archivo fuente:** `react-bits/src/content/Components/Stack/Stack.jsx (aún no portado al motor)`
- **Nota:** modo pile de mazo
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/Stack/Stack.jsx](../../../../../react-bits/src/content/Components/Stack/Stack.jsx) (552 líneas), CSS [Stack.css](../../../../../react-bits/src/content/Components/Stack/Stack.css), props en [StackDemo.jsx](../../../../../react-bits/src/demo/Components/StackDemo.jsx), uso en [stackCode.js](../../../../../react-bits/src/constants/code/Components/stackCode.js).
- **Dependencias del original:** `motion/react`
- **Informe:** QUIZÁ (modo `pile` de la pila) · coste M · valor 2 (idea) · estilos: suizo, matriz (versión plana)
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-stack.js` (+ `fx/experimental/exp-stack.css` si hace falta) como pieza por clase con el nombre `exp-stack`. Antes, buscar `exp-stack` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-stack`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (19):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `cards` | ReactNode[] | four sample photos | The cards in the stack, top first. Images fill the card automatically, any other content works too. | `data-cards` |
  | `layout` | 'fan' \| 'cascade' \| 'deck' \| 'pile' | 'fan' | How the cards behind sit. Fan tilts them out from a corner, cascade offsets them diagonally, deck stacks them upward and pile scatters them like loose photos. | `data-layout` |
  | `visible` | number | 4 | How many cards show, counting the top one. The rest wait hidden at the back. | `data-visible` |
  | `spread` | number | 0.5 | How far the cards behind fan, offset or scatter, from 0 for a neat stack to 1 for a wide one. | `data-spread` |
  | `depth` | number | 0.5 | How much smaller and darker each card behind gets, from 0 for none to 1 for a strong recede. | `data-depth` |
  | `radius` | number | 16 | Corner radius of the cards in pixels. | `data-radius` |
  | `frame` | number | 0 | Width of a border around each card in pixels, like the edge of a printed photo. | `data-frame` |
  | `frameColor` | string | '#ffffff' | Color of the frame around each card. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `shadow` | boolean | true | Gives every card a soft drop shadow. | `data-shadow` |
  | `tilt` | number | 30 | How far the top card leans in 3D while it is dragged, in degrees. It tilts around the point you hold and leans into fast moves. Use 0 to keep it flat. | `data-tilt` |
  | `threshold` | number | 90 | How far in pixels the top card has to be dragged before it goes to the back. A quick flick works too. | `data-threshold` |
  | `speed` | number | 1 | Speed of every animation, from 0.5 for slow and soft to 2 for fast and snappy. | `data-speed` |
  | `sendToBackOnClick` | boolean | false | Clicking the top card also sends it to the back. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `autoplay` | boolean | false | Cycles through the cards on its own. | `data-autoplay` |
  | `autoplayDelay` | number | 3000 | Time in milliseconds between automatic cycles. | `data-autoplay-delay` |
  | `pauseOnHover` | boolean | false | Pauses autoplay while the pointer is over the stack. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `onChange` | (index: number) => void | - | Called with the index of the new top card whenever the stack moves. | no aplica (React) |
  | `className` | string | '' | Extra class names for the root element. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the root element. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-staggered` · StaggeredMenu · quizás

- **Diapositiva:** `l09-q-staggered`
- **Propósito (texto de la ficha):** GSAP; capas de color que barren + ítems escalonados
- **Archivo fuente:** `react-bits/src/content/Components/StaggeredMenu/StaggeredMenu.jsx (aún no portado al motor)`
- **Nota:** entrada de separador
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/StaggeredMenu/StaggeredMenu.jsx](../../../../../react-bits/src/content/Components/StaggeredMenu/StaggeredMenu.jsx) (449 líneas), CSS [StaggeredMenu.css](../../../../../react-bits/src/content/Components/StaggeredMenu/StaggeredMenu.css), props en [StaggeredMenuDemo.jsx](../../../../../react-bits/src/demo/Components/StaggeredMenuDemo.jsx), uso en [staggeredMenuCode.js](../../../../../react-bits/src/constants/code/Components/staggeredMenuCode.js).
- **Dependencias del original:** `gsap`
- **Informe:** QUIZÁ (entrada de separador) · coste S · valor 1–2 · estilos: rice, aurora, matriz, suizo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-staggered.js` (+ `fx/experimental/exp-staggered.css` si hace falta) como pieza por clase con el nombre `exp-staggered`. Antes, buscar `exp-staggered` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-staggered`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (15):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `position` | "left" \| "right" | "right" | Anchor position for the menu panel (left or right side). | `data-position` |
  | `colors` | string[] | ["#B497CF", "#5227FF"] | Colors used for staggered underlay layers. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `items` | StaggeredMenuItem[] | [] | Menu items rendered inside the panel. | `data-items` |
  | `socialItems` | StaggeredMenuSocialItem[] | [] | Social links displayed in the menu panel. | `data-social-items` |
  | `displaySocials` | boolean | true | Whether to display the social links section. | `data-display-socials` |
  | `displayItemNumbering` | boolean | true | Whether to show numbering for menu items. | `data-display-item-numbering` |
  | `className` | string | undefined | Optional extra class names. | no aplica (React) |
  | `logoUrl` | string | /src/assets/logos/reactbits-gh-white.svg | Path to the logo image. | `data-logo-url` |
  | `menuButtonColor` | string | "#fff" | Color of the menu toggle button when closed. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `openMenuButtonColor` | string | "#fff" | Color of the menu toggle button when open. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `accentColor` | string | undefined | Hover accent color for menu items. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `changeMenuColorOnOpen` | boolean | true | Whether to animate the button color when opening/closing. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `onMenuOpen` | () => void | undefined | Callback function called when menu opens. | no aplica (React) |
  | `onMenuClose` | () => void | undefined | Callback function called when menu closes. | no aplica (React) |
  | `closeOnClickAway` | boolean | true | Whether to close the menu when clicking outside. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-tilted` · TiltedCard · quizás

- **Diapositiva:** `l09-q-tilted`
- **Propósito (texto de la ficha):** CSS 3D + rAF; inclinación, brillo y cara trasera
- **Archivo fuente:** `react-bits/src/content/Components/TiltedCard/TiltedCard.jsx (aún no portado al motor)`
- **Nota:** tarjeta que gira por paso
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Components/TiltedCard/TiltedCard.jsx](../../../../../react-bits/src/content/Components/TiltedCard/TiltedCard.jsx) (562 líneas), CSS [TiltedCard.css](../../../../../react-bits/src/content/Components/TiltedCard/TiltedCard.css), props en [TiltedCardDemo.jsx](../../../../../react-bits/src/demo/Components/TiltedCardDemo.jsx), uso en [tiltedCardCode.js](../../../../../react-bits/src/constants/code/Components/tiltedCardCode.js).
- **Dependencias del original:** ninguna (React y CSS o WebGL crudo)
- **Informe:** QUIZÁ (tarjeta que se gira por paso: pregunta y respuesta, antes y después) · coste S · valor 1–2 · estilos: arcilla, cromo, rice
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-tilted.js` (+ `fx/experimental/exp-tilted.css` si hace falta) como pieza por clase con el nombre `exp-tilted`. Antes, buscar `exp-tilted` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-tilted`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (36):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `imageSrc` | string | - | Photo that fills the card. | `data-image-src` |
  | `altText` | string | 'Tilted card image' | Alternative text for the photo. | `data-alt-text` |
  | `children` | ReactNode | - | Content on the face of the card, over the photo or instead of it. | no aplica (React) |
  | `captionText` | string | '' | Text in the small tag that follows the cursor and swings as it moves. | `data-caption-text` |
  | `showTooltip` | boolean | true | Shows the caption tag on hover. | `data-show-tooltip` |
  | `overlayContent` | ReactNode | null | Content that floats in front of the card, lifted off its surface. | `data-overlay-content` |
  | `displayOverlayContent` | boolean | false | Shows the overlay content. | `data-display-overlay-content` |
  | `overlayDepth` | number | 30 | How far the overlay floats in front, in px. | `data-overlay-depth` |
  | `backContent` | ReactNode | null | Content for the back of the card. Clicking, tapping or pressing Enter flips the card over. | `data-back-content` |
  | `flipOnClick` | boolean | true | Flips the card when it is clicked. Needs backContent. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `flipped` | boolean | - | Controls which side shows. Leave it unset to let clicks flip the card. | `data-flipped` |
  | `onFlip` | (flipped: boolean) => void | - | Called with the new side whenever the card is flipped. | no aplica (React) |
  | `onClick` | (event) => void | - | Called when the card is clicked or activated with the keyboard. | no aplica (React) |
  | `containerWidth` | number \| string | '100%' | Width of the area that reacts to the cursor. | `data-container-width` |
  | `containerHeight` | number \| string | '300px' | Height of the area that reacts to the cursor. | `data-container-height` |
  | `imageWidth` | number \| string | '300px' | Width of the card. | `data-image-width` |
  | `imageHeight` | number \| string | '300px' | Height of the card. | `data-image-height` |
  | `rotateAmplitude` | number | 12 | How far the card tilts toward the cursor, in degrees. | `data-rotate-amplitude` |
  | `scaleOnHover` | number | 1.05 | How much the card grows when hovered. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `perspective` | number \| string | 800 | Viewing distance in px. Lower values give a stronger 3D effect. | `data-perspective` |
  | `radius` | number \| string | 15 | Corner radius of the card. | `data-radius` |
  | `smoothness` | number | 0.6 | From 0 to 1. Low values snap to the cursor, high values glide and settle with a soft bounce. | `data-smoothness` |
  | `glare` | number | 0.5 | Strength of the light that catches the surface and edges as the card tilts, from 0 to 1. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `glareColor` | string | '#ffffff' | Color of the glare. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `shadow` | number | 0.5 | Strength of the soft shadow under the card, which shifts and grows as the card lifts, from 0 to 1. | `data-shadow` |
  | `parallax` | number | 1 | How far layers and the photo shift with the tilt. 0 keeps everything flat. | se descarta: el motor no usa ratón (sustituir por pasos o bucle) |
  | `axis` | 'both' \| 'horizontal' \| 'vertical' | 'both' | Limits the tilt to following the cursor left and right, or up and down. | `data-axis` |
  | `reverse` | boolean | false | Tilts away from the cursor instead of toward it. | `data-reverse` |
  | `trackWindow` | boolean | false | The card follows the cursor anywhere on the page, not only while hovered. | `data-track-window` |
  | `floating` | boolean | false | The card drifts and sways gently while idle. | `data-floating` |
  | `gyroscope` | boolean | true | Tilts the card as a phone or tablet is moved. Asks for permission on iOS on the first tap. | `data-gyroscope` |
  | `intro` | boolean | true | The card rises and settles into place when it first scrolls into view. | `data-intro` |
  | `introDelay` | number | 0 | Wait before the intro, in ms. Stagger it across a row of cards. | `data-intro-delay` |
  | `className` | string | '' | Extra class names for the card. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the card. | no aplica (React) |
  | `TiltedCardLayer` | component | - | Wrap content in <TiltedCardLayer depth={30}> to float it above the card face. Higher depth floats further, negative depth sinks behind. | `data-tilted-card-layer` |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-cometdial` · CometDial · quizás

- **Diapositiva:** `l09-q-cometdial`
- **Propósito (texto de la ficha):** Dial de anillo con marcas y un «cometa» que deja estela tras la cabeza iluminada. SVG con arcos y física de giro con el ratón
- **Archivo fuente:** `react-bits/src/content/Micro/CometDial/CometDial.jsx (aún no portado al motor)`
- **Nota:** gauge de KPI
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Micro/CometDial/CometDial.jsx](../../../../../react-bits/src/content/Micro/CometDial/CometDial.jsx) (382 líneas), CSS [CometDial.css](../../../../../react-bits/src/content/Micro/CometDial/CometDial.css), props en [CometDialDemo.jsx](../../../../../react-bits/src/demo/Micro/CometDialDemo.jsx), uso en [cometDialCode.js](../../../../../react-bits/src/constants/code/Micro/cometDialCode.js).
- **Dependencias del original:** `motion/react`
- **Informe:** QUIZÁ (como gauge de KPI) · coste M (sobra la física de arrastre) · valor 2 · estilos: cromo, noche, rice, aurora
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-cometdial.js` (+ `fx/experimental/exp-cometdial.css` si hace falta) como pieza por clase con el nombre `exp-cometdial`. Antes, buscar `exp-cometdial` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-cometdial`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (22):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `value` | number | undefined | Controlled value. A change from outside launches the reading on the tap spring. | `data-value` |
  | `defaultValue` | number | 62 | Initial value when uncontrolled. | `data-default-value` |
  | `min` | number | 0 | Lowest value. | `data-min` |
  | `max` | number | 100 | Highest value. | `data-max` |
  | `step` | number | 1 | Snapping grid, and the keyboard nudge. | `data-step` |
  | `unit` | string | "%" | Suffix after the figure. Empty hides it. | `data-unit` |
  | `label` | string | "Level" | Accessible name of the slider. | `data-label` |
  | `accent` | string | "#f5f5f5" | The lit arc, the bead and the comet. | `data-accent` |
  | `ink` | string | "#fdfdfd" | The track and the readout. | `data-ink` |
  | `size` | number | 250 | Diameter in pixels. Everything inside scales with it. | `data-size` |
  | `sweep` | number | 320 | Degrees the arc covers, with the gap centred at the bottom. | `data-sweep` |
  | `thickness` | number | 5 | Stroke width of the track and the arc. The bead follows it. | `data-thickness` |
  | `speed` | number | 25 | How quickly the reading arrives, 0 to 100. | `data-speed` |
  | `tapBounce` | number | 0.2 | Ring-down after a tap. 0 stops dead. | `data-tap-bounce` |
  | `flickBounce` | number | 0.1 | Ring-down after a full-speed flick. A slower release lands between the two. | `data-flick-bounce` |
  | `momentum` | number | 1 | How far a flick carries the reading past where you let go. 0 drops it where released. | `data-momentum` |
  | `cometReach` | number | 180 | Degrees of trail behind the bead at full speed. | `data-comet-reach` |
  | `cometWidth` | number | 12 | Extra stroke width at the head of the trail at full speed. | `data-comet-width` |
  | `disabled` | boolean | false | Dims the dial and ignores input. | `data-disabled` |
  | `onChange` | (value: number) => void | - | Called on every snapped change, including during a drag. | no aplica (React) |
  | `onChangeEnd` | (value: number, detail: { velocity: number; bounce: number }) => void | - | Called on release and on a key, with the release velocity and the bounce it earned. | no aplica (React) |
  | `className` | string | "" | Extra classes for the root. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-thoughtline` · ThoughtLine · quizás

- **Diapositiva:** `l09-q-thoughtline`
- **Propósito (texto de la ficha):** Cabecera de «Pensando…» con brillo que recorre el texto, reloj y pasos que se pliegan en «Pensó durante 4,2 s». `motion`, CSS shimmer
- **Archivo fuente:** `react-bits/src/content/Micro/ThoughtLine/ThoughtLine.jsx (aún no portado al motor)`
- **Nota:** charlas de LLM o agentes
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Micro/ThoughtLine/ThoughtLine.jsx](../../../../../react-bits/src/content/Micro/ThoughtLine/ThoughtLine.jsx) (267 líneas), CSS [ThoughtLine.css](../../../../../react-bits/src/content/Micro/ThoughtLine/ThoughtLine.css), props en [ThoughtLineDemo.jsx](../../../../../react-bits/src/demo/Micro/ThoughtLineDemo.jsx), uso en [thoughtLineCode.js](../../../../../react-bits/src/constants/code/Micro/thoughtLineCode.js).
- **Dependencias del original:** `@hugeicons/core-free-icons`, `@hugeicons/react`, `motion/react`
- **Informe:** QUIZÁ (charlas de LLM o agentes) · coste S–M · valor 2 · estilos: noche, matriz, rice, suizo
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-thoughtline.js` (+ `fx/experimental/exp-thoughtline.css` si hace falta) como pieza por clase con el nombre `exp-thoughtline`. Antes, buscar `exp-thoughtline` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-thoughtline`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (23):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `label` | string | "Thinking…" | The working line. It breathes, and it is the spoken text. | `data-label` |
  | `doneLabel` | string | "" | The settled line. Empty gives "Thought for", or "Done thinking" without the timer. | `data-done-label` |
  | `renderLabel` | (text, working) => ReactNode | - | Wraps either string, for a sheen or a link. Inline content only. | `data-render-label` |
  | `glyph` | 'sparkle' \| 'dot' \| 'none' \| ReactNode | 'sparkle' | The mark that breathes and dims. | `data-glyph` |
  | `steps` | string[] | [] | The trace beneath the line. Append as the agent progresses; the last step is current, earlier ones tick. | `data-steps` |
  | `collapsible` | boolean | true | The line becomes a toggle for the trace, with a chevron. | `data-collapsible` |
  | `collapseOnSettle` | boolean | true | Fold the trace into the line when it settles. | `data-collapse-on-settle` |
  | `color` | string | "currentColor" | The ink of the line and the trace. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `glyphColor` | string | "" | The glyph alone. Empty follows the ink. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `fontSize` | number | 16 | Type size in px. Everything scales in em. | `data-font-size` |
  | `breathPeriod` | number | 1.6 | One breath, up and down, in seconds. | `data-breath-period` |
  | `breathDepth` | number | 0.45 | How far the glyph and label dim at the trough. 0 is no breath. | `data-breath-depth` |
  | `shimmer` | boolean | true | A band of ink sweeps the working label. The label then leaves the breath to the glyph. | `data-shimmer` |
  | `shimmerDuration` | number | 1.8 | One sweep, in seconds. | `data-shimmer-duration` |
  | `settleDuration` | number | 350 | The settle chord, in ms: crossfade, dim, glide, fold. | `data-settle-duration` |
  | `settleBlur` | number | 2 | Blur through the crossfade seam, in px. | `data-settle-blur` |
  | `working` | boolean | true | Working or settled. True again starts a new clock. | `data-working` |
  | `settleAfter` | number | 0 | Seconds after which the line settles by itself. 0 waits for working. | `data-settle-after` |
  | `elapsed` | number | undefined | Controlled seconds. The internal clock never runs. | `data-elapsed` |
  | `showTimer` | boolean | true | The live clock that freezes into the sentence. | `data-show-timer` |
  | `onSettle` | (seconds) => void | - | Once per settle, with the frozen time. | no aplica (React) |
  | `className` | string | "" | Extra classes for the root. | no aplica (React) |
  | `style` | CSSProperties | - | Inline styles for the root. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-refineframe` · RefineFrame · quizás

- **Diapositiva:** `l09-q-refineframe`
- **Propósito (texto de la ficha):** Marco de imagen que pasa por etapas de generación (ruido → borrador → final) sin mover el maquetado. CSS filtros y máscaras
- **Archivo fuente:** `react-bits/src/content/Micro/RefineFrame/RefineFrame.jsx (aún no portado al motor)`
- **Nota:** charlas de difusión
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Micro/RefineFrame/RefineFrame.jsx](../../../../../react-bits/src/content/Micro/RefineFrame/RefineFrame.jsx) (300 líneas), CSS [RefineFrame.css](../../../../../react-bits/src/content/Micro/RefineFrame/RefineFrame.css), props en [RefineFrameDemo.jsx](../../../../../react-bits/src/demo/Micro/RefineFrameDemo.jsx), uso en [refineFrameCode.js](../../../../../react-bits/src/constants/code/Micro/refineFrameCode.js).
- **Dependencias del original:** `@hugeicons/core-free-icons`, `@hugeicons/react`
- **Informe:** QUIZÁ (solo para charlas de difusión) · coste M · valor 1–2 · estilos: aurora, nube, celula
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-refineframe.js` (+ `fx/experimental/exp-refineframe.css` si hace falta) como pieza por clase con el nombre `exp-refineframe`. Antes, buscar `exp-refineframe` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-refineframe`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (15):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `status` | 'queued' \| 'generating' \| 'refining' \| 'complete' \| 'error' | 'generating' | The stage. Each change tweens the media to that stage. | `data-status` |
  | `children` | ReactNode | - | The media: an img, video or canvas. It fills the frame. | no aplica (React) |
  | `aspectRatio` | string | "4 / 3" | The box reserved before and during generation, so nothing shifts. | `data-aspect-ratio` |
  | `width` | number | 320 | Frame width in px, capped at the parent. | `data-width` |
  | `radius` | number | 16 | Corner radius in px. | `data-radius` |
  | `background` | string | "#27272a" | The paper behind the media, and the chip surface. | `data-background` |
  | `color` | string | "#f5f5f5" | The ink: chip text, the sweep and the retry pill. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `stageDuration` | number | 400 | Each stage tween, in ms. | `data-stage-duration` |
  | `sweep` | boolean | true | A soft band crosses the frame while it works. | `data-sweep` |
  | `showStatus` | boolean | true | The chip with the mark and the stage label. | `data-show-status` |
  | `hideAfter` | number | 1200 | Ms after completion before the chip fades. 0 keeps it. | `data-hide-after` |
  | `labels` | Partial<Record<status, string>> | DEFAULT_LABELS | Chip text per stage: Queued, Generating, Refining, Ready, Failed. | `data-labels` |
  | `retryLabel` | string | "Retry" | The pill on an error. | `data-retry-label` |
  | `onRetry` | () => void | - | The retry pill was pressed. Without it, no pill. | no aplica (React) |
  | `className` | string | "" | Extra classes for the frame. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa

### `q-springcheck` · SpringCheck · quizás

- **Diapositiva:** `l09-q-springcheck`
- **Propósito (texto de la ficha):** Fila de checklist: el muelle rellena la casilla, dibuja el tick y tacha la etiqueta. `motion`
- **Archivo fuente:** `react-bits/src/content/Micro/SpringCheck/SpringCheck.jsx (aún no portado al motor)`
- **Nota:** checklist ya lo cubre
- **Documentación de react-bits** (commit `4dc7b5b`): componente [src/content/Micro/SpringCheck/SpringCheck.jsx](../../../../../react-bits/src/content/Micro/SpringCheck/SpringCheck.jsx) (168 líneas), CSS [SpringCheck.css](../../../../../react-bits/src/content/Micro/SpringCheck/SpringCheck.css), props en [SpringCheckDemo.jsx](../../../../../react-bits/src/demo/Micro/SpringCheckDemo.jsx), uso en [springCheckCode.js](../../../../../react-bits/src/constants/code/Micro/springCheckCode.js).
- **Dependencias del original:** `@hugeicons/core-free-icons`, `motion/react`
- **Informe:** QUIZÁ (un SVG con `api.tween` en una lista de hitos; StatusMark ya lo cubre) · coste S · valor 1–2 · estilos: todos
- **Tareas:**
  1. Leer el `.jsx`, el `.css` y la tabla de props del original; anotar en este plan lo que no encaje.
  2. Portarlo a `fx/experimental/exp-springcheck.js` (+ `fx/experimental/exp-springcheck.css` si hace falta) como pieza por clase con el nombre `exp-springcheck`. Antes, buscar `exp-springcheck` en `decks/*/` y `fx/` para evitar choques.
  3. Sustituir React/hooks por el ciclo `render`/`play`/`stop` (o `init`/`frame` en pintores), colores por tokens y la entrada de ratón por pasos o bucle.
  4. Diapositiva `l09-q-springcheck`: demo en vivo con los valores por defecto del original y una segunda variante (preset o prop principal) si cabe; ficha con la tabla de props mapeada.
- **Props del original y su traducción propuesta** (17):

  | Prop | Tipo | Por defecto | Qué hace | En el motor |
  |---|---|---|---|---|
  | `label` | ReactNode | "Ship the build" | The words beside the box; the strike-through is exactly their width. | `data-label` |
  | `checked` | boolean | undefined | Controlled state. A change from outside animates on the spring. | `data-checked` |
  | `defaultChecked` | boolean | false | Initial state when uncontrolled. | `data-default-checked` |
  | `onChange` | (checked: boolean) => void | - | Called on every toggle. | no aplica (React) |
  | `disabled` | boolean | false | Dims the row and ignores input. | `data-disabled` |
  | `color` | string | "#ffffff" | Ink: the label, the ring, the rule and the focus outline. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `fillColor` | string | "#ffffff" | The fill that swells out of the box centre. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `checkColor` | string | "#0b0b0f" | Stroke of the tick drawn over the fill. | fijo con tokens (`api.cats()`, `api.tok()`) |
  | `boxSize` | number | 28 | Box side in pixels; ring, gap and row height derive from it. | `data-box-size` |
  | `boxRadius` | number | 9 | Box corner radius in pixels; half the size makes a circle. | `data-box-radius` |
  | `fontSize` | number | 18 | Label size in pixels; the rule thickness derives from it. | `data-font-size` |
  | `bounce` | number | 0.2 | How far the fill swells past full. 0 arrives dead, 0.5 rebounds twice. | `data-bounce` |
  | `strikeLag` | number | 0.12 | Where on the spring the rule starts: 0 wipes with the fill, 0.4 waits for the tick. | `data-strike-lag` |
  | `doneOpacity` | number | 0.42 | How much ink the words keep once checked. | `data-done-opacity` |
  | `strike` | "left" \| "center" \| "right" \| "none" | "left" | Where the strike-through wipes from, or no rule at all. | `data-strike` |
  | `ariaLabel` | string | - | Accessible name when the label is not text. | `data-aria-label` |
  | `className` | string | "" | Extra classes for the row. | no aplica (React) |

- **Aceptación propia:** se reconoce el efecto del original con los valores por defecto; funciona sin ratón; con `api.reduced` queda una imagen fija representativa
