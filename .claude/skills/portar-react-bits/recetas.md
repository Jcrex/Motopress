# Recetas: de react-bits al motor, por técnica

Cada sección empieza por `## <técnicas>`: la herramienta `rb_tecnica` la busca por esas palabras. Las técnicas de un componente salen en `rb_ficha` («Técnicas detectadas»).

## webgl glsl · WebGL crudo y shaders

Destino habitual: pintor de fondo (`Motor.painters['exp-x'] = { init(s), frame(s, api, t, still) }`, se usa con `data-painter`) o una capa dentro de un efecto.

- **El shader de fragmento se reutiliza casi tal cual** (`rb_codigo … shaders`). El de vértices no: el motor dibuja un triángulo que cubre la pantalla con su propio `VS_FULL`, cuyo atributo se llama `p`. `Motor.gl.program()` usa `VS_FULL2` solo si el fragmento empieza por `#version 300 es`.
- **Uniforms:** `Motor.gl.drawFull(L, pg, { … })` envía números, `vec2`, `vec3`, `vec4` y listas planas de `vec3` (`uRamp[8]` → 24 números). **No envía enteros:** cambia `uniform int uCount` por `uniform float uCount` y usa `int(uCount)` dentro.
- **Colores:** las props de color (`colors`, `color1`, `background`…) pasan a tokens: `Motor.color.parse(api.tok('accent'))` da `[r, g, b]` en 0–1; `api.cats(n).map(Motor.color.parse)` para paletas. Lee los tokens en cada `frame` (cambian con el estilo y el modo).
- **Ratón** (`uMouse`, `uPointer`, `uStir`…): sustitúyelo por una trayectoria lenta en el tiempo (`0.5 + 0.3 * vec2(sin(t*.2), cos(t*.17))`) o por la semilla `s.seed`; nunca dejes el uniform sin valor.
- **Tiempo:** `t` en segundos; con movimiento reducido el motor llama con `still = true` y un `t` fijo: el dibujo debe quedar bien quieto.
- **Resolución:** `devicePixelRatio` y `ResizeObserver` sobran. `Motor.gl.layer(s, Motor.gl.scale(s, 0.6, 1))` crea la capa a escala; los shaders caros, a 0,5–0,6.
- **Coste:** `if (Motor.gl.throttle(s, t, still, 24)) return;` limita a 24 imágenes por segundo.
- **Respaldo 2D obligatorio:** si `program()` devuelve `null` (sin WebGL o con un GLSL 3.00 sin WebGL2), dibuja algo digno con `s.ctx` (degradado o formas con `api.tok`).
- **Columna del título:** los fondos de portada dejan libre la zona izquierda (unos 900 px) o la oscurecen.
- Trampas: interpolaciones `${…}` de JavaScript dentro del shader (constantes como `${MAX_COLORS}`): sustitúyelas por el número; `precision` obligatoria en GLSL 1.00; `texture2D` → `texture` en 3.00.

## ogl · librería ogl

ogl es una capa fina sobre WebGL: `Renderer` → `Motor.gl.layer`; `Program({ vertex, fragment, uniforms })` → `Motor.gl.program` con el fragmento original; `Mesh(gl, { geometry: new Triangle(gl) })` → `Motor.gl.drawFull`; `uniforms.uTime.value = t` → la clave en el objeto de `drawFull`. Si usa geometría propia (`Plane` con muchos vértices, instancias), el triángulo de pantalla no basta: escribe un efecto con su propio búfer o descártalo. Después, aplica la receta `webgl`.

## three · three.js

Pesado (unos 600 KB) y con su propio bucle. Solo si el efecto es la protagonista del deck: cárgalo por CDN con versión fija en el deck (no en el motor) y crea un efecto con `render()` que construya la escena una vez y dibuje un fotograma final. Antes, comprueba si un shader de pantalla completa da el mismo resultado (muchos fondos de three son un plano con un shader).

## canvas2d · canvas 2D

- En un efecto: `const { ctx, w, h } = api.canvas(host)` crea o reutiliza el lienzo con la escala correcta; dibuja el estado final en `render()` y anima en `play()` con `api.raf((t) => …)`.
- En un pintor de fondo: `s.ctx`, `s.w`, `s.h` ya existen.
- Colores con `api.tok()`, `Motor.color.alpha(color, a)` para transparencias; texto con `api.font('mono', 22, 500)`.
- Aleatoriedad: `api.rng(semilla)`, nunca `Math.random()` (las capturas deben repetirse); ruido con `api.noise2(semilla)`.

## motion · motion/react (framer-motion)

No hay React: lo que hace `motion` se traduce a WAAPI (`el.animate(frames, opciones)`) o a transiciones CSS.

- `initial`/`animate`/`exit` → dos fotogramas de `el.animate([…], { duration: api.dur, easing: getComputedStyle(el).getPropertyValue('--ease'), fill: 'backwards' })`.
- `AnimatePresence` con rotación de elementos → muestra uno y oculta el resto con clases; el cambio, por pasos (`data-step`) o con `api.after(ms, …)` en bucle mientras la diapositiva está activa.
- Muelles (`type: 'spring'`) → la curva `--ease` del estilo (cada estilo tiene la suya); no copies la rigidez y el amortiguamiento.
- `staggerChildren` → `delay: i * paso` en cada hijo.
- `whileInView`/`useInView` → el evento `motor:enter`.
- `layout`/`layoutId` → casi nunca hacen falta en una diapositiva fija; descártalos.

## gsap splittext scrolltrigger · GSAP

GSAP y SplitText ya se cargan en el motor por CDN. `gsap.to/from/timeline` se conservan dentro de `play()`, comprobando `if (!window.gsap || api.reduced) return;`. `SplitText` sirve igual (y `Motor.titleFx` ya parte títulos). `ScrollTrigger` no tiene sentido sin scroll: su progreso pasa a ser el tiempo desde `motor:enter` o el número de paso.

## svg filtro-svg · SVG y filtros

Se conserva el marcado SVG; los `fill`/`stroke` literales pasan a `var(--…)` en `style` o a `api.tok()`. Los filtros (`feTurbulence`, `feDisplacementMap`) funcionan igual; anima sus atributos con `api.tween` o WAAPI. Los `id` de filtros y degradados deben ser únicos por diapositiva (prefijo con el `id` de la sección).

## css-animacion · CSS y @keyframes

Copia el CSS del original (`rb_codigo … css`) a un archivo junto al port o al `deck.css`, con:
- clases con prefijo propio (`exp-x-…`) para no chocar con el motor ni con los decks;
- colores literales → `var(--accent)`, `var(--fg-2)`…;
- tamaños de texto ≥ 22 px;
- la animación solo dentro de `.slide.is-active` (si no, corre en las diapositivas ocultas) y anulada con `@media (prefers-reduced-motion: reduce)`.

## raton hover clic arrastre scroll teclado · interacción

El motor se presenta, no se manipula. Para cada evento de `rb_codigo … eventos`, elige una de tres salidas y anótala en la cabecera del port:

| Interacción en el original | En el motor |
|---|---|
| Decorativa (el efecto «sigue» al cursor) | trayectoria lenta en el tiempo o punto fijo según la semilla |
| Dispara un cambio (clic, hover que revela) | un paso: `data-step` en el elemento, y `step(api, n)` o el evento `motor:step` |
| Es la esencia (arrastrar, dibujar, scroll que conduce todo) | descartar el componente y anotar el motivo en `atlas.db` |

## raf visibilidad resize · ciclo de vida de React

- `useEffect(() => { … return () => cleanup }, [])` → `render()` (montaje) y `stop()` (limpieza).
- `requestAnimationFrame` propio → `api.raf((t, dt) => …)` en efectos: `t` son **milisegundos** desde que empezó y `dt` los del último fotograma; devolver `false` lo detiene; se cancela solo al salir. En pintores, `frame(s, api, t, still)` recibe `t` en **segundos**.
- `setTimeout`/`setInterval` → `api.after(ms, fn)`.
- `IntersectionObserver` → `motor:enter` / `motor:leave`.
- `ResizeObserver` → nada: el lienzo mide siempre 1920×1080.
- `useState` que cambia con el tiempo → variables locales del efecto o atributos `data-*` que `render()` lee.

## matter · física

matter-js no está en el motor. Opciones: precalcular la simulación con `api.rng` y reproducirla como animación, o descartar el componente.

## webgpu · WebGPU

No se porta: el motor no depende de WebGPU. Si el efecto lo merece, busca un shader GLSL equivalente.
