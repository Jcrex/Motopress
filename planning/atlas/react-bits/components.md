# Lote `components` · react-bits `src/content/Components` (48)

Evaluación para el motor de diapositivas (vanilla, 1920×1080, teclado, sin scroll ni ratón, GSAP + d3 por CDN).

## Lo que ya hay en el motor (para no duplicar)

- **engine.css**: composiciones `.cols` (`.wide-side`, `.even`, `.three`), `.stack`, `.row`, `.fill`; piezas `.panel`, `.label`, `.value` (cifra de 48 px), `.readout`, `.legend`, `.chip`, `.keycap`, `.win/.win-bar/.win-body`, `.term`, `.note`. **No hay rejilla bento** ni componentes de cifra grande con animación propia, de línea de tiempo o de pila de tarjetas.
- **Pasos**: `[data-step]` → la clase `.on` aparece y desaparece con fundido y subida de 14 px; avanza con «siguiente» antes de cambiar de diapositiva. **El motor no avisa a los efectos de que ha cambiado el paso** (no hay evento): un efecto que quiera reaccionar al paso tiene que observar las clases `.on` con `MutationObserver` dentro del propio efecto, o hay que añadir un evento `motor:step` al motor.
- **themes/styles.css**: `rice .focus-border` / `.win.is-focus` (borde cónico que gira con `@property --angle`), paneles esmerilados con `backdrop-filter` en rice y aurora, transiciones de diapositiva por estilo con View Transitions (por ejemplo, el fundido por píxeles de matriz).
- **fx/**: `secuencia` (rai.js: entrada escalonada `data-seq` con fade, draw, grow, rise y pop), `kpis` (datos.js: tabla de KPI con sparklines), `op-cifras` (arq-opus.js: contador lineal `data-count`, solo para ese deck), `compare`, `tipo`, `paletas`, `rueda` (círculo OKLCH), `desktop` y `backdrop` con `Motor.painters`.

Conclusión previa: casi todo el lote es **navegación o galería de imágenes guiada por el puntero** (hover, drag, wheel, scroll), y en un deck proyectado esa interacción no tiene valor. Lo que se puede aprovechar es la **idea de maquetación**, siempre que la animación la mueva el **paso** (`data-step`) en lugar del cursor.

## Tabla

Valor: de 0 a 3. Coste: S, M, L o XL. Sin la dependencia `@hugeicons` (iconos) no se pierde nada; en el motor se usarían SVG en línea o texto.

| Componente | Técnica | Valor | Estilos (encajan / chocan) | Coste | Veredicto |
|---|---|---|---|---|---|
| AccordionGallery | GSAP, flex; paneles de imagen que se expanden con hover | 2 | suizo, nube, matriz, noche / arcilla | S | QUIZÁ (como «acordeón por pasos») |
| AnimatedList | React, rAF con muelles, scroll, selección que se desliza, hugeicons | 1 | todos | M | DESCARTAR (la idea pasa a `agenda`) |
| BorderGlow | CSS con degradado en malla en el borde, que sigue al puntero | 1 | aurora, cromo, rice / suizo, matriz | S | QUIZÁ (generalizar el `focus-border` de rice) |
| BounceCards | CSS transform + rAF con muelles; abanico de fotos que entra rebotando | 2 | rice, arcilla, aurora, nube / suizo, matriz | S | QUIZÁ (abanico de capturas) |
| BubbleMenu | GSAP; menú circular | 0 | — | — | DESCARTAR |
| CardNav | React; barra de navegación que se despliega | 0 | — | — | DESCARTAR |
| CardSwap | CSS 3D + física de muelles propia; pila que manda la tarjeta delantera al fondo | 3 | rice, aurora, cromo, arcilla, noche / suizo (por el sesgo 3D) | M | **IMPLEMENTAR** (pila por pasos) |
| Carousel | React con muelles, 5 transiciones, autoplay | 1 | — | M | DESCARTAR (el deck ya es un carrusel) |
| ChromaGrid | CSS + rAF; rejilla en grises con foco del puntero que devuelve el color | 1 | noche, termica, suizo | S | DESCARTAR (el foco por pasos se integra en `bento`) |
| CircularCarousel | CSS 3D + muelles + drag; anillo de imágenes | 1 | — | L | DESCARTAR |
| CircularGallery | WebGL2 crudo; galería curvada con drag | 1 | — | L | DESCARTAR |
| Counter | DOM + muelles por dígito, máscara y desenfoque de movimiento, `Intl.NumberFormat` | 3 | todos (matriz, termica y noche, muy bien) | S–M | **IMPLEMENTAR** (cifra tipo odómetro) |
| CurvedInput | DOM; campo de texto curvado | 0 | — | — | DESCARTAR |
| DecayCard | WebGL2; imagen que se rasga con el puntero | 1 | noche, termica | L | DESCARTAR |
| DepthCarousel | GSAP; raíl 3D en profundidad, drag y wheel | 1 | cromo, noche | M | DESCARTAR (lo cubre CardSwap) |
| Dock | React; dock de macOS con lupa | 0 | (rice ya tiene `desktop`) | — | DESCARTAR |
| DomeGallery | CSS 3D + @use-gesture; cúpula de imágenes | 1 | — | L | DESCARTAR |
| DriftWall | CSS 3D + rAF; muro inclinado de baldosas que se desplaza | 2 | noche, matriz, nube, cromo, termica / suizo, arcilla | S | QUIZÁ (muro de portada o separador) |
| ElasticSlider | DOM; slider de entrada | 0 | — | — | DESCARTAR |
| FlexCarousel | ogl; fila de imágenes con vidrio líquido | 0 | — | XL | DESCARTAR |
| FlowingMenu | CSS; menú a pantalla completa con banda y marquesina | 1 | noche, suizo, matriz | S | QUIZÁ (variante de `agenda`) |
| FluidGlass | WebGL2 con SDF; vidrio 3D que refracta el titular | 2 | cromo, aurora | XL | DESCARTAR (1400 líneas; captura texto en una textura) |
| FlyingPosters | WebGL2; pósteres con scroll | 0 | — | L | DESCARTAR |
| Folder | WebGL2 + física; carpeta que se abre | 1 | — | XL | DESCARTAR |
| GlassIcons | WebGL2; iconos de vidrio líquido | 1 | — | L | DESCARTAR |
| GlassSurface | WebGL2; panel de vidrio que refracta lo de detrás | 1 | aurora, cromo | L | DESCARTAR (`backdrop-filter` ya cubre el esmerilado) |
| GooeyNav | WebGL2 metaballs; navegación | 0 | — | L | DESCARTAR |
| HoloCard | WebGL2; carta holográfica que se inclina | 1 | — | L | DESCARTAR |
| InfiniteMenu | WebGL2; esfera de baldosas con drag | 1 | — | L | DESCARTAR |
| InfiniteSpiral | CSS 3D + rAF; hélice de tarjetas | 1 | celula (como ADN), aurora | S | DESCARTAR (decorativo; difícil de leer) |
| Lanyard | three.js + física de cuerda | 0 | — | XL | DESCARTAR |
| LineSidebar | DOM + rAF; lista que se desplaza por cercanía al cursor | 2 | todos | S | **IMPLEMENTAR** (como `agenda` automática) |
| MagicBento | DOM + CSS; rejilla bento con borde luminoso, ilustraciones y onda al hacer clic | 3 | todos (hay que adaptar el borde luminoso al estilo) | M | **IMPLEMENTAR** (bento de KPIs) |
| Masonry | DOM + muelles + lightbox | 1 | — | M | DESCARTAR (con `columns` de CSS basta) |
| ModelViewer | @react-three/fiber + drei | 2 (robótica) | nube, arcilla | XL | DESCARTAR (no hay three.js) |
| MorphSlider | ogl + GSAP; transición de desplazamiento entre imágenes | 1 | — | L | DESCARTAR (las transiciones son View Transitions por estilo) |
| OptionWheel | DOM + rAF; selector curvo con wheel | 1 | suizo | M | DESCARTAR |
| PillNav | DOM; navegación en píldora | 0 | — | — | DESCARTAR |
| PixelCard | Canvas 2D; píxeles que centellean y llenan la tarjeta | 2 | matriz, termica, noche / suizo, arcilla | S–M | QUIZÁ (revelado de panel por píxeles) |
| ProfileCard | CSS + rAF; tarjeta de perfil con lámina | 1 | — | M | DESCARTAR |
| ReflectiveCard | WebGL2 + cámara | 0 | — | XL | DESCARTAR |
| ScrollStack | scroll + rAF; tarjetas que se apilan | 2 (idea) | — | M | DESCARTAR (la idea queda en CardSwap por pasos) |
| SpecularButton | WebGL2; botón | 0 | — | L | DESCARTAR |
| SpotlightCard | CSS + rAF; foco que sigue al puntero | 1 | noche, aurora | S | DESCARTAR (se integra en `bento` como foco por paso) |
| Stack | motion/react; pila con drag y flick | 2 (idea) | suizo, matriz (versión plana) | M | QUIZÁ (modo `pile` de la pila) |
| StaggeredMenu | GSAP; capas de color que barren + ítems escalonados | 1–2 | rice, aurora, matriz, suizo | S | QUIZÁ (entrada de separador) |
| Stepper | WAAPI; formulario por pasos con indicador que se desliza y check dibujado | 3 | todos | S–M | **IMPLEMENTAR** (proceso o línea de tiempo por pasos) |
| TiltedCard | CSS 3D + rAF; inclinación, brillo y cara trasera | 1–2 | arcilla, cromo, rice | S | QUIZÁ (tarjeta que se gira por paso: pregunta y respuesta, antes y después) |

**Totales**: IMPLEMENTAR 5 · QUIZÁ 11 · DESCARTAR 32.

## Top recomendados (de mayor a menor valor/coste)

Todos se reescriben desde cero, inspirados en el componente (ver la licencia más abajo).

### 1. `cifra`, inspirado en Counter (S–M)
- **Uso**: el número grande de «una idea por diapositiva» (p. ej. «97,3 %», «1.240 h», «28,4 fps»).
- **Marcado**: `<div class="fx cifra" data-fx="cifra" data-value="97.3" data-dec="1" data-suffix=" %"></div>`; varios por diapositiva con `data-seq` para escalonarlos.
- **render**: formatea con `Intl.NumberFormat('es-ES')`; cada dígito es una ventana `overflow:hidden` con una tira 0–9 en `translateY(-d·1em)` en su posición final. Tipografía `var(--font-display)`, `--title-weight`, `tabular-nums`; color `var(--fg)`; sufijo en `var(--fg-2)`.
- **play**: GSAP o WAAPI por dígito, de 0 (o de `data-from`) al valor, con `stagger` de derecha a izquierda y la curva `api.ease` del estilo (la elástica de arcilla da el rebote del original). Opcionalmente, desenfoque vertical (`filter: blur`) durante el giro en noche y termica. Con `api.reduced`, no se hace nada.
- **Sustituye y generaliza** el `op-cifras` de arq-opus, que es un tween lineal de texto.
- **Por estilo**: en matriz, dígitos en la fuente de puntos; en termica, añadir «°C» o una lectura fija.

### 2. `pasos`, inspirado en Stepper (S–M)
- **Uso**: proceso lineal (pipeline de ROS 2, fases de entrenamiento, instalación de Arch) con un indicador que avanza **con cada pulsación**.
- **Marcado**: `<ol class="fx pasos" data-fx="pasos"><li data-step>Percepción<small>…</small></li>…</ol>`, horizontal u orientación `data-orient="v"`.
- **render**: círculos numerados unidos por una línea; los pasos con `.on` quedan «hechos» (relleno `var(--accent)`, texto `var(--on-accent)`, check SVG) y la línea de progreso queda escalada hasta el último paso hecho. En capturas y en la vista general todos los pasos están en `.on`, así que se ve completo.
- **play**: un `MutationObserver` sobre `.on` mueve la línea (`scaleX` con `api.dur`) y dibuja el check (`stroke-dashoffset`), igual que el original. Estado «actual» con `var(--accent)` y la palabra «en curso» al lado (regla de estados).
- **Tokens**: `--accent`, `--line-2`, `--fg-2`, `--fg-3`, `ok` para «hecho» con su palabra.

### 3. `pila`, inspirado en CardSwap (más un modo `pile` de Stack) (M)
- **Uso**: secuencia de N tarjetas (nodos, capas, fases) en la que cada paso manda la delantera al fondo y saca la siguiente. Ahorra diapositivas sin caer en viñetas.
- **Marcado**: `<div class="fx pila" data-fx="pila"><article class="panel" data-step>…</article>…</div>`. Los `data-step` sirven solo de contador; el efecto lee cuántos hay en `.on`.
- **render**: calcula para cada tarjeta `translate3d(i·dx, -i·dy, -i·dz) skewY(s)` según el orden actual, con `perspective: 900px` y una capa de sombra con `opacity` según la profundidad (`color-mix(var(--bg) …)`). Sin muelles; estado final determinista.
- **play**: GSAP en la tarjeta que sale (cae y vuelve detrás) y en las demás (avanzan un hueco), con `api.ease`. Con `api.reduced`, se cambia el orden sin animar.
- **Por estilo**: rice, aurora, cromo y arcilla tal cual. En suizo y matriz, `data-mode="pile"`: sin sesgo ni 3D, desplazamientos ortogonales y la tarjeta sale lateralmente (la idea de Stack). En noche, borde `--accent` en la delantera (`.is-focus`).

### 4. `bento`, inspirado en MagicBento (+ SpotlightCard y ChromaGrid) (M)
- **Uso**: resumen de KPIs o de capacidades en una rejilla 4×3 con celdas `span`; hoy el motor solo tiene `.cols`.
- **CSS nuevo**: `.bento { display:grid; grid-template-columns:repeat(4,1fr); grid-auto-rows:1fr; gap:24px; height:100% }` y `.bento > .w2`, `.h2`. Cabe en 1664×630 con 3 filas de unos 194 px. Puede ir a engine.css como composición, sin efecto.
- **Efecto opcional `data-fx="bento"`**: entrada escalonada (como el `STAGGER` de 80 ms del original) y **foco por paso** en lugar del puntero. La celda con `data-step` activo recibe un halo radial `radial-gradient(var(--accent) / 18 %)` y un borde `--accent`; las demás bajan a `--fg-3`, que es la idea de ChromaGrid sin color de imagen.
- **render**: todas visibles y el foco en la última celda en `.on` (o ninguno). Cada celda puede alojar un `cifra` o una sparkline como la de `kpis`.
- **No portar** las ilustraciones animadas, el tilt magnético ni la onda al hacer clic.

### 5. `agenda`, inspirado en LineSidebar (+ la banda de FlowingMenu) (S)
- **Uso**: índice que se genera solo a partir de los `data-section` de las diapositivas, con la sección actual destacada. Sirve para la diapositiva de índice y para separadores repetidos.
- **render**: recorre `document.querySelectorAll('.slide[data-section]')`, saca las secciones únicas y marca la de la diapositiva actual. Aplica el desplazamiento de LineSidebar, pero en función de la **distancia a la sección actual** en lugar del cursor (`translateX` y opacidad con caída gaussiana). Actual en `var(--fg)` con una barra `var(--accent)`; el resto en `var(--fg-3)`.
- **play**: la barra se desliza desde la sección anterior a la actual (`api.tween`). Variante `data-mode="banda"` (FlowingMenu): la fila actual se llena con `var(--accent)` y lleva una marquesina con el título de la sección, que en `render` queda quieta.

### 6. `muro`, inspirado en DriftWall (S)
- **Uso**: fondo de portada o separador: un plano inclinado (`rotateX/rotateY`) de baldosas con texto (nombres de topics de ROS 2, paquetes, líneas de log, métricas) que se desplaza en vertical por columnas a velocidades distintas.
- **render**: posición fija con desfase determinista (`api.rng`); baldosas `var(--bg-3)` con texto `var(--fg-3)` y máscara de fundido a `var(--bg)`.
- **play**: `api.raf` con `translateY` por columna; parar con `stop`; con `api.reduced`, nada.
- **Estilos**: noche, matriz, nube y termica (sí); suizo y arcilla (no). No duplica `Motor.painters`, que son campos procedurales en canvas; esto es tipográfico y de DOM.

### 7. (QUIZÁ, barato) `revelado-px` (PixelCard) y `abanico` (BounceCards)
- **revelado-px**: canvas 2D sobre un `.panel` que se llena de píxeles `api.seq()` desde el centro y se desvanece para revelar el contenido. Encaja en matriz y termica. `render()` muestra el panel sin el canvas.
- **abanico**: 3–5 capturas (escritorio Hyprland, RViz) en abanico con `rotate` del patrón `[1, .5, -.3, -1…]`, entrada con rebote GSAP y `back.out` en rice y arcilla. `render()` deja el abanico abierto.

## Observaciones transversales

- **Dependencias**: 13 componentes son WebGL2 crudo (`#version 300 es`), 3 usan ogl, 2 three.js o R3F, 1 motion/react, 6 GSAP y 10 @hugeicons. Ninguno de los WebGL aporta algo que justifique un port L o XL en un deck: casi todos son vidrio o refracción, o galerías de imágenes. Los útiles son DOM, CSS y rAF puros, con un port S o M.
- **Patrón de port**: hooks → `render/play/stop`; props → `data-*`; mapas `THEMES` dark/light con hex → tokens (`--bg-3`, `--line`, `--fg-*`, `--accent`) y `api.dark`; muelles propios → GSAP con `api.ease` y `api.dur` del estilo (cada estilo tiene su curva en `source.json`, así que no hay que copiar constantes de rigidez); `prefers-reduced-motion` → `api.reduced`.
- **Interacción a pasos**: lo que en react-bits mueve el puntero (spotlight, proximidad, swap, flick) se reinterpreta como «el paso N está activo». Hace falta un mecanismo común: o un evento `motor:step` en engine.js (un cambio mínimo en `next/prev/go`, que **recomiendo**), o un helper compartido en fx que observe `[data-step].on` con `MutationObserver` y llame a un `onStep(api, n)`. Así `pasos`, `pila`, `bento` y `agenda` comparten la lógica. En la vista general y al imprimir, todos los pasos están en `.on`, de modo que `render()` debe dibujar «todos los pasos hechos» y la captura sale completa.
- **Imágenes**: la mitad del lote son galerías de fotos. Los decks típicos (ROS, ML, datos) apenas usan fotos y `bundle.mjs` tendría que incrustarlas, así que se descartan casi todas.
- **Licencia (MIT + Commons Clause)**: los cinco recomendados se pueden reescribir desde cero con poco código (la idea es sencilla y la implementación del motor sería distinta: tokens, pasos, GSAP). No conviene copiar el código de Counter (`slotsFor`, máscara) ni la física de CardSwap; basta con reimplementar la idea.
