# Sublote `secuencia` · Efecto secuencia

Parte de [L11-decks](plan.md). Revelar en orden los elementos marcados con data-seq y mover puntos por caminos SVG. Fuente: `fx/rai.js Motor.fx('secuencia')`.

## Diapositivas

1. `l11-secuencia`: título del sublote con la lista de variantes.
2. `l11-secuencia-fade`: Elementos con data-seq y data-a="fade" y un punto data-travel que recorre un camino. Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
3. `l11-secuencia-draw`: Elementos con data-seq y data-a="draw" (líneas y caminos SVG). Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
4. `l11-secuencia-grow`: Elementos con data-seq y data-a="grow" (barras de izquierda a derecha). Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
5. `l11-secuencia-rise`: Elementos con data-seq y data-a="rise" (barras de abajo arriba). Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.
6. `l11-secuencia-pop`: Elementos con data-seq y data-a="pop" (escala). Ficha con el nombre de la variante, qué cambia respecto a las demás y la línea del código que la define.

## Aceptación

- Ficha lateral con nombre, propósito, parámetros principales y archivo fuente (plantilla `.ficha` de L00)
- `render()` deja el estado final completo; `play()` solo anima; con `api.reduced` no hay movimiento
- Colores solo con tokens; texto mínimo de 22 px; nada se sale del lienzo según `tools/verificar.mjs`
- Sin errores de consola al entrar, al pulsar → y al salir
- Revisada en las capturas de suizo y noche, claro y oscuro
- Cada variante se distingue de las demás a simple vista en las capturas
