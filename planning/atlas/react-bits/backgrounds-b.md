# Lote `backgrounds-b` · src/content/Backgrounds (32 componentes, de LightPillar a WebThreads)

## Contexto

En esta versión de react-bits casi todos los fondos son **WebGL2 crudo** (`#version 300 es`) metido en hooks de React. Solo MicroSlats y PatternWaves usan `ogl`, ShapeWaves depende de `vgpu` (WebGPU) y ShapeGrid y parte de MagnetLines usan canvas 2D. Todos repiten la misma estructura: `settingsRef`, un «wake» con IntersectionObserver, `intro` (revelado inicial), `lightMode`, `prefers-reduced-motion`, puntero y clic (ondas, pulsos, «burst»). Casi todos los sombreadores dependen solo de `uTime`, así que se puede congelar un fotograma para `render()`. Las excepciones son las simulaciones con estado: LiquidEther, el SIM de LiquidChrome, el fluido de MicroSlats, la nieve acumulada de PixelSnow y el muelle de Waves con el ratón.

Pintores que ya existen y con los que hay que comparar:
- `rice`: manchas radiales y mosaico dwindle.
- `noche`: horizonte synthwave con rejilla en perspectiva y estrellas.
- `suizo`: disco rojo, arcos y barras.
- `aurora`: campo de flujo con 820 partículas.
- `cromo`: metabolas por raymarching (WebGL1).
- `arcilla`: brazo SDF de arcilla.
- `nube`: nube de puntos LiDAR.
- `termica`: campo de calor 2D con LUT ironbow.
- `celula`: tejido al microscopio.
- `matriz`: LED con sprites.

`fx/ros.js` ya tiene `lidar`, con un barrido angular.

Hay un detalle técnico que pesa en todos los ports. `glLayer()` de fondos.js abre un contexto `webgl` (WebGL1), y un canvas solo admite un tipo de contexto. Así que cada fondo se puede llevar de una de dos formas:
- Bajar el GLSL a ES 1.0: `in/out` pasan a `attribute/varying`, `texture()` a `texture2D`, `texelFetch` y `gl_VertexID`/`gl_InstanceID` a buffers, y desaparecen los `uint`.
- Añadir un `glLayer2` con su propio `<canvas class="gl2">`.

Licencia: por la Commons Clause, lo prudente es **reescribir la idea** con `api.noise2`, `api.rng` y tokens, no copiar sombreadores. En los cuatro recomendados es fácil, porque la idea visual cabe en 60–150 líneas de canvas 2D.

Leyenda: valor de 0 (no aporta proyectado) a 3 (aporta claramente). Coste S/M/L/XL según el BRIEF.

## Tabla

| Componente | Qué hace · técnica | Valor | Estilos | Coste | Veredicto |
|---|---|---|---|---|---|
| **Radar** | Pantalla de radar PPI: anillos, radios, marcas de rumbo, barrido con estela de fósforo, contactos que se mueven y ruido (clutter). Modos de barrido angular o radial e inclinación 3D. WebGL2, 1 FBO + sprites | 3 | noche (HUD/FUI), matriz (versión en LED con contacto rojo), nube; choca con aurora, arcilla y celula | S–M (rehecho en canvas 2D: anillos, gradiente cónico y contactos con `rng`) | **IMPLEMENTAR** |
| **Topography** | Paisaje 3D dibujado con curvas de nivel brillantes, curvas maestras cada 5, niebla, profundidad de campo y avance de cámara. WebGL2 con malla instanciada, horneado del campo y bloom (1516 líneas) | 3 | aurora (su mood dice literalmente «curvas de nivel»), nube (terreno de gemelo digital, color por altura con `seq`), noche (alambre neón), suizo en claro (monocromo y curva maestra en rojo) | L si se porta tal cual · **M** rehecho con `d3.contours` (d3 ya está cargado) y proyección en perspectiva en 2D | **IMPLEMENTAR** (reescrito) |
| **Threads** | Haz de unas 90 líneas que salen juntas por la izquierda y se deshilachan hacia la derecha con ruido de Perlin. Grosor y alfa decrecen con el índice y el color pasa de `color` a `accent`. WebGL2 instanciado | 2–3 | aurora, suizo (líneas finas, sin adorno, acento en las últimas), rice, celula en claro; en matriz y termica no pega | S (polilíneas en 2D con `noise2`) | **IMPLEMENTAR** |
| **MagnetLines** | Rejilla de segmentos que se orientan hacia el cursor (modos orbit, attract…), con inercia y onda. Canvas 2D y WebGL2 | 2 (no como fondo: como **diagrama de campo vectorial**: gradiente, campo de potencial, costmap) | todos (es un diagrama); quiver con `seq` por magnitud | S | **IMPLEMENTAR** (como fx `campo`, sin ratón) |
| Scanner | Líneas de interferencia (suma de senos en contornos), haz de barrido con estela, scanlines CRT, grano y viñeta. WebGL2 en una sola pasada | 2 | noche (alternativa al horizonte), termica (barrido); choca con suizo y arcilla | M (bajar a GLSL 1.0; encaja en `glLayer`) | QUIZÁ (pintor alternativo de noche) |
| PatternWaves | Superficie iluminada en semitono (puntos, líneas o glifos) que ondula como seda. ogl, 3 FBO | 2 | matriz (semitono = rejilla LED), suizo en claro | L tal cual · S–M rehecho como LED de tamaño o brillo variable con `ledSprite` | QUIZÁ (fondo de portada o pintor alternativo de matriz) |
| PixelBlast | Nubes de píxeles con tramado Bayer 8×8 que derivan y titilan; suelo en perspectiva; ondas al clic. WebGL2 (341 líneas de GLSL) | 2 | matriz, noche (retro); el resto no | M | QUIZÁ (se solapa con PatternWaves: elegir uno de los dos) |
| RippleGrid | Rejilla nítida en perspectiva con ondas que salen solas del centro (`autoRipple`) cada 2,6 s. WebGL2 en una sola pasada | 2 | suizo (retícula), nube, noche | M (o S en 2D desplazando las líneas) | QUIZÁ (el `noche` actual ya tiene rejilla en perspectiva) |
| SoftAurora | Bandas de aurora boreal con ruido 3D y paleta coseno. WebGL2 en una sola pasada | 2 | aurora, rice; con la paleta coseno no se respetan los tokens, habría que cambiarla por mezcla `accent`/`accent-2` | M | QUIZÁ (fondo de portada genérico) |
| Waves | Muchas líneas paralelas que ondulan como seda; se apartan del cursor y vuelven con un muelle. WebGL2 | 2 | aurora, suizo | S en 2D | QUIZÁ (duplica a Threads; se queda Threads) |
| LineWaves | Líneas finas deformadas en ondas con una banda de luz que las recorre y ciclo de 3 colores. WebGL2 | 1–2 | aurora, rice | M | QUIZÁ (misma familia que Threads/Waves) |
| LightRays | Rayos volumétricos desde un borde, con halo y bruma. WebGL2 en una sola pasada | 2 | cromo y arcilla (luz de estudio), celula en claro (iluminación de campo claro) | M | QUIZÁ (capa de «foco» sobre una portada) |
| MoltenMetal | Filamentos cáusticos con núcleos al blanco. WebGL2 en una sola pasada | 2 | termica (pasado por la LUT ironbow parece metal al rojo), cromo | M | QUIZÁ (alternativa de termica; se aleja del mood «cámara térmica de un robot») |
| SlicedWaves | Cintas de color en ondas cortadas en barras luminosas, vistas en profundidad con desenfoque. WebGL2 + FBO | 1–2 | rice (pasteles), aurora | M | QUIZÁ (bonito, pero las barras parecen un gráfico sin serlo, y eso confunde en charlas de datos) |
| LiquidChrome | Cintas de cromo líquido en un estanque, con ondas. WebGL2 con simulación (SIM + SLOPE) | 2 | cromo | L | DESCARTAR (duplica el raymarching de `cromo`) |
| LiquidEther | Fluido estable movido por el ratón (o un «autoDemo»), coloreado por velocidad. WebGL2 con simulación | 1 | aurora | L | DESCARTAR (con estado: no hay `render()` estático fiel) |
| MicroSlats | Pared de lamas diminutas que forman un mar en perspectiva con crestas brillantes. ogl con fluido y 4 FBO | 1–2 | cromo, matriz | L | DESCARTAR |
| Particles | Campo 3D de partículas con brillo, titileo y líneas de constelación. WebGL2 | 1–2 | nube, noche | M | DESCARTAR (duplica `nube` y las estrellas de `noche`) |
| LightPillar | Pilar de luz en espiral por raymarching (80 pasos × 6 octavas) con bloom. WebGL2 | 1 | noche | L (y caro a 1920×1080) | DESCARTAR |
| LightTunnel | Túnel de fibra óptica con cometas de luz hacia el fondo. WebGL2 | 1 | noche | M | DESCARTAR (efecto hiperespacio; tapa el título) |
| MagicRings | Anillos concéntricos que laten hacia fuera con brillo y dispersión. WebGL2 + FBO | 1 | rice, noche | M | DESCARTAR (los arcos de `suizo` y el anillo de `celula` ya cubren el motivo) |
| Orb | Anillo-orbe de color que respira con una luz orbitando. WebGL2 | 1 | rice, cromo | M | DESCARTAR (estética de asistente de voz; sin uso en la narrativa) |
| PixelSnow | Copos de pixel art en capas, con acumulación. WebGL2 | 0–1 | — | M | DESCARTAR |
| Plasma | Pliegues de satén luminoso que giran en volumen. WebGL2 + FBO | 1 | aurora, cromo | M | DESCARTAR |
| PlasmaWave | Dos cintas de plasma entrelazadas con núcleo blanco. WebGL2 | 1 | noche, rice | M | DESCARTAR |
| Silk | Pliegues de seda con brillos. WebGL2 + FBO | 1 | aurora, rice | M | DESCARTAR (genérico; Threads cubre la textura «sedosa» con menos ruido visual) |
| Prism | Prisma giratorio de luz espectral. WebGL2 | 1 | — (espectro arcoíris fijo, fuera de tokens) | M | DESCARTAR |
| PrismaticBurst | Estallido de rayos prismáticos con desenfoque. WebGL2 + FBO | 1 | — | M | DESCARTAR |
| SideRays | Haces de luz desde una esquina que titilan. WebGL2 | 1–2 | arcilla, cromo | M | DESCARTAR (duplica LightRays) |
| WebThreads | Hilos brillantes trenzados por puntos de pinzamiento con pulsos. WebGL2 | 1 | noche | M | DESCARTAR |
| ShapeGrid | Rejilla de formas que deriva y se ilumina bajo el cursor, con estela arcoíris. Canvas 2D | 1 | matriz, suizo | S | DESCARTAR (sin ratón es una rejilla que se mueve; `matriz` ya lo hace mejor) |
| ShapeWaves | Campo de triángulos, círculos y cuadrados que crecen con ondas; puede formar texto. **vgpu (WebGPU)** | 1–2 | matriz | XL | DESCARTAR (WebGPU no es fiable en captura ni en PDF) |

**Total: IMPLEMENTAR 4 · QUIZÁ 10 · DESCARTAR 18.**

## Top recomendados (de más a menos por valor/coste)

### 1. Radar → fx `radar` y pintor alternativo de `noche` y `matriz`
- **Uso**: portada o separador de charlas de robótica/ROS 2 y fondo HUD de `noche`. En diapositiva, con contactos rotulados («obstáculo 2,4 m»), sirve como diagrama de percepción.
- **Marcado**: `<div class="fx-bg" data-fx="radar" data-seed="3" data-contacts="5"></div>`. También puede registrarse como `Motor.painters.noche_radar`, y `backdrop` escogería según `data-painter`.
- **Tokens**:
  - Anillos y marcas: `fg-3` (alfa 0.25–0.5).
  - Línea del barrido: `accent`.
  - Estela: gradiente cónico de `accent` (alfa 0.35 → 0).
  - Contactos: `fg`, más uno en `err` con la palabra «contacto».
  - En `matriz` todo se dibuja con `ledSprite` sobre la retícula de 15 px y el contacto en `accent` (el rojo de señal).
- **render**: barrido congelado en un ángulo fijo (p. ej. −35°), con estela completa, todos los contactos en su posición «recién barrida» y anillos completos.
- **play**: `api.raf` a 30 fps con el `throttle` de fondos.js. Ángulo = t·0.9 rad/s; el brillo de cada contacto decae como `exp(-(ángulo desde la última pasada)/τ)` y su posición deriva despacio con `noise2`.
- **Reduced motion**: queda el fotograma de `render`.
- **Reutilización**: el barrido de `ros.js/lidar` se puede extraer a un helper común.

### 2. Topography → `Motor.painters.aurora` alternativo («topo») y fondo de portada de `nube`
- **Idea**: rehacerlo sin port.
  - Campo de alturas de 192×108 con `api.noise2` (dos octavas más un warp, como `relief()`).
  - `d3.contours().thresholds(22)`.
  - Proyección de cada anillo con una inclinación de unos 32° (y' = horizonte + (y·cosθ)/(1 + y·sinθ·k)) para dar la vista 3D en perspectiva.
  - Con inclinación 0 queda el mapa topográfico plano, ideal para `suizo` en claro.
- **Tokens**:
  - Curvas menores: `fg-3`, alfa 0.35.
  - Curvas maestras (cada 5): `accent` en aurora y suizo.
  - En `nube`, color por cota con `api.seq()`, que encaja con el «coloreado por altura».
  - Niebla: degradado hacia `bg` en el horizonte.
- **render**: `t = 4`, cámara quieta, todas las curvas dibujadas.
- **play**: avance de la cámara (desplazamiento del muestreo en y) y un `morph` lento. Se recalculan los contornos cada fotograma a 20–30 fps; d3.contours sobre unas 20 000 celdas tarda unos 2–4 ms.
- **Composición**: en portada, el terreno ocupa el 55 % inferior derecho y deja la columna del título limpia, como hace `noche`.

### 3. Threads → pintor alternativo de `suizo` y `aurora` (`hilos`)
- **Marcado**: `data-fx="backdrop"` con `data-painter="hilos"`, o un fx `hilos` para portadas.
- **Dibujo**: N = 60 polilíneas de 120 puntos. Hasta `split + i/N·fray` van juntas y a partir de ahí se desvían con `noise2(t·0.25 + seed, x·waves + i/N)`. El grosor baja de 2,5 px a 0,5 px y el alfa decrece con `pow(i/N, 0.3)`.
- **Tokens**: color = `mix(fg-3, accent, i/N)`. En suizo solo las 3 últimas van en `accent` y el resto en `fg-2`, por el contraste de extensión. En aurora se usa `api.cats(3)` por terciles.
- **render**: fotograma fijo con t = 4.
- **play**: avanza t a 0.6×. Una polilínea de 2D cuesta poco: 60 × 120 puntos a 60 fps sin problema.
- **Ángulo**: se rota unos 25° como el original, con el haz entrando por abajo a la izquierda, para no tapar el título.

### 4. MagnetLines → fx `campo` (diagrama de campo vectorial, no fondo)
- **Uso**: descenso de gradiente sobre una superficie de pérdida (ML), campos de potencial atractivo/repulsivo para navegación (ROS), flujo óptico.
- **Marcado**: `<div data-fx="campo" data-campo="potencial">` con fuentes, sumideros y obstáculos en `data-*`.
- **Tokens**:
  - Segmentos en `api.seq()` por magnitud, con leyenda «magnitud».
  - Fuentes en `accent` y obstáculos en `err` con la palabra «obstáculo».
  - Texto en `fg-2`.
- **render**: segmentos orientados al campo final.
- **play**: con `api.tween`, los segmentos giran desde `baseAngle` hasta su orientación, con un retardo por distancia (la «ripple» del original). Después, una partícula de prueba sigue el campo y deja estela.
- Sobra todo lo del puntero.

### 5. Scanner → pintor alternativo de `noche`
- **Port**: el sombreador es de una sola pasada y sin FBO: contornos de `signal(p,t)` como bandas, un haz de barrido con estela, scanlines y viñeta. Se baja a GLSL 1.0 y se usa `glLayer`/`program`/`drawFull` de fondos.js sin cambios.
- **Uniforms**: `uAcc = lin(accent)`, `uAcc2 = lin(accent-2)` y `uDark`, con `fg-3` para las bandas sin barrer.
- **render**: barrido congelado al 60 %.
- **play**: `uSweep` avanza con un periodo de 6 s.
- Sobran los pings y la lente del ratón.
- **Pega con el mood**: «líneas de barrido y neón contenido».

### 6. PatternWaves / PixelBlast → semitono para `matriz` (elegir uno)
- **Dibujo**: reutiliza `ledSprite` y la retícula de 15 px de `P.matriz`. Para cada LED, la luz es `h = noise2(x·k + t·0.1, y·k)` iluminada con una normal aproximada, y el sprite se dibuja con alfa `h` (o con tamaño ∝ h, como en PatternWaves). Si se quiere el aire de PixelBlast, se cuantiza con Bayer 4×4.
- **Tokens**: `fg` y `accent`, con un único LED rojo de señal.
- **render**: t fijo.
- **play**: deriva lenta a 30 fps.
- **Coste**: S–M, más barato que cualquier port del original.

## Observaciones transversales

- **Patrón de port uniforme**:
  - `useEffect` → `render`/`play`/`stop`.
  - `settingsRef` y las props → `data-*` en el `.fx-bg` más tokens.
  - `lightMode` → `api.dark`. Casi todos usan `uLightMode` para invertir a «tinta», y conviene conservar esa lógica.
  - `intro` → solo en `play()`, con `uIntro = 1` en `render`.
  - `reduced` → no llamar a `play`.
  - El «wake»/IntersectionObserver sobra: el motor ya solo anima la diapositiva activa.
  - Puntero, clic, `clickPulse` y `burst` se quitan todos. Donde aportaban, se sustituyen por un evento automático en `play` (p. ej. el `autoRipple` de RippleGrid).
- **WebGL2 frente a WebGL1**: hay que decidir una vez si fondos.js admite un `glLayer2` (canvas aparte con `webgl2`). Si no, cada sombreador hay que bajarlo a mano. El bloqueo real está en `texelFetch`, `gl_VertexID`/`gl_InstanceID`, `uint` y MRT (`layout(location=1)`, como en Topography).
- **Color**: los componentes reciben hex por props y hacen `pow(c, 2.2)` en JS. Eso equivale al `lin(api.tok(...))` de fondos.js, así que el cambio es directo. Las paletas coseno o espectrales (SoftAurora, Prism, PrismaticBurst) no se pueden pasar a tokens sin perder su gracia.
- **Coste a 1920×1080**: los que hacen raymarching o volumen (LightPillar, Plasma, PrismaticBurst con blur) necesitarían el `glScale` con techo y el `throttle` a 20–30 fps, como `cromo`/`arcilla`. Aun así se pisarían con lo que ya hay.
- **Duplicados con lo que ya existe**:
  - LiquidChrome duplica a `cromo`.
  - Particles duplica a `nube` y a las estrellas de `noche`.
  - MagicRings duplica a los arcos de `suizo`.
  - Silk, Plasma y SoftAurora duplican a las manchas de `rice`.
  - Lo que de verdad falta en el motor son **líneas finas generativas** (Threads, Topography) y **HUD de instrumento** (Radar, Scanner), y esos son los recomendados.
- **Simulaciones con estado** (LiquidEther, LiquidChrome, MicroSlats, PixelSnow con acumulación): no tienen `render()` estático reproducible sin precalentar N pasos. Se descartan.
