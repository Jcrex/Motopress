# Lote `micro` · src/content/Micro (35 componentes)

Contexto: casi todo el lote son controles de entrada (botones, interruptores, selectores, campos) cuyo valor está en responder al puntero: arrastrar, mantener pulsado, deslizar o pasar el ratón por encima. En una diapositiva proyectada sin ratón eso no aporta nada. Solo se salva una familia: los **indicadores de estado de agente o tarea** (CallChip, StatusMark, LatticeLoader, ThoughtLine) y dos **medidores** (SloshGauge, CometDial). Esos sí encajan como «demo en vivo» o como revelado de dato. Ninguno trae una técnica que el motor no tenga ya: son SVG con stroke-dasharray, animaciones CSS y muelles de `motion`, que se pasan sin problema a GSAP o a WAAPI. La licencia (Commons Clause) no estorba, porque lo que interesa es la idea y se reescribe desde cero en unas decenas de líneas.

Leyenda de valor: 0 = no aporta proyectado · 3 = aporta claramente. Coste: S/M/L/XL según el BRIEF.

## Tabla

| Componente | Qué hace · técnica | Valor | Estilos | Coste | Veredicto |
|---|---|---|---|---|---|
| **CallChip** | Ficha de llamada a herramienta (`bash · npm test`). Se rellena mientras corre un cronómetro y termina en «done» verde o en «failed» rojo con sacudida. Estados con palabra (`queued/running/done/failed`). React, CSS, iconos hugeicons | 3 | todos; sobre todo noche, matriz, rice y suizo | S | **IMPLEMENTAR** |
| **StatusMark** | Glifo de estado: anillo discontinuo (pendiente) → arco de progreso o giratorio → check o cruz, con el texto tachado. SVG dasharray, `motion` | 3 | todos (neutro, hereda currentColor) | S | **IMPLEMENTAR** |
| **LatticeLoader** | Rejilla de 3×3 o 4×4 celdas que se encienden en onda (orbit, snake, ripple…), con etiqueta y cronómetro. Al acabar, las celdas dibujan ✓ o ✗. Solo CSS con animation-delay | 3 | matriz (encaja de forma natural con los LED), noche, termica, suizo; choca poco | S | **IMPLEMENTAR** |
| **SloshGauge** | Depósito con un líquido que persigue el valor: muelle amortiguado que se inclina con la velocidad y rebota al llenarse, con marcas y valor. React, clip-path, rAF | 2 | arcilla, nube, termica, aurora; en suizo sobra el «chapoteo» | S–M | **IMPLEMENTAR** (modo no interactivo) |
| **CometDial** | Dial de anillo con marcas y un «cometa» que deja estela tras la cabeza iluminada. SVG con arcos y física de giro con el ratón | 2 | cromo, noche, rice, aurora | M (sobra la física de arrastre) | **QUIZÁ** (como gauge de KPI) |
| **ThoughtLine** | Cabecera de «Pensando…» con brillo que recorre el texto, reloj y pasos que se pliegan en «Pensó durante 4,2 s». `motion`, CSS shimmer | 2 | noche, matriz, rice, suizo | S–M | **QUIZÁ** (charlas de LLM o agentes) |
| **RefineFrame** | Marco de imagen que pasa por etapas de generación (ruido → borrador → final) sin mover el maquetado. CSS filtros y máscaras | 1–2 | aurora, nube, celula | M | **QUIZÁ** (solo para charlas de difusión) |
| **SpringCheck** | Fila de checklist: el muelle rellena la casilla, dibuja el tick y tacha la etiqueta. `motion` | 1–2 | todos | S | **QUIZÁ** (un SVG con `api.tween` en una lista de hitos; StatusMark ya lo cubre) |
| SwipeToast | Toast con una mecha que se consume y se cierra deslizando. `motion` | 1 | noche, rice | S | DESCARTAR (si acaso, como aviso «ok/warn» simulado; StatusMark lo hace mejor) |
| VoicePill | Botón de micrófono con barras de ecualizador simuladas y temporizador. Solo CSS y JS | 1 | — | S | DESCARTAR (decorativo; el motor ya tiene `scope`) |
| PromptBar | Caja de chat con @fuentes, /comandos y selector de modelo. 718 líneas | 1 | — | L | DESCARTAR (para una demo de prompt basta HTML estático) |
| FuseButton | Botón con «deshacer» sobre una mecha que arde | 0 | — | S | DESCARTAR |
| HoldButton | Mantener pulsado para confirmar, con relleno líquido | 0 | — | S | DESCARTAR |
| BellToggle | Interruptor de campana que suena | 0 | — | S | DESCARTAR |
| PulseHeart | Botón de «me gusta» con latido y contador | 0 | — | S | DESCARTAR |
| SquishSwitch | Interruptor que se estira y se aplasta | 0 | — | S | DESCARTAR |
| JellyRadio | Grupo de radio con chips que se empujan | 0 | — | S | DESCARTAR |
| RubberSegment | Control segmentado con pulgar elástico | 0 | — | S | DESCARTAR |
| GlideSelect | Menú select con resalte que se desliza | 0 | — | S | DESCARTAR |
| BranchedMenu | Menú plegable con ramas desde un tronco | 0–1 | — | M | DESCARTAR |
| PeekRating | Estrellas que se levantan bajo el puntero | 0 | — | S | DESCARTAR |
| ScrubField | Número que se cambia arrastrando | 0 | — | S | DESCARTAR |
| WakeSlider | Deslizador de barras con estela | 0 | — | S | DESCARTAR |
| SlideCommit | Deslizar para confirmar | 0 | — | M | DESCARTAR |
| SlingButton | Botón tirachinas | 0 | — | M | DESCARTAR |
| SwipeRow | Fila que se desliza para mostrar acciones | 0 | — | M | DESCARTAR |
| CodeSlots | Campo de código OTP con dígitos de muelle | 0 | — | M | DESCARTAR |
| WarmTooltip | Grupo de tooltips «calientes» | 0 | — | M | DESCARTAR |
| DodgeField | Hijo que esquiva el puntero | 0 | — | S | DESCARTAR |
| FlipCard | Tarjeta que gira en 3D al hacer clic o arrastrar | 1 | — | S | DESCARTAR (el giro de pregunta→respuesta se hace con GSAP en 10 líneas) |
| FolderFloat | Carpeta que suelta notas flotantes. matter-js | 0–1 | — | L | DESCARTAR |
| TearTicket | Billete con resguardo que se arranca fibra a fibra | 0 | — | L | DESCARTAR |
| PaperCrumple | Imagen que se arruga en 3D al arrastrarla. three.js | 0 | — | XL | DESCARTAR |
| Shredder | Lista con trituradora que corta filas en tiras. react-dom portal | 0–1 | — | L | DESCARTAR |
| FlyingButton | Botón que despega con propulsores y humo. 2136 líneas | 0 | — | XL | DESCARTAR |

**Totales:** IMPLEMENTAR 4 (CallChip, StatusMark, LatticeLoader, SloshGauge) · QUIZÁ 4 (CometDial, ThoughtLine, RefineFrame, SpringCheck) · DESCARTAR 27.

## Top recomendados (por valor/coste)

### 1. CallChip → efecto `tarea` (`data-fx="tarea"`)
- Uso: secuencias de comandos «en vivo» (`ros2 launch nav2_bringup …`, `colcon build`, `pytest`, `pacman -Syu`), con una ficha por fila apilada en vertical. Cada ficha lleva el icono y el nombre de la herramienta en `fg-2`, el argumento en mono y `fg`, el estado como palabra (`en cola / corriendo / hecho / falló`) y el tiempo («1,8 s»).
- Marcado: `<li data-cmd="colcon build" data-ms="2400" data-end="ok|err">`.
- Tokens: el relleno de fondo usa `color-mix(var(--fg) 8%)`; el final usa `--ok` o `--err` en el borde y el glifo, siempre con la palabra al lado. El texto queda en `fg`, nunca del color del estado.
- `render()`: todas las fichas en su estado final (relleno al 100 %, palabra final, tiempo final). Encaja en la captura y en el PDF.
- `play()`: secuencial. Cada ficha pasa de «en cola» a «corriendo», el relleno avanza con `api.tween` hasta el 90 %, el cronómetro corre con `api.raf` y al final la ficha se completa o da una sacudida corta (GSAP x keyframes) si es `err`. Con `api.reduced` no hay sacudida ni cronómetro, y la ficha salta al estado final.

### 2. StatusMark → `estado` (componente ligero, reutilizable por otros fx)
- Helper `Motor.ui.mark(el, status, progress)` más un efecto `checklist` (`data-fx="checklist"`) para listas de hitos o de pasos de pipeline: pendiente, en curso, hecho o fallido, con el texto tachado al completarse.
- Tokens: anillo `fg-3`, arco `accent`, check `ok`, cruz `err` y palabra al lado. Sirve como «semáforo» en tablas de cobertura y requisitos.
- `render()`: estado final (dasharray completo y check o cruz dibujados con `stroke-dashoffset: 0`). `play()`: va de un hito a otro animando el dasharray y la tachadura.

### 3. LatticeLoader → `rejilla` (`data-fx="rejilla"`)
- Para matriz es casi nativo, porque es su lenguaje de puntos LED. También vale para noche y termica. Puede ir a gran escala (rejilla de 4×4 con celdas de 40 px) como «el agente está pensando» junto a un cronómetro, o pequeño junto a CallChip.
- Tokens: celdas en `fg` con opacidad `fg-3` en reposo y `accent` al encenderse; marca final con `ok` o `err` y la palabra «Hecho en 3,4 s» o «Falló tras 3,4 s».
- `render()`: muestra la marca final (las celdas forman ✓ o ✗) y el tiempo final. `play()`: activa la clase con los keyframes de onda (se puede reutilizar el truco de `animation-delay` por celda), corre el cronómetro y pasa a la marca a los N ms. `stop()` quita las clases.

### 4. SloshGauge → `deposito` (`data-fx="deposito"`)
- Gauge vertical para porcentajes (batería del robot, uso de GPU o VRAM, cobertura del mapa) que hace de alternativa al «número grande». Lleva el valor grande al lado, en `fg`.
- Tokens: líquido con `api.seq()` según el valor (o `accent`), vidrio y marcas en `fg-3`, y umbral con `warn` o `err` más la palabra si el valor lo exige.
- `render()`: líquido plano en el valor final (clip-path sin inclinación). `play()`: sube desde 0 con el muelle amortiguado (las 30 líneas de `tick()` se reaprovechan tal cual como idea) y lo inclina y hace chapotear con `api.raf`. Con `api.reduced` hay un tween lineal, sin inclinación.

### 5. CometDial → `dial` (QUIZÁ)
- Dial de anillo con marcas para un KPI (latencia, RPM, % de exactitud). Se quita toda la lógica de arrastre (más de 250 líneas) y queda el arco SVG con la estela del cometa (gradiente cónico o trazos con opacidad decreciente). `render()`: arco iluminado hasta el valor. `play()`: barrido con GSAP. Va bien con cromo y noche.

### 6. ThoughtLine → `pensando` (QUIZÁ)
- Solo para charlas de LLM o agentes: «Pensando…» con brillo, los pasos van apareciendo y se pliegan en «Pensó durante 4,2 s». `render()` deja la línea plegada con los pasos visibles debajo (estado final legible), y `play()` hace el brillo con `background-clip:text` en `fg-2`→`fg`.

## Observaciones transversales
- **Dependencias:** `motion/react` (16 componentes) solo se usa para muelles y `animate`, y se cambia directamente por GSAP (`ease: "elastic"`, `back`) o `api.tween`. `@hugeicons` aparece en 17, pero los iconos son decorativos y se sustituyen por SVG inline o por texto. Los casos extremos son PaperCrumple (three), FolderFloat (matter-js), FlyingButton (2136 líneas) y TearTicket o Shredder (física de papel), que además dependen por completo de la interacción.
- **Patrón de port útil:** los componentes de estado ya tienen la forma que necesita el motor, una máquina de estados `data-status` con CSS por estado. Para el port basta con `render()` → poner `data-status` en el estado final; `play()` → recorrer los estados con `api.after`; y cambiar los colores en props (`#22c55e` o `#ef4444`) por `--ok` y `--err`, siempre con una palabra al lado. Todos traen ya la palabra de estado y el cronómetro, que es justo lo que pide CLAUDE.md.
- **Escala:** todo está pensado a 14–20 px y hay que subirlo a 22 px o más con trazos proporcionales; el dasharray depende del radio, así que se recalcula a partir del tamaño.
- **Duplicados:** nada del lote duplica `fx/` (no hay chips de estado ni gauges en `kpis`/`scope`); `fetch`/terminal de arch.js combina bien con CallChip.
- Los datos de las demos (comandos, tiempos, porcentajes) deben marcarse como «de ejemplo».
