# Efecto nuevo

Solo si ninguna pieza, ni `.grafico`, ni un efecto genérico (`secuencia`, `vc-plot`), ni un SVG estático sirve. Para barras, columnas, líneas o dispersión usa `.grafico`; el ejemplo de abajo solo ilustra el patrón. Va en `fx/<nombre>.js` si puede servir a otros decks, o en `decks/<deck>/fx.js` si es solo de ese deck. Se carga después de `fx/piezas.js`.

## Contrato

```js
Motor.fx('nombre', {
  render(api) {},           // obligatorio: vacía y dibuja el estado FINAL de api.step; se repite al cambiar de estilo o modo
  play(api) {},             // opcional: solo anima lo que render() dejó; no se llama con movimiento reducido
  stop(api) {},             // opcional: cancela lo que play() dejó a medias
  step(api, n, { dir }) {}, // opcional: se mostró u ocultó un [data-step]; n = pasos visibles
});
```

`api`: `q(sel)`, `qa(sel)` (dentro de la diapositiva), `el`, `tok('fg-2')`, `cats(n)`, `seq(t)`, `div(t)`, `font('mono', 22, 500)`, `dark`, `style`, `dur`, `ease(t)`, `step`, `steps`, `raf(fn)`, `after(ms, fn)`, `tween(ms, fn)` (se cancelan solos al salir), `canvas(host)`, `rng(seed)`, `noise2(seed)`, `reduced`, y `Motor.color` (`alpha`, `contrast`, `parse`).

## Ejemplo: barras con datos del propio HTML

Los datos van en el HTML, no en el JavaScript, para que el efecto sirva para cualquier deck.

```html
<section class="slide" id="ventas" data-fx="barras" data-section="Datos" data-title="Ventas por región">
  <header class="s-head"><p class="kicker">datos · 2025</p><h2 class="s-title">Ventas por región</h2></header>
  <div class="s-body stack">
    <div class="fx" data-role="chart" style="height:540px"></div>
    <script type="application/json" data-role="datos">{"unidad":"k€","filas":[["Norte",420],["Sur",310],["Este",265]]}</script>
    <p class="note">Datos de ejemplo.</p>
  </div>
</section>
```

```js
(() => {
  Motor.fx('barras', {
    render(api) {
      const { unidad, filas } = JSON.parse(api.q('[data-role="datos"]').textContent);
      const host = api.q('[data-role="chart"]');
      host.innerHTML = '';
      const W = host.clientWidth || 1664, H = host.clientHeight || 540, L = 220, R = 140;
      const max = Math.max(...filas.map((f) => f[1])), bh = Math.min(72, (H - 20) / filas.length - 16);
      const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const g = svg.selectAll('g').data(filas).join('g').attr('transform', (_, i) => `translate(0,${10 + i * (bh + 16)})`);
      g.append('text').attr('x', L - 16).attr('y', bh / 2).attr('dy', '.35em').attr('text-anchor', 'end')
        .attr('fill', api.tok('fg')).style('font', api.font('text', 26, 500)).text((f) => f[0]);
      g.append('rect').attr('class', 'bar').attr('x', L).attr('height', bh).attr('rx', 4)
        .attr('width', (f) => (W - L - R) * f[1] / max).attr('fill', api.tok('cat-1'));   // una serie: cat-1
      g.append('text').attr('x', (f) => L + (W - L - R) * f[1] / max + 12).attr('y', bh / 2).attr('dy', '.35em')
        .attr('fill', api.tok('fg-2')).style('font', api.font('mono', 24, 500)).text((f) => `${f[1]} ${unidad}`);
    },
    play(api) {
      if (api.reduced || !window.gsap) return;
      gsap.from(api.qa('.bar'), { attr: { width: 0 }, duration: api.dur / 1000, stagger: 0.08, ease: 'power2.out' });
    },
  });
})();
```

## Errores típicos

| Error | Arreglo |
|---|---|
| `render()` añade sin vaciar y se duplica al cambiar de estilo | empieza con `host.innerHTML = ''` |
| colores calculados una vez al cargar | léelos dentro de `render()`: cambian con el estilo y el modo |
| `play()` deja el estado final distinto de `render()` | `play()` solo interpola hacia lo que ya está dibujado |
| `setTimeout`/`requestAnimationFrame` propios que siguen al salir | usa `api.after`, `api.raf`, `api.tween` |
| texto de ejes en el color de la serie o a menos de 22 px | `fg`/`fg-2`/`fg-3` y `api.font(rol, ≥22)` |
| nombre de clase genérico (`.pila`, `.pasos`) que choca con otro deck | antes de crear una clase, `grep -rn "\.nombre" engine themes fx decks/*/` |
