# L02 · Resumen

Cerrado el 2026-11-08. Son 10 de 10 componentes explicados en 19 diapositivas: título, 9 componentes, el sublote `motor-color` (título y 7 variantes) y el resumen.

## Archivos

- `atlas/completo/src/l02.html`. Las 7 variantes de `Motor.color` llevan una ficha propia escrita a mano, con la firma, qué cambia y la línea de `engine/engine.js`.
- `atlas/completo/lotes/l02.js`: efectos `ac-dom`, `ac-tokens`, `ac-series`, `ac-font`, `ac-tiempo`, `ac-canvas`, `ac-azar` (con botones `data-semilla`), `ac-color` (una función por variante, según `data-variante`), `ac-util` y `ac-gl`.
- `atlas/completo/lotes/l02.css`.

## Verificación

- `verificar.mjs` en suizo y noche, claro y oscuro: sin errores ni desbordes.
- `recorrer.mjs` desde `l02-titulo`, en suizo y noche (claro y oscuro) y con movimiento reducido en cromo y matriz: sin errores.
- Comprobaciones interactivas, todas correctas:
  - la semilla 42 cambia el dibujo y la 7 lo repite píxel a píxel;
  - el sombreador obtiene WebGL2 con GLSL 3.00;
  - con WebGL desactivado (`--disable-webgl --disable-3d-apis`) muestra «respaldo 2D» sin errores;
  - el contraste fg/bg de la demo coincide con `Motor.color.contrast`;
  - `api.raf` anima y se para al salir de la diapositiva.

## Correcciones al inventario

- `noise2` devuelve valores en [−1, 1], no en [0, 1]. Corregido en `atlas.db` y en `construir_db.py`.
- `rng` tiene además `normal()`, `range(a, b)`, `int(a, b)` y `pick(lista)`. Añadido a la ficha.
- `Motor.color` no exporta `sim()`: la simulación de Machado (2009) solo se usa a través de `dE(a, b, 'protan'|'deutan')` y `cvd()`. Las variantes 5 y 6 del sublote muestran `cvd` y `dE` con simulación, en lugar de un `sim()` que no existe. Corregido en la base y en `generar_planes.py`.

## Observaciones

- En suizo, `cvd(cat-3, cat-5)` vale 0: dos series que no son vecinas son indistinguibles para protanopía o deuteranopía. Es coherente con el criterio del motor, que solo exige ΔE ≥ 8 entre vecinas, pero con más de cuatro series en un mismo gráfico conviene recordarlo. La diapositiva `l02-motor-color-daltonismo` lo muestra.
- `Motor.gl.layer` necesita un objeto `{ host, w, h, ratio }`, como el de los pintores, y añade un `canvas.gl` sin estilos. Fuera de `.fx-bg` hay que darle `position: absolute; inset: 0; width/height: 100%`.
