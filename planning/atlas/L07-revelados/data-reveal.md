# Sublote `data-reveal` · Revelados (data-reveal)

Parte de [L07-revelados](plan.md). Dar a cada paso el gesto de aparición del estilo o uno fijo. Fuente: `fx/sistema.js resolveReveals() Motor.revealStyle · engine/engine.css [data-rv]`.

## Diapositivas

1. `l07-data-reveal`: título del sublote con la lista de variantes.
2. `l07-data-reveal-auto`: Tres bloques con data-step y data-reveal="auto" (gesto del estilo activo, escrito en la ficha). Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
3. `l07-data-reveal-fade`: Tres bloques con data-step y data-reveal="fade". Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
4. `l07-data-reveal-wipe`: Tres bloques con data-step y data-reveal="wipe". Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
5. `l07-data-reveal-wipe-x`: Tres bloques con data-step y data-reveal="wipe-x". Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
6. `l07-data-reveal-focus`: Tres bloques con data-step y data-reveal="focus". Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
7. `l07-data-reveal-develop`: Tres bloques con data-step y data-reveal="develop". Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
8. `l07-data-reveal-mist`: Tres bloques con data-step y data-reveal="mist". Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
9. `l07-data-reveal-pixel`: Tres bloques con data-step y data-reveal="pixel". Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
10. `l07-data-reveal-tilt`: Tres bloques con data-step y data-reveal="tilt". Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.

## Aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro
- Cada variante se distingue de las demás a simple vista en las capturas
