# Sublote `cols` · Columnas (.cols)

Parte de [L05-maquetacion](plan.md). Repartir el cuerpo en cuerpo + lateral o en columnas iguales. Fuente: `engine/engine.css .cols`.

## Diapositivas

1. `l05-cols`: título del sublote con la lista de variantes.
2. `l05-cols-cols`: .cols: cuerpo + lateral de 500 px. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
3. `l05-cols-wide-side`: .cols.wide-side. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
4. `l05-cols-even`: .cols.even. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
5. `l05-cols-three`: .cols.three. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.

## Aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ac-ficha` de L00; marcado en `L00-infra/resumen.md`)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro
- Cada variante se distingue de las demás a simple vista en las capturas
