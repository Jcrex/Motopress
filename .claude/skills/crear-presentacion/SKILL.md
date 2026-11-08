---
name: crear-presentacion
description: Use when creating, editing, extending or reviewing a slide deck (presentación, diapositivas, deck, transparencias) in this motor repository, including decks/<nombre>/index.html, new data-fx effects in fx/, charts with the user's data, or checking a deck before delivering it.
---

# Crear una presentación con el motor

Un deck es un `decks/<nombre>/index.html` que carga el motor por rutas `../../`. No hay compilación: se escribe HTML, se revisa con dos herramientas y se mira en capturas.

## Con el servidor MCP `motor`

Si tienes sus herramientas (`.mcp.json` lo registra en este repositorio), úsalas en lugar de editar el HTML a mano: `crear_deck` → `diapositiva_desde_spec` por cada idea (tipos: portada, separador, cierre, cifra, cifras, tarjetas, problema, proceso, comparacion, grafico, tabla, imagen, terminal, cita, checklist, libre) → `revisar` → `capturar` cada diapositiva (devuelve la imagen) → `empaquetar`. Para lo que no cubren los tipos, `escribir_diapositiva` con HTML del catálogo. Cada escritura se revisa y no se guarda si añade errores. Las reglas de abajo siguen valiendo.

## Flujo

1. **Guion antes que HTML.** Una idea por diapositiva. Para cada una decide la forma: cifra, tabla, gráfico, diagrama, proceso o imagen. Pregunta al usuario solo lo que no puedas deducir (estilo, carpeta de salida, datos reales).
2. **Crea el deck** copiando `plantilla.html` (de esta carpeta) a `decks/<nombre>/index.html` y crea `decks/<nombre>/deck.css` (aunque esté vacío: la plantilla lo enlaza).
3. **Escribe las diapositivas** con lo que hay en `catalogo.md`, en este orden de preferencia:
   1. HTML estático con bloques y piezas por clase (`cifra`, `etapas`, `checklist`, `bento`…).
   2. Datos numéricos: `<figure class="grafico">` (barras, columnas, líneas, dispersión) con el JSON dentro.
   3. SVG propio animado con `data-fx="secuencia"` y `data-seq`.
   4. `vc-plot` / `vc-heat` para curvas y = f(x) y matrices.
   5. Efecto nuevo (lee `efecto-nuevo.md`).
4. **Revisión estática** (sin navegador, tarda menos de un segundo): `node tools/revisar.mjs <nombre>`. Corrige todos los `ERROR` y revisa cada `aviso`.
5. **Revisión visual:** `node tools/verificar.mjs <nombre> [estilo1,estilo2] [--paso=ultimo] [--solo=id1,id2]` (levanta su propio servidor). En esta máquina: `CHROMIUM_PATH=~/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome`. Abre con Read varias capturas de `output/capturas/<nombre>/` (claro y oscuro) y busca títulos en dos líneas, texto cortado o pegado al borde y contraste pobre. `VERIF_REDUCED=1` captura el estado final de las animaciones.
6. **Entrega:** `node tools/bundle.mjs decks/<nombre>/index.html [--out=<carpeta>]` crea un único HTML.

## Reglas que no comprueba ninguna herramienta

- Datos que no vengan del usuario: escribe «Datos de ejemplo» o «Datos sintéticos» en la diapositiva (`<p class="note">`).
- Estado con color siempre acompañado de una palabra («correcto», «vigilar», «fallo»).
- Cuerpo útil de unos 1664×630 px: si no cabe, divide en dos diapositivas en vez de encoger el texto.
- `render()` deja el estado final completo; `play()` solo anima.

`revisar.mjs` ya comprueba: atributos obligatorios, `id` duplicados, orden de los scripts, estilos, efectos, pintores, revelados y presets de título inexistentes, colores literales, texto por debajo de 22 px, títulos largos, listas con demasiados elementos y el JSON de los `.grafico`.

## Errores frecuentes

| Síntoma | Causa |
|---|---|
| Un efecto de demo (`kpis`, `sankey`, `training`…) muestra datos que no son los del usuario | esos efectos traen sus datos dentro del JavaScript; usa uno genérico o escribe uno |
| `data-fx="vc"` sin estilos ni fórmulas | falta KaTeX o `../../fx/vc.css` (ver `catalogo.md`) |
| Un gráfico muestra «Gráfico sin datos válidos» | JSON mal formado o falta `fx/grafico.js`; `revisar.mjs` lo indica |
| Las capturas no muestran parte del contenido | los `data-step` empiezan ocultos; captura con `--paso=ultimo` |
| Cambiar `data-style` a mano no redibuja | el estilo se guarda en `localStorage` (`motor:style`); usa la tecla S o `verificar.mjs` |

## No tocar

`engine/`, `themes/tokens.css`, `themes/meta.js` (generados: para colores o fuentes, edita `themes/source.json` y ejecuta `node tools/build-themes.mjs --report`). `decks/` no se sube a git salvo `decks/motor-pruebas/`.
