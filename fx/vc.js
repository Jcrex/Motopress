/* Efectos comunes de los decks de Visión por Computador (vc-*).
   Cárgalo ANTES de ../../fx/rai.js (que aporta «secuencia» y las notas del orador con la tecla N):
   vc.js intercepta Motor.fx para poder combinar «secuencia» dentro del efecto «vc».
   Al cargar:
     - KaTeX: renderiza $$…$$ (bloque) y \( … \) (en línea) en todo el documento.
     - Resaltado de Python en <pre class="code">: palabras clave, números, cadenas, comentarios y funciones.
   Efectos (todos dejan el estado final en render() y solo animan en play()):
     - vc-conv: convolución/correlación paso a paso sobre una matriz pequeña.
         <div class="fx vc-conv" data-img='[[...]]' data-k='[[...]]' data-mode="conv|corr" data-pad="zero|none"></div>
         Calcula la salida real; play() desliza el núcleo y escribe cada valor.
     - vc-plot: curvas y = f(x).
         <div class="fx" data-role="plot" data-x="0,255" data-y="0,255"
              data-fns='[{"f":"x=>255*Math.pow(x/255,0.5)","label":"γ = 0,5"}]'
              data-xl="r (entrada)" data-yl="s (salida)"></div>
         Leyenda: data-legend="tl|tr|bl|br" (esquina; por defecto arriba a la izquierda).
         Opcional: data-bars='[...]' (histograma de barras, se dibuja detrás) y data-pts='[[x,y],…]' (puntos marcados).
     - vc-heat: matriz numérica coloreada (núcleos, espectros pequeños, histogramas de tabla).
         <div class="fx vc-heat" data-m='[[...]]' data-signed="1" data-dec="2"></div>
   Un mismo slide puede usar data-fx="vc" para activar todos los anteriores a la vez junto con «secuencia». */
(() => {
  const REG = Object.create(null);
  const reg0 = Motor.fx.bind(Motor);
  Motor.fx = (name, def) => { REG[name] = def; return reg0(name, def); };

  /* ---------- KaTeX ---------- */
  function katexAll() {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(document.body, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }],
      throwOnError: false, ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    });
  }

  /* ---------- Resaltado de Python ---------- */
  const KW = /\b(def|return|import|from|as|for|in|if|elif|else|while|not|and|or|is|None|True|False|lambda|with|class|try|except|pass|break|continue|yield|print)\b/;
  function highlight(pre) {
    if (pre.dataset.hl) return; pre.dataset.hl = '1';
    const src = pre.textContent;
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const re = /(#[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(\d+\.?\d*(?:e-?\d+)?j?)\b|\b([A-Za-z_]\w*)(?=\s*\()|\b([A-Za-z_]\w*)\b/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index)); last = re.lastIndex;
      const [t, com, str, num, fn, word] = m;
      if (com) out += `<span class="c-com">${esc(com)}</span>`;
      else if (str) out += `<span class="c-str">${esc(str)}</span>`;
      else if (num) out += `<span class="c-num">${num}</span>`;
      else if (fn) out += KW.test(fn) && fn.length === fn.match(KW)[0].length ? `<span class="c-kw">${fn}</span>` : `<span class="c-fn">${fn}</span>`;
      else if (word && KW.test(word) && word.match(KW)[0] === word) out += `<span class="c-kw">${word}</span>`;
      else out += esc(t);
    }
    pre.innerHTML = out + esc(src.slice(last));
  }

  function boot() { document.querySelectorAll('pre.code').forEach(highlight); katexAll(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load', katexAll);

  /* ---------- utilidades ---------- */
  const J = (s, d) => { try { return s ? JSON.parse(s) : d; } catch (e) { console.warn('vc: JSON no válido', s); return d; } };
  const fmt = (v, dec) => { const r = +v.toFixed(dec); return Object.is(r, -0) ? '0' : String(r).replace('.', ','); };
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; };

  /* ---------- vc-conv ---------- */
  function convOut(img, k, mode, pad) {
    const H = img.length, W = img[0].length, kh = k.length, kw = k[0].length, cy = kh >> 1, cx = kw >> 1;
    const kk = mode === 'conv' ? k.map((r) => [...r].reverse()).reverse() : k;
    const res = [];
    const y0 = pad === 'none' ? cy : 0, y1 = pad === 'none' ? H - cy : H, x0 = pad === 'none' ? cx : 0, x1 = pad === 'none' ? W - cx : W;
    for (let y = y0; y < y1; y++) { const row = []; for (let x = x0; x < x1; x++) {
      let s = 0; for (let j = 0; j < kh; j++) for (let i = 0; i < kw; i++) {
        const yy = y + j - cy, xx = x + i - cx; if (yy >= 0 && yy < H && xx >= 0 && xx < W) s += img[yy][xx] * kk[j][i];
      } row.push({ y, x, v: s }); } res.push(row); }
    return { res, kk };
  }
  function convRender(api, host, state) {
    host.innerHTML = '';
    const img = J(host.dataset.img, [[0]]), k = J(host.dataset.k, [[1]]), mode = host.dataset.mode || 'conv', pad = host.dataset.pad || 'zero';
    const dec = +(host.dataset.dec ?? 2);
    const { res, kk } = convOut(img, k, mode, pad);
    const H = img.length, W = img[0].length, kh = k.length, kw = k[0].length;
    const Wpx = host.clientWidth || 1200, Hpx = host.clientHeight || 520;
    const cols = W + kw + W + 4, cell = Math.min(Math.floor(Wpx / cols), Math.floor((Hpx - 60) / Math.max(H, kh)));
    const svg = el('svg', { width: Wpx, height: Hpx, viewBox: `0 0 ${Wpx} ${Hpx}` }, host);
    const fg = api.tok('fg'), fg2 = api.tok('fg-2'), fg3 = api.tok('fg-3'), line = api.tok('line-2'), acc = api.tok('accent'), acc2 = api.tok('accent-2') || acc;
    const fsz = Math.max(18, Math.min(30, cell * 0.36));
    const vals = res.flat().map((r) => r.v), vmax = Math.max(1e-9, ...vals.map(Math.abs));
    const imax = Math.max(1e-9, ...img.flat().map(Math.abs));
    const ox1 = 0, ox2 = (W + 1) * cell, ox3 = (W + kw + 3) * cell, oy = 48;
    const lab = (x, t) => { const e = el('text', { x, y: 30, fill: fg2, 'font-size': 22, font: api.font('mono', 22, 500) }, svg); e.style.font = api.font('mono', 22, 500); e.textContent = t; };
    lab(ox1, 'f (entrada)'); lab(ox2, mode === 'conv' ? 'h (núcleo)' : 'h (núcleo, correlación)'); lab(ox3, 'g = ' + (mode === 'conv' ? 'f ∗ h' : 'f ⋆ h'));
    const grid = (ox, m, colorFn, txtFn) => m.forEach((row, y) => row.forEach((v, x) => {
      el('rect', { x: ox + x * cell, y: oy + y * cell, width: cell - 2, height: cell - 2, fill: colorFn(v), stroke: line, 'stroke-width': 1 }, svg);
      const t = el('text', { x: ox + x * cell + cell / 2 - 1, y: oy + y * cell + cell / 2 + fsz * 0.35, 'text-anchor': 'middle', fill: fg }, svg);
      t.style.font = api.font('mono', fsz, 500); t.textContent = txtFn(v);
    }));
    grid(ox1, img, (v) => api.color.mix(api.tok('bg-3'), api.tok('fg-3'), Math.abs(v) / imax * 0.8), (v) => fmt(v, dec));
    const kmax = Math.max(1e-9, ...k.flat().map(Math.abs));
    const tone = (c) => api.color.mix(api.tok('bg-3'), c, 0.62);
    grid(ox2, k, (v) => tone(api.div(0.5 + 0.5 * v / kmax)), (v) => fmt(v, dec));
    // salida
    const outCells = [];
    const offY = pad === 'none' ? (kh >> 1) : 0, offX = pad === 'none' ? (kw >> 1) : 0;
    res.forEach((row) => row.forEach((r) => {
      const gx = ox3 + (r.x - offX) * cell, gy = oy + (r.y - offY) * cell;
      const rect = el('rect', { x: gx, y: gy, width: cell - 2, height: cell - 2, fill: tone(api.div(0.5 + 0.5 * r.v / vmax)), stroke: line, 'stroke-width': 1 }, svg);
      const t = el('text', { x: gx + cell / 2 - 1, y: gy + cell / 2 + fsz * 0.35, 'text-anchor': 'middle', fill: fg }, svg);
      t.style.font = api.font('mono', fsz, 600); t.textContent = fmt(r.v, dec);
      outCells.push({ r, rect, t });
    }));
    const win = el('rect', { x: ox1 - 3, y: oy - 3, width: kw * cell + 4, height: kh * cell + 4, fill: 'none', stroke: acc, 'stroke-width': 4, opacity: 0 }, svg);
    const hit = el('rect', { x: 0, y: 0, width: cell + 2, height: cell + 2, fill: 'none', stroke: acc, 'stroke-width': 4, opacity: 0 }, svg);
    const note = el('text', { x: ox1, y: oy + Math.max(H, kh) * cell + 34, fill: fg3 }, svg);
    note.style.font = api.font('mono', 22, 400);
    note.textContent = mode === 'conv' ? 'convolución: el núcleo se gira 180° antes de deslizarlo' : 'correlación: el núcleo se desliza sin girar';
    state.conv = { outCells, win, hit, cell, ox1, ox3, oy, kh, kw, offX, offY, note, kk, img, dec };
  }
  function convPlay(api, host, state) {
    const s = state.conv; if (!s) return;
    s.outCells.forEach((o) => { o.t.style.opacity = 0; o.rect.style.opacity = 0.25; });
    s.win.setAttribute('opacity', 1); s.hit.setAttribute('opacity', 1);
    const step = +(host.dataset.ms || 420); // data-ms (data-step lo reserva el motor para los pasos)
    s.outCells.forEach((o, i) => api.after(300 + i * step, () => {
      const cy = s.kh >> 1, cx = s.kw >> 1;
      s.win.setAttribute('x', s.ox1 + (o.r.x - cx) * s.cell - 3); s.win.setAttribute('y', s.oy + (o.r.y - cy) * s.cell - 3);
      s.hit.setAttribute('x', s.ox3 + (o.r.x - s.offX) * s.cell - 2); s.hit.setAttribute('y', s.oy + (o.r.y - s.offY) * s.cell - 2);
      o.t.style.opacity = 1; o.rect.style.opacity = 1;
      if (i === s.outCells.length - 1) api.after(step, () => { s.win.setAttribute('opacity', 0); s.hit.setAttribute('opacity', 0); });
    }));
  }

  /* ---------- vc-plot ---------- */
  function plotRender(api, host) {
    host.innerHTML = '';
    const Wpx = host.clientWidth || 900, Hpx = host.clientHeight || 520;
    const [x0, x1] = (host.dataset.x || '0,1').split(',').map(Number), [y0, y1] = (host.dataset.y || '0,1').split(',').map(Number);
    const fns = J(host.dataset.fns, []), bars = J(host.dataset.bars, null), pts = J(host.dataset.pts, []);
    const m = { l: 120, r: 30, t: 24, b: 70 };
    const X = (x) => m.l + (x - x0) / (x1 - x0) * (Wpx - m.l - m.r), Y = (y) => Hpx - m.b - (y - y0) / (y1 - y0) * (Hpx - m.t - m.b);
    const svg = el('svg', { width: Wpx, height: Hpx, viewBox: `0 0 ${Wpx} ${Hpx}` }, host);
    const fg2 = api.tok('fg-2'), fg3 = api.tok('fg-3'), line = api.tok('line'), cats = api.cats(6);
    const txt = (x, y, s, anchor = 'middle', size = 22, color = fg2) => { const t = el('text', { x, y, 'text-anchor': anchor, fill: color }, svg); t.style.font = api.font('mono', size, 400); t.textContent = s; return t; };
    for (let i = 0; i <= 4; i++) {
      const xv = x0 + (x1 - x0) * i / 4, yv = y0 + (y1 - y0) * i / 4;
      el('line', { x1: X(xv), x2: X(xv), y1: Y(y0), y2: Y(y1), stroke: line, 'stroke-dasharray': '2 6' }, svg);
      el('line', { x1: X(x0), x2: X(x1), y1: Y(yv), y2: Y(yv), stroke: line, 'stroke-dasharray': '2 6' }, svg);
      txt(X(xv), Hpx - m.b + 30, fmt(xv, 2)); txt(m.l - 12, Y(yv) + 7, fmt(yv, 2), 'end');
    }
    if (host.dataset.xl) txt((Wpx + m.l) / 2, Hpx - 12, host.dataset.xl, 'middle', 22, fg3);
    if (host.dataset.yl) { const t = txt(18, (Hpx - m.b) / 2, host.dataset.yl, 'middle', 22, fg3); t.setAttribute('transform', `rotate(-90 18 ${(Hpx - m.b) / 2})`); }
    if (bars) {
      const bw = (X(x1) - X(x0)) / bars.length;
      bars.forEach((v, i) => el('rect', { class: 'bar', x: X(x0) + i * bw + 1, y: Y(v), width: Math.max(1, bw - 2), height: Y(y0) - Y(v), fill: api.tok('accent'), opacity: 0.55 }, svg));
    }
    const paths = [], legend = [];
    fns.forEach((d, i) => {
      let f; try { f = new Function('return ' + d.f)(); } catch (e) { console.warn('vc-plot: función no válida', d.f); return; }
      const n = 240; let p = '';
      for (let j = 0; j <= n; j++) { const x = x0 + (x1 - x0) * j / n; let y = f(x); if (!isFinite(y)) continue; y = Math.max(y0, Math.min(y1, y)); p += (p ? 'L' : 'M') + X(x).toFixed(1) + ',' + Y(y).toFixed(1); }
      const c = d.c ? api.tok(d.c) : cats[i % 6];
      paths.push(el('path', { d: p, fill: 'none', stroke: c, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-dasharray': d.dash || '' }, svg));
      if (d.label) legend.push([d.label, c]);
    });
    if (legend.length) {
      const lw = Math.max(262, 72 + 13.6 * Math.max(...legend.map(([l]) => String(l).length))), pos = host.dataset.legend || 'tl', lh = legend.length * 34 + 10;
      const x0l = pos[1] === 'r' ? Wpx - m.r - lw - 8 : m.l + 12, y0l = pos[0] === 'b' ? Hpx - m.b - lh - 12 : m.t + 4;
      el('rect', { x: x0l, y: y0l, width: lw, height: lh, fill: api.tok('bg-2'), stroke: api.tok('line'), opacity: 0.92 }, svg);
      legend.forEach(([lab, c], i) => {
        const ly = y0l + 30 + i * 34;
        el('line', { x1: x0l + 12, x2: x0l + 48, y1: ly - 7, y2: ly - 7, stroke: c, 'stroke-width': 4 }, svg);
        txt(x0l + 58, ly, lab, 'start', 22, api.tok('fg'));
      });
    }
    pts.forEach(([x, y, l]) => { el('circle', { cx: X(x), cy: Y(y), r: 8, fill: api.tok('accent') }, svg); if (l) txt(X(x) + 14, Y(y) - 12, l, 'start', 22, api.tok('fg')); });
    return paths;
  }
  function plotPlay(api, paths) {
    paths.forEach((p, i) => { const L = p.getTotalLength(); try { p.animate([{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }], { duration: 1100, delay: 200 + i * 350, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }); } catch (e) { /* estado final ya visible */ } });
  }

  /* ---------- vc-heat ---------- */
  function heatRender(api, host) {
    host.innerHTML = '';
    const m = J(host.dataset.m, [[0]]), signed = host.dataset.signed === '1', dec = +(host.dataset.dec ?? 2);
    const H = m.length, W = m[0].length, Wpx = host.clientWidth || 400, Hpx = host.clientHeight || 400;
    const cell = Math.min(Wpx / W, Hpx / H), mx = Math.max(1e-9, ...m.flat().map(Math.abs)), mn = Math.min(...m.flat());
    const svg = el('svg', { width: W * cell, height: H * cell, viewBox: `0 0 ${W * cell} ${H * cell}` }, host);
    const fsz = Math.max(18, Math.min(34, cell * 0.34));
    m.forEach((row, y) => row.forEach((v, x) => {
      const tone = (c) => api.color.mix(api.tok('bg-3'), c, 0.62);
      const fill = signed ? tone(api.div(0.5 + 0.5 * v / mx)) : tone(api.seq((v - Math.min(0, mn)) / (mx - Math.min(0, mn) || 1)));
      el('rect', { x: x * cell + 1, y: y * cell + 1, width: cell - 2, height: cell - 2, fill, stroke: api.tok('line-2') }, svg);
      if (host.dataset.nums !== '0') { const t = el('text', { x: x * cell + cell / 2, y: y * cell + cell / 2 + fsz * 0.35, 'text-anchor': 'middle', fill: api.tok('fg') }, svg); t.style.font = api.font('mono', fsz, 600); t.textContent = fmt(v, dec); }
    }));
  }

  /* ---------- registro ---------- */
  const seqFx = () => REG.secuencia;
  function renderAll(api) {
    api.state = api.state || {};
    api.qa('.vc-conv').forEach((h, i) => { api.state['c' + i] = {}; convRender(api, h, api.state['c' + i]); });
    api.state.paths = []; api.qa('[data-role="plot"]').forEach((h) => api.state.paths.push(plotRender(api, h)));
    api.qa('.vc-heat').forEach((h) => heatRender(api, h));
  }
  function playAll(api) {
    if (api.reduced) return;
    api.qa('.vc-conv').forEach((h, i) => convPlay(api, h, api.state['c' + i]));
    (api.state.paths || []).forEach((p) => plotPlay(api, p));
  }
  Motor.fx('vc', {
    render(api) { renderAll(api); const s = seqFx(); if (s) s.render(api); },
    play(api) { playAll(api); const s = seqFx(); if (s) s.play(api); },
    stop(api) { const s = seqFx(); if (s && s.stop) s.stop(api); },
  });
  Motor.fx('vc-conv', { render: renderAll, play: playAll });
  Motor.fx('vc-plot', { render: renderAll, play: playAll });
  Motor.fx('vc-heat', { render: renderAll, play: playAll });
})();
