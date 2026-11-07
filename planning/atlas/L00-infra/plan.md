# L00 · Infraestructura

Prepara la carpeta `atlas/` con las dos versiones, el esqueleto del Atlas Completo y las herramientas de comprobación. No tiene componentes en `atlas.db`. Termina con una portada `l00-portada` que navega sin errores.

Estructura final:

```
atlas/
├── original/            Atlas actual, movido sin cambios de contenido
│   ├── index.html
│   └── atlas.css
└── completo/            Atlas Completo
    ├── index.html
    ├── completo.css     plantilla de ficha, etiqueta experimental, títulos de lote
    ├── decks-css/       CSS mínimo que necesitan los efectos de L11 (copiado de cada deck)
    ├── media/           imágenes y vídeos de las demos
    └── vendor/          three.js, STLLoader y el STL del G1 (para ns-g1)
fx/experimental/         «quizás» portados de react-bits; solo los carga atlas/completo
```

## Tareas

Cada tarea se comprueba por sí sola. El orden importa: T2 debe ir antes de T3.

### T1 · `verificar.mjs` acepta rutas

- Si el argumento contiene `/` o es `.`, se sirve `http://localhost:8000/<arg>/` y las capturas van a `capturas/<arg con / cambiado por ->/`. Si no, se mantiene `decks/<nombre>/`.
- **Aceptación:** `node tools/verificar.mjs motor-pruebas suizo` genera las mismas capturas que antes (mismos nombres y carpeta). `node tools/verificar.mjs . suizo` captura el Atlas de la raíz.

### T2 · Capturas de referencia del Atlas actual

- `VERIF_REDUCED=1 node tools/verificar.mjs . suizo,noche,rice,cromo --out=output/regresion-antes`
- **Aceptación:** 31 diapositivas × 4 estilos × 2 modos = 248 PNG, y ningún error de consola.

### T3 · Mover el Atlas actual a `atlas/original/`

- `git mv index.html atlas/original/index.html` y `git mv atlas/atlas.css atlas/original/atlas.css`.
- En `atlas/original/index.html`, ajustar las rutas `engine/`, `themes/` y `fx/` a `../../`. El `href` de `atlas.css` queda relativo a su carpeta.
- Dejar en la raíz un `index.html` mínimo de una línea: `location.replace('atlas/original/' + location.hash)`. Así siguen valiendo los enlaces `localhost:8000/#portada`.
- **Aceptación:** `grep -c 'src="\.\./\.\./' atlas/original/index.html` es igual al número de `<script src>` locales. `localhost:8000/#lidar` acaba en `atlas/original/#lidar`.

### T4 · Regresión del Atlas movido

- `VERIF_REDUCED=1 node tools/verificar.mjs atlas/original suizo,noche,rice,cromo --out=output/regresion-despues`.
- Comparar cada par de PNG con PIL (`ImageChops.difference`) en un script del scratchpad.
- **Aceptación:** diferencia nula salvo el ruido conocido (el punto animado de unos 20 px; ver la memoria `motor-verificacion`). Cualquier otra diferencia bloquea T5.

### T5 · Documentación y empaquetado

- Actualizar las referencias a `index.html` y `atlas/atlas.css` de la raíz en:
  - `README.md`: Abrir, Estructura y Empaquetar;
  - `CLAUDE.md`: paso 1, «copiando el `<head>` de `atlas/original/index.html`»;
  - `AGENTS.md`: líneas 9, 28 y 61.
- `tools/bundle.mjs`:
  - la entrada por defecto pasa a `atlas/original/index.html`, con el nombre `atlas`;
  - una entrada `atlas/<x>/index.html` se llama `atlas-<x>`.
- Regenerar `dist/atlas.html` con `node tools/bundle.mjs atlas/original/index.html dist/atlas.html`.
- **Aceptación:**
  - `grep -n "index.html" README.md CLAUDE.md AGENTS.md` no deja ninguna referencia a la raíz como deck;
  - `dist/atlas.html` se abre con doble clic y muestra la portada;
  - su tamaño difiere menos de un 1 % del anterior.

### T6 · Esqueleto de `atlas/completo/index.html`

- **`<head>` y scripts:** copiar los de `atlas/original/index.html` con rutas `../../`, y además:
  - `MOTOR_PICK` con los diez estilos;
  - `fx/fondos.js` y `fx/piezas.js` después de `fx/sistema.js`;
  - `fx/vc.js` antes de `fx/rai.js`;
  - `fx/arq-opus.js` y `fx/nav-semantica.js`;
  - KaTeX y su auto-render desde jsDelivr, con versión fija;
  - `vendor/three-0.147.0.min.js` y `vendor/STLLoader-0.147.0.js`.
- **Diapositivas:** una sola, `l00-portada` (`data-fx="backdrop"`), con el título «Atlas Completo» y la lista de lotes.
- **Aceptación:** `node tools/verificar.mjs atlas/completo suizo,noche` sin errores de consola ni desbordes.

### T7 · Plantilla de ficha (`atlas/completo/completo.css`)

- **`.ficha`:** composición de dos columnas, la demo (unos 1080 px) y el lateral (unos 540 px). El lateral es un `aside.panel` con cuatro bloques fijos:
  - `.ficha-nombre`: nombre y id;
  - `.ficha-proposito`;
  - `.ficha-params`: tabla de dos columnas, parámetro y valores;
  - `.ficha-fuente`: ruta en `.mono` y, si lo hay, el origen en react-bits.
- **`.ficha.ancha`:** la demo a todo el ancho y la ficha en una banda inferior de 200 px. Es para pintores y demos grandes.
- **`.exp`:** etiqueta «Experimental · quizás» en el `kicker`, con `var(--warn)` y la palabra siempre visible.
- **`.lote-titulo`:** diapositiva de título de lote con su número, su nombre y la lista de demos en dos columnas.
- Antes de crear cada clase, buscar el nombre en `decks/*/`, `fx/`, `engine/` y `themes/`.
- **Aceptación:**
  - una diapositiva de prueba `l00-ficha` con las tres variantes (`ficha`, `ficha ancha` y `ficha` con `.exp`) cabe en el lienzo en los diez estilos;
  - textos de 22 px o más;
  - se retira al cerrar L00.

### T8 · Recursos de `ns-g1` y CSS de efectos de decks

- **Recursos de `ns-g1`.** Copiar de `decks/estado-arte-nav-semantica/` a `atlas/completo/`:
  - `vendor/three-0.147.0.min.js`, `vendor/STLLoader-0.147.0.js` y `vendor/three-LICENSE.txt`;
  - `media/g1-3d/g1-29dof-de-pie.stl` (4,7 MB);
  - `media-web/g1-3d-respaldo.png`.
- **CSS de los efectos de decks.** Extraer a `atlas/completo/decks-css/` las reglas de `deck.css` que usan los efectos de L11:
  - `arq-opus.css`, de `decks/arquitectura-g1-opus/`;
  - `nav-semantica.css`, de `decks/estado-arte-nav-semantica/`;
  - `vc.css`, de `decks/vc-base/` o del deck vc que lo defina.

  Se copia solo lo que usan esos efectos y se limita a `.slide[id^="l11-"]` para que no afecte al resto.
- **Aceptación:** los archivos existen y `git check-ignore` no los ignora.

### T9 · `fx/experimental/`

- Crear `fx/experimental/README.md`, que explica que aquí van los «quizás» portados de react-bits (con su ruta de origen y el commit `4dc7b5b`) y que solo los carga el Atlas Completo.
- Cada lote añade sus `<script>` y `<link>` explícitos en `atlas/completo/index.html`.
- **Aceptación:** el README existe y `atlas/completo/index.html` no carga nada de `fx/experimental/` todavía.

### T10 · `planning/atlas/recorrer.mjs`

- Script de Playwright:
  - abre `atlas/completo/` en cada estilo pedido (por defecto suizo y noche) y en claro y oscuro;
  - pulsa → hasta llegar al final, recorriendo así cada paso;
  - recoge `console.error` y `pageerror` con el id de la diapositiva activa;
  - imprime el resumen y sale con código 1 si hay errores.
- Admite `CHROMIUM_PATH` y `--desde=<id>` para empezar en un lote.
- **Aceptación:** con el esqueleto, recorre `l00-portada` y sale con 0. Con un error provocado en una diapositiva de prueba, lo detecta y sale con 1.

### T11 · Commit de L00

- Un commit con `atlas/`, `fx/experimental/README.md`, `tools/`, la documentación, `dist/atlas.html` y `planning/`.
- Actualizar `INFRA_ESTADO` en `generar_planes.py` a «completado» y regenerar `00-indice.md`.
- **Aceptación:** `git status` limpio salvo `output/`, y el índice muestra L00 como completado.
