---
name: portar-react-bits
description: Use when porting a react-bits component (~/Proyectos/react-bits) to the motor, working on the «quizás» of the Atlas Completo (lotes L06–L09), studying how a react-bits effect is implemented (shaders, motion, GSAP, canvas), or when the user asks for an effect «como el X de react-bits».
---

# Portar un componente de react-bits al motor

react-bits está hecho en React (hooks, motion, ogl, three) y casi siempre depende del ratón. El motor es JavaScript sin React, con un lienzo fijo de 1920×1080 que se presenta con el teclado. Portar es traducir, no copiar: se conserva el shader o la idea visual y se cambian el ciclo de vida, los colores y la interacción.

## Herramientas (servidor MCP `motor`)

| Herramienta | Para qué |
|---|---|
| `rb_buscar` | ¿Existe ya en el motor? ¿Qué veredicto tiene? Filtros: texto, categoría, veredicto, técnica, estado (`portado`, `quizas`, `libre`) |
| `rb_ficha` | Props con sus valores por defecto, técnicas, shaders y uniforms, eventos, veredicto y motivo, estilos que encajan, equivalente en el motor |
| `rb_codigo` | Solo la parte que necesitas, con líneas: `resumen` (mapa del archivo), `shaders`, `props`, `bucle`, `eventos`, `css`, `uso`, `presets` o un rango |
| `rb_tecnica` | La receta de traducción de una técnica y ejemplos ya portados (también en `recetas.md`) |
| `rb_preparar` | Escribe `fx/experimental/<nombre>.js` con la cabecera rellena, los shaders extraídos y el esqueleto del destino |
| `capturar` | Mirar el resultado en un estilo y modo |

Sin MCP: la misma información está en `planning/atlas/atlas.db` (tabla `react_bits`) y en el clon; `recetas.md` está en esta carpeta.

## Flujo

1. `rb_buscar` con el nombre o la idea. Si ya hay un equivalente portado, úsalo y para aquí. Si el veredicto es `descartar`, explica el motivo al usuario antes de seguir.
2. `rb_ficha`: decide el destino con la tabla de abajo y apunta qué interacción hay que sustituir.
3. `rb_codigo` por partes: primero `resumen`, luego `shaders`/`bucle`/`props` según la técnica. No leas el `.jsx` entero.
4. `rb_tecnica` para cada técnica detectada que no domines.
5. `rb_preparar` con el destino elegido y completa los `TODO`.
6. Cárgalo donde toque (en el Atlas Completo, `atlas/completo/`; nunca en un deck sin que pase a estable) y revisa con `capturar` en los estilos que el informe dice que encajan, en claro y en oscuro. Comprueba también que con movimiento reducido queda un estado final digno.
7. Registra el resultado (ver «Al terminar»).

## Destino

| Si el original es… | Destino en el motor | Esqueleto (`rb_preparar destino=`) |
|---|---|---|
| Un fondo a pantalla completa | pintor de `data-painter` | `pintor` |
| Algo que se pone con una clase y se combina con cualquier diapositiva | pieza (como `cifra` o `deposito`) | `pieza` |
| Una demo con marcado propio y datos | efecto `data-fx` | `efecto` |
| Una forma de hacer entrar un título | preset de `data-title-fx` | `titulo` |
| Una forma de hacer aparecer un elemento | modo de `data-reveal`: hoy la lista es fija en `fx/sistema.js`; propón la ampliación al usuario | — |

## Reglas del port

- Cabecera obligatoria (la escribe `rb_preparar`): origen con ruta y commit, tabla props → `data-*` o token, y lo descartado.
- Colores solo con tokens; texto ≥ 22 px; `render()` deja el estado final y `play()` solo anima; `api.reduced` sin movimiento.
- Sin `Math.random()`: `api.rng(semilla)`.
- Nombres: `exp-<nombre>` para los «quizás» (`q-glitch` → `exp-glitch`); clases CSS con ese prefijo.
- Antes de crear una clase global, búscala en `engine/`, `themes/`, `fx/` y `decks/*/`.

## Al terminar

- `atlas.db`: si el componente del Atlas pasa a estar portado, `UPDATE componentes SET archivo_fuente = 'fx/experimental/exp-x.js' WHERE id = 'q-x'` (el estado `quizas` se mantiene hasta que pase a estable). Si se descarta, anota el motivo en `componentes.nota`.
- `fx/experimental/README.md` no hace falta tocarlo; el `catalogo` del MCP lista los ports experimentales solo.
- Para pasarlo a estable: moverlo a `fx/`, quitar el prefijo, documentarlo en `README.md` y en el catálogo de `crear-presentacion`, y poner `estado_motor = 'implementado'`.
- Si react-bits se ha actualizado (`git pull` en el clon), ejecuta `python3 planning/atlas/react_bits.py`: avisa de los componentes nuevos, que necesitan veredicto.

## Errores frecuentes

| Síntoma | Causa |
|---|---|
| El fondo sale negro o transparente | falta un uniform (el del ratón suele quedarse a 0), o es `uniform int` (el motor solo envía floats) |
| `program()` devuelve `null` | GLSL 3.00 sin WebGL2, o interpolaciones `${…}` sin sustituir dentro del shader |
| El color no cambia al pulsar S o D | los colores se leyeron una vez al cargar: léelos en `render()`/`frame()` |
| La animación sigue en otra diapositiva | bucle propio en vez de `api.raf`, o CSS sin limitar a `.slide.is-active` |
| Las capturas cambian en cada pasada | `Math.random()` o tiempo real en vez de la semilla |
