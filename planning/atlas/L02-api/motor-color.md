# Sublote `motor-color` · Motor.color

Parte de [L02-api](plan.md). Color perceptual: OKLab/OKLCH, mezcla, contraste WCAG, simulación de daltonismo y distancia ΔE. Fuente: `engine/engine.js color`.

## Diapositivas

1. `l02-motor-color`: título del sublote con la lista de variantes.
2. `l02-motor-color-parse-hex`: parse() y hex() con tres colores del estilo y su ida y vuelta. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
3. `l02-motor-color-oklch`: oklab/oklch/fromOklch: el acento descompuesto en L, C y h con barras. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
4. `l02-motor-color-mix`: mix() de bg a accent en siete pasos. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
5. `l02-motor-color-contraste`: contrast() y wcag() de fg, fg-2 y fg-3 sobre bg. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
6. `l02-motor-color-daltonismo`: sim() protan y deutan de cat-1…6 en tres filas. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
7. `l02-motor-color-delta-e`: dE() y cvd() entre series vecinas con su valor. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
8. `l02-motor-color-alpha`: alpha() del acento al 25, 50 y 75 %. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.

## Aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ficha` de L00)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro
- Cada variante se distingue de las demás a simple vista en las capturas
