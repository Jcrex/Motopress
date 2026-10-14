# AGENTS.md · motor de presentaciones

Instrucciones para cualquier agente de código (Codex, opencode, Aider, Continue, modelos locales con Ollama o llama.cpp…). Son las mismas reglas que `CLAUDE.md`, escritas de forma más explícita y con plantillas para copiar.

Este repositorio es un motor de diapositivas en HTML, CSS y JavaScript sin paso de compilación. Una presentación es un archivo `decks/<nombre>/index.html` que carga el motor.

## Antes de empezar

- No leas `index.html` entero: tiene cientos de líneas. Usa como referencia `decks/rai-g1/index.html` o busca con `grep` la parte que necesites.
- No toques `engine/`, `themes/tokens.css` ni `themes/meta.js`. Los dos últimos se generan.
- Trabaja solo dentro de `decks/<nombre>/` y, si hace falta un efecto nuevo, en `fx/<nombre>.js`.
- Los nombres de archivo, `id` y efectos van en minúsculas y con guiones: `mi-deck`, `ventas-2025`.

## Paso 1 · Crear el deck

Crea `decks/<nombre>/index.html` con esta plantilla. Cambia solo lo marcado con `<!-- CAMBIA -->`.

```html
<!doctype html>
<html lang="es" data-style="suizo"> <!-- CAMBIA: estilo por defecto -->
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Título del deck</title> <!-- CAMBIA -->
<meta name="color-scheme" content="light dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Copia aquí la línea <link> de Google Fonts de index.html (es una sola línea larga). -->
<link rel="stylesheet" href="../../themes/tokens.css">
<link rel="stylesheet" href="../../engine/engine.css">
<link rel="stylesheet" href="../../themes/styles.css">
<link rel="stylesheet" href="deck.css"> <!-- opcional: estilos propios del deck -->
</head>
<body>
<main class="viewport">
<div class="stage">

  <!-- Diapositivas aquí (ver paso 2) -->

</div>
</main>

<script>window.MOTOR_PICK = ['suizo', 'nube', 'noche'];</script> <!-- CAMBIA: estilos permitidos, en orden -->
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
<script src="../../themes/meta.js"></script>
<script src="../../engine/engine.js"></script>
<script src="../../fx/sistema.js"></script>
<script src="../../fx/fondos.js"></script>
<!-- Añade aquí los fx/ que uses: ../../fx/datos.js, ../../fx/ml.js, ../../fx/ros.js, ../../fx/arch.js -->
</body>
</html>
```

Orden obligatorio de los `<script>`: `MOTOR_PICK` → librerías CDN → `themes/meta.js` → `engine/engine.js` → `fx/sistema.js` → `fx/fondos.js` → resto de `fx/`.

Estilos válidos (no inventes otros): `rice`, `noche`, `suizo`, `aurora`, `cromo`, `arcilla`, `nube`, `termica`, `celula`, `matriz`.

Si usas `d3-cloud` o `d3-sankey`, copia también sus `<script>` de `index.html`.

## Paso 2 · Escribir las diapositivas

Una `<section class="slide">` por diapositiva. Atributos obligatorios: `id` (único), `data-section` y `data-title`.

Portada o separador:

```html
<section class="slide is-plain cover" id="portada" data-fx="backdrop" data-seed="3" data-section="Inicio" data-title="Portada">
  <div class="fx-bg"></div>
  <div class="cover-body">
    <p class="kicker">subtítulo corto</p>
    <h1 class="s-title xl">Título de la portada</h1>
    <p class="lead">Una o dos frases de entrada.</p>
  </div>
</section>
```

Diapositiva normal:

```html
<section class="slide" id="ventas" data-section="Datos" data-title="Ventas por región">
  <header class="s-head">
    <p class="kicker">datos · ventas 2025</p>
    <h2 class="s-title">Ventas por región</h2>
  </header>
  <div class="s-body cols">
    <div class="panel">…contenido principal…</div>
    <aside class="stack">…lateral…</aside>
  </div>
</section>
```

Piezas disponibles:

- Composiciones: `.cols` (cuerpo + lateral de 500 px), `.cols.wide-side`, `.cols.even`, `.cols.three`, `.stack`, `.row`.
- Bloques: `.panel`, `.label`, `.value`, `.readout`, `.legend`, `.note`, `.chip`, `.keycap`, `.win` (con `.win-bar` y `.win-body`), `.term`.
- Revelar por pasos con →: añade `data-step` a un elemento.
- Sin `data-fx`, la diapositiva es HTML estático. Es la opción más segura.

Efectos ya hechos para `data-fx` (búscalos con `grep -n "Motor.fx('" fx/*.js`): `backdrop`, `estilos`, `teoria`, `rueda`, `tipo`, `paletas`, `refs`, `compare`, `rosgraph`, `lidar`, `astar`, `tftree`, `blueprint`, `scope`, `training`, `confusion`, `latent`, `nnet`, `clouds`, `ridge`, `calendar`, `sankey`, `kpis`, `desktop`, `fetch`. Reutilízalos antes de crear uno nuevo.

## Paso 3 · Efecto nuevo (solo si hace falta)

Crea `fx/<nombre>.js` y cárgalo al final del deck.

```js
(() => {
  Motor.fx('mi-efecto', {
    render(api) {
      // Dibuja el estado FINAL completo. Sin animación.
      const host = api.q('[data-role="chart"]');
      host.innerHTML = '';
      const color = api.tok('accent');      // color del estilo activo
      const series = api.cats(3);           // colores categóricos cat-1…cat-3
      // …dibuja con d3 o con HTML…
    },
    play(api) {
      // Solo anima lo que render() ya dejó dibujado.
      if (api.reduced || !window.gsap) return;
      gsap.from(api.qa('.barra'), { scaleY: 0, transformOrigin: 'bottom', duration: api.dur / 1000, stagger: 0.05 });
    },
    stop(api) {
      // Opcional: limpia lo que play() dejó a medias.
    },
  });
})();
```

En el HTML: `<section class="slide" data-fx="mi-efecto" …>` y dentro un `<div class="fx" data-role="chart"></div>`.

Utilidades de `api`: `q(sel)`, `qa(sel)`, `tok('nombre')`, `cats(n)`, `seq(t)`, `div(t)`, `font('mono', 22, 500)`, `dark`, `style`, `meta`, `dur`, `ease(t)`, `raf(fn)`, `after(ms, fn)`, `tween(ms, fn)`, `canvas(host)`, `rng(seed)`, `noise2(seed)`, `reduced`. El motor vuelve a llamar a `render()` al cambiar de estilo o de modo, así que `render()` debe vaciar y redibujar.

## Reglas de composición

1. Lienzo de 1920×1080. El cuerpo útil mide unos 1664×630 px bajo el título. Nada puede salirse.
2. Título de una línea: como máximo unos 28 caracteres.
3. Texto mínimo de 22 px, también en ejes y leyendas.
4. Una idea por diapositiva. Mejor una tabla, un gráfico, un número grande o un diagrama que una lista de viñetas. Como mucho 4 viñetas cortas si no hay otra forma.
5. Colores solo con tokens: `var(--accent)`, `var(--fg-2)`, `api.tok('fg-2')`, `api.cats()`, `api.seq()`, `api.div()`. Nunca escribas `#hex`, `rgb()`, `hsl()` ni nombres como `red`.
6. Series categóricas siempre en el orden `cat-1`, `cat-2`… `cat-6`. Magnitudes con `seq`. Valores con signo (positivo/negativo) con `div`.
7. Estados con `var(--ok)`, `var(--warn)`, `var(--err)` y siempre con una palabra al lado («correcto», «vigilar», «fallo»). Nunca solo el color.
8. El texto de los gráficos usa `fg`, `fg-2` o `fg-3`, no el color de la serie.
9. `render()` deja el estado final completo; `play()` solo anima. Si `api.reduced` es verdadero, no animes.
10. Si los datos no los dio el usuario, escribe en la diapositiva «Datos de ejemplo» o «Datos sintéticos» (por ejemplo, en un `<p class="note">`).

## Paso 4 · Verificar

Sirve la carpeta raíz del repositorio (no la del deck), porque las rutas usan `../../`:

```bash
python -m http.server 8000
# abre http://localhost:8000/decks/<nombre>/#portada
```

Después, con el servidor en marcha, ejecuta el verificador. Hace capturas de todas las diapositivas en dos estilos y en claro y oscuro, e imprime los errores de consola y los elementos que se salen del lienzo:

```bash
npm i -D playwright && npx playwright install chromium   # solo la primera vez
node tools/verificar.mjs <nombre>                          # estilos por defecto: suizo y noche
node tools/verificar.mjs <nombre> nube,matriz              # o los que elijas
```

Las capturas quedan en `output/capturas/<nombre>/<estilo>-<modo>-<id>.png`. Si ya tienes Chromium instalado, pásalo con `CHROMIUM_PATH=/ruta/a/chrome`. Si el verificador solo imprime la línea «Capturas en …», no hay errores ni desbordes; aun así, abre algunas capturas.

Notas:

- El motor lee el estilo y el modo de `localStorage` (`motor:style`, `motor:mode`) al cargar. Cambiar `data-style` a mano después de cargar no redibuja los efectos.
- Las capturas muestran el primer paso: los elementos con `data-step` salen ocultos.

Si no tienes Playwright ni navegador, comprueba al menos:

- Que cada `id` es único: `grep -o 'id="[^"]*"' decks/<nombre>/index.html | sort | uniq -d` no debe imprimir nada.
- Que no hay colores literales: `grep -rnE '(^|[^&0-9a-zA-Z])#[0-9a-fA-F]{3}([0-9a-fA-F]{3}([0-9a-fA-F]{2})?)?\b|rgba?\(|hsla?\(' decks/<nombre>/ fx/<nombre>.js` no debe imprimir nada.
- Que todos los `data-fx` usados existen: compara `grep -o 'data-fx="[^"]*"' decks/<nombre>/index.html` con `grep -o "Motor.fx('[^']*'" fx/*.js`.
- Avisa al usuario de que no has podido verlo en un navegador.

Revisa en las capturas: errores de consola, texto que se sale del lienzo o se corta, títulos en dos líneas y textos menores de 22 px.

## Paso 5 · Entregar un solo archivo

```bash
node tools/bundle.mjs decks/<nombre>/index.html             # crea output/<nombre>.html
```

## Carpeta de salida

Todo lo que generan las herramientas va a `output/`: las presentaciones empaquetadas en la raíz y las capturas en `output/capturas/<nombre>/`. Esa carpeta no se sube a git.

Para usar otra carpeta, elige una de estas dos formas (la primera manda sobre la segunda):

```bash
node tools/bundle.mjs decks/<nombre>/index.html --out=/ruta/entregas    # solo para esta orden
export MOTOR_OUT=/ruta/entregas                                         # para toda la sesión
```

Las rutas relativas parten de la raíz del repositorio. Si el usuario indica una carpeta de salida, úsala siempre con `--out=`.

## Cambiar colores o fuentes de un estilo

Edita `themes/source.json` y ejecuta `node tools/build-themes.mjs --report`. No edites `themes/tokens.css` a mano.

## Lista de comprobación final

- [ ] `decks/<nombre>/index.html` existe y carga los scripts en el orden indicado.
- [ ] Cada diapositiva tiene `id`, `data-section` y `data-title`.
- [ ] Ningún título pasa de una línea; ningún texto baja de 22 px.
- [ ] No hay colores literales; solo tokens.
- [ ] Los datos inventados están marcados como de ejemplo o sintéticos.
- [ ] Verificado en dos estilos y en claro y oscuro, sin errores de consola ni desbordes (o se ha avisado de que no se pudo).
