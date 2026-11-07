# Atlas Completo · plan maestro

Presentación de referencia con una diapositiva por componente del motor, incluidos los «quizás». Deck: `atlas/completo/index.html`. El Atlas original pasa a `atlas/original/` sin cambios de contenido.

**Progreso:** 0 de 238 componentes explicados · unas 288 diapositivas previstas (más la portada).

Este índice se regenera con `python3 planning/atlas/generar_planes.py` a partir de `atlas.db`, que es donde se marca el progreso (`explicado = 1`).

## Lotes

| # | Lote | Estado | Componentes | Quizás | Diapositivas | Subplan |
|---:|---|---|---:|---:|---:|---|
| 0 | L00 · Infraestructura | completado | — | — | 1 (portada) | [L00-infra/plan.md](L00-infra/plan.md) |
| 1 | L01-nucleo · Núcleo | pendiente | 0/19 | 0 | 21 | [L01-nucleo/plan.md](L01-nucleo/plan.md) |
| 2 | L02-api · API de efectos | pendiente | 0/10 | 0 | 19 | [L02-api/plan.md](L02-api/plan.md) |
| 3 | L03-estilos · Estilos y tokens | pendiente | 0/14 | 0 | 16 | [L03-estilos/plan.md](L03-estilos/plan.md) |
| 4 | L04-transiciones · Transiciones | pendiente | 0/11 | 0 | 13 | [L04-transiciones/plan.md](L04-transiciones/plan.md) |
| 5 | L05-maquetacion · Maquetación | pendiente | 0/14 | 0 | 20 | [L05-maquetacion/plan.md](L05-maquetacion/plan.md) |
| 6 | L06-texto · Texto y títulos | pendiente | 0/27 | 14 | 29 | [L06-texto/plan.md](L06-texto/plan.md) |
| 7 | L07-revelados · Revelados y animación | pendiente | 0/11 | 10 | 22 | [L07-revelados/plan.md](L07-revelados/plan.md) |
| 8 | L08-fondos · Fondos | pendiente | 0/46 | 25 | 48 | [L08-fondos/plan.md](L08-fondos/plan.md) |
| 9 | L09-piezas · Piezas de interfaz | pendiente | 0/28 | 19 | 30 | [L09-piezas/plan.md](L09-piezas/plan.md) |
| 10 | L10-graficos · Demos del Atlas | pendiente | 0/24 | 0 | 26 | [L10-graficos/plan.md](L10-graficos/plan.md) |
| 11 | L11-decks · Efectos de decks | pendiente | 0/30 | 0 | 37 | [L11-decks/plan.md](L11-decks/plan.md) |
| 12 | L12-herramientas · Herramientas | pendiente | 0/4 | 0 | 6 | [L12-herramientas/plan.md](L12-herramientas/plan.md) |

## Flujo por componente

1. Implementar la diapositiva (y, en los «quizás», portar antes el componente de react-bits a `fx/experimental/`).
2. Servir la raíz (`python3 -m http.server 8000`) y ejecutar `node tools/verificar.mjs atlas/completo` y `node planning/atlas/recorrer.mjs` (L00).
3. Revisar las capturas de esa diapositiva en suizo y noche, claro y oscuro.
4. `UPDATE componentes SET explicado=1, diapositivas='<ids>' WHERE id='<id>'` en `atlas.db`.
5. Regenerar planes e índice con `generar_planes.py`.

## Al cerrar cada lote

1. Escribir `planning/atlas/<lote>/resumen.md` (qué se cubrió, decisiones, problemas) y rellenar `doc_resumen` de sus componentes.
2. Commit con el lote y su plan.
3. Parar e informar del progreso antes del siguiente lote.

## Terminado cuando

- `SELECT * FROM componentes WHERE explicado = 0` devuelve 0 filas.
- Todos los lotes figuran como completados en esta tabla.
- `recorrer.mjs` navega de la primera a la última diapositiva, paso a paso, sin errores de consola.

## Fuentes

- Inventario: [inventario.md](inventario.md).
- react-bits: clon en `~/Proyectos/react-bits` (fuera del repositorio), commit en la tabla `meta` de `atlas.db`. Props, uso y dependencias en la tabla `react_bits`; relación con el motor en `origen_react_bits`.
- Informes del estudio: [react-bits/](react-bits/).
