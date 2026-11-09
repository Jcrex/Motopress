# Catálogo del motor

Todo lo que se puede usar en una diapositiva sin escribir JavaScript. Si algo no está aquí, búscalo con `grep` en `engine/engine.css`, `themes/styles.css` o `fx/` antes de inventarlo.

## Estructura de una diapositiva

| Tipo | Marcado |
|---|---|
| Portada | `<section class="slide is-plain cover" data-fx="backdrop" data-seed="3">` + `<div class="fx-bg"></div>` + `<div class="cover-body">` con `.kicker`, `h1.s-title.xl`, `.lead` |
| Separador | `class="slide is-plain divider"` con `data-fx="backdrop"`, `.fx-bg` y `<div class="divider-body">` |
| Cierre | como el separador, añadiendo `closing` (fondo más tranquilo) |
| Normal | `<header class="s-head">` (`.kicker` + `h2.s-title`) y `<div class="s-body …">` |

Atributos obligatorios en cada `<section>`: `id` (único, minúsculas y guiones), `data-section` (agrupa; alimenta la `agenda`) y `data-title`.

## Composición del cuerpo (`.s-body`)

| Clase | Resultado |
|---|---|
| `cols` | cuerpo + lateral de 500 px |
| `cols wide-side` | lateral más ancho |
| `cols even` | dos columnas iguales |
| `cols three` | tres columnas |
| `stack` | apilado vertical |
| `row` | fila horizontal |

## Bloques

`.panel` (caja), `.label` (rótulo pequeño), `.value` (dato), `.readout` (`<dl>` de pares `dt`/`dd`), `.legend` (`<ul>`; `legend-col` en vertical; cada `<li>` con `<i style="--c:var(--cat-1)"></i>`), `.note` (nota al pie; úsala para «Datos de ejemplo»), `.chip`, `.keycap`, `.lead`, `.kicker`, `.muted`, `.mono`, `.num`, `.win` (ventana: `.win-bar` + `.win-body`), `.term` (terminal, en `<pre>`).

## Piezas por clase (`fx/piezas.js`, sin `data-fx`)

| Pieza | Marcado | Para |
|---|---|---|
| Número grande | `<span class="cifra" data-value="97.3" data-suf=" %"></span>` · `data-dec`, `data-pre`, `data-from`, `data-mode="count|roll"`. `data-value` admite `97.3`, `97,3`, `1.234,5`, `1.234.567` y `−3`; un solo punto es decimal (`1.000` = 1, escribe `1000`); sin número se muestra «—». Si no cabe, la letra se reduce | una cifra protagonista |
| Variación | `<span class="cifra-delta sube"><b>▲ sube</b> 4,1 fps</span>` (o `baja`) | junto a una cifra |
| Proceso | `<ol class="etapas"><li data-step><b>Fase</b><small>detalle</small></li>…</ol>` · `etapas v` en vertical | fases lineales |
| Hitos | `<ul class="checklist"><li data-step data-end="ok|warn|err">…</li></ul>` · `checklist tacha` | estado de tareas |
| Índice | `<ol class="agenda"></ol>` · `data-skip="Inicio"`, `data-current`, `agenda banda` | se genera con los `data-section` |
| Foco | `<div class="reticula">` con hijos `data-target="0|1|…" data-label="…"` | señalar partes de una imagen |
| Rejilla resumen | `<div class="bento">` con celdas `.panel` (`w2`, `w3`, `h2`); `data-step` en celdas para enfocarlas | resumen de varias cifras |
| Tarjetas apiladas | `<div class="mazo">` con `.panel`, todas con `data-step` menos la primera · `mazo plana` | recorrer ejemplos |
| Borde vivo | `class="chispa"` o `class="rayo"` en un panel | el punto clave o la alerta |
| Texto cifrado | `class="descifra"` · `data-orden="start|center|random"` | palabra que se revela |
| Split-flap | `<div class="paleta" data-words="A|B|C"></div>` · `data-pasos` | estados que cambian |
| Terminal que escribe | `<div class="term teclea"><div data-k="cmd">$ orden</div><div>salida</div></div>` | demos de consola |
| Depósito | `<div class="deposito" data-value="72" data-label="batería" data-umbral="30" data-critico="15"></div>` | nivel con estado |

## Pasos, revelados y títulos

- `data-step` en cualquier elemento: aparece con →. `verificar.mjs` captura el primer paso salvo con `--paso=ultimo` o `--paso=N`.
- `data-reveal="auto"` en un `data-step`: gesto del estilo. Nombres fijos: `fade`, `wipe`, `wipe-x`, `focus`, `develop`, `mist`, `pixel`, `tilt`. En `<html>` vale para todo el deck.
- `data-title-fx="auto"` anima la entrada del título (por defecto solo en portadas con `backdrop`); `"none"` la quita. Presets: `rise`, `descifra`, `mask-lines`, `blur`, `pliega`, `enfoca`.
- Fondo de portada: `data-painter="hilos"` (todos los estilos), `data-painter="noche:escaner aurora:hilos"` (por estilo) o `"none"`. Pintores: `grano`, `hilos`, `radar`, `topo`, `isolineas`, `escaner`, `velo`, más el propio de cada estilo. `data-seed` cambia la variación.

## Gráficos con datos (`fx/grafico.js`, sin `data-fx` ni D3)

```html
<figure class="grafico" data-tipo="barras" data-unidad=" ms" data-orden="desc" data-resalta="Nav2">
  <script type="application/json">{"datos": [["Nav2", 112], ["MoveIt 2", 74]]}</script>
  <figcaption>Datos de ejemplo.</figcaption>
</figure>
```

| Atributo | Valores |
|---|---|
| `data-tipo` | `barras` (horizontales, por defecto; lo mejor con rótulos largos), `columnas`, `lineas`, `dispersion` |
| `data-apilar` | barras o columnas con varias series, apiladas |
| `data-unidad`, `data-dec` | sufijo (si es larga, va una vez en el título del eje) y decimales de los rótulos de valor (el eje usa al menos los de su paso) |
| `data-eje-x`, `data-eje-y` | título de los ejes |
| `data-resalta="A|B"` | destaca esas etiquetas; el resto en gris |
| `data-orden="desc|asc"`, `data-cero`, `data-valores="no"` | ordenar una serie, eje y desde 0 en líneas, sin rótulos de valor |

JSON: `{"datos": [[etiqueta, valor], …]}` para una serie; `{"etiquetas": […], "series": [{"nombre": …, "valores": […]}, …]}` para varias (leyenda automática, colores `cat-1…6`); `"x": [números]` en lugar de `"etiquetas"` hace numérico el eje x de `lineas`; `dispersion` usa `"series": [{"nombre": …, "puntos": [[x, y], …]}]`. Ocupa el alto de su contenedor (mínimo 360 px; dale `style="height:…"` si hace falta). Se anima al entrar o al revelar su `data-step`. Ejemplos en `decks/motor-pruebas/` (`#g-barras` … `#g-dispersion`).

## Efectos con `data-fx`

### Genéricos: aceptan tu contenido

| Efecto | Script | Uso |
|---|---|---|
| `backdrop` | `fx/sistema.js` | fondo animado de portadas y separadores |
| `secuencia` | `fx/rai.js` | revela al entrar los elementos con `data-seq="n"` (mismo n, a la vez). `data-a="fade|draw|grow|rise|pop"` (`draw` traza `<path>`/`<line>` SVG; `grow` y `rise` hacen crecer barras). `data-travel="#id-camino"` en un `<circle>` lo mueve por ese camino (`data-period` en ms por vuelta, 4200 por defecto; `data-rest` de 0 a 1, posición mientras espera). `data-step-ms` en la sección cambia el ritmo. Ideal para diagramas SVG propios |
| `vc` | `fx/vc.js` (antes de `fx/rai.js`) | activa a la vez `secuencia`, `vc-plot`, `vc-heat` y `vc-conv`, y las fórmulas KaTeX |
| `vc-plot` | `fx/vc.js` | curvas y = f(x) y barras: `<div class="fx" data-role="plot" data-x="0,255" data-y="0,255" data-fns='[{"f":"x=>x*x/255","label":"cuadrática"}]' data-xl="eje x" data-yl="eje y"></div>`. Opcional: `data-bars='[…]'`, `data-pts='[[x,y],…]'`, `data-legend="tl|tr|bl|br|top"`, `data-xdec`, `data-ydec` |
| `vc-heat` | `fx/vc.js` | matriz coloreada: `<div class="fx vc-heat" data-m='[[1,2],[3,4]]' data-signed="1" data-dec="2"></div>` (`data-nums="0"` oculta los números) |
| `vc-conv` | `fx/vc.js` | convolución paso a paso: `data-img='[[…]]' data-k='[[…]]' data-mode="conv|corr" data-pad="zero|none"` |

`fx/vc.js` necesita KaTeX (CSS y JS, con `contrib/auto-render`) desde jsDelivr y los estilos de `fx/vc.css` (`.eq`, `pre.code`, `.tip`, `.trap`, `.exam`, `.g2`, `.g3`, `.vstack`…): `<link rel="stylesheet" href="../../fx/vc.css">`. Copia el bloque de `<link>`/`<script>` de KaTeX de `decks/vc-t1-realce/index.html`.

Notas del orador: `<aside class="notes">…</aside>` dentro de la diapositiva. El motor las oculta y la tecla N abre una ventana con las notas de la diapositiva activa, la siguiente y un cronómetro (en `fx/sistema.js`, sin cargar nada más).

### De demostración: datos fijos dentro del efecto

`estilos`, `teoria`, `rueda`, `tipo`, `paletas`, `refs`, `compare` (sistema), `rosgraph`, `lidar`, `astar`, `tftree`, `blueprint`, `scope` (ros), `training`, `confusion`, `latent`, `nnet` (ml), `clouds`, `ridge`, `calendar`, `sankey`, `kpis` (datos), `desktop`, `fetch` (arch). Dibujan datos sintéticos escritos en el JavaScript y esperan un marcado concreto (`data-role`). Úsalos solo si la demo encaja tal cual; para ver su marcado, busca el `id` correspondiente en `atlas/original/index.html` con `grep -n -A20 'data-fx="lidar"'`. Para tus datos, escribe un efecto (ver `efecto-nuevo.md`) o usa SVG con `secuencia`.

Los prefijos `op-*`, `ns-*` y `arq-opus` son de decks concretos: no los reutilices.

## Tokens de color

CSS: `var(--bg)`, `--bg-2`, `--bg-3`, `--fg`, `--fg-2`, `--fg-3`, `--line`, `--line-2`, `--accent`, `--accent-2`, `--accent-3`, `--accent-ink`, `--on-accent`, `--ok`, `--warn`, `--err` (y `--ok-ink`, `--warn-ink`, `--err-ink` para texto: siempre ≥ 4,5:1), `--cat-1` … `--cat-6`, `--seq-1` … `--seq-7`, `--div-1` … `--div-7`. En JavaScript: `api.tok('fg-2')`, `api.cats(n)`, `api.seq(t)`, `api.div(t)`.

| Qué codifica | Token |
|---|---|
| categorías (series, grupos) | `cat-1` … `cat-6`, en ese orden |
| magnitud | `seq` |
| signo (+/−) | `div` |
| estado | `ok`, `warn`, `err` + palabra («correcto», «vigilar», «fallo») |
| texto de gráficos | `fg`, `fg-2`, `fg-3` |

## Estilos

`rice`, `noche`, `suizo`, `aurora`, `cromo`, `arcilla`, `nube`, `termica`, `celula`, `matriz`. Suizo es editorial y sobrio (acento rojo); noche, cromo y matriz son oscuros de por sí; nube, arcilla y cromo usan WebGL en portadas. Para datos y clases, `suizo` y `nube` son los más legibles.

## Tipos de diapositiva (`tp-`, los genera el MCP)

`diapositiva_desde_spec` produce HTML con clases de `engine.css` que también sirven a mano: `.tp-problema` (problema → solución), `.tp-rejilla` (tarjetas o columnas, `style="--n:3"`), `.tp-cifras`, `.tp-tabla` (`tr.on` destaca, `.num` alinea números), `.tp-cita`, `.tp-img`, `.tp-lista`, `.tp-texto`, `.etapas.neutra` (flujo sin estados) y `.checklist > li.tp-pend`. Copia el marcado de `decks/motor-pruebas/` (ids `tp-*`).
