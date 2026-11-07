# Inventario del Atlas Completo

Fase 0, 2026-11-07. Fuente de verdad: `planning/atlas/atlas.db`, que se regenera con `python3 planning/atlas/construir_db.py`.

**238 componentes**: 170 implementados y 68 «quizás». 49 ya aparecen en alguna diapositiva del Atlas actual (`index.html`). Estimación: unas **288 diapositivas**, contando una de título y una de resumen por lote y una por variante en los sublotes.

## Recuento por lote

| Lote | Contenido | Total | Implementados | Quizás | Sublotes |
|---|---|---:|---:|---:|---:|
| `L01-nucleo` Núcleo | Lienzo, anatomía de la diapositiva, navegación, pasos, HUD, vista general, preferencias, ciclo de vida de efectos, eventos, impresión | 19 | 19 | 0 | 0 |
| `L02-api` API de efectos | Lo que recibe un efecto en api y las utilidades globales Motor.color, Motor.util y Motor.gl | 10 | 10 | 0 | 1 |
| `L03-estilos` Estilos y tokens | Las diez direcciones de arte, el sistema de tokens y las paletas de gráficos generadas | 14 | 14 | 0 | 0 |
| `L04-transiciones` Transiciones | Cambio de diapositiva con View Transitions y el gesto de cada estilo | 11 | 11 | 0 | 0 |
| `L05-maquetacion` Maquetación | Composiciones del cuerpo y piezas básicas de engine.css | 14 | 14 | 0 | 1 |
| `L06-texto` Texto y títulos | Entrada de títulos, tratamientos de título por estilo y piezas de texto animado | 27 | 13 | 14 | 0 |
| `L07-revelados` Revelados y animación | data-reveal y efectos de aparición, transformación y luz | 11 | 1 | 10 | 1 |
| `L08-fondos` Fondos | backdrop, data-painter y todos los pintores de portada | 46 | 21 | 25 | 0 |
| `L09-piezas` Piezas de interfaz | Piezas por clase de fx/piezas.js y componentes de interfaz candidatos | 28 | 9 | 19 | 0 |
| `L10-graficos` Demos del Atlas | Efectos de datos y diagramas del Atlas actual: sistema, ROS 2, ML, datos y Arch | 24 | 24 | 0 | 0 |
| `L11-decks` Efectos de decks | Efectos de fx/ creados para decks concretos: vc, rai, arq-opus y nav-semantica | 30 | 30 | 0 | 1 |
| `L12-herramientas` Herramientas | Herramientas de línea de órdenes de tools/ | 4 | 4 | 0 | 0 |
| **Total** | | **238** | **170** | **68** | **4** |

## Sublotes (componentes con una diapositiva por variante)

- `motor-color` → `L02-api/motor-color`: 7 variantes (parse/hex, oklab/oklch/fromOklch, mix, contrast + wcag, sim protan/deutan, dE/cvd, alpha)
- `cols` → `L05-maquetacion/cols`: 4 variantes (.cols (lateral 500 px), .cols.wide-side, .cols.even, .cols.three)
- `data-reveal` → `L07-revelados/data-reveal`: 9 variantes (auto, fade, wipe, wipe-x, focus, develop, mist, pixel, tilt)
- `secuencia` → `L11-decks/secuencia`: 5 variantes (fade, draw, grow, rise, pop)

## Implementados por lote

### L01-nucleo · Núcleo

`lienzo`, `anatomia-slide`, `navegacion-teclado` ✓, `navegacion-tactil`, `ancla-url`, `pasos`, `hud`, `barra-progreso`, `vista-general`, `pantalla-completa`, `selector-estilo` ✓, `modo-claro-oscuro`, `preferencias`, `motor-pick`, `decorado-slide`, `ciclo-fx`, `eventos-motor`, `movimiento-reducido`, `impresion-pdf`

### L02-api · API de efectos

`api-dom`, `api-tokens`, `api-series` ✓, `api-font`, `api-tiempo`, `api-canvas`, `api-rng-noise`, `motor-color` ✓, `motor-util`, `motor-gl`

### L03-estilos · Estilos y tokens

`estilo-rice` ✓, `estilo-noche` ✓, `estilo-suizo` ✓, `estilo-aurora` ✓, `estilo-cromo` ✓, `estilo-arcilla` ✓, `estilo-nube` ✓, `estilo-termica` ✓, `estilo-celula` ✓, `estilo-matriz` ✓, `tokens-color`, `tokens-forma-movimiento` ✓, `paletas-graficos` ✓, `meta-estilos` ✓

### L04-transiciones · Transiciones

`view-transitions`, `transicion-rice`, `transicion-noche`, `transicion-suizo`, `transicion-aurora`, `transicion-cromo`, `transicion-arcilla`, `transicion-nube`, `transicion-termica`, `transicion-celula`, `transicion-matriz`

### L05-maquetacion · Maquetación

`cols`, `stack-row`, `panel`, `lecturas` ✓, `leyenda`, `nota`, `chip`, `keycap` ✓, `ventana` ✓, `terminal` ✓, `texto-utilidades`, `portada-divider` ✓, `host-fx`

### L06-texto · Texto y títulos

`data-title-fx` ✓, `titulo-rise`, `titulo-mask-lines`, `titulo-blur`, `titulo-pliega`, `titulo-enfoca`, `titulo-descifra`, `titulo-cromo-sheen`, `titulo-termica-heat`, `descifra`, `cifra`, `paleta`, `teclea`

### L07-revelados · Revelados y animación

`data-reveal`

### L08-fondos · Fondos

`backdrop` ✓, `data-painter`, `motor-painters`, `pintor-rice` ✓, `pintor-noche`, `pintor-suizo`, `pintor-aurora`, `pintor-cromo`, `pintor-arcilla`, `pintor-nube`, `pintor-termica`, `pintor-celula`, `pintor-matriz`, `pintor-grano`, `pintor-hilos`, `pintor-radar`, `pintor-topo`, `pintor-isolineas`, `pintor-escaner`, `pintor-velo`, `pintor-none`

### L09-piezas · Piezas de interfaz

`etapas`, `checklist`, `agenda`, `reticula`, `bento`, `mazo`, `chispa`, `rayo`, `deposito`

### L10-graficos · Demos del Atlas

`fx-estilos` ✓, `fx-teoria` ✓, `fx-rueda` ✓, `fx-tipo` ✓, `fx-paletas` ✓, `fx-refs` ✓, `fx-compare` ✓, `fx-rosgraph` ✓, `fx-lidar` ✓, `fx-astar` ✓, `fx-tftree` ✓, `fx-blueprint` ✓, `fx-scope` ✓, `fx-training` ✓, `fx-confusion` ✓, `fx-latent` ✓, `fx-nnet` ✓, `fx-clouds` ✓, `fx-ridge` ✓, `fx-calendar` ✓, `fx-sankey` ✓, `fx-kpis` ✓, `fx-desktop` ✓, `fx-fetch` ✓

### L11-decks · Efectos de decks

`vc`, `vc-conv`, `vc-plot`, `vc-heat`, `vc-katex`, `vc-codigo`, `secuencia`, `notas-orador`, `pausa-videos`, `fx-op-pila`, `fx-op-ritmo`, `fx-op-donde`, `fx-op-slam`, `fx-op-grafo`, `fx-op-costmap`, `fx-op-parseo`, `fx-op-rai`, `fx-op-cifras`, `fx-op-laya`, `fx-op-puerta`, `fx-op-e1`, `fx-op-montaje`, `ns-hilo`, `ns-video-auto`, `fx-ns-g1`, `fx-ns-ritmo`, `fx-ns-donde`, `fx-ns-rai`, `fx-ns-e1`, `fx-ns-montaje`

### L12-herramientas · Herramientas

`tool-build-themes`, `tool-bundle`, `tool-verificar`, `tool-salida`

✓ = ya tiene diapositiva en el Atlas actual.

## Componentes «quizás»

Ninguno existe todavía en el código: vienen de los informes de react-bits (`planning/atlas/react-bits/`). Los 10 marcados «recomendado sin implementar» salieron IMPLEMENTAR en el estudio pero no entraron en las fases 0–2.

### L06-texto · Texto y títulos (14)

| id | react-bits | Qué hace | Coste | Nota |
|---|---|---|---|---|
| `traza` | StrokeText | Dibuja el contorno del texto (SVG `<text>` + `stroke-dashoffset`) y luego rellena con barrido · GSAP | M | recomendado sin implementar |
| `muestrario` | TechText | Muestrario tipográfico en canvas: glifos con contorno discontinuo, lupa que rellena, líneas de baseline, x-height, cap height, ascender y… | M | recomendado sin implementar |
| `q-shuffle` | Shuffle | Letras que barajan o deslizan su contenido (evenodd/center/sequence) · GSAP SplitText + ScrollTrigger | S | fusionar en descifra |
| `q-scrambled` | ScrambledText | Revuelve las letras cerca del cursor; tiene intro de scramble · GSAP ScrambleTextPlugin | S | fusionar en descifra |
| `q-fold` | FoldText | Letras que se despliegan sobre una bisagra 3D (paper/blinds/flip) con sombreado de pliegue · GSAP | S | ya cubierto por el preset pliega |
| `q-depth` | DepthText | Extrusión 3D con 34 copias apiladas en `translateZ`, órbita automática y seguimiento del puntero · CSS 3D | M | solo para .div-num |
| `q-metallic` | MetallicPaint | Cromo líquido sobre un texto o un logo (adaptado de Liquid Metal, de Paper) | L | título de portada de cromo |
| `q-truefocus` | TrueFocus | Recorre las palabras con corchetes, caja o subrayado y desenfoca las demás · motion | S–M |  |
| `q-glitch` | GlitchText | Glitch por franjas, RGB, scan o ruido con máscaras CSS · CSS + rAF | S |  |
| `q-particle` | ParticleText | Partículas que se reúnen formando el texto (gather/scan) con resaltado y empuje del puntero · canvas 2D | M |  |
| `q-masked` | MaskedHeading | Imagen o vídeo dentro del texto (clipPath SVG) con revelado rise/wipe/blur y parallax · GSAP | M |  |
| `q-circular` | CircularText | Texto en círculo que gira (sello) · motion | S |  |
| `q-pressure` | TextPressure | Ejes variables (wdth/wght/ital) según el cursor; modos idle `wave`/`pulse` · rAF; necesita Roboto Flex | M |  |
| `q-rotating` | RotatingText | Rota palabras dentro de una frase (slide/blur/flip) · motion | S |  |

### L07-revelados · Revelados y animación (10)

| id | react-bits | Qué hace | Coste | Nota |
|---|---|---|---|---|
| `trama` | HalftoneReveal | Foto en trama de semitonos (puntos, mono o duotono) que pasa a la foto real bajo el cursor | M | recomendado sin implementar |
| `pixeles` | PixelTransition | Una tarjeta se cubre de píxeles, cambia el contenido y se aclara (patrones al azar, Bayer, onda, barrido) | S–M | recomendado sin implementar |
| `q-ditherveil` | DitherVeil | Foto en 1 bit (Floyd/Bayer) que el cursor «quema» hasta el color; deambula sola | M | modo dither de trama |
| `q-pixelswap` | PixelSwap | El contenido nuevo entra píxel a píxel en una ola con muelle | M | fusionar en pixeles |
| `q-gradualblur` | GradualBlur | Desenfoque progresivo en un borde (capas de `backdrop-filter`) | S | clase .borde-difuso |
| `q-scrollexpand` | ScrollExpand | Marco redondeado que crece hasta sangre con el scroll | S | en un paso, la foto se amplía a sangre |
| `q-strands` | Strands | Esfera de cristal con hebras espectrales, tipo Siri; reacciona a un nivel de «voz» simulado | M | solo decks de voz o asistentes |
| `q-glare` | GlareHover | Destello que cruza un elemento; tiene `mode="loop"` con intervalo | S |  |
| `q-laserflow` | LaserFlow | Haz de luz que cae sobre un elemento y se derrama por sus esquinas, con niebla y polvo | M |  |
| `q-electriclogo` | ElectricLogo | Rayos que recorren el contorno de un logo SVG | L |  |

### L08-fondos · Fondos (25)

| id | react-bits | Qué hace | Coste | Nota |
|---|---|---|---|---|
| `q-floatinglines` | FloatingLines | Haces de líneas finas luminosas que ondulan en tres bandas con profundidad de campo | M | recomendado sin implementar |
| `q-gradientascii` | GradientASCII | Brillos en degradado dibujados con caracteres ASCII | M | recomendado sin implementar |
| `q-faultyterminal` | FaultyTerminal | Terminal CRT de glifos que parpadean, con glitches y persistencia | M | recomendado sin implementar |
| `q-elasticmesh` | ElasticMesh | Texto o logo inflado que se aplasta y rebota | L | solo portada de arcilla |
| `q-scanner` | Scanner | Líneas de interferencia (suma de senos en contornos), haz de barrido con estela, scanlines CRT, grano y viñeta. WebGL2 en una sola pasada | M (bajar a GLSL 1.0; encaja en `glLayer`) | pintor alternativo de noche |
| `q-pixelblast` | PixelBlast | Nubes de píxeles con tramado Bayer 8×8 que derivan y titilan; suelo en perspectiva; ondas al clic. WebGL2 (341 líneas de GLSL) | M | se solapa con PatternWaves |
| `q-waves` | Waves | Muchas líneas paralelas que ondulan como seda; se apartan del cursor y vuelven con un muelle. WebGL2 | S en 2D | duplica a hilos |
| `q-linewaves` | LineWaves | Líneas finas deformadas en ondas con una banda de luz que las recorre y ciclo de 3 colores. WebGL2 | M | familia de hilos |
| `q-lightrays` | LightRays | Rayos volumétricos desde un borde, con halo y bruma. WebGL2 en una sola pasada | M | capa de foco sobre portada |
| `q-moltenmetal` | MoltenMetal | Filamentos cáusticos con núcleos al blanco. WebGL2 en una sola pasada | M | alternativa de termica |
| `q-acidsquares` | AcidSquares | Campo de baldosas brillantes que ondula bajo dos luces de color | L |  |
| `q-beams` | Beams | Cintas satinadas que ondulan en la oscuridad con brillo especular | M |  |
| `q-crtwarp` | CRTWarp | Plasma en bloques sobre un CRT curvo con scanlines, máscara de fósforo y persistencia | M–L |  |
| `q-darkveil` | DarkVeil | Velo sedoso generado por una **CPPN** (red neuronal de pesos fijos) | S–M |  |
| `q-dither` | Dither | Ondas con tramado Bayer, semitono o ruido en paleta reducida | M |  |
| `q-ferrofluid` | Ferrofluid | Mar brillante de ferrofluido con picos | L |  |
| `q-galaxy` | Galaxy | Vuelo por un campo de estrellas en capas con saltos warp | M |  |
| `q-ghostfibers` | GhostFibers | Cintas de fibras luminosas con profundidad de campo y partículas | L |  |
| `q-gradientwaves` | GradientWaves | Olas satinadas que avanzan desde un horizonte con bruma (heightfield con raymarch) | L |  |
| `q-gridmotion` | GridMotion | Muro inclinado de baldosas (texto o imágenes) que se desliza | S |  |
| `q-iridescence` | Iridescence | Superficie líquida iridiscente con pliegues | S–M |  |
| `q-patternwaves` | PatternWaves | Superficie iluminada en semitono (puntos, líneas o glifos) que ondula como seda. ogl, 3 FBO | L tal cual · S–M rehecho como LED de tamaño o brillo variable con `ledSprite` |  |
| `q-ripplegrid` | RippleGrid | Rejilla nítida en perspectiva con ondas que salen solas del centro (`autoRipple`) cada 2,6 s. WebGL2 en una sola pasada | M (o S en 2D desplazando las líneas) |  |
| `q-softaurora` | SoftAurora | Bandas de aurora boreal con ruido 3D y paleta coseno. WebGL2 en una sola pasada | M |  |
| `q-slicedwaves` | SlicedWaves | Cintas de color en ondas cortadas en barras luminosas, vistas en profundidad con desenfoque. WebGL2 + FBO | M |  |

### L09-piezas · Piezas de interfaz (19)

| id | react-bits | Qué hace | Coste | Nota |
|---|---|---|---|---|
| `tarea` | CallChip | Ficha de llamada a herramienta (`bash · npm test`). Se rellena mientras corre un cronómetro y termina en «done» verde o en «failed» rojo… | S | recomendado sin implementar |
| `rejilla` | LatticeLoader | Rejilla de 3×3 o 4×4 celdas que se encienden en onda (orbit, snake, ripple…), con etiqueta y cronómetro. Al acabar, las celdas dibujan ✓… | S | recomendado sin implementar |
| `campo` | MagnetLines | Rejilla de segmentos que se orientan hacia el cursor (modos orbit, attract…), con inercia y onda. Canvas 2D y WebGL2 | S | recomendado sin implementar (fx campo, sin ratón) |
| `q-crosshair` | Crosshair | Cruz con coordenadas que mide lo que hay bajo el cursor | S | lectura de coordenadas en reticula |
| `q-logoloop` | LogoLoop | Cinta infinita de logos; también en ola, arco y órbita 3D, con lupa | S–M | diapositiva de stack |
| `q-orbit` | OrbitImages | Imágenes que orbitan una trayectoria y pasan por delante y por detrás de un centro | M | diagrama de ecosistema |
| `q-accordion` | AccordionGallery | GSAP, flex; paneles de imagen que se expanden con hover | S | acordeón por pasos |
| `q-borderglow` | BorderGlow | CSS con degradado en malla en el borde, que sigue al puntero | S | generalizar focus-border de rice |
| `q-bouncecards` | BounceCards | CSS transform + rAF con muelles; abanico de fotos que entra rebotando | S | abanico de capturas |
| `q-driftwall` | DriftWall | CSS 3D + rAF; muro inclinado de baldosas que se desplaza | S | muro de portada o separador |
| `q-flowingmenu` | FlowingMenu | CSS; menú a pantalla completa con banda y marquesina | S | variante de agenda |
| `q-pixelcard` | PixelCard | Canvas 2D; píxeles que centellean y llenan la tarjeta | S–M | revelado de panel por píxeles |
| `q-stack` | Stack | motion/react; pila con drag y flick | M | modo pile de mazo |
| `q-staggered` | StaggeredMenu | GSAP; capas de color que barren + ítems escalonados | S | entrada de separador |
| `q-tilted` | TiltedCard | CSS 3D + rAF; inclinación, brillo y cara trasera | S | tarjeta que gira por paso |
| `q-cometdial` | CometDial | Dial de anillo con marcas y un «cometa» que deja estela tras la cabeza iluminada. SVG con arcos y física de giro con el ratón | M (sobra la física de arrastre) | gauge de KPI |
| `q-thoughtline` | ThoughtLine | Cabecera de «Pensando…» con brillo que recorre el texto, reloj y pasos que se pliegan en «Pensó durante 4,2 s». `motion`, CSS shimmer | S–M | charlas de LLM o agentes |
| `q-refineframe` | RefineFrame | Marco de imagen que pasa por etapas de generación (ruido → borrador → final) sin mover el maquetado. CSS filtros y máscaras | M | charlas de difusión |
| `q-springcheck` | SpringCheck | Fila de checklist: el muelle rellena la casilla, dibuja el tick y tacha la etiqueta. `motion` | S | checklist ya lo cubre |
## Comprobación contra react-bits (2026-11-07)

- Clon en `~/Proyectos/react-bits`, commit `4dc7b5b` (2026-10-31). Tiene los mismos 218 componentes que el estudio; no falta ni sobra ninguno.
- Los 68 «quizás» existen en react-bits. Para cada uno, `atlas.db` guarda en la tabla `react_bits`:
  - las rutas del `.jsx`, el `.css`, la demo, los presets y el archivo de uso;
  - las dependencias;
  - la tabla de props completa: nombre, tipo, valor por defecto y descripción.
- La tabla `origen_react_bits` enlaza cada componente del motor con su origen (109 enlaces): los 68 «quizás» y los 30 implementados que vienen de react-bits.
- Ninguno de los 68 está en el motor. Se buscaron como `Motor.fx`, pintor, preset de título y clase CSS en `engine/`, `fx/` y `themes/`. Hubo dos hallazgos:
  - `.focus-border` de rice ya existe (`themes/styles.css:36`); se añadió como componente implementado, y es la base de BorderGlow;
  - `op-cifras` tiene un glitch propio (`fx/arq-opus.js:663`), que queda como referencia de `q-glitch`.

## Decisiones tomadas (2026-11-07)

1. Los «quizás» se portan desde el código y la documentación de react-bits a `fx/experimental/`, cargados solo por el Atlas Completo y con la etiqueta «Experimental · quizás».
2. Los duplicados se quedan en el inventario y tienen diapositiva propia.
3. Ubicación: `atlas/original/` (el Atlas actual, movido) y `atlas/completo/` (el nuevo).
4. Los recursos de `ns-g1` (three.js, STLLoader y el STL) se copian a `atlas/completo/vendor/` y `media/`.
5. Herramientas (L12): la orden, sus opciones y una salida real capturada.
6. Granularidad aprobada: los sublotes `motor-color`, `cols`, `data-reveal` y `secuencia` llevan una diapositiva por variante; el resto de componentes, una diapositiva cada uno.
