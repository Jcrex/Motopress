# Atlas Completo · cómo retomar

Estado al cierre de la sesión del 2026-11-08. La fuente de verdad del progreso es `atlas.db`; el índice legible es [00-indice.md](00-indice.md).

## Dónde estamos

| Lote | Estado | Commit | Diapositivas |
|---|---|---|---:|
| Fases 0 y 1 (inventario y plan) | hecho | `c91b626` | — |
| L00 · Infraestructura | completado | `fba5b6b` | 1 |
| L01 · Núcleo | completado | `398e41a` | 21 |
| L02 · API de efectos | completado | `5fa05e7` | 19 |
| L03 · Estilos y tokens | completado | `f3298d6` | 16 |
| L04 · Transiciones | completado | `fb15278` | 13 |
| **L05 · Maquetación** | **siguiente** | — | 20 previstas |
| L06–L12 | pendientes | — | unas 199 previstas |

- **Componentes:** 54 de 238 explicados (19 + 10 + 14 + 11). Quedan 116 implementados y los 68 «quizás».
- **Deck:** `atlas/completo/index.html`, con 70 diapositivas.
- **Remoto:** los commits de esta sesión no se han subido. El último push fue `981522b`.

## Cómo trabajar un lote (el flujo que se ha seguido)

1. **Leer el plan del lote.** Está en `planning/atlas/LNN-…/plan.md`. Antes de diseñar las demos, comprobar en el código lo que dice el inventario: en L02 había tres datos mal, ver los `resumen.md`.
2. **Escribir los archivos del lote:**
   - `atlas/completo/src/lNN.html`: diapositivas con id `lNN-<componente>`;
   - `atlas/completo/lotes/lNN.js`: efectos con prefijo `ac-`;
   - `atlas/completo/lotes/lNN.css`: clases con prefijo `ac-`.

   Marcadores que rellena `montar.py`:
   - `<!-- titulo:LNN -->`: diapositiva de título del lote;
   - `<!-- kicker:id -->`: kicker y etiqueta experimental;
   - `<!-- ficha:id -->`: lateral con nombre, propósito, parámetros y fuente.

   Plantilla de la diapositiva: ver `L00-infra/resumen.md`.
3. **Enlazar el CSS y el JS del lote.** Se añaden en `atlas/completo/src/_cabecera.html` y en `src/_pie.html`, detrás de los del lote anterior.
4. **Montar:** `python3 planning/atlas/montar.py`. No se edita `atlas/completo/index.html` a mano.
5. **Verificar**, con el servidor arrancado en la raíz:
   ```bash
   python3 -m http.server 8000 &
   export CHROMIUM_PATH=~/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome
   node tools/revisar.mjs atlas/completo                           # revisión estática (herramienta nueva, de otra sesión)
   node tools/verificar.mjs atlas/completo suizo,noche --out=<scratchpad>/v
   node planning/atlas/recorrer.mjs --desde=lNN-titulo              # paso a paso; también con --reducido
   node planning/atlas/pruebas/acept-lNN.mjs                         # criterios interactivos del lote
   python3 -I planning/atlas/pruebas/hoja.py <capturas> suizo-light hoja.png orden.txt   # hoja de contactos para revisar a ojo
   ```
   - Ver siempre las capturas: los fallos visuales no los detecta ninguna herramienta.
   - `recorrer.mjs` encuentra errores que `verificar.mjs` no ve. Por ejemplo, en L01 detectó el `view-transition-name` duplicado de la copia del HUD.
6. **Cerrar el lote:**
   ```sql
   UPDATE componentes SET explicado=1, diapositivas=slide_id, doc_resumen='planning/atlas/LNN-…/resumen.md' WHERE lote_id='LNN-…';
   ```
   Después:
   - escribir `resumen.md`: archivos, verificación, correcciones al inventario y hallazgos;
   - ejecutar `python3 planning/atlas/generar_planes.py`;
   - hacer commit solo de `atlas/completo` y `planning`;
   - parar e informar al usuario.

**No volver a ejecutar `construir_db.py`:** rehace la base y pone `explicado` a 0. Si hay que corregir un dato del inventario, hacer un `UPDATE` en `atlas.db` y el mismo cambio en `construir_db.py`, como se hizo en L02.

## Lo que hay que saber para los lotes que quedan

- **Tokens por atributo.** Se aplican con `[data-style]` y `[data-style][data-theme]` en cualquier elemento, así que una zona puede verse en otro estilo o modo; lo usan L01 y L03. Las transiciones, en cambio, dependen de `:root[data-style]` (L04).
- **Vistas previas.** Una `.slide is-active` anidada e inerte, con `zoom`, muestra un estilo real (función `vista()` en `lotes/l03.js`).
- **Botones de las demos:**
  - `data-ac-accion="go:id|style:id|overview|mode|fullscreen|print"` (en `lotes/l01.js`);
  - `data-semilla` (en `lotes/l02.js`);
  - `data-vt` (en `lotes/l04.js`).
- **Volver a dibujar una diapositiva.** El motor no expone `renderSlide`. Para redibujar desde un botón, guardar la función de dibujo y llamarla con `slide._api`, como en `ac-azar` de L02.
- **`Motor.gl.layer`** pide `{ host, w, h, ratio }` y crea un `canvas.gl` sin estilos: hay que darle tamaño con CSS.
- **L08 (fondos) y L09 (piezas)** acumulan casi todos los «quizás». Cada uno se porta desde `~/Proyectos/react-bits` (commit `4dc7b5b`) a `fx/experimental/`, siguiendo la tabla de props de su `plan.md` y la tabla `react_bits` de `atlas.db`.
- **L11** necesita copiar a `atlas/completo/decks-css/` el CSS de los decks que usan `op-*`, `ns-*` y `vc-*`. Los decks están en `decks/`, que git ignora.
- **Ruido conocido en las capturas:** el reloj de rice y del escritorio, el calendario y el fondo de cromo en claro.

## Archivos de esta carpeta

| Archivo | Para qué |
|---|---|
| `00-indice.md` | plan maestro y progreso (generado) |
| `inventario.md` | inventario de la fase 0 y decisiones del usuario |
| `atlas.db` | componentes, lotes, documentación de react-bits y progreso |
| `construir_db.py` | rehace la base (**no ejecutar más**) |
| `react_bits.py` | carga la documentación de react-bits en la base |
| `generar_planes.py` | escribe los `plan.md`, los sublotes y el índice |
| `montar.py` | monta `atlas/completo/index.html` |
| `recorrer.mjs` | recorre el deck paso a paso buscando errores |
| `pruebas/` | criterios interactivos por lote (`acept-lNN.mjs`), captura de una diapositiva (`una.mjs`), prueba sin WebGL (`singl.mjs`), hoja de contactos (`hoja.py`) y comparación de capturas (`comparar.py`) |
| `LNN-…/plan.md` | plan del lote (generado) |
| `LNN-…/resumen.md` | resumen al cerrar el lote |
| `react-bits/` | informes del estudio de react-bits |
