# Lote `animations` — react-bits `src/content/Animations` (38 componentes)

Leído el código de cada componente (props, bucle de animación, eventos, dependencias) y las descripciones de `src/constants/Information.js`. Comparado con `engine/engine.js` (pasos `data-step`, transiciones por estilo con View Transitions), `themes/styles.css` (borde cónico giratorio de rice, `deco-grain` de aurora, `deco-scan`/`deco-corners` de noche, brillo `cromo-sheen`, transiciones `vt-*`), `fx/sistema.js` (painters rice/noche/aurora, SplitText de títulos) y `fx/fondos.js` (painters cromo/arcilla/nube/termica/celula/matriz).

**Hechos clave del lote**
- Casi todo está pensado para el ratón: 31 de 38 escuchan `pointermove`, `mousemove` o `scroll`. Solo 12 tienen un modo que funciona solo (`intro`, `autoAnimate`, `ambient`, `wander`, `mode="loop"`, `trigger="mount"`, `listening`).
- La versión clonada se reescribió en 2026 y ya casi no usa librerías: la mayoría son **WebGL2 crudo** (`#version 300 es`, triángulo a pantalla completa) o canvas 2D. Solo 5 usan ogl o three (BlobCursor con three; CrystalizedBall, DitherVeil, ElectricLogo y RippleDistortion con ogl). Ninguno tiene respaldo en 2D: el canvas 2D solo se usa para leer colores o rasterizar.
- Escala: valor 0–3; coste S/M/L/XL según el brief.

## Tabla

| # | Componente | Qué hace | Técnica | Valor | Estilos (encaja / choca) | Coste | Veredicto |
|---|---|---|---|---|---|---|---|
| 1 | AnimatedContent | Revela contenido al hacer scroll o al montarse: desplazamiento, desenfoque, giro, inclinación 3D, barrido con máscara y escalonado de hijos | GSAP + ScrollTrigger, `mask-image` con `--ac-wipe` | 2 | barrido→nube, desenfoque→aurora, inclinación→rice/arcilla / ninguno | S | **IMPLEMENTAR** (junto con FadeContent, como `data-reveal`) |
| 2 | BlobCursor | Gota de metal líquido que sigue al cursor | three.js + RoomEnvironment | 0 | cromo (ya tiene esferas fundidas) | XL | DESCARTAR |
| 3 | ClickSpark | Chispas en cada clic | canvas 2D | 0 | — | S | DESCARTAR |
| 4 | Crosshair | Cruz con coordenadas que mide lo que hay bajo el cursor | canvas 2D + DOM | 1 | noche, termica (medidor de punto) / suizo | S | QUIZÁ (solo como lectura de coordenadas dentro de `reticula`) |
| 5 | CrystalizedBall | Esfera de cristal con borde eléctrico y polvo que gira | ogl (sombreador) | 1 | noche, cromo / suizo, arcilla, celula | L | DESCARTAR |
| 6 | Cubes | Rejilla de cubos 3D que miran al cursor; ola automática en reposo | WebGL2 | 1 | matriz, nube / suizo, aurora | L | DESCARTAR (repite los fondos) |
| 7 | CursorGrid | Rejilla con foco del cursor, celdas que se encienden solas y entrada animada | WebGL2 | 1 | suizo, matriz (ya tienen `deco-grid` y LED) | M | DESCARTAR |
| 8 | DitherVeil | Foto en 1 bit (Floyd/Bayer) que el cursor «quema» hasta el color; deambula sola | ogl | 2 | matriz, noche / aurora, arcilla | M | QUIZÁ (como modo `dither` de `trama`) |
| 9 | ElasticMesh | Texto o logo inflado que se aplasta y rebota | WebGL2 + física de muelles | 1 | arcilla (plastilina) / el resto | L | QUIZÁ (solo portada de arcilla; baja prioridad) |
| 10 | ElectricBorder | Rayos alrededor de un rectángulo redondeado; al encenderse recorren el borde | WebGL2 (un solo sombreador, ruido propio) | 2 | noche, matriz (en rojo de señal), termica / suizo, arcilla, celula | M | **IMPLEMENTAR** |
| 11 | ElectricLogo | Rayos que recorren el contorno de un logo SVG | ogl + campo de distancias calculado en la CPU | 1 | noche / suizo, arcilla | L | QUIZÁ |
| 12 | FadeContent | Fundido con enfoque, «revelado» desde gris o disolución con grano, niebla o píxeles | GSAP + máscara SVG con `feTurbulence` | 2 | enfoque→celula, revelado→termica, niebla→aurora, píxeles→matriz | S–M | **IMPLEMENTAR** (dentro de `data-reveal`) |
| 13 | GhostCursor | Humo que sigue al cursor | WebGL2 + bloom | 0 | — | L | DESCARTAR |
| 14 | GlareHover | Destello que cruza un elemento; tiene `mode="loop"` con intervalo | CSS + rAF | 1 | rice, arcilla / cromo ya tiene `cromo-sheen` | S | QUIZÁ |
| 15 | GlowCursor | Estela luminosa del cursor | WebGL2 | 0 | — | M | DESCARTAR |
| 16 | GradualBlur | Desenfoque progresivo en un borde (capas de `backdrop-filter`) | CSS | 1 | aurora, rice, nube / suizo | S | QUIZÁ (clase `.borde-difuso` para listas o código que se cortan) |
| 17 | HalftoneReveal | Foto en trama de semitonos (puntos, mono o duotono) que pasa a la foto real bajo el cursor | WebGL2 | 2 | suizo, arcilla, celula (H&E impreso) / noche | M | **IMPLEMENTAR** (como `trama`) |
| 18 | ImageTrail | Estela de imágenes tras el cursor | GSAP + DOM | 0 | — | M | DESCARTAR |
| 19 | LaserFlow | Haz de luz que cae sobre un elemento y se derrama por sus esquinas, con niebla y polvo | WebGL2 | 2 | noche, aurora, rice / suizo, arcilla, celula | M | QUIZÁ |
| 20 | LogoLoop | Cinta infinita de logos; también en ola, arco y órbita 3D, con lupa | DOM + rAF | 2 | todos menos suizo (ahí mejor una rejilla quieta) | S–M | QUIZÁ (diapositiva de «stack») |
| 21 | Magnet | El elemento se acerca al cursor con un muelle | DOM | 0 | — | S | DESCARTAR |
| 22 | MetaBalls | Metaballs que se funden; modos órbita, lámpara de lava y deriva, con relleno, contorno o curvas de nivel | WebGL2 | 1 | cromo (ya es su fondo), aurora con curvas de nivel | M | DESCARTAR (sirve de referencia para mejorar `P.cromo`) |
| 23 | MetallicPaint | Cromo líquido sobre un texto o un logo (adaptado de Liquid Metal, de Paper) | WebGL2 + campo de distancias en la CPU | 2 | solo cromo | L | QUIZÁ (título de portada de cromo; revisar la licencia de Paper) |
| 24 | Noise | Grano de película con polvo, rayas, líneas de barrido y parpadeo | canvas 2D por teselas | 1 | aurora, noche (ya tienen `deco-grain` y `deco-scan`) | S | DESCARTAR (ya cubierto; el grano en movimiento proyectado molesta) |
| 25 | OrbitImages | Imágenes que orbitan una trayectoria y pasan por delante y por detrás de un centro | SVG + DOM + rAF | 2 | rice, nube, aurora / suizo | M | QUIZÁ (diagrama «ecosistema») |
| 26 | PixelSwap | El contenido nuevo entra píxel a píxel en una ola con muelle | DOM (rejilla de capas) + rAF | 1 | matriz, noche | M | QUIZÁ (fusionar en `pixeles`) |
| 27 | PixelTrail | Estela de píxeles viscosos tras el cursor | WebGL2 | 0 | — | M | DESCARTAR |
| 28 | PixelTransition | Una tarjeta se cubre de píxeles, cambia el contenido y se aclara (patrones al azar, Bayer, onda, barrido) | canvas 2D | 2 | matriz, noche, termica / aurora, arcilla | S–M | **IMPLEMENTAR** (cambio antes/después por paso) |
| 29 | Ribbons | Cintas que siguen al cursor | WebGL2 | 0 | — | M | DESCARTAR |
| 30 | RippleDistortion | Ondas de agua sobre una imagen | ogl | 0 | — | L | DESCARTAR |
| 31 | ScrollExpand | Marco redondeado que crece hasta sangre con el scroll | DOM + `clip-path` + rAF | 2 | todos (cada uno con su easing) | S | QUIZÁ (en un paso: la foto se amplía a sangre) |
| 32 | ShapeBlur | Forma nítida que se desenfoca bajo el cursor, como una lente | WebGL2 | 0 | celula (lo cubre mejor el modo enfoque) | M | DESCARTAR |
| 33 | SplashCursor | Simulación de fluido tras el cursor | WebGL2 (fluidos + bloom) | 0 | — | L | DESCARTAR |
| 34 | StarBorder | Una estrella con estela y polvo recorre el contorno exacto de un elemento | canvas 2D | 2 | aurora, nube, cromo, noche / suizo; rice ya tiene borde cónico | S–M | **IMPLEMENTAR** |
| 35 | StickerPeel | Pegatina que se despega y se arrastra | WebGL2 + física | 0 | arcilla | L | DESCARTAR |
| 36 | Strands | Esfera de cristal con hebras espectrales, tipo Siri; reacciona a un nivel de «voz» simulado | WebGL2 | 1 | aurora, noche / suizo, arcilla | M | QUIZÁ (solo decks sobre voz o asistentes) |
| 37 | SwarmCursor | Enjambre de partículas que sigue al cursor o rodea enlaces | WebGL2 + canvas | 1 | aurora (ya tiene campo de flujo) | M | DESCARTAR |
| 38 | TargetCursor | Retícula con esquinas que se ajustan al objetivo y muestran una etiqueta | DOM + rAF | 2 | noche (HUD), termica, nube / suizo | S | **IMPLEMENTAR** (como `reticula` que se mueve por pasos) |

**Totales:** IMPLEMENTAR 7 (AnimatedContent, FadeContent, ElectricBorder, HalftoneReveal, PixelTransition, StarBorder, TargetCursor) · QUIZÁ 14 · DESCARTAR 17.
Si se fusionan, los 7 dan 6 efectos: AnimatedContent y FadeContent forman `data-reveal`.

## Top recomendados (de más a menos valor por coste)

### 1. `data-reveal`: revelados por estilo (AnimatedContent + FadeContent) · valor 2 · S
- **Qué es:** no es un `data-fx`, sino una extensión de `[data-step]` y de la entrada de la diapositiva. Atributo `data-reveal="wipe|focus|develop|mist|pixel|tilt"`, con un valor por defecto para cada estilo:
  - nube → barrido vertical (`mask-image` con un degradado y la variable `--wipe`, como `WIPES.down`)
  - celula → enfoque (`filter: blur(12px)` a 0 con `scale .97`): el mismo gesto que enfocar un microscopio
  - termica → revelado (`grayscale(1) contrast(.55) brightness(1.3)` a normal)
  - aurora → niebla (máscara SVG con `feTurbulence` a baja frecuencia)
  - matriz → píxeles
  - rice y arcilla → inclinación 3D o salto con su propio easing
  - suizo → el fundido y desplazamiento que ya existe
- **Tokens y movimiento:** solo `--dur` y `--ease` del estilo. No necesita colores.
- **render y play:** con la regla actual `.slide [data-step].on`, el estado `.on` es el estado final y la vista general ya fuerza `opacity: 1`. Lo ideal es hacerlo en CSS puro (transiciones sobre `filter`, `mask-position` o `--wipe` con `@property`). Solo niebla y píxeles necesitan GSAP más un `<filter>` SVG compartido. Para escalonar hijos, `data-reveal-stagger` con `transition-delay: calc(var(--i) * 60ms)`.
- **Cambios en el port:** quitar ScrollTrigger; el disparador es `.on` o `is-active`. Con `reduced`, fundido sin filtros.

### 2. `reticula` (TargetCursor, más la lectura de coordenadas de Crosshair) · valor 2 · S
- **Uso:** `data-fx="reticula"` en un diagrama. Cuatro esquinas, en `var(--accent)` y 3 px, saltan de un `[data-target]` a otro en cada paso. Se ajustan a su `border-radius` y muestran una etiqueta en mono con `fg-2` (p. ej. `/cmd_vel · 20 Hz`).
- **Encaje por estilo:** en noche continúa los `deco-corners`; en termica hace de «medidor de punto»; en nube es una caja delimitadora 3D.
- **render y play:** render coloca la retícula sobre el último objetivo visible; play hace un tween de posición y tamaño entre objetivos y un giro corto de las esquinas.
- **Requisito:** que el motor avise a los efectos cuando cambia un `[data-step]`. Hoy solo alterna la clase, así que sin ese aviso habría que usar un `MutationObserver` dentro del efecto.
- **Cambios en el port:** sin cursor ni modo de mezcla `difference` (estropea los tokens). Con `reduced`, salto sin tween.

### 3. `chispa` (StarBorder) · valor 2 · S–M
- **Uso:** `data-fx="chispa"` sobre un `.panel` destacado. Canvas 2D superpuesto con margen (`BLEED`), con el contorno de rectángulo redondeado tomado del `border-radius` calculado del panel. Cabeza en `accent`, cola mezclada hacia `accent-2`, halo con `color.alpha`.
- **Encaje por estilo:** en aurora, vuelta lenta con `--dur` de 1100 ms; en nube, un «haz de escáner» que da la vuelta; en cromo, un reflejo. Rice ya tiene su borde cónico y suizo no lleva adorno.
- **render y play:** render dibuja el borde fino completo más la estrella parada en una posición fija (por ejemplo arriba a la derecha) con su estela. play mueve `phase` con `api.raf`. Con `reduced`, estático.
- **Cambios en el port:** quitar `hover`, `clickPulse` y el estado de React. Unas 150 líneas útiles.

### 4. `rayo` (ElectricBorder) · valor 2 · M
- **Uso:** `data-fx="rayo"` en el panel clave (fallo, alerta, «el cuello de botella está aquí»). El borde equivalente en noche, matriz y termica.
- **Cambios en el port:** reaprovechar el sombreador WebGL2 tal cual, que ya es crudo. Hay que:
  - cambiar `uCore` y `uGlowColor` por `api.tok('accent')` y `api.tok('accent-2')` (en matriz, el rojo de señal);
  - poner `uInk` según `api.dark`, porque el modo claro ya existe en el original;
  - eliminar `uHover`, los pulsos de clic y `interactive`.
- **render y play:** render dibuja un fotograma con `uTime` fijo, `uPower=1` y `uReveal=1`. play reproduce la intro (el rayo recorre el borde) y después el bucle a 30 fps con el `throttle` de `fondos.js`.
- **Riesgos:** sin WebGL2, respaldo con un borde `box-shadow` en `accent`. Con `reduced`, `uFlicker=0` y estático.
- **Rendimiento:** el canvas solo cubre el panel más 64 px, así que el coste es bajo.

### 5. `trama` (HalftoneReveal + DitherVeil) · valor 2 · M
- **Uso:** `data-fx="trama"` sobre una `<img>`. Trata las fotos (robots, laboratorio) para que respeten la paleta. Por estilo:
  - suizo: semitono mono
  - arcilla y celula: duotono
  - matriz: dither en 1 bit
  - noche: Bayer
- **Tokens:** tinta = `fg`, papel = `bg`, acento = `accent`.
- **render y play:** render deja la imagen tramada completa: es el estado final, de modo que las capturas y el PDF salen bien. play hace la transición tramada → foto real (o al revés) con un círculo que se abre desde un punto fijo (la `wander` original, pero determinista) o por paso.
- **Cambios en el port:** el sombreador de HalftoneReveal ya es WebGL2. El dither puede hacerse en canvas 2D: Floyd–Steinberg una sola vez en render y un fundido CSS hacia la foto en play, sin GPU. Ojo con el bundle: las imágenes tienen que ir embebidas.

### 6. `pixeles` (PixelTransition, con la ola de PixelSwap) · valor 2 · S–M
- **Uso:** `data-fx="pixeles"` en un contenedor con dos hijos `[data-antes]` y `[data-despues]`. En el paso, los píxeles cubren el panel siguiendo un patrón Bayer o una onda desde una esquina, cambian el contenido y se aclaran. Sirve para antes y después: un mapa sin SLAM y con SLAM, o una métrica antes y después de una optimización.
- **Tokens:** color del píxel `accent` (matriz) o `bg-3`.
- **render y play:** render muestra el estado `despues` si el paso está activo y `antes` si no. play hace la disolución con `api.raf` en canvas 2D, que ya es el método del original.
- **Encaje:** matriz (encaja con su transición `vt-leds`), noche y termica.

### 7. (opcional) `haz` (LaserFlow) · valor 2 · M
Para la portada o un divisor en noche y aurora: un haz en `accent` que cae sobre el bloque del título. render dibuja un fotograma quieto; play reproduce la intro y el bucle a 30 fps con el techo `MAX_RENDER_DIM`. Va detrás de los seis anteriores porque es otro fondo de portada y se pisa con los painters.

## Variantes autónomas valoradas y descartadas
- **Cursores** (Blob, Ghost, Glow, Splash, Swarm, Pixel/Image Trail, Ribbons, Magnet, ClickSpark): moverlos por una trayectoria programada para que «dibujen» un recorrido sería posible, pero ya lo cubren `astar`, `lidar` y los painters. Además, un rastro proyectado distrae más de lo que explica.
- **Cubes y CursorGrid:** sus modos automáticos (`autoAnimate`, `ambient`) son fondos genéricos que chocan con los painters de cada estilo.
- **MetaBalls, Noise, ShapeBlur, GlareHover:** ya tienen equivalente en el motor (cromo, `deco-grain`, el modo enfoque de `data-reveal` y `cromo-sheen`).
- **ElasticMesh y MetallicPaint:** son «el título de portada» de arcilla y cromo, con un acierto de mood muy alto, pero coste L por los campos de distancias, la física y el texto rasterizado. Solo compensan si esos dos estilos se usan mucho.

## Observaciones transversales
1. **Dependencias:** casi nula. El 80 % es WebGL2 crudo o canvas 2D; GSAP solo aparece en AnimatedContent, FadeContent e ImageTrail, y ya está en el motor. ogl y three solo en 5, todos descartados o en QUIZÁ. Portar no exige reescribir librerías, sino **quitar la capa de interacción**, que es la mitad del código de cada archivo.
2. **El patrón del port se repite:**
   - `useEffect` → `render` y `play`; el `ResizeObserver` sobra en un lienzo fijo de 1920×1080;
   - `settingsRef` y props → atributos `data-*` más tokens;
   - `IntersectionObserver` → `activate` y `deactivate` del motor;
   - `matchMedia(reduced)` → `api.reduced`;
   - `intro` → `play()`, y el estado tras la intro → `render()`.
   Casi todos tienen una variable `power`, `reveal` o `presence` que va de 0 a 1: fijarla a 1 da el render estático.
3. **Falta en el motor:** un aviso de paso para los efectos (algo como `api.onStep(fn)` o un evento `motor:step`). Tres de los seis recomendados (`reticula`, `pixeles`, `trama` por pasos) lo necesitan. Hoy `next()` solo pone la clase `.on`.
4. **WebGL sin respaldo:** react-bits no trae respaldo en 2D. Cada port en WebGL2 necesita uno mínimo (CSS o canvas), como ya hace `fondos.js`. También hay que volver a respetar el `throttle` a 30 fps y el techo de resolución.
5. **Colores:** todos reciben hex por props (`'#7df9ff'`, `'#3847ff'`…) y varios los mezclan con blanco en oscuro. Hay que cambiarlo por `api.tok` y `api.color.alpha` y comprobar los dos modos. ElectricBorder, StarBorder, CursorGrid y Strands ya distinguen `theme` o `lightMode`, lo que ayuda.
6. **Licencia:** la Commons Clause prohíbe redistribuir los componentes «portados». Si el motor se publica, los seis efectos deben ser **reescrituras inspiradas**, no copias. Es viable porque la idea de cada uno es pequeña: un contorno parametrizado con una estela, máscaras CSS, Bayer, retícula. La excepción es el sombreador de ElectricBorder: si se reutiliza literalmente, cuenta como port. Lo prudente es escribir un ruido propio (ya existe `api.noise2`) o tratarlo como uso interno. MetallicPaint además deriva de Paper, otra licencia que revisar.
