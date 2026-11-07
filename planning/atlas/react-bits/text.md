# Lote `text` · react-bits `src/content/TextAnimations` (33 componentes)

## Punto de partida: cómo anima hoy el motor el texto

- **Entrada de títulos** (`fx/sistema.js`, efecto `backdrop`): en `play()` parte `.s-title` con `SplitText.create(title, { type: 'words,chars' })` y hace `gsap.fromTo(chars, { yPercent: 38, opacity: .12 }, { yPercent: 0, opacity: 1, stagger: .022 (aurora .04), ease: Motor.titleEase[style] })`. Espera a `document.fonts.ready` y en `stop()` hace `revert()`.
- `Motor.titleEase` = `rice back.out(1.7)`, `noche steps(4)`, `suizo power3.out`, `aurora expo.out`, `arcilla back.out(2.2)`, `nube power2.out`, `celula sine.out`, `matriz steps(4)`; **`cromo` y `termica` = `null`** porque su título es texto con `background-clip:text` (cromado con brillo `cromo-sheen`, rampa ironbow `termica-heat`, en `themes/styles.css`) y las transformaciones por letra romperían el recorte.
- Limitaciones: (1) **solo se anima el título en diapositivas con `data-fx="backdrop"`** (portada, separadores y cierre); las demás no tienen entrada de título. (2) Lo único que cambia entre estilos es el *ease*: el mismo «subir y aparecer» en los 10 estilos.
- **Cifras**: no hay un efecto genérico. `op-cifras` (fx/arq-opus.js) recorre `[data-count]` con `api.tween` y `Math.round` (sin decimales, sin formato es-ES, sin modo odómetro), y `kpis` (fx/datos.js) solo funde filas de la tabla.
- **Fuentes variables cargadas** (útiles para efectos por ejes): Outfit (wght), Bricolage Grotesque (opsz, wght), Fraunces (opsz, wght, **SOFT**), Doto (wght, **ROND**), Schibsted Grotesk (wght), Newsreader (opsz, wght), Unbounded (wght). Doto, Chakra Petch y Unbounded son las más «de pantalla».

Dependencias del lote: 9 usan GSAP (SplitText, ScrollTrigger o ScrambleTextPlugin), 6 usan `motion/react`, 1 `matter-js`, 1 `ogl`; el resto es canvas 2D, SVG o CSS con rAF. **La mitad lleva interacción de puntero o de scroll** que no sirve en un deck proyectado.

## Tabla

Valor 0–3 · Coste S/M/L/XL según el brief.

| Componente | Qué hace · técnica | Valor | Estilos que le van (chocan) | Coste | Veredicto |
|---|---|---|---|---|---|
| **SplitText** | Entrada por letras, palabras o líneas con efectos rise/fade/blur/flip/pop/skew/wave, máscara y `staggerFrom` · GSAP + SplitText + ScrollTrigger | 3 | Todos salvo cromo y termica (texto recortado) | S | **IMPLEMENTAR** (como presets por estilo de la entrada actual) |
| **BlurText** | Palabras que entran desenfocadas (blur/focus/drift/zoom/tilt) · motion | 3 | celula (enfoque de microscopio), aurora, nube (choca con noche y matriz) | S | **IMPLEMENTAR** (preset) |
| **CountUp** | Cifra que cuenta, o modo **odómetro `roll`** por columnas de dígitos con desenfoque de movimiento; formato compacto K/M/B · motion `animate` | 3 | Todos; `roll` en termica, matriz, noche y nube; `count` sobrio en suizo y celula | S–M | **IMPLEMENTAR** |
| **DecryptedText** | Revela el texto desde caracteres aleatorios (secuencial o desde centro/extremos; scramble/fade/flip) · React + rAF | 3 | noche (FUI/terminal), matriz; quizá rice (choca con suizo, celula y arcilla) | S | **IMPLEMENTAR** |
| **SplitFlapText** | Panel de aeropuerto: casillas que pasan caracteres hasta el destino · React + rAF + CSS 3D | 2 | matriz (perfecto con Doto), noche, suizo (tablero ferroviario) | S–M | **IMPLEMENTAR** |
| **TextType** | Máquina de escribir con cursor que se desliza, borrado y errores · GSAP | 2 | rice, noche y matriz (líneas de terminal: `ros2 …`, `pacman …`) | S | **IMPLEMENTAR** |
| **StrokeText** | Dibuja el contorno del texto (SVG `<text>` + `stroke-dashoffset`) y luego rellena con barrido · GSAP | 2 | nube (líneas finas), noche (neón), celula (contorno); choca con matriz (Doto de puntos) y con cromo y termica | M | **IMPLEMENTAR** |
| **TechText** | Muestrario tipográfico en canvas: glifos con contorno discontinuo, lupa que rellena, líneas de baseline, x-height, cap height, ascender y descender con etiquetas; intro `metrics`/`assemble`/`type` · canvas 2D | 2 | suizo, nube; ideal para la diapositiva `tipo` del deck del sistema | M | **IMPLEMENTAR** (en el deck del sistema) |
| Shuffle | Letras que barajan o deslizan su contenido (evenodd/center/sequence) · GSAP SplitText + ScrollTrigger | 2 | noche, matriz | S | QUIZÁ (fusionar en `descifra`) |
| ScrambledText | Revuelve las letras cerca del cursor; tiene intro de scramble · GSAP ScrambleTextPlugin | 1 | noche | S | QUIZÁ (solo la intro, dentro de `descifra`) |
| FoldText | Letras que se despliegan sobre una bisagra 3D (paper/blinds/flip) con sombreado de pliegue · GSAP | 2 | arcilla, rice (choca con suizo y noche) | S | QUIZÁ (preset `pliega`) |
| TrueFocus | Recorre las palabras con corchetes, caja o subrayado y desenfoca las demás · motion | 2 | noche (corchetes HUD), suizo (subrayado) | S–M | QUIZÁ |
| GlitchText | Glitch por franjas, RGB, scan o ruido con máscaras CSS · CSS + rAF | 1 | noche, matriz; duplica a medias el glitch manual de `op-cifras` | S | QUIZÁ |
| DepthText | Extrusión 3D con 34 copias apiladas en `translateZ`, órbita automática y seguimiento del puntero · CSS 3D | 1 | arcilla (letra de plastilina extruida), cromo | M | QUIZÁ (solo para `.div-num`) |
| ParticleText | Partículas que se reúnen formando el texto (gather/scan) con resaltado y empuje del puntero · canvas 2D | 2 | **nube** (el título se forma como nube de puntos LiDAR coloreada con `seq`), matriz | M | QUIZÁ |
| MaskedHeading | Imagen o vídeo dentro del texto (clipPath SVG) con revelado rise/wipe/blur y parallax · GSAP | 1 | portadas con foto; neutro | M | QUIZÁ |
| CircularText | Texto en círculo que gira (sello) · motion | 1 | rice, cromo (sello Y3K) | S | QUIZÁ |
| TextPressure | Ejes variables (wdth/wght/ital) según el cursor; modos idle `wave`/`pulse` · rAF; necesita Roboto Flex | 1 | matriz (Doto wght/ROND en ola), arcilla (Fraunces SOFT) | M | QUIZÁ (solo modo idle con fuentes ya cargadas) |
| RotatingText | Rota palabras dentro de una frase (slide/blur/flip) · motion | 1 | rice, aurora | S | QUIZÁ |
| ShinyText | Brillo que recorre el texto · CSS background + rAF | 1 | duplica `cromo-sheen` | S | DESCARTAR |
| GradientText | Degradado animado dentro del texto (linear/flow/conic) · CSS var + rAF | 1 | duplica `termica-heat` y cromo; para rice basta un CSS de 3 líneas | S | DESCARTAR |
| FuzzyText | Texto en canvas que tiembla por franjas · canvas 2D | 0 | — (resta legibilidad; pierde la fuente y el color de los tokens) | M | DESCARTAR |
| ASCIIText | Texto renderizado como ASCII con ondas y croma · WebGL2 + respaldo 2D | 1 | matriz o noche, pero pesado y poco legible | L | DESCARTAR |
| WarpText | Texto deformado por shader (lente, ondas, refracción) · ogl | 1 | aurora | L | DESCARTAR |
| EchoText | Copias que siguen al texto (estela) · rAF; pensado para el puntero | 1 | — | M | DESCARTAR |
| CurvedLoop | Marquesina sobre curva SVG con arrastre · SVG + rAF | 0 | — (un bucle infinito distrae al proyectar) | S | DESCARTAR |
| TextLoop | Cinta de texto sobre onda, arco o círculo · GSAP | 0 | — | M | DESCARTAR |
| ScrollVelocity | Marquesinas que se aceleran con el scroll · motion `useScroll` | 0 | — (no hay scroll) | — | DESCARTAR |
| ScrollFloat | Letras que flotan al hacer scroll · ScrollTrigger | 0 | — (sus efectos ya están en SplitText) | — | DESCARTAR |
| ScrollReveal | Revela palabras con el scroll · ScrollTrigger | 0 | — | — | DESCARTAR |
| TextCursor | Estela de texto que sigue al ratón · rAF | 0 | — | — | DESCARTAR |
| VariableProximity | Ejes variables según la distancia al ratón · rAF | 0 | — | — | DESCARTAR |
| FallingText | Letras que caen con física · matter-js | 0 | — | XL | DESCARTAR |

**Total: IMPLEMENTAR 8 · QUIZÁ 11 · DESCARTAR 14.**

## Top recomendados (de más a menos valor/coste)

### 1. `Motor.titleFx`: presets de entrada de título por estilo (SplitText + BlurText + FoldText + DecryptedText)
Generaliza la entrada actual en lugar de añadir efectos sueltos. Hoy `Motor.titleEase[style]` es una cadena; pasaría a un objeto `{ preset, ease, stagger }` o a una función `(title, api) => tween`. Viviría en `fx/sistema.js` o en un nuevo `fx/texto.js`.

| Estilo | Preset propuesto | Motivo |
|---|---|---|
| rice | `rise` con `back.out(1.7)` (el actual) | rebote de la bezier de Hyprland |
| noche | `descifra` (ver nº 3), en mayúsculas | FUI y terminal |
| suizo | `mask-lines`: `SplitText {type:'lines', mask:'lines'}`, `yPercent:100→0`, `power3.out` | editorial y sobrio, sin opacidades intermedias |
| aurora | `blur` por palabras: `filter: blur(12px)→0`, `y:20→0`, `expo.out`, stagger 0.08 | lento y orgánico |
| cromo | `null` (se queda el brillo CSS) | ShinyText ya está |
| arcilla | `pliega`: `rotationX:-90→0`, `transformOrigin:'50% 100%'`, `back.out(2.2)`, perspectiva en el `.s-title` | plastilina que se levanta |
| nube | `traza` (StrokeText, nº 6) en portada y `rise` en el resto | líneas finas |
| termica | `null` (se queda el calor CSS) | GradientText ya está |
| celula | `enfoca`: blur 8→0 y `opacity:.3→1` de la línea completa, sin partir | enfoque del microscopio |
| matriz | `descifra` con Doto, o `paleta` (split-flap, nº 4) en separadores | matriz LED |

- **`render()`**: no hace nada. El título se queda como texto plano, el estado final.
- **`play()`**: aplica el preset tras `document.fonts.ready`.
- **`stop()`**: `revert()`.
- **Opt-in por diapositiva**: `data-title-fx="blur|mask-lines|descifra|none"` sobrescribe el preset del estilo. Propongo que el motor (no solo `backdrop`) lo aplique **en cualquier diapositiva que lo pida**. Por defecto, solo en portada y separadores, para no cansar.
- **Cuidado**:
  - Nunca partir títulos con `background-clip:text` (cromo, termica): conservar el `null`.
  - `filter: blur` por palabra es barato; por letra a 1920 px es más caro, así que mejor por palabras.
  - `api.reduced`: el motor ya no llama a `play()`.

### 2. `cifra`: contador o odómetro de KPI (CountUp)
- Marcado: `<span class="num" data-fx-num="1234.5" data-dec="1" data-fmt="compact|plain" data-mode="count|roll" data-pre="" data-suf=" Hz">`. Puede ser un helper `Motor.cifras(api)` llamable desde cualquier efecto (op-cifras y kpis lo reutilizarían) o un `data-fx="cifras"`.
- **Formato** con `Intl.NumberFormat('es-ES', { minimumFractionDigits, maximumFractionDigits, useGrouping: 'always' })`. Ojo: en es-ES, 1234 no se agrupa sin `'always'`. Compacto con `notation:'compact'` da «1,2 mil» o «3,4 M».
- **`render()`**: escribe el valor final formateado y reserva el ancho con `font-variant-numeric: tabular-nums` (y `min-width` en `ch`) para que no salte el layout.
- **`play()`**:
  - `count`: `api.tween(dur, p => el.textContent = fmt(from + (to - from) * ease(p)))`.
  - `roll`: una columna por dígito, con una tira 0–9 en `translateY(-n·1.2em)` desde la derecha y stagger de 70 ms. El desenfoque de movimiento (SVG `feGaussianBlur` en vertical) es opcional y cuesta poco.
- **Tokens**: el número en `fg`, la unidad en `fg-3`, el delta con `ok`/`err` y siempre con la palabra «sube»/«baja».
- **Estilos**: `roll` en termica (lectura de cámara, Spline Sans Mono), matriz (Doto), noche y nube (Geist Mono); `count` en suizo, celula y aurora; `roll` con `back.out` en arcilla.

### 3. `descifra`: revelado por scramble (DecryptedText + Shuffle + intro de ScrambledText)
- **Marcado**: `data-fx="descifra"` en el contenedor, o como preset de título.
- **Implementación**: SplitText `chars`; cada letra fija su ancho (`display:inline-block; width` medido) para que no baile con fuentes proporcionales como Chakra Petch. Con `api.raf` se sustituye cada carácter por glifos de `api.rng(seed)` (deterministas, mejor para capturas) hasta su instante de revelado. Orden configurable: `start`, `center` o `random`.
- **Glifos por estilo**: noche `▚▞░▒<>/\\_`, matriz `·•●`, rice letras.
- **Accesibilidad**: `aria-label` con el texto real durante la animación.
- **`render()`**: texto final. **`play()`**: unos 900 ms. **`stop()`**: revert.
- No hace falta ScrambleTextPlugin, que es gratuito desde GSAP 3.13 y podría cargarse de jsdelivr, pero son unas 30 líneas propias.
- **Tokens**: los caracteres aún revueltos van en `accent-ink`, los fijados en `fg`.

### 4. `paleta`: split-flap (SplitFlapText)
- **Marcado**: `<div data-fx="paleta" data-words="NAV2 · LISTO|SLAM · ACTIVO" data-pad="14">`.
- **Casillas**: `bg-3`, filete `line`, texto `fg`, fuente `--font-mono` (Doto en matriz); radio `--radius`.
- **`render()`**: muestra la última palabra (estado final).
- **`play()`**: para cada casilla que cambia, secuencia de N caracteres de `api.rng` con stagger; la mitad superior gira con `rotateX` (CSS 3D, sin rAF por carácter más allá del cambio de glifo). Sin bucle infinito: una o dos frases y se detiene.
- **Usos**: separadores de matriz y noche, estado de un sistema («MAPA → LOCALIZADO → NAVEGANDO»), números de agenda.

### 5. `teclea`: máquina de escribir para terminal (TextType)
- **Marcado**: `<pre class="term" data-fx="teclea">` con líneas `data-k="cmd"` (se escriben) y `data-k="out"` (aparecen de golpe).
- **`render()`**: todo escrito.
- **`play()`**: vacía y escribe con `api.tween` por línea, unos 35 ms por carácter con variación de `api.rng`. Cursor `▍` en `accent` que parpadea con CSS y se oculta al terminar.
- Sustituiría el `clip-path steps(12)` de `fetch` (fx/arch.js).
- **Estilos**: rice, noche, matriz, nube. En suizo y celula, mejor sin efecto.

### 6. `traza`: dibujado de contorno y relleno (StrokeText)
- Genera un `<svg>` con `<text>` medido con `getBBox` tras `fonts.ready` y lo superpone al título real (oculto con `visibility`).
- Trazo `stroke: var(--accent)`, relleno `fill: var(--fg)`; el relleno barre un `clipPath` de izquierda a derecha.
- **`render()`**: SVG quitado y título real visible.
- **`play()`**: `stroke-dashoffset: L→0` (1.4 s, stagger por letra si se usan `<tspan>`), luego barrido del relleno y por último se cambia al título real.
- **Estilos**: nube (portada), noche (contorno con `text-shadow` de neón), celula. Choca con Doto y con los títulos recortados.

### 7. `muestrario`: espécimen tipográfico con métricas (TechText)
- Pensado para la diapositiva `tipo` de `fx/sistema.js`, que ya muestra la escala pero no la anatomía de la letra.
- Canvas 2D (`api.canvas`): título grande en `--font-display` con líneas de baseline, x-height, cap height, ascender y descender medidas con `measureText` (`actualBoundingBoxAscent` de «x», «H», «d», «p»), etiquetas en `--font-mono` de 22 px como mínimo y color `fg-3`; líneas en `line-2` y la medida activa en `accent`.
- **`render()`**: glifos rellenos y todas las líneas.
- **`play()`**: intro `metrics` (las líneas crecen de izquierda a derecha y los glifos pasan de contorno discontinuo a relleno en cascada) y después una «lupa» que recorre una vez el texto y se detiene.
- Sin arrastre ni puntero.
- **Estilos**: suizo y nube sobre todo, pero funciona en los 10 porque lee la fuente del estilo.

(Fuera del top, el siguiente candidato es **ParticleText para nube**: el título de portada se forma como una nube de puntos coloreada con `api.seq()` por altura. `render()` dibuja los puntos ya en su sitio con el texto real debajo al 100 % para que sea legible. Coste M; solo compensa si nube se usa mucho.)

## Observaciones transversales

1. **Casi todo es GSAP + SplitText, que ya está cargado.** Lo que en react-bits usa `motion/react` (BlurText, RotatingText, TrueFocus, CountUp) se traduce directo a `gsap.fromTo` o a `api.tween`. Ninguno de los recomendados necesita dependencias nuevas; descarto todo lo que exige ogl, matter-js o WebGL2.
2. **El patrón de port es siempre el mismo**:
   - `useEffect` + IntersectionObserver → `play(api)`.
   - Cleanup → `stop(api)` con `revert()`.
   - Props de color → tokens (`var(--accent)`, `api.tok('fg-3')`).
   - `Math.random` → `api.rng(seed)` para capturas reproducibles.
   - El estado final se escribe en `render()` como texto plano; esto es clave para las capturas, la vista general y el PDF.
   - Se elimina todo `pointermove`, `hover`, `drag`, `clickBurst` y `ScrollTrigger`.
3. **Esperar a las fuentes antes de medir o partir.** Con 25 familias de Google Fonts, `SplitText` y `measureText` antes de `document.fonts.ready` dan anchos falsos; el motor ya lo hace en `backdrop` y hay que replicarlo en cualquier efecto de texto.
4. **Títulos recortados (`background-clip:text`) en cromo y termica**: cualquier efecto por letra debe saltarse estos estilos o mover el fondo a cada letra con `background-attachment`. Lo más simple es conservar el `null`. ShinyText y GradientText duplican justo estos dos acabados.
5. **Nada de bucles infinitos de texto**: marquesinas, rotadores y glitch periódico distraen al proyectar. Si se usan, que se detengan tras 1–2 ciclos o queden solo en la diapositiva de cierre.
6. **Ancho estable**: scramble, contadores y split-flap deben fijar el ancho (`tabular-nums`, `ch`, ancho medido por letra) para no mover el layout ni disparar los avisos de desbordamiento de `tools/verificar.mjs`.
7. **Licencia**: todos los recomendados son ideas sencillas (stagger con un preset, columnas de dígitos, scramble, dashoffset). Conviene **reescribirlas desde cero** sobre `Motor.fx`/GSAP y no portar el código de react-bits (Commons Clause), sobre todo si el motor se publica como reutilizable.
