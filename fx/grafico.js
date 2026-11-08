/* Gráfico genérico con los datos en el HTML. Pieza por clase: no necesita data-fx ni D3.

   <figure class="grafico" data-tipo="barras" data-unidad="ms">
     <script type="application/json">{"datos": [["Norte", 420], ["Sur", 310]]}<\/script>
   </figure>

   Datos (JSON dentro del <figure>), una de estas formas:
     {"datos": [["etiqueta", valor], …]}                                   una serie
     {"etiquetas": ["a", "b"], "series": [{"nombre": "2024", "valores": [1, 2]}, …]}
     {"series": [{"nombre": "A", "puntos": [[x, y], …]}, …]}               solo dispersion
     "x": [0, 5, 10] en lugar de "etiquetas" hace numérico el eje x de «lineas».
   Atributos:
     data-tipo     barras (horizontales, por defecto) · columnas · lineas · dispersion
     data-apilar   en barras y columnas con varias series: apiladas en vez de agrupadas
     data-unidad   sufijo de los valores («ms», « %»)      data-dec   decimales del eje de valores (auto)
     data-eje-x / data-eje-y   título de los ejes          data-cero  lineas: el eje y empieza en 0
     data-resalta  etiquetas destacadas, separadas por «|»: el resto queda en gris
     data-valores="no"  sin rótulos de valor               data-orden="desc|asc"  ordena una serie
   Colores: serie i → var(--cat-i); el SVG usa variables CSS, así que cambia con el estilo sin redibujar.
   Se dibuja completo al cargar; al entrar en la diapositiva (o al revelarse su data-step) se anima. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const ctx = document.createElement('canvas').getContext('2d');
  const textW = (el, s, size, role = 'text', weight = 500) => {
    ctx.font = `${weight} ${size}px ${getComputedStyle(el).getPropertyValue('--font-' + role) || 'sans-serif'}`;
    return ctx.measureText(String(s)).width;
  };

  /* ---------- datos ---------- */
  // Número desde JSON o texto: acepta «1,5» (coma decimal) y «1.234,5»; null o vacío = hueco.
  const num = (v) => {
    if (v == null || v === '') return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    let t = String(v).trim().replace(/\s/g, '');
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    const n = Number(t);
    if (!Number.isFinite(n)) throw new Error(`valor no numérico: «${v}»`);
    return n;
  };
  function parse(el) {
    const raw = el.querySelector('script[type="application/json"]');
    if (!raw) throw new Error('falta <script type="application/json"> con los datos');
    const d = JSON.parse(raw.textContent);
    let labels = d.etiquetas || null, series = d.series || [];
    if (d.datos) { labels = d.datos.map((r) => r[0]); series = [{ nombre: d.nombre || '', valores: d.datos.map((r) => r[1]) }]; }
    if (d.x) labels = d.x;
    series = series.map((s) => ({ ...s, valores: s.valores && s.valores.map(num), puntos: s.puntos && s.puntos.map(([a, b]) => [num(a), num(b)]) }));
    if (d.x) labels = labels.map(num);
    if (!series.length || !series.some((s) => (s.valores || s.puntos || []).some((v) => v != null && (!Array.isArray(v) || v[1] != null)))) throw new Error('no hay valores');
    if (!labels && !series.every((s) => s.puntos)) throw new Error('faltan "etiquetas" o "datos"');
    const orden = el.dataset.orden;
    if (orden && series.length === 1 && labels) {
      const idx = labels.map((_, i) => i).sort((a, b) => (orden === 'asc' ? 1 : -1) * ((series[0].valores[a] ?? -Infinity) - (series[0].valores[b] ?? -Infinity)));
      labels = idx.map((i) => labels[i]); series = [{ ...series[0], valores: idx.map((i) => series[0].valores[i]) }];
    }
    return { labels, series, numericX: !!d.x };
  }

  /* ---------- escalas y formato ---------- */
  function nice(lo, hi, count = 5) {
    if (lo === hi) { hi = lo + 1; lo = Math.min(0, lo); }
    const raw = (hi - lo) / count, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
    const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
    const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, ticks = [];
    for (let v = a; v <= b + step / 2; v += step) ticks.push(+v.toFixed(10));
    return { lo: a, hi: b, ticks, step };
  }
  // Decimales que hacen falta para escribir v sin redondear (2,5 → 1; 0,25 → 2; 25 → 0), hasta max.
  const decOf = (v, max = 10) => { v = Math.abs(v); for (let d = 0; d < max; d++) { const k = v * 10 ** d; if (Math.abs(k - Math.round(k)) < 1e-6 * Math.max(1, k)) return d; } return max; };
  const ownDec = (el) => { const d = num(el.dataset.dec); return Number.isInteger(d) && d >= 0 && d <= 20 ? d : null; };
  const nf = (dec) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  // Marcas del eje: decimales del paso (o data-dec).
  const fmtr = (el, step, own = true) => { const d = own ? ownDec(el) : null, f = nf(d ?? decOf(step)); return (v) => f.format(v); };
  // Rótulos de valor: data-dec si existe; si no, los decimales del propio valor (hasta 2), nunca menos que el eje.
  const fmtVal = (el, step) => { const d = ownDec(el), base = decOf(step), cache = {}; return (v) => { const k = d ?? Math.max(base, decOf(v, 2)); return (cache[k] ||= nf(k)).format(v); }; };
  const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

  /* ---------- dibujo ---------- */
  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const txt = (parent, x, y, s, cls, anchor = 'start', extra = {}) => { const t = svgEl('text', { x, y, class: cls, 'text-anchor': anchor, 'dominant-baseline': 'middle', ...extra }, parent); t.textContent = s; return t; };
  const color = (i) => `var(--cat-${(i % 6) + 1})`;

  const fail = (el, e) => {
    const keep = el.querySelector('script[type="application/json"]');
    el.textContent = ''; if (keep) el.appendChild(keep);
    el.insertAdjacentHTML('beforeend', `<p class="note">Gráfico sin datos válidos: ${esc(e.message)}</p>`);
    console.error('[grafico]', e);
  };
  function render(el) {
    let data;
    try { data = parse(el); } catch (e) { fail(el, e); return; }
    try { draw(el, data); } catch (e) { fail(el, e); }
  }
  function draw(el, data) {
    const keep = el.querySelector('script[type="application/json"]');
    const cap = el.querySelector('figcaption');
    el.textContent = ''; el.appendChild(keep);
    const tipo = el.dataset.tipo || 'barras', { labels, series } = data;
    if (series.length > 1) {
      const ul = document.createElement('ul'); ul.className = 'legend grafico-legend';
      ul.innerHTML = series.map((s, i) => `<li><i class="${tipo === 'lineas' ? 'line' : ''}" style="--c:${color(i)}"></i>${esc(s.nombre)}</li>`).join('');
      el.appendChild(ul);
    }
    const W = Math.round(el.clientWidth) || 1200, H = Math.max(240, Math.round(el.clientHeight - (series.length > 1 ? 56 : 0) - (cap ? 44 : 0)) || 480);
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img' }, el);
    const unit = el.dataset.unidad || '', showVals = el.dataset.valores !== 'no';
    const hi = new Set((el.dataset.resalta || '').split('|').map((s) => s.trim()).filter(Boolean));
    const fillOf = (si, label) => (hi.size ? (hi.has(String(label)) ? color(si) : 'var(--fg-3)') : color(si));
    const opOf = (label) => (hi.size && !hi.has(String(label)) ? 0.45 : 1);
    const stack = el.dataset.apilar != null && series.length > 1;
    const axisX = el.dataset.ejeX, axisY = el.dataset.ejeY;

    if (tipo === 'barras' || tipo === 'columnas') {
      const n = labels.length, m = series.length;
      const totals = labels.map((_, j) => series.reduce((a, s) => a + (s.valores[j] ?? 0), 0));
      const all = stack ? totals : series.flatMap((s) => s.valores.filter((v) => v != null));
      const sc = nice(Math.min(0, ...all), Math.max(0, ...all));
      const fmt = fmtr(el, sc.step), lab = (v) => fmt(v) + unit, fv = fmtVal(el, sc.step), labV = (v) => fv(v) + unit;
      const horiz = tipo === 'barras';
      if (horiz) {
        const left = Math.min(W * 0.4, Math.max(...labels.map((l) => textW(el, l, 26))) + 24);
        const valW = showVals ? Math.max(...all.map((v) => textW(el, labV(v), 22, 'mono'))) + 16 : 12;
        const top = 4, bottom = H - (axisX ? 84 : 48), x = lin(sc.lo, sc.hi, left, W - valW);
        const band = (bottom - top) / n, bh = Math.min(84, band * 0.72);
        sc.ticks.forEach((t) => { svgEl('line', { x1: x(t), x2: x(t), y1: top, y2: bottom, class: t === 0 ? 'g-zero' : 'g-grid' }, svg); txt(svg, x(t), bottom + 22, lab(t), 'g-tick', 'middle'); });
        if (axisX) txt(svg, (left + W - valW) / 2, H - 18, axisX, 'g-axis', 'middle');
        labels.forEach((l, j) => {
          const y0 = top + band * j + (band - bh) / 2;
          txt(svg, left - 16, y0 + bh / 2, l, 'g-label', 'end', { opacity: opOf(l) });
          let acc = 0;
          series.forEach((s, i) => {
            const raw = s.valores[j], v = raw ?? 0, h = stack ? bh : bh / m, y = stack ? y0 : y0 + h * i;
            if (raw == null) { if (showVals && !stack) txt(svg, x(0) + 10, y + h / 2, 'sin dato', 'g-val g-nd', 'start'); return; } // hueco: sin barra
            const a = stack ? acc : 0, b = a + v; acc = stack ? b : acc;
            svgEl('rect', { x: x(Math.min(a, b)), y, width: Math.abs(x(b) - x(a)), height: Math.max(1, h - (stack ? 0 : 3)), rx: 3, class: 'g-bar', style: `fill:${fillOf(i, l)}`, opacity: opOf(l), 'data-o': x(0), 'data-dir': 'x' }, svg);
            if (showVals && !stack) txt(svg, x(Math.max(0, v)) + 10, y + h / 2, labV(v), 'g-val', 'start');
          });
          if (showVals && stack) txt(svg, x(totals[j]) + 10, y0 + bh / 2, labV(totals[j]), 'g-val', 'start');
        });
      } else {
        const tickW = Math.max(...sc.ticks.map((t) => textW(el, lab(t), 22, 'mono')));
        const left = tickW + (axisY ? 64 : 20), top = showVals ? 36 : 8, bottom = H - (axisX ? 96 : 56), right = W - 8;
        const y = lin(sc.lo, sc.hi, bottom, top), band = (right - left) / n, bw = Math.min(140, band * 0.7);
        sc.ticks.forEach((t) => { svgEl('line', { x1: left, x2: right, y1: y(t), y2: y(t), class: t === 0 ? 'g-zero' : 'g-grid' }, svg); txt(svg, left - 12, y(t), lab(t), 'g-tick', 'end'); });
        if (axisY) txt(svg, 22, (top + bottom) / 2, axisY, 'g-axis', 'middle', { transform: `rotate(-90 22 ${(top + bottom) / 2})` });
        if (axisX) txt(svg, (left + right) / 2, H - 20, axisX, 'g-axis', 'middle');
        labels.forEach((l, j) => {
          const x0 = left + band * j + (band - bw) / 2;
          txt(svg, x0 + bw / 2, bottom + 28, l, 'g-label', 'middle', { opacity: opOf(l) });
          let acc = 0;
          series.forEach((s, i) => {
            const raw = s.valores[j], v = raw ?? 0, w = stack ? bw : bw / m, xx = stack ? x0 : x0 + w * i;
            if (raw == null) { if (showVals && !stack && m * n <= 24) txt(svg, xx + w / 2, y(0) - 18, 's/d', 'g-val g-nd', 'middle'); return; } // hueco: sin barra
            const a = stack ? acc : 0, b = a + v; acc = stack ? b : acc;
            svgEl('rect', { x: xx, y: y(Math.max(a, b)), width: Math.max(1, w - (stack ? 0 : 3)), height: Math.abs(y(a) - y(b)), rx: 3, class: 'g-bar', style: `fill:${fillOf(i, l)}`, opacity: opOf(l), 'data-o': y(0), 'data-dir': 'y' }, svg);
            if (showVals && !stack && m * n <= 24) txt(svg, xx + w / 2, y(Math.max(0, v)) - 18, labV(v), 'g-val', 'middle');
          });
          if (showVals && stack) txt(svg, x0 + bw / 2, y(totals[j]) - 18, labV(totals[j]), 'g-val', 'middle');
        });
      }
    } else if (tipo === 'lineas' || tipo === 'dispersion') {
      const pts = tipo === 'dispersion'
        ? series.map((s) => s.puntos.filter(([a, b]) => a != null && b != null))
        : series.map((s) => s.valores.map((v, j) => [data.numericX ? labels[j] : j, v]));
      const flat = pts.flat().filter((p) => p[1] != null);
      const ys = flat.map((p) => p[1]), xs = flat.map((p) => p[0]);
      const sy = nice(el.dataset.cero != null ? Math.min(0, ...ys) : Math.min(...ys), Math.max(...ys));
      const categorical = tipo === 'lineas' && !data.numericX;
      const sx = categorical ? null : nice(Math.min(...xs), Math.max(...xs));
      const fy = fmtr(el, sy.step), ly = (v) => fy(v) + unit, fx = sx ? fmtr(el, sx.step, false) : null;
      const fyv = fmtVal(el, sy.step), lyv = (v) => fyv(v) + unit;
      const lastOf = (s) => { for (let k = s.valores.length - 1; k >= 0; k--) if (s.valores[k] != null) return s.valores[k]; return null; };
      const tickW = Math.max(...sy.ticks.map((t) => textW(el, ly(t), 22, 'mono')));
      const endW = tipo === 'lineas' && showVals ? Math.max(...series.map((s) => (lastOf(s) == null ? 0 : textW(el, lyv(lastOf(s)), 22, 'mono')))) + 20 : 16;
      const left = tickW + (axisY ? 64 : 20), top = 16, bottom = H - (axisX ? 96 : 56), right = W - endW;
      const y = lin(sy.lo, sy.hi, bottom, top);
      const x = categorical ? (j) => left + (labels.length < 2 ? 0 : (j / (labels.length - 1)) * (right - left)) : lin(sx.lo, sx.hi, left, right);
      sy.ticks.forEach((t) => { svgEl('line', { x1: left, x2: right, y1: y(t), y2: y(t), class: t === 0 ? 'g-zero' : 'g-grid' }, svg); txt(svg, left - 12, y(t), ly(t), 'g-tick', 'end'); });
      if (categorical) {
        const every = Math.ceil(labels.length / Math.max(1, Math.floor((right - left) / (Math.max(...labels.map((l) => textW(el, l, 22, 'mono'))) + 24))));
        labels.forEach((l, j) => { if (j % every === 0) txt(svg, x(j), bottom + 28, l, 'g-tick', 'middle'); });
      } else sx.ticks.forEach((t) => { svgEl('line', { x1: x(t), x2: x(t), y1: top, y2: bottom, class: 'g-grid' }, svg); txt(svg, x(t), bottom + 28, fx(t), 'g-tick', 'middle'); });
      if (axisY) txt(svg, 22, (top + bottom) / 2, axisY, 'g-axis', 'middle', { transform: `rotate(-90 22 ${(top + bottom) / 2})` });
      if (axisX) txt(svg, (left + right) / 2, H - 20, axisX, 'g-axis', 'middle');
      pts.forEach((p, i) => {
        const c = color(i), ok = p.filter((q) => q[1] != null);
        if (tipo === 'lineas') {
          // Un hueco (null) corta la línea: el tramo siguiente empieza con M.
          const d = p.map((q, k) => (q[1] == null ? '' : `${k && p[k - 1][1] != null ? 'L' : 'M'}${x(q[0]).toFixed(1)},${y(q[1]).toFixed(1)}`)).join('');
          svgEl('path', { d, class: 'g-line', style: `stroke:${c}` }, svg);
          if (ok.length <= 24) ok.forEach((q) => svgEl('circle', { cx: x(q[0]), cy: y(q[1]), r: 6, class: 'g-dot', style: `fill:${c}` }, svg));
          const last = ok[ok.length - 1];
          if (showVals && last) txt(svg, x(last[0]) + 14, y(last[1]), lyv(last[1]), 'g-val', 'start');
        } else ok.forEach((q) => svgEl('circle', { cx: x(q[0]), cy: y(q[1]), r: 11, class: 'g-dot g-pt', style: `fill:${c}` }, svg));
      });
    } else {
      el.insertAdjacentHTML('beforeend', `<p class="note">Tipo de gráfico desconocido: ${esc(tipo)}</p>`);
    }
    if (cap) el.appendChild(cap);
    el._size = el.clientWidth + 'x' + el.clientHeight;
    svg.setAttribute('aria-label', (el.getAttribute('aria-label') || el.closest('.slide')?.dataset.title || 'gráfico'));
  }

  /* ---------- animación ---------- */
  function play(el, api) {
    const dur = Math.max(600, (api && api.dur) || 600) * 1.3, ease = 'cubic-bezier(.2,.7,.2,1)';
    try {
      el.querySelectorAll('.g-bar').forEach((b, k) => {
        const o = b.dataset.o, ax = b.dataset.dir;
        b.style.transformOrigin = ax === 'x' ? `${o}px 0` : `0 ${o}px`; b.style.transformBox = 'view-box';
        b.animate([{ transform: ax === 'x' ? 'scaleX(0)' : 'scaleY(0)' }, { transform: 'none' }], { duration: dur, delay: k * 40, easing: ease, fill: 'backwards' });
      });
      el.querySelectorAll('.g-line').forEach((p) => {
        const L = p.getTotalLength();
        p.animate([{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }], { duration: dur * 1.4, easing: ease });
      });
      el.querySelectorAll('.g-dot, .g-val').forEach((d, k) => d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: dur * 0.6 + k * 12, fill: 'backwards' }));
    } catch (e) { /* sin WAAPI: queda el estado final */ }
  }

  /* ---------- ciclo ---------- */
  const hidden = (el) => { const s = el.closest('[data-step]'); return s && !s.classList.contains('on'); };
  const renderIn = (root) => root.querySelectorAll('.grafico').forEach((el) => { if (el._size !== el.clientWidth + 'x' + el.clientHeight) render(el); });
  document.addEventListener('motor:enter', (e) => {
    const { slide, api, animate } = e.detail;
    renderIn(slide);
    if (animate) slide.querySelectorAll('.grafico').forEach((el) => { if (!hidden(el)) play(el, api); });
  });
  document.addEventListener('motor:step', (e) => {
    const { el, api, dir, animate } = e.detail;
    if (dir !== 'next' || !animate || !el) return;
    [...(el.matches('.grafico') ? [el] : []), ...el.querySelectorAll('.grafico')].forEach((g) => play(g, api));
  });
  const boot = () => renderIn(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  if (document.fonts) document.fonts.ready.then(() => document.querySelectorAll('.grafico').forEach(render));
  // Otro estilo u otro modo cambia las fuentes: se recoloca cuando estén cargadas.
  new MutationObserver(() => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => document.querySelectorAll('.grafico').forEach(render), 80)))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-style'] });
  Motor.grafico = { render, play };
})();
