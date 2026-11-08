# Motor de presentaciones · Atlas

Motor de diapositivas en HTML, CSS y JavaScript con diez direcciones de arte, cada una en modo claro y oscuro. Pensado para presentar robótica con ROS 2, aprendizaje automático, análisis de datos y un escritorio Arch con Hyprland, y para que Claude Code genere decks nuevos sobre él.

El núcleo no tiene dependencias. Los efectos de gráficos usan D3 y GSAP desde jsDelivr.

## Abrirlo

```bash
cd motor
node tools/servidor.mjs          # o python -m http.server 8000, o cualquier servidor estático
# abre http://localhost:8000/#portada (redirige a atlas/original/; el Atlas Completo está en /atlas/completo/)
```

`dist/atlas.html` es la misma presentación en un solo archivo; se abre con doble clic.

## Teclado

| Tecla | Acción |
|---|---|
| → · Espacio · ↓ | Siguiente paso o diapositiva |
| ← · ↑ | Paso o diapositiva anterior |
| S · ⇧S | Estilo siguiente · anterior |
| 1 … 9 · 0 | Ir a un estilo concreto (0 es el décimo) |
| D | Alternar claro y oscuro |
| O | Vista general (clic en una miniatura para ir) |
| F | Pantalla completa |
| H | Ocultar o mostrar los controles |

El ancla de la URL (`#lidar`) abre una diapositiva concreta. El estilo y el modo elegidos se recuerdan en el navegador.

## Estructura

```
motor/
├── index.html            redirige a atlas/original/ (conserva el #ancla)
├── engine/
│   ├── engine.css        lienzo 1920×1080, piezas comunes, HUD, vista general, impresión
│   └── engine.js         navegación, estilos, ciclo de vida de efectos, utilidades de color
├── themes/
│   ├── source.json       ← fuente única de los diez estilos (edítala aquí)
│   ├── tokens.css        generado: variables CSS por estilo y modo
│   ├── meta.js           generado: nombres, armonía, contrastes de Itten, fuentes
│   └── styles.css        tratamiento de cada estilo: decorado, paneles, títulos, transiciones
├── atlas/
│   ├── original/         deck «Atlas» (ejemplo completo, 31 diapositivas) y su atlas.css
│   └── completo/         «Atlas Completo»: una diapositiva por componente (plan en planning/atlas/)
├── fx/                   efectos: sistema, fondos (WebGL y 2D de los estilos nuevos), ros, ml, datos, arch
├── tools/
│   ├── build-themes.mjs  genera tokens.css y meta.js y ajusta las paletas de gráficos
│   ├── bundle.mjs        empaqueta un deck en un único HTML
│   ├── revisar.mjs       revisión estática de un deck (sin navegador): atributos, scripts, efectos, colores
│   ├── verificar.mjs     capturas de un deck en varios estilos, modos y pasos, con errores y desbordes
│   ├── servidor.mjs      servidor estático de la raíz (lo usan verificar y el MCP)
│   └── salida.mjs        carpeta de salida común (output/, --out o MOTOR_OUT)
├── output/               presentaciones empaquetadas y capturas (no se sube a git)
└── dist/atlas.html       versión de un solo archivo
```

## Escribir una diapositiva

```html
<section class="slide" id="lidar" data-fx="lidar" data-section="ROS 2" data-title="Escaneo LiDAR">
  <header class="s-head">
    <p class="kicker">ros 2 · sensor_msgs/msg/LaserScan</p>
    <h2 class="s-title">Escaneo LiDAR 2D</h2>
  </header>
  <div class="s-body cols">
    <div class="fx" data-role="scan"></div>
    <aside class="stack">…</aside>
  </div>
</section>
```

- Lienzo fijo de 1920×1080. Márgenes: 120 px arriba, 128 a los lados, 140 abajo. El cuerpo mide unos 1664×630 px.
- `data-section` agrupa diapositivas (barra de Rice, folio de Suizo, Cromo o Matriz, ruta de tópico de Nube).
- `data-fx` conecta un efecto. Sin `data-fx`, la diapositiva es HTML estático.
- Composiciones listas: `.cols` (cuerpo + lateral de 500 px), `.cols.wide-side`, `.cols.even`, `.cols.three`, `.stack`, `.row`.
- Piezas: `.panel`, `.label`, `.value`, `.readout`, `.legend`, `.note`, `.chip`, `.keycap`, `.win` (ventana con `.win-bar` y `.win-body`), `.term`.
- Portadas y separadores: `class="slide is-plain divider"` con `data-fx="backdrop"` y un `<div class="fx-bg">`.
  - `data-painter` cambia el fondo: `"hilos"` para todos los estilos, `"noche:escaner aurora:hilos"` solo para esos estilos (el resto usa el suyo) y `"none"` lo deja liso. En `<html>` vale para todo el deck; la diapositiva manda.
- Fondos alternativos para `data-painter`: `grano` (degradado con grano), `hilos` (haz de líneas que se deshilacha), `radar` (pantalla PPI con contactos), `topo` (terreno con curvas de nivel), `isolineas` (curvas de nivel que fluyen, en cat-1…3), `escaner` (sala de rejilla recorrida por un láser) y `velo` (banda de aurora arriba). Todos dejan libre la columna del título y tienen respaldo 2D.
- Entrada del título: `data-title-fx="auto"` (preset del estilo), `"none"` o el nombre de un preset: `rise` (rice, nube), `descifra` (noche, matriz), `mask-lines` (suizo), `blur` (aurora), `pliega` (arcilla), `enfoca` (celula). Sin atributo, solo se anima en las diapositivas con `backdrop`. En `<html>` vale para todo el deck. Cromo y Térmica nunca parten el título (lo animan en CSS).
- Pasos: añade `data-step` a cualquier elemento para revelarlo con →. Con `data-reveal="auto"` se revela con el gesto del estilo (inclinación en rice y arcilla, barrido en noche, cromo y nube, niebla en aurora, revelado en térmica, enfoque en célula, puntos en matriz, fundido en suizo); también vale un nombre fijo: `fade`, `wipe`, `wipe-x`, `focus`, `develop`, `mist`, `pixel`, `tilt`. En `<html>` vale para todo el deck.

### Gráficos (`fx/grafico.js`)

`<figure class="grafico" data-tipo="barras|columnas|lineas|dispersion">` con los datos en un `<script type="application/json">` dentro: `{"datos": [["Norte", 420], …]}` o `{"etiquetas": […], "series": [{"nombre": …, "valores": […]}]}`. Opciones: `data-apilar`, `data-unidad`, `data-dec`, `data-eje-x`, `data-eje-y`, `data-resalta`, `data-orden`, `data-cero`, `data-valores="no"`. Dibuja SVG con variables CSS (cambia de estilo sin redibujar), sin D3, y se anima al entrar o al revelar su paso.

### Notas del orador

`<aside class="notes">…</aside>` dentro de una diapositiva. No se ven en el lienzo; la tecla N abre una ventana con las notas de la diapositiva activa, la siguiente y un cronómetro.

### Piezas (`fx/piezas.js`)

Componentes por clase que se combinan en cualquier diapositiva, con o sin `data-fx`. Se ven completos sin animar (capturas, vista general, PDF).

- `<span class="cifra" data-value="97.3" data-suf=" %"></span>`: número grande que cuenta (`data-mode="count"`) o rueda por dígitos (`"roll"`); por defecto, según el estilo. `data-dec`, `data-pre`, `data-from`. Dentro de un `data-step`, se anima al revelarse. Para la variación: `<span class="cifra-delta sube"><b>▲ sube</b> 4,1 fps</span>` (o `baja`).
- `<ol class="etapas"><li data-step><b>Fase</b><small>detalle</small></li>…</ol>`: proceso lineal; cada → marca una fase como «hecho» y la siguiente como «en curso». `class="etapas v"` en vertical.
- `<ul class="checklist"><li data-step data-end="ok|warn|err">…</li></ul>`: hitos con marca y palabra (pendiente, en curso, hecho, revisar, falló). `class="checklist tacha"` tacha lo hecho.
- `<ol class="agenda"></ol>`: índice generado con los `data-section`, con la sección actual destacada (o `data-current`); `data-skip="Inicio"` omite secciones; `class="agenda banda"` la rellena.
- `<div class="reticula">` con hijos `data-target="0|1|2…"` y `data-label`: cuatro esquinas que saltan al objetivo de cada paso.
- `<div class="bento">` con celdas `.panel` (`w2`, `w3`, `h2` para ocupar más): rejilla de resumen; con `data-step` en las celdas, cada → pone el foco en una.
- `<div class="mazo">` con tarjetas `.panel`, todas con `data-step` menos la primera: cada → manda la delantera al fondo. En suizo y matriz (o con `class="mazo plana"`) se apila sin 3D.
- `class="chispa"` o `class="rayo"` en cualquier panel: una chispa que recorre el borde o un borde eléctrico (para la alerta o el punto clave).
- `class="descifra"` en un texto: se revela con glifos al entrar (`data-orden="start|center|random"`).
- `<div class="paleta" data-words="MAPA LISTO|SLAM ACTIVO|NAVEGANDO"></div>`: casillas de split-flap que recorren las palabras al entrar; con `data-pasos`, una palabra por paso.
- `<div class="term teclea"><div data-k="cmd">$ colcon build</div><div>salida</div></div>`: escribe los comandos y suelta la salida.
- `<div class="deposito" data-value="72" data-label="batería" data-umbral="30" data-critico="15"></div>`: nivel vertical con lectura grande y palabra de estado (normal, bajo, crítico).

## Efectos

```js
Motor.fx('mi-efecto', {
  render(api) { /* deja la diapositiva completa y en reposo, leyendo los tokens */ },
  play(api)   { /* anima; se llama al entrar si no hay movimiento reducido */ },
  stop(api)   { /* opcional: limpia lo que play() dejó a medias */ },
  step(api, n, { dir, el, total, animate }) { /* opcional: se muestra u oculta un [data-step]; n = pasos visibles */ },
});
```

`render()` debe dibujar el estado de `api.step` (pasos visibles; en la vista general cuentan todos) sobre `api.steps` (total). Al volver desde la diapositiva siguiente, el motor enciende todos los pasos y vuelve a llamar a `render()`.

Eventos DOM en la diapositiva, que burbujean hasta `document`: `motor:enter` (`detail.animate` indica si se puede animar), `motor:leave` y `motor:step` (`detail.step`, `detail.dir`). Presets de título nuevos: `Motor.titleFx('nombre', (title, { api, ease }) => ({ revert() {…} }))`; el preset por estilo va en `Motor.titleStyle[estilo]`.

`api` ofrece: `q()` y `qa()` dentro de la diapositiva, `tok('accent')`, `cats(6)`, `seq(t)`, `div(t)`, `font('mono', 22, 500)`, `dark`, `style`, `meta`, `dur`, `ease(t)`, `raf(fn)`, `after(ms, fn)`, `tween(ms, fn)`, `canvas(host)`, `rng(seed)`, `noise2(seed)` y `color` (OKLCH, contraste WCAG, simulación de daltonismo). Al cambiar de estilo o modo, el motor vuelve a llamar a `render()`.

Efectos incluidos: `backdrop`, `estilos`, `teoria`, `rueda`, `tipo`, `paletas`, `refs`, `compare`, `rosgraph`, `lidar`, `astar`, `tftree`, `blueprint`, `scope`, `training`, `confusion`, `latent`, `nnet`, `clouds`, `ridge`, `calendar`, `sankey`, `kpis`, `desktop`, `fetch`.

## Estilos

| Tecla | id | Nombre | Idea | Tipografía | Fondo de portadas | Transición |
|---|---|---|---|---|---|---|
| 1 | `rice` | Rice | Catppuccin Mocha / Latte, escritorio de Hyprland | Outfit + JetBrains Mono | ventanas en mosaico con borde que gira | cambio de espacio de trabajo |
| 2 | `noche` | Noche | Tokyo Night, interfaz de ficción | Chakra Petch + IBM Plex Mono | horizonte de neón | fallo de señal |
| 3 | `suizo` | Suizo | acromático + rojo, editorial de datos | Instrument Sans + Instrument Serif | geometría de arcos | corte vertical |
| 4 | `aurora` | Aurora | Rosé Pine, arte generativo | Bricolage Grotesque + DM Mono | campo de flujo | fundido con desenfoque |
| 5 | `cromo` | Cromo | metal líquido, estética Y3K | Unbounded + Manrope + Martian Mono | metabolas cromadas por raymarching (WebGL) | telón de metal que gotea |
| 6 | `arcilla` | Arcilla | render 3D mate de plastilina | Fraunces + Albert Sans + Red Hat Mono | brazo robótico con sombras suaves y oclusión (WebGL) | llegada blanda que se aplasta |
| 7 | `nube` | Nube | gemelo digital, nube de puntos LiDAR | Geist + Geist Mono | unos 40 000 puntos de un escaneo simulado, mapa Turbo (WebGL) | barrido de escáner |
| 8 | `termica` | Térmica | cámara infrarroja | Schibsted Grotesk + Spline Sans Mono | robot móvil en ironbow o «negro caliente» con isotermas | destello de calibración |
| 9 | `celula` | Célula | microscopía | Newsreader + Public Sans + Sometype Mono | tejido en fluorescencia (oscuro) o tinción H&E (claro) | diafragma circular |
| 0 | `matriz` | Matriz | matriz de LED, monocromo con rojo | Doto + Host Grotesk + Fragment Mono | globo de LED con anillo glifo | puntos que crecen hasta tocarse |

Elige el estilo por defecto con `<html data-style="nube">` o con `"default"` en `themes/source.json`. Cada deck puede limitar y ordenar sus estilos con `<script>window.MOTOR_PICK = ['rice', 'nube', …]</script>` antes de cargar `themes/meta.js`; sin esa línea aparecen todos en el orden de `source.json`.

Los fondos de Cromo, Arcilla y Nube usan WebGL. Si el navegador no da contexto WebGL, dibujan una versión plana en canvas 2D. La capa pide WebGL2 y, si no lo hay, WebGL1: los sombreadores GLSL 1.00 van en las dos, y los que empiezan por `#version 300 es` solo en WebGL2 (sin él, el pintor usa su respaldo 2D). Las utilidades están en `Motor.gl` (`layer`, `program`, `drawFull`, `uniforms`, `scale`, `throttle`, `VS_FULL`); `program()` cambia a `VS_FULL2` si el fragmento es 3.00. Arcilla es el más costoso: se dibuja a menos resolución y a 20 imágenes por segundo. Con movimiento reducido, todos los fondos se quedan quietos.

### Añadir o cambiar un estilo

1. Edita `themes/source.json`: colores por rol (`bg`, `fg`, `accent`…), candidatos de serie (`cats`), tono secuencial (`seq`), polos divergentes (`div`), fuentes, forma y movimiento.
2. Ejecuta `node tools/build-themes.mjs --report`.
   - Iguala la luminosidad OKLCH de las series de gráfico y elige el orden con mayor separación para protanopía y deuteranopía (ΔE OKLab ≥ 8 entre vecinas).
   - Corrige `fg-2`, `fg-3` y los `*-ink` hasta un contraste WCAG suficiente.
3. Añade su tratamiento en `themes/styles.css` (decorado, paneles, títulos y transición), la familia en el enlace de Google Fonts y su fondo en `fx/fondos.js` (`Motor.painters[id] = { init, frame }`).

## Empaquetar y exportar

```bash
node tools/bundle.mjs atlas/original/index.html dist/atlas.html   # un solo HTML, en una ruta concreta
node tools/bundle.mjs atlas/completo/index.html                   # sin destino: output/atlas-completo.html
node tools/bundle.mjs decks/motor-pruebas/index.html              # output/motor-pruebas.html
node tools/bundle.mjs decks/motor-pruebas/index.html --fragment   # output/motor-pruebas-frag.html, sin doctype/head/body
```

Sin archivo de destino, el resultado va a la carpeta de salida: `output/` por defecto, o la que indiques con `--out=<carpeta>` o con la variable `MOTOR_OUT` (la opción manda sobre la variable). `node tools/verificar.mjs <deck>` guarda allí sus capturas, en `capturas/<deck>/`.

Para PDF, imprime desde Chrome: la hoja de impresión pone cada diapositiva en una página de 1920×1080.

## Dependencias

D3 7.9.0, d3-cloud 1.2.7, d3-sankey 0.12.3, GSAP 3.13.0 con SplitText (gratuito, incluso para uso comercial, según su README). Fuentes de Google Fonts.

## Créditos de paletas

Catppuccin (MIT), Tokyo Night de folke (Apache-2.0) y Rosé Pine (MIT). Nube usa el mapa Turbo de Google (Apache-2.0) para la altura de los puntos; Térmica sigue la idea de las paletas ironbow de las cámaras térmicas. Suizo, Cromo, Arcilla, Célula y Matriz son propias. Okabe–Ito y viridis aparecen como referencia en la diapositiva de referencias.

Los datos de todas las demos son sintéticos y se generan en el navegador con semillas fijas.
