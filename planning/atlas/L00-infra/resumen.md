# L00 · Resumen

Cerrado el 2026-11-08.

## Hecho

| Tarea | Resultado |
|---|---|
| T1 | `tools/verificar.mjs` acepta rutas (`atlas/completo`, `.`). Con nombres de `decks/` funciona igual que antes. |
| T2 | 248 capturas de referencia del Atlas en la raíz (suizo, noche, rice y cromo; claro y oscuro; movimiento reducido). |
| T3 | `index.html` y `atlas.css` movidos con `git mv` a `atlas/original/`, con rutas `../../`. La raíz tiene un `index.html` que redirige y conserva el `#ancla`. |
| T4 | 102 de 248 capturas difieren, todas por contenido que depende de la hora o por ruido; ver más abajo. Ningún cambio de maquetación. |
| T5 | Actualizados README, CLAUDE.md y AGENTS.md. `bundle.mjs` usa por defecto `atlas/original/index.html` y llama `atlas-<x>` a `atlas/<x>/`. `dist/atlas.html` regenerado: se abre con doble clic y sin errores. |
| T6 | `atlas/completo/index.html` con portada `l00-portada`, todos los `fx/` del motor y de los decks, KaTeX 0.16.11, three.js local y `<link rel="icon" href="data:,">`. |
| T7 | `atlas/completo/completo.css`: ficha, ficha ancha, etiqueta experimental, portada y título de lote. Revisada en los diez estilos, claro y oscuro, sin desbordes. |
| T8 | Copiados three.js, STLLoader, su licencia, el STL del G1 con la licencia de unitree_ros y la imagen de respaldo. |
| T9 | `fx/experimental/README.md`. |
| T10 | `planning/atlas/recorrer.mjs`: recorre paso a paso y atribuye cada error a la diapositiva activa. Probado con un error provocado: lo detecta en `l00-error` y sale con 1. |

## Cambios respecto al plan

- **Prefijo `ac-`** en todas las clases del Atlas Completo (`ac-ficha`, `ac-demo`, `ac-info`, `ac-nombre`, `ac-proposito`, `ac-params`, `ac-fuente`, `ac-exp`, `ac-lote`, `ac-portada`, `ac-lotes`). Hacía falta porque `.ficha` ya existe en `decks/arquitectura-g1-haiku/arq.css` y en `estado-arte-nav-semantica`, y `.exp` en `fx/datos.js` y en vc-lab2 y vc-lab3. La variante ancha es `ac-ficha ancha`.
- **CSS de decks para L11 (parte de T8):** se deja para L11, porque solo se sabe qué reglas hacen falta al montar cada efecto.
- **Tamaño de `dist/atlas.html`:** pasa de 310 a 356 KB (+15 %), no menos del 1 % previsto. El archivo anterior estaba desfasado (era de antes de las fases 0–2, sin revelados ni piezas); el diff solo añade ese CSS y JS.

## Ruido conocido en la regresión de capturas

- Reloj de la barra de rice (unos 60×16 px arriba a la derecha) y reloj del escritorio Hyprland.
- `calendario`: cambia con la fecha (las dos pasadas quedaron a ambos lados de la medianoche).
- Cromo en claro: el fondo metálico cambia unos 1000 píxeles en cada captura, incluso con movimiento reducido.
- Suavizado de bordes: unos 250 píxeles por debajo del umbral visual.
- El 404 de consola que aparecía en todos los decks es `favicon.ico`.

## Plantilla de ficha (marcado)

```html
<section class="slide" id="lNN-componente" data-section="…" data-title="…">
  <header class="s-head">
    <p class="kicker">lNN · lote <span class="ac-exp">Experimental · quizás</span></p>   <!-- etiqueta solo en los quizás -->
    <h2 class="s-title">Nombre corto</h2>
  </header>
  <div class="s-body ac-ficha">                         <!-- o «ac-ficha ancha» -->
    <div class="ac-demo">…demo en vivo…</div>
    <aside class="ac-info panel">
      <p class="ac-nombre"><b>Nombre</b><code>id</code></p>
      <p class="ac-proposito">Propósito.</p>
      <dl class="ac-params"><dt>data-x</dt><dd>valores</dd></dl>
      <p class="ac-fuente"><code>archivo</code><span>react-bits: …</span></p>
    </aside>
  </div>
</section>
```
