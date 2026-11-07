# Lote `backgrounds-a`: react-bits/src/content/Backgrounds (A–L)

32 componentes: AcidSquares … Lightning. Los he comparado con los pintores que ya existen: `Motor.painters` en `fx/sistema.js` (rice, noche, suizo, aurora, todos en canvas 2D) y en `fx/fondos.js` (cromo, arcilla y nube en WebGL1 con respaldo 2D; termica, celula y matriz en 2D).

## Contexto técnico común (importante para el coste)

- Casi todo el lote se ha **reescrito sin dependencias**: WebGL2 crudo (`#version 300 es`) más un canvas 2D auxiliar que solo sirve para leer colores CSS. Solo usan dependencias **AeroShards** (`vgpu`, que es WebGPU), **ColorBends** y **Hyperspeed** (`three`) y **EvilEye** (`ogl`).
- Todos siguen el mismo patrón: `uTime`, `uReveal`/intro de unos 2–3 s, `lightMode`, `IntersectionObserver`, `prefers-reduced-motion`, el ratón como uniform y clics que lanzan «pings», «swirls» o «strikes». Para el motor hay que hacer cuatro cosas: quitar el ratón, fijar `uReveal=1` y un `t` determinista en `render()`, sustituir las props de color por tokens y aplicar el throttle a 30 fps.
- **Choque con `glLayer` del motor**: el motor pide `getContext('webgl')` (WebGL1). Estos sombreadores usan `out vec4`, `textureGrad` y `dFdx` sin extensión, así que hay dos salidas: añadir un `glLayer2` con `webgl2` y `preserveDrawingBuffer:true`, o bajar el GLSL a la versión 100 (con `OES_standard_derivatives` donde haga falta).
- **No existe un mecanismo de «painter alternativo»**: `backdrop` elige `painters[api.style]`. Para tener variantes haría falta, por ejemplo, `data-painter="gridscan"` en la sección (que `backdrop` lea `painters[el.dataset.painter] || painters[api.style]`) o registrar el pintor como `Motor.fx` de portada independiente. Ese cambio es pequeño, pero toca `fx/sistema.js`.
- **Licencia (Commons Clause)**: los sombreadores son la parte «portable» y justo la que no conviene copiar literalmente en un motor reutilizable. Recomiendo **reescribirlos desde cero tomando la idea** (todas las técnicas son estándar: simplex/value noise, isolíneas con derivadas, raytrace analítico de una caja, atlas de glifos, Bayer). DarkVeil no admite reescritura limpia: sus pesos de CPPN son el propio componente.

## Tabla

Valor: 0–3. Coste: S/M/L/XL.

| Componente | Qué hace | Técnica | Valor | Estilos que encajan (chocan) | Coste | Veredicto |
|---|---|---|---|---|---|---|
| AcidSquares | Campo de baldosas brillantes que ondula bajo dos luces de color | WebGL2, malla con relieve e iluminación | 2 | cromo, arcilla (suizo, celula) | L | QUIZÁ |
| AeroShards | Cintas de esquirlas de vidrio en capas con marcadores de topógrafo | **WebGPU** vía `vgpu`, bloom | 2 | cromo, nube | XL | DESCARTAR |
| Antigravity | Partículas que forman un anillo alrededor del cursor | WebGL2 instanciado | 1 | aurora (todos: sin cursor no tiene sentido) | M | DESCARTAR |
| Aurora | Banda de aurora suave en el borde superior (simplex, rampa OKLCH, hasta 3 capas) | WebGL2, un pase | 2,5 | aurora, noche, rice (suizo, matriz) | S–M | IMPLEMENTAR |
| Balatro | Pintura en remolino pixelada (el sombreador del juego) | WebGL2 | 1 | rice como mucho (casi todos: identidad ajena muy fuerte) | M | DESCARTAR |
| Ballpit | Foso de bolas con física que se empujan con el cursor | WebGL2 + física propia | 1 | arcilla (resto) | L | DESCARTAR |
| Beams | Cintas satinadas que ondulan en la oscuridad con brillo especular | WebGL2 | 2 | cromo, noche (suizo, celula) | M | QUIZÁ |
| ColorBends | Bandas de color fluidas y vivas | three.js (un plano y un sombreador) | 1,5 | rice, aurora | M | DESCARTAR (Grainient lo cubre) |
| CRTWarp | Plasma en bloques sobre un CRT curvo con scanlines, máscara de fósforo y persistencia | WebGL2 multipase (persistencia y bloom) | 2 | noche, matriz (suizo, arcilla) | M–L | QUIZÁ |
| DarkVeil | Velo sedoso generado por una **CPPN** (red neuronal de pesos fijos) | WebGL2 | 2 (en charlas de ML) | noche, aurora | S–M | QUIZÁ (colores fijos y pesos con licencia) |
| Dither | Ondas con tramado Bayer, semitono o ruido en paleta reducida | WebGL2 | 2 | matriz, noche, termica (aurora, cromo) | M | QUIZÁ |
| DotField | Campo de puntos en degradado con una lente que sigue al cursor | WebGL2 | 1,5 | suizo, matriz | S | DESCARTAR (duplica matriz y la lente necesita cursor) |
| DotGrid | Rejilla de puntos elástica que se arrastra con el cursor | WebGL2 + muelles | 1 | matriz | M | DESCARTAR |
| EvilEye | Ojo procedural con pupila de gato y llamas | ogl | 0,5 | — | M | DESCARTAR |
| FaultyTerminal | Terminal CRT de glifos que parpadean, con glitches y persistencia | WebGL2 | 2,5 | noche, matriz (suizo, arcilla, celula) | M | IMPLEMENTAR |
| Ferrofluid | Mar brillante de ferrofluido con picos | WebGL2 con bucles de hasta 64 pasos | 2,5 | **cromo** (resto) | L | QUIZÁ |
| FloatingLines | Haces de líneas finas luminosas que ondulan en tres bandas con profundidad de campo | WebGL2 | 2,5 | aurora, rice, noche (suizo, matriz) | M | IMPLEMENTAR |
| FluxLines | Isolíneas luminosas de un campo de ruido fluido («fluido magnético») | WebGL2, `dFdx` | 3 | **aurora** (sus «curvas de nivel»), noche, celula | M | IMPLEMENTAR |
| Galaxy | Vuelo por un campo de estrellas en capas con saltos warp | WebGL2 | 2 | noche (suizo, arcilla) | M | QUIZÁ |
| GhostFibers | Cintas de fibras luminosas con profundidad de campo y partículas | WebGL2 multipase, unas 1100 líneas | 2 | aurora, cromo | L | QUIZÁ |
| GradientASCII | Brillos en degradado dibujados con caracteres ASCII | WebGL2 + atlas de glifos (`textureGrad`) | 2,5 | noche, **rice** (terminal de Hyprland), matriz | M | IMPLEMENTAR |
| GradientBlinds | Persianas satinadas en degradado iluminadas por un foco | WebGL2 | 1,5 | cromo, rice | M | DESCARTAR |
| GradientWaves | Olas satinadas que avanzan desde un horizonte con bruma (heightfield con raymarch) | WebGL2, 128 pasos | 2 | noche (ya tiene horizonte), aurora | L | QUIZÁ |
| Grainient | Degradado fluido con grano (lineal o radial, rampa de hasta 8 colores) | WebGL2, un pase | 2 | aurora, rice, nube; sirve de base neutra en cualquier estilo | S | IMPLEMENTAR |
| GridDistortion | Imagen que se rompe en bloques bajo el cursor | WebGL2 + textura | 0,5 | — | M | DESCARTAR |
| GridMotion | Muro inclinado de baldosas (texto o imágenes) que se desliza | DOM + CSS 3D + rAF | 2 | suizo, rice, matriz | S | QUIZÁ (alto) |
| GridScan | Habitación 3D de rejilla recorrida por un láser de escaneo, con pings | WebGL2, raytrace analítico de una caja (barato); trae webcam con face-api y giroscopio opcionales | 3 | **noche**, **nube**, matriz (arcilla, celula) | M | IMPLEMENTAR |
| Hyperspeed | Autopista nocturna de estelas de luz que entra en hiperespacio | three.js | 1,5 | noche | L–XL | DESCARTAR |
| Iridescence | Superficie líquida iridiscente con pliegues | WebGL2 | 1,5 | cromo (Y3K) | S–M | QUIZÁ (bajo: la rotación de tono no casa con los tokens) |
| LetterGlitch | Campo de letras que parpadean y se corrompen en color | WebGL2 + atlas | 1,5 | matriz, noche | M | DESCARTAR (GradientASCII y FaultyTerminal lo cubren mejor) |
| Lightfall | Estelas de luz que caen por un túnel curvo | WebGL2 | 1,5 | noche, aurora | M–L | DESCARTAR |
| Lightning | Rayos ramificados que crepitan | WebGL2 | 1,5 | noche (resto) | M | DESCARTAR (como mucho, una divisoria dramática) |

**Total**: IMPLEMENTAR 7 · QUIZÁ 12 · DESCARTAR 13.

## Top recomendados (por valor/coste)

En todos el patrón es el mismo: `render()` dibuja un fotograma con `t` fijo (p. ej. 4, como `backdrop`) y `uReveal=1`; `play()` usa `api.raf` con throttle a 30 fps y, si hay intro, sube `uReveal` de 0 a 1 con `api.tween`; con `api.reduced` no hay intro y el fotograma queda quieto. Uniforms de color con `lin(api.tok(...))`.

1. **GridScan → `Motor.painters.noche` alternativo y portada para nube** (valor 3, M)
   - Nombre: pintor `escaner` (o `data-painter="escaner"`). Encaja con el mood FUI y HUD de noche («líneas de barrido») y con el gemelo digital de nube (un barrido LiDAR por una sala). El noche actual es una retícula synthwave 2D con horizonte: GridScan es la versión 3D y más sobria.
   - Tokens: rejilla con `line-2`/`fg-3`, láser con `accent`, núcleo con `fg`, reflejo del suelo con `accent-2`; en claro, `uLight=1` (sombra en vez de brillo).
   - `render`: sala completa con el láser congelado a mitad del recorrido (`uScanZ = depth*0.45`) y su estela. `play`: barrido de `scanDuration` 2,4 s y pausa de 1,6 s en bucle, más un ping con `api.after` al entrar (sustituye al clic). Hay que eliminar la webcam, face-api, el giroscopio y el paralaje de cursor. Es barato: sin bucles de march, cabe a escala 1.

2. **FluxLines → `Motor.painters.aurora` alternativo** (valor 3, M)
   - El mood de aurora dice literalmente «curvas de nivel» y el pintor actual hace un campo de flujo con partículas que se acumula entre fotogramas (no es determinista y depende de 170 pasos de precalentado). Las isolíneas de un ruido que fluye dan el mismo «orgánico y lento» y además son deterministas para un `t` dado.
   - Nombre: `isolineas`. Tokens: color por banda con `api.cats(3)` (cat-1…3 en orden fijo), brillo atenuado con `api.dark`, fondo transparente.
   - `render`: un fotograma con `t=4`. `play`: avance lento (`speed` 0,3). Al entrar se puede hacer un swirl con `api.after(600)` que sustituya al imán del cursor, y en la mitad izquierda hay que atenuar con una máscara (como hace el aurora actual con `p.x < w*0.45`). Hace falta WebGL2 o `OES_standard_derivatives`.

3. **Grainient → fondo de portada «grano» genérico** (valor 2, S)
   - Un sombreador de un pase sin estado. Sirve de base para `.cover` y `.divider` en estilos sin pintor potente (suizo en oscuro, rice), y como textura de «vidrio esmerilado y grano» de aurora.
   - `data-fx="grano"` o pintor `grano`. Tokens: rampa `bg → accent-2 → accent` (o `api.seq()` para un degradado ordenado) y grano proporcional a `api.dark`.
   - `render`: degradado y grano quietos. `play`: flujo lento; el grano animado se apaga con `api.reduced`.

4. **Aurora → banda de portada** (valor 2,5, S–M)
   - Banda en el borde superior (o inferior con `direction`) que deja libre el centro para el título. Es muy legible. No duplica el aurora-pintor (partículas), sino que lo complementa en portadas y divisorias.
   - `data-fx="velo-aurora"`. Tokens: paradas de rampa `cat-1, cat-2, cat-3` (o `accent`, `accent-2`, `accent-3`). En claro, limitar la luminancia como ya hace (`uLightMode`).
   - `render`: la banda completa (`uReveal=1`). `play`: la banda baja desde -0,25 en unos 2,4 s y después ondula.

5. **FloatingLines → divisorias de rice, aurora y noche** (valor 2,5, M)
   - Tres bandas de líneas finas con profundidad de campo: es elegante y no compite con el texto. Pega en divisorias de sección.
   - `data-fx="hilos"`. Tokens: degradado de línea `accent → fg` (o `accent-2` en rice), mezcla `screen` en oscuro y `multiply` en claro.
   - `render`: posiciones con `t` fijo. `play`: deriva y paralaje automático suave en lugar del ratón; el `clickSwirl` pasa a disparo único al entrar.

6. **GradientASCII → portada de rice/noche para charlas de Arch/Hyprland** (valor 2,5, M)
   - Brillos dibujados con caracteres: es «terminal» sin ser ilegible. Encaja en rice (riceo de Hyprland) y en noche (terminal).
   - `data-fx="ascii"`. Atlas de glifos generado en `init` con `api.font('mono', …)` (la mono del estilo). Color de glifo según `accent`/`accent-2`/`accent-3` y fondo transparente.
   - `render`: un fotograma sin flicker. `play`: flujo, flicker leve y scramble que barre una vez de izquierda a derecha al entrar (sustituye al cursor). Requiere WebGL2 por `textureGrad`, o bajarlo a `texture2D` con un LOD fijo.

7. **FaultyTerminal → alternativa de noche o matriz** (valor 2,5, M)
   - Glifos de bloque en un CRT con persistencia. Es más «terminal» que el noche actual, pero también más ruidoso, así que hay que limitarlo a la mitad derecha y bajar `brightness`.
   - Pintor `terminal`. Tinte `accent` (noche) o `fg` con un único `accent` para glitches (matriz, «un solo rojo de señal»).
   - `render`: sin glitch ni flicker. `play`: flicker y un glitch con `api.after` al cambiar de diapositiva. Se omite con `api.reduced`.

Fuera del top, pero con potencial claro:
- **Ferrofluid** para cromo, si se acepta el coste: mar de metal líquido con picos (L, sombreador caro; habría que bajar `glScale` a 0,5).
- **GridMotion** como muro de palabras clave en la portada (S: DOM y GSAP, se escribe desde cero en una hora). En `render` las filas quedan desplazadas y en `play` se deslizan.

## Observaciones transversales

- **Dependencias**: solo 4 de 32 traen `three`, `ogl` o `vgpu`, y todos ellos están descartados. Lo demás es WebGL2 crudo, así que el motor necesita un **`glLayer` con WebGL2** (con `preserveDrawingBuffer` para `verificar.mjs` y respaldo 2D si no hay contexto) antes de traer cualquiera. Conviene una sola utilidad compartida en `fx/fondos.js`.
- **Patrón de port repetido**:
  - Ratón/clic → evento automático al entrar (`api.after`).
  - `intro` → `uReveal` animado en `play` y fijado a 1 en `render`.
  - `lightMode` → `api.dark`.
  - Props de color → `lin(api.tok())`.
  - `IntersectionObserver` → sobra, porque el motor ya para con `stop()`.
  - `dpr` → `glScale(s, k, max)`.
- **Rendimiento a 1920×1080**: los sombreadores con raymarch (GradientWaves 128 pasos, Ferrofluid 64, GhostFibers multipase, CRTWarp con bloom) necesitan una escala de 0,5–0,6 como `arcilla`. GridScan, FluxLines, Grainient y Aurora aguantan a escala 0,7–1.
- **Alternativas de pintor por estilo**: un `data-painter` en `backdrop` permitiría varios fondos por estilo (noche: retícula actual o escáner; aurora: partículas o isolíneas). Es el cambio de infraestructura que más rentabiliza este lote.
- **Duplicados con lo que ya existe**: DotField, DotGrid y LetterGlitch se solapan con matriz; Galaxy, Lightfall y Hyperspeed se solapan con las estrellas y la perspectiva de noche; Iridescence, Beams y AcidSquares con cromo (que ya hace metaballs por raymarch).
- **Licencia**: todas las técnicas recomendadas son genéricas y conviene reescribirlas. DarkVeil es la excepción (los pesos de la CPPN son el componente), así que si se quiere un «fondo que es una red neuronal» para charlas de ML, lo correcto es entrenar o generar una CPPN propia.
