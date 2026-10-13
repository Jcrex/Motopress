# Motor de presentaciones · Atlas

Motor de diapositivas en HTML, CSS y JavaScript con diez direcciones de arte, cada una en modo claro y oscuro. Pensado para presentar robótica con ROS 2, aprendizaje automático, análisis de datos y un escritorio Arch con Hyprland, y para que Claude Code genere decks nuevos sobre él.

El núcleo no tiene dependencias. Los efectos de gráficos usan D3 y GSAP desde jsDelivr.

## Abrirlo

```bash
cd motor
python -m http.server 8000      # o cualquier servidor estático
# abre http://localhost:8000/#portada
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
├── index.html            deck «Atlas» (ejemplo completo, 31 diapositivas)
├── engine/
│   ├── engine.css        lienzo 1920×1080, piezas comunes, HUD, vista general, impresión
│   └── engine.js         navegación, estilos, ciclo de vida de efectos, utilidades de color
├── themes/
│   ├── source.json       ← fuente única de los diez estilos (edítala aquí)
│   ├── tokens.css        generado: variables CSS por estilo y modo
│   ├── meta.js           generado: nombres, armonía, contrastes de Itten, fuentes
│   └── styles.css        tratamiento de cada estilo: decorado, paneles, títulos, transiciones
├── atlas/atlas.css       maquetación propia del deck de ejemplo
├── fx/                   efectos: sistema, fondos (WebGL y 2D de los estilos nuevos), ros, ml, datos, arch
├── tools/
│   ├── build-themes.mjs  genera tokens.css y meta.js y ajusta las paletas de gráficos
│   └── bundle.mjs        empaqueta un deck en un único HTML
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
- Pasos: añade `data-step` a cualquier elemento para revelarlo con →.

## Efectos

```js
Motor.fx('mi-efecto', {
  render(api) { /* deja la diapositiva completa y en reposo, leyendo los tokens */ },
  play(api)   { /* anima; se llama al entrar si no hay movimiento reducido */ },
  stop(api)   { /* opcional: limpia lo que play() dejó a medias */ },
});
```

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

Los fondos de Cromo, Arcilla y Nube usan WebGL. Si el navegador no da contexto WebGL, dibujan una versión plana en canvas 2D. Arcilla es el más costoso: se dibuja a menos resolución y a 20 imágenes por segundo. Con movimiento reducido, todos los fondos se quedan quietos.

### Añadir o cambiar un estilo

1. Edita `themes/source.json`: colores por rol (`bg`, `fg`, `accent`…), candidatos de serie (`cats`), tono secuencial (`seq`), polos divergentes (`div`), fuentes, forma y movimiento.
2. Ejecuta `node tools/build-themes.mjs --report`.
   - Iguala la luminosidad OKLCH de las series de gráfico y elige el orden con mayor separación para protanopía y deuteranopía (ΔE OKLab ≥ 8 entre vecinas).
   - Corrige `fg-2`, `fg-3` y los `*-ink` hasta un contraste WCAG suficiente.
3. Añade su tratamiento en `themes/styles.css` (decorado, paneles, títulos y transición), la familia en el enlace de Google Fonts y su fondo en `fx/fondos.js` (`Motor.painters[id] = { init, frame }`).

## Empaquetar y exportar

```bash
node tools/bundle.mjs index.html dist/atlas.html              # un solo HTML
node tools/bundle.mjs index.html dist/atlas-frag.html --fragment  # sin doctype/head/body
```

Para PDF, imprime desde Chrome: la hoja de impresión pone cada diapositiva en una página de 1920×1080.

## Dependencias

D3 7.9.0, d3-cloud 1.2.7, d3-sankey 0.12.3, GSAP 3.13.0 con SplitText (gratuito, incluso para uso comercial, según su README). Fuentes de Google Fonts.

## Créditos de paletas

Catppuccin (MIT), Tokyo Night de folke (Apache-2.0) y Rosé Pine (MIT). Nube usa el mapa Turbo de Google (Apache-2.0) para la altura de los puntos; Térmica sigue la idea de las paletas ironbow de las cámaras térmicas. Suizo, Cromo, Arcilla, Célula y Matriz son propias. Okabe–Ito y viridis aparecen como referencia en la diapositiva de referencias.

Los datos de todas las demos son sintéticos y se generan en el navegador con semillas fijas.
