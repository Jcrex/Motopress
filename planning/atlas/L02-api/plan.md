# L02-api · API de efectos

Lo que recibe un efecto en api y las utilidades globales Motor.color, Motor.util y Motor.gl.

Deck: `atlas/completo/index.html`. Diapositivas con id `l02-<componente>`. Estado de cada componente en `atlas.db` (`explicado`, `diapositivas`).

## Diapositivas del lote

1. `l02-titulo`: título del lote con la lista de sus demos y el id de cada una.
2. `l02-api-dom`: api.q, api.qa y api.el
3. `l02-api-tokens`: api.tok y estado del estilo
4. `l02-api-series`: api.cats, api.seq y api.div
5. `l02-api-font`: api.font
6. `l02-api-tiempo`: api.raf, api.after, api.tween, api.dur y api.ease
7. `l02-api-canvas`: api.canvas
8. `l02-api-rng-noise`: api.rng y api.noise2
9. `l02-motor-color` … sublote [Motor.color](motor-color.md): 8 diapositivas
10. `l02-motor-util`: Motor.util
11. `l02-motor-gl`: Motor.gl
12. `l02-resumen`: resumen del lote que combina lo visto (la única diapositiva que mezcla componentes).

Total estimado: **19 diapositivas**.

## Criterios comunes de aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro

## Componentes

### `api-dom` · api.q, api.qa y api.el

- **Diapositiva:** `l02-api-dom`
- **Propósito (texto de la ficha):** Buscar elementos solo dentro de la diapositiva del efecto
- **Archivo fuente:** `engine/engine.js makeApi()`
- **Parámetros que muestra la ficha:** `metodos`: ["q(sel)", "qa(sel)", "el"]
- **Demo:** Dos listas idénticas en dos diapositivas; api.qa solo resalta las de esta
- **Aceptación propia:** El recuento de api.qa no incluye elementos de otras diapositivas

### `api-tokens` · api.tok y estado del estilo

- **Diapositiva:** `l02-api-tokens`
- **Propósito (texto de la ficha):** Leer tokens CSS del estilo activo y saber estilo, modo y metadatos
- **Archivo fuente:** `engine/engine.js makeApi()`
- **Parámetros que muestra la ficha:** `metodos`: ["tok(nombre, desde?)", "dark", "style", "meta"]
- **Demo:** Tabla en vivo de api.tok para bg, fg, accent, ok, warn, err con su muestra, más api.style, api.dark y api.meta.name
- **Aceptación propia:** Los valores cambian al cambiar de estilo y modo

### `api-series` · api.cats, api.seq y api.div

- **Diapositiva:** `l02-api-series`
- **Propósito (texto de la ficha):** Obtener colores de series categóricas, rampas secuenciales y divergentes del estilo
- **Archivo fuente:** `engine/engine.js makeApi() ramp()`
- **En el Atlas original:** `#paletas` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `metodos`: ["cats(n=6)", "seq(t)", "div(t)", "ramp(prefijo, t)"]
- **Demo:** Barras con api.cats(6), rampa con api.seq de 0 a 1 y rampa con api.div de 0 a 1
- **Aceptación propia:** Seis series en orden cat-1…cat-6 y rampas continuas

### `api-font` · api.font

- **Diapositiva:** `l02-api-font`
- **Propósito (texto de la ficha):** Componer la fuente de canvas con la familia del estilo
- **Archivo fuente:** `engine/engine.js makeApi()`
- **Parámetros que muestra la ficha:** `firma`: font('mono'\|'text'\|'display'\|'serif', tamaño, peso=400)
- **Demo:** Cuatro líneas en canvas con api.font para display, text, mono y serif
- **Aceptación propia:** Cada línea usa la familia del estilo activo

### `api-tiempo` · api.raf, api.after, api.tween, api.dur y api.ease

- **Diapositiva:** `l02-api-tiempo`
- **Propósito (texto de la ficha):** Animar con bucles y temporizadores que el motor cancela solo al salir, con la duración y la curva del estilo
- **Archivo fuente:** `engine/engine.js makeApi() stopAll()`
- **Parámetros que muestra la ficha:** `metodos`: ["raf(fn(t, dt) → false para parar)", "after(ms, fn)", "tween(ms, fn(e, p), {delay, ease})", "dur", "ease(t)"]
- **Demo:** Tres pistas: raf (punto en bucle), after (marca a los 800 ms) y tween (barra con api.ease); duración api.dur escrita
- **Aceptación propia:** Al salir de la diapositiva los bucles se paran (sin trabajo en segundo plano)

### `api-canvas` · api.canvas

- **Diapositiva:** `l02-api-canvas`
- **Propósito (texto de la ficha):** Crear un canvas 2D nítido a la densidad de píxeles y escala actuales
- **Archivo fuente:** `engine/engine.js makeApi()`
- **Parámetros que muestra la ficha:** `devuelve`: ["cv", "ctx", "w", "h", "ratio"]
- **Demo:** Canvas con líneas de 1 px y el ratio devuelto escrito
- **Aceptación propia:** Las líneas se ven nítidas a la escala actual

### `api-rng-noise` · api.rng y api.noise2

- **Diapositiva:** `l02-api-rng-noise`
- **Propósito (texto de la ficha):** Aleatoriedad determinista por semilla y ruido 2D suave para datos y fondos reproducibles
- **Archivo fuente:** `engine/engine.js rng() noise2()`
- **Parámetros que muestra la ficha:** `metodos`: ["rng(seed) → () ⇒ [0,1)", "noise2(seed) → (x, y) ⇒ [0,1]"]
- **Demo:** Puntos de api.rng con semilla fija junto a un campo de api.noise2 en escala seq; selector de dos semillas
- **Aceptación propia:** La misma semilla da el mismo dibujo al recargar

### `motor-color` · Motor.color

- **Diapositiva:** `l02-motor-color` (sublote, ver [motor-color.md](motor-color.md))
- **Propósito (texto de la ficha):** Color perceptual: OKLab/OKLCH, mezcla, contraste WCAG, simulación de daltonismo y distancia ΔE
- **Archivo fuente:** `engine/engine.js color`
- **En el Atlas original:** `#color-teoria` (reutilizar su marcado como punto de partida)
- **Parámetros que muestra la ficha:** `variantes`: ["parse/hex", "oklab/oklch/fromOklch", "mix", "contrast + wcag", "sim protan/deutan", "dE/cvd", "alpha"]
- **Demo:** una diapositiva por variante, ver [motor-color.md](motor-color.md)

### `motor-util` · Motor.util

- **Diapositiva:** `l02-motor-util`
- **Propósito (texto de la ficha):** Utilidades numéricas comunes: curvas bezier CSS, clamp y lerp
- **Archivo fuente:** `engine/engine.js util bezier()`
- **Parámetros que muestra la ficha:** `metodos`: ["bezier(str)", "clamp(v, a, b)", "lerp(a, b, t)"]
- **Demo:** Curva bezier(api.tok("ease")) dibujada y ejemplos de clamp y lerp con sus resultados
- **Aceptación propia:** La curva es la del estilo activo

### `motor-gl` · Motor.gl

- **Diapositiva:** `l02-motor-gl`
- **Propósito (texto de la ficha):** Capa WebGL2 con respaldo a WebGL1 para pintores y efectos con sombreadores
- **Archivo fuente:** `fx/fondos.js glLayer() program()`
- **Parámetros que muestra la ficha:** `metodos`: ["layer(s, scale)", "program(L, key, vs, fs)", "uniforms", "drawFull", "scale", "throttle", "VS_FULL", "VS_FULL2"]; `regla`: #version 300 es solo con WebGL2
- **Demo:** Sombreador mínimo GLSL 3.00 con Motor.gl.layer/program/drawFull y una etiqueta WebGL2/WebGL1/2D según lo obtenido
- **Aceptación propia:** Sin WebGL muestra la etiqueta de respaldo, sin error
