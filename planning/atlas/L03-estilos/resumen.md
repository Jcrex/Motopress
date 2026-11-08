# L03 · Resumen

Cerrado el 2026-11-08. Son 14 de 14 componentes explicados en 16 diapositivas: título, diez estilos, tokens de color, forma y movimiento, paletas de gráficos, metadatos y un resumen con los diez estilos a la vez.

## Archivos

- `atlas/completo/src/l03.html`. Incluye `<template id="ac-plantilla-estilo">`, la maqueta de la vista previa (panel con lectura, barras cat-1…6, entradilla, fichas de estado y terminal).
- `atlas/completo/lotes/l03.js`: efectos `ac-estilo`, `ac-roles`, `ac-forma`, `ac-paletas-src`, `ac-meta` y `ac-resumen-estilos`.
- `atlas/completo/lotes/l03.css`.

## Cómo se muestra cada estilo

Cada vista previa es una `.slide` anidada e inerte, con `data-style` y `data-theme` propios y el decorado clonado de la diapositiva. Como `tokens.css` y `styles.css` se aplican por atributo, la vista previa muestra el estilo real con sus paneles, títulos, decorado y fuentes, aunque el deck esté en otro estilo. Debajo van el ambiente, la armonía, las fuentes y la nota de movimiento de `themes/meta.js`.

Limitaciones:

- Las 3 reglas de `styles.css` que dependen de `:root` (ajustes de cromo en claro, de arcilla en oscuro y de térmica en claro) no se aplican en la vista previa.
- El fondo de portada de cada estilo no se dibuja aquí; está en L08.

## Verificación

- `verificar.mjs` en suizo y noche, claro y oscuro: sin desbordes.
- `recorrer.mjs` desde `l03-titulo` en suizo y noche, y con movimiento reducido en arcilla y térmica: sin errores.
- En las 20 vistas previas (10 estilos × claro y oscuro), `--bg` y `--font-display` calculados coinciden con `MOTOR_STYLES[i].modes[modo].roles.bg` y `fontNames.display`.

## Hallazgos

- **El ajuste de `build-themes` se ve con cifras.** En noche, la paleta de origen (Tokyo Night) tiene un ΔE mínimo entre vecinas de 1,3 con daltonismo; tras el ajuste sube a 19,6, y el rango de luminosidad baja de 0,101 a 0,002. En suizo, el ΔE pasa de 13,0 a 18,8.
- **`ok` y `warn` no siempre llegan a AA como texto normal.** En suizo claro dan 3,7 y 3,3 («AA grande»). Por eso la regla de los estados exige siempre una palabra al lado y no fiarlo todo al color.
- **`meta.js` es más rico de lo que usaban los efectos.** Tiene, por modo, los nombres originales de la paleta (`names`: «mauve», «papel»…) y `sourceCats`. Ahora los muestran `l03-tokens-color` y `l03-paletas-graficos`.
