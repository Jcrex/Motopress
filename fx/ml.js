/* Efectos de aprendizaje automático: curvas de entrenamiento, matriz de confusión,
   espacio latente y arquitectura de una red. Datos sintéticos y deterministas. */
(() => {
  const { color } = Motor;
  const TAU = Math.PI * 2;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const textOn = (api, bgc) => (color.contrast(api.tok('fg'), bgc) >= color.contrast(api.tok('bg'), bgc) ? api.tok('fg') : api.tok('bg'));

  /* =================================================================
     CURVAS DE ENTRENAMIENTO
     ================================================================= */
  function trainingData() {
    const R = Motor.util.rng(42), E = 60, rows = [];
    for (let e = 0; e <= E; e++) {
      const tl = 2.1 * Math.exp(-e / 8.5) + 0.11 + (R() - 0.5) * 0.03;
      const vl = 2.15 * Math.exp(-e / 9.5) + 0.24 + Math.max(0, e - 36) * 0.011 + (R() - 0.5) * 0.045;
      const ta = Math.min(99.2, 100 - 62 * Math.exp(-e / 9) - 1.2 + (R() - 0.5) * 0.6);
      const va = Math.min(97, 100 - 64 * Math.exp(-e / 10) - 9.5 - Math.max(0, e - 36) * 0.09 + (R() - 0.5) * 0.9);
      rows.push({ e, tl, vl, ta, va });
    }
    return rows;
  }
  function lineChart(api, host, rows, keys, opts) {
    const d3 = window.d3;
    const W = host.clientWidth, H = host.clientHeight, m = { l: 74, r: 196, t: 16, b: 52 };
    host.querySelectorAll('svg, .tip').forEach((n) => n.remove());
    const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
    const x = d3.scaleLinear([0, 60], [m.l, W - m.r]);
    const y = d3.scaleLinear(opts.domain, [H - m.b, m.t]);
    const grid = api.tok('line'), fg2 = api.tok('fg-2'), dash = api.tok('grid-dash');
    const ax = svg.append('g').style('font', api.font('mono', 20, 400)).attr('fill', fg2);
    y.ticks(5).forEach((v) => {
      ax.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(v)).attr('y2', y(v)).attr('stroke', grid).attr('stroke-dasharray', dash);
      ax.append('text').attr('x', m.l - 12).attr('y', y(v)).attr('dy', '0.35em').attr('text-anchor', 'end').text(opts.fmt(v));
    });
    [0, 10, 20, 30, 40, 50, 60].forEach((v) => ax.append('text').attr('x', x(v)).attr('y', H - m.b + 32).attr('text-anchor', 'middle').text(v));
    ax.append('text').attr('x', W - m.r).attr('y', H - 4).attr('text-anchor', 'end').text('época');
    ax.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', H - m.b).attr('y2', H - m.b).attr('stroke', api.tok('line-2'));
    const best = rows.reduce((b, r) => (r.vl < b.vl ? r : b), rows[0]);
    const ann = svg.append('g').attr('class', 'ann');
    ann.append('rect').attr('x', x(best.e)).attr('y', m.t).attr('width', x(60) - x(best.e)).attr('height', H - m.b - m.t).attr('fill', color.alpha(api.tok('accent-3'), api.dark ? 0.1 : 0.08));
    ann.append('line').attr('x1', x(best.e)).attr('x2', x(best.e)).attr('y1', m.t).attr('y2', H - m.b).attr('stroke', api.tok('fg-2')).attr('stroke-width', 1.5).attr('stroke-dasharray', '6 6');
    const ay = opts.annBottom ? H - m.b - 64 : m.t + 26;
    ann.append('text').attr('x', x(best.e) + 10).attr('y', ay).attr('fill', api.tok('fg')).style('font', api.font('mono', 20, 600)).text(`mejor checkpoint · época ${best.e}`);
    ann.append('text').attr('x', (x(best.e) + x(60)) / 2).attr('y', ay + 30).attr('text-anchor', 'middle').attr('fill', api.tok('fg-2')).style('font', api.font('text', 22, 500)).text('sobreajuste');
    const cats = api.cats(2), cols = [cats[1], cats[0]], names = ['entrenamiento', 'validación'];
    const mw = +api.tok('mark-w') || 2.5;
    keys.forEach((k, i) => {
      const ln = d3.line().x((r) => x(r.e)).y((r) => y(r[k])).curve(d3.curveMonotoneX);
      svg.append('path').attr('class', 'ln').attr('d', ln(rows)).attr('fill', 'none').attr('stroke', cols[i]).attr('stroke-width', mw + (i ? 0.5 : 0)).attr('stroke-linejoin', 'round');
      const last = rows[rows.length - 1];
      svg.append('circle').attr('cx', x(60)).attr('cy', y(last[k])).attr('r', 6).attr('fill', cols[i]).attr('stroke', api.tok('bg')).attr('stroke-width', 2);
      svg.append('text').attr('x', x(60) + 14).attr('y', y(last[k]) + (opts.offs ? opts.offs[i] : 0)).attr('dy', '0.35em').attr('fill', api.tok('fg')).style('font', api.font('text', 22, 600)).text(names[i]);
    });
    // capa de lectura al pasar el ratón
    const tip = document.createElement('div');
    tip.className = 'tip panel'; tip.style.cssText = 'position:absolute;pointer-events:none;opacity:0;padding:12px 16px;font:500 20px/1.35 var(--font-mono);transition:opacity .15s;white-space:nowrap';
    host.appendChild(tip);
    const cross = svg.append('line').attr('y1', m.t).attr('y2', H - m.b).attr('stroke', api.tok('fg-3')).attr('opacity', 0);
    const dots = keys.map((k, i) => svg.append('circle').attr('r', 7).attr('fill', cols[i]).attr('stroke', api.tok('bg')).attr('stroke-width', 2).attr('opacity', 0));
    svg.append('rect').attr('x', m.l).attr('y', m.t).attr('width', W - m.l - m.r).attr('height', H - m.t - m.b).attr('fill', 'transparent')
      .on('pointermove', function (ev) {
        const [px] = d3.pointer(ev, this), e = Math.round(x.invert(px)), r = rows[Math.max(0, Math.min(60, e))];
        cross.attr('x1', x(r.e)).attr('x2', x(r.e)).attr('opacity', 1);
        keys.forEach((k, i) => dots[i].attr('cx', x(r.e)).attr('cy', y(r[k])).attr('opacity', 1));
        tip.innerHTML = `época ${r.e}<br>${names[0]} ${opts.fmt(r[keys[0]], true)}<br>${names[1]} ${opts.fmt(r[keys[1]], true)}`;
        tip.style.opacity = 1; tip.style.left = Math.min(W - 300, x(r.e) + 18) + 'px'; tip.style.top = (m.t + 70) + 'px';
      })
      .on('pointerleave', () => { cross.attr('opacity', 0); dots.forEach((d) => d.attr('opacity', 0)); tip.style.opacity = 0; });
    return best;
  }
  Motor.fx('training', {
    render(api) {
      const rows = trainingData();
      const body = api.q('[data-role="body"]');
      body.innerHTML = `<div class="chart"><h3>Pérdida (entropía cruzada)</h3><div class="fx" data-role="loss"></div></div><div class="chart"><h3>Exactitud (%)</h3><div class="fx" data-role="acc"></div></div>`;
      const best = lineChart(api, api.q('[data-role="loss"]'), rows, ['tl', 'vl'], { domain: [0, 2.4], fmt: (v, p) => (p ? v.toFixed(3) : v.toFixed(1)), offs: [10, -10] });
      lineChart(api, api.q('[data-role="acc"]'), rows, ['ta', 'va'], { domain: [30, 100], fmt: (v, p) => (p ? v.toFixed(1) + ' %' : v), offs: [-12, 12], annBottom: true });
      void best;
    },
    play(api) {
      if (!window.gsap) return;
      api.qa('.ln').forEach((p, i) => { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: api.dur / 450, delay: (i % 2) * 0.15, ease: 'power1.inOut' }); });
      gsap.fromTo(api.qa('.ann'), { opacity: 0 }, { opacity: 1, duration: 0.5, delay: api.dur / 450 });
    },
  });

  /* =================================================================
     MATRIZ DE CONFUSIÓN
     ================================================================= */
  const CLS = ['persona', 'coche', 'bicicleta', 'perro', 'señal', 'cono'];
  const CM = [[182, 2, 9, 4, 1, 2], [3, 176, 2, 0, 12, 7], [14, 3, 165, 6, 2, 10], [8, 1, 5, 179, 0, 7], [1, 9, 1, 0, 186, 3], [2, 6, 7, 3, 4, 178]];
  Motor.fx('confusion', {
    render(api) {
      const host = api.q('[data-role="matrix"]');
      const W = 1000, H = 640;
      host.querySelectorAll('svg').forEach((s) => s.remove());
      const d3 = window.d3, svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const T = 64, size = Math.min(W - 190, H - T - 30), L = Math.round((W - size) / 2 + 50), c = size / 6;
      const fg2 = api.tok('fg-2'), r = Math.min(6, parseFloat(api.tok('radius')) / 2);
      svg.append('text').attr('x', L + size / 2).attr('y', 22).attr('text-anchor', 'middle').attr('fill', fg2).style('font', api.font('mono', 20, 600)).text('predicción →');
      svg.append('text').attr('transform', `translate(${L - 150} ${T + size / 2}) rotate(-90)`).attr('text-anchor', 'middle').attr('fill', fg2).style('font', api.font('mono', 20, 600)).text('clase real →');
      CLS.forEach((nm, j) => svg.append('text').attr('x', L + j * c + c / 2).attr('y', T - 14).attr('text-anchor', 'middle').attr('fill', api.tok('fg')).style('font', api.font('mono', 19, 500)).text(nm));
      CLS.forEach((nm, i) => svg.append('text').attr('x', L - 14).attr('y', T + i * c + c / 2).attr('dy', '0.35em').attr('text-anchor', 'end').attr('fill', api.tok('fg')).style('font', api.font('mono', 19, 500)).text(nm));
      CM.forEach((row, i) => {
        const tot = row.reduce((a, b) => a + b, 0);
        row.forEach((v, j) => {
          const p = v / tot, fill = api.seq(Math.pow(p, 0.55));
          const g = svg.append('g').attr('class', 'cell').attr('data-d', i + j);
          g.append('rect').attr('x', L + j * c + 2).attr('y', T + i * c + 2).attr('width', c - 4).attr('height', c - 4).attr('rx', r).attr('fill', fill);
          g.append('text').attr('x', L + j * c + c / 2).attr('y', T + i * c + c / 2).attr('dy', '0.35em').attr('text-anchor', 'middle').attr('fill', textOn(api, fill)).style('font', api.font('mono', i === j ? 26 : 21, i === j ? 700 : 500)).text(Math.round(p * 100));
          g.append('title').text(`${CLS[i]} → ${CLS[j]}: ${v} de ${tot}`);
        });
      });
      svg.append('rect').attr('x', L).attr('y', T).attr('width', size).attr('height', size).attr('fill', 'none').attr('stroke', api.tok('line-2'));
      const total = CM.flat().reduce((a, b) => a + b, 0), diag = CM.reduce((s, r2, i) => s + r2[i], 0);
      const prec = CLS.map((_, j) => CM[j][j] / CM.reduce((s, r2) => s + r2[j], 0)), rec = CLS.map((_, i) => CM[i][i] / CM[i].reduce((a, b) => a + b, 0));
      const cats = api.cats(2);
      api.q('[data-role="side"]').innerHTML = `
        <div><p class="label">Exactitud global</p><p class="value" style="font-size:96px">${(100 * diag / total).toFixed(1)}<small style="font-size:40px"> %</small></p><p class="note">${diag} de ${total} detecciones, porcentaje por fila (recall).</p></div>
        <ul class="legend"><li><i style="--c:${cats[0]}"></i>precisión</li><li><i style="--c:${cats[1]}"></i>recall</li></ul>
        <div class="pr" style="display:grid;grid-template-columns:150px 1fr 64px;gap:10px 14px;align-items:center;font:500 21px/1.1 var(--font-mono);color:var(--fg-2)">
          ${CLS.map((nm, i) => `<span>${nm}</span><span style="display:flex;flex-direction:column;gap:4px"><i class="bar" style="display:block;height:10px;width:${prec[i] * 100}%;background:${cats[0]};border-radius:5px"></i><i class="bar" style="display:block;height:10px;width:${rec[i] * 100}%;background:${cats[1]};border-radius:5px"></i></span><span style="text-align:right;color:var(--fg)">${Math.round(rec[i] * 100)}</span>`).join('')}
        </div>
        <p class="note">La bicicleta se confunde con persona: misma silueta a baja resolución.</p>`;
    },
    play(api) {
      if (!window.gsap) return;
      const cells = api.qa('.cell');
      gsap.fromTo(cells, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: api.dur / 1200, ease: 'power2.out', delay: (i, t) => +t.dataset.d * 0.06 });
      gsap.fromTo(api.qa('.pr .bar'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: api.dur / 1000, stagger: 0.03, delay: 0.4 });
    },
  });

  /* =================================================================
     ESPACIO LATENTE
     ================================================================= */
  const SCN = ['pasillo', 'cocina', 'laboratorio', 'exterior', 'almacén', 'oficina'];
  function latentPoints() {
    const R = Motor.util.rng(77), centers = [[-0.55, -0.35], [0.1, -0.55], [0.62, -0.2], [0.5, 0.48], [-0.12, 0.42], [-0.68, 0.32]];
    const pts = [];
    centers.forEach(([cx, cy], k) => {
      for (let i = 0; i < 300; i++) {
        const a = R() * TAU, rr = Math.abs(R.normal()) * 0.11 * (k === 3 ? 1.3 : 1);
        pts.push({ k, x: cx + Math.cos(a) * rr * 1.25 + R.normal() * 0.025, y: cy + Math.sin(a) * rr + R.normal() * 0.025, sx: R() * 2 - 1, sy: R() * 2 - 1, d: R() });
      }
    });
    for (let i = 0; i < 9; i++) { const p = pts[Math.floor(R() * pts.length)], other = centers[(p.k + 2 + (i % 3)) % 6]; p.x = other[0] + R.normal() * 0.05; p.y = other[1] + R.normal() * 0.05; p.odd = true; }
    return { pts, centers };
  }
  Motor.fx('latent', {
    render(api) {
      const host = api.q('[data-role="plot"]');
      api.Lt = { ...api.canvas(host), ...latentPoints() };
      drawLatent(api, 1);
      const cats = api.cats(6);
      api.q('[data-role="legend"]').innerHTML = SCN.map((s, i) => `<li><i style="--c:${cats[i]};border-radius:50%"></i>${s}</li>`).join('') + `<li><i style="--c:transparent;border-radius:50%;outline:2.5px solid var(--fg)"></i>posible etiqueta errónea</li>`;
    },
    play(api) {
      const T = Math.max(1800, api.dur * 2.6);
      api.raf((t) => { drawLatent(api, Math.min(1, t / T), t); });
    },
  });
  function drawLatent(api, p, t = 0) {
    const { ctx, w, h, pts, centers } = api.Lt;
    ctx.clearRect(0, 0, w, h);
    const cats = api.cats(6), s = Math.min(w, h) * 0.62, ox = w / 2, oy = h / 2;
    ctx.strokeStyle = api.tok('line'); ctx.lineWidth = 1; ctx.setLineDash(api.tok('grid-dash').split(' ').map(Number).filter((v) => v > 0));
    for (let g = -1; g <= 1; g += 0.5) { ctx.beginPath(); ctx.moveTo(ox + g * s, 0); ctx.lineTo(ox + g * s, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, oy + g * s * 0.75); ctx.lineTo(w, oy + g * s * 0.75); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = api.dark ? 'lighter' : 'source-over';
    pts.forEach((q) => {
      const e = api.ease(Math.max(0, Math.min(1, (p - q.d * 0.35) / 0.65)));
      const wob = p >= 1 && t ? Math.sin(t / 900 + q.d * 20) * 0.004 : 0;
      const x = ox + ((q.sx + (q.x - q.sx) * e) + wob) * s, y = oy + (q.sy + (q.y - q.sy) * e) * s;
      ctx.fillStyle = color.alpha(cats[q.k], api.dark ? 0.62 : 0.78);
      ctx.beginPath(); ctx.arc(x, y, 4.6, 0, TAU); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    if (p >= 0.85) {
      const a = Math.min(1, (p - 0.85) / 0.15);
      pts.filter((q) => q.odd).forEach((q) => { ctx.strokeStyle = color.alpha(api.tok('fg'), a); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ox + q.x * s, oy + q.y * s, 13, 0, TAU); ctx.stroke(); });
      ctx.font = api.font('text', 24, 700); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
      centers.forEach(([cx, cy], k) => {
        const x = ox + cx * s, y = oy + cy * s - 0.17 * s;
        ctx.strokeStyle = color.alpha(api.tok('bg'), 0.9 * a); ctx.lineWidth = 7; ctx.strokeText(SCN[k], x, y);
        ctx.fillStyle = color.alpha(api.tok('fg'), a); ctx.fillText(SCN[k], x, y);
      });
    }
  }

  /* =================================================================
     ARQUITECTURA DE LA RED
     ================================================================= */
  const LAYERS = [
    { n: 8, show: 8, name: 'entrada · 8', labels: ['rango frontal', 'rango izq.', 'rango der.', 'vel. lineal', 'vel. angular', 'dist. a meta', 'ángulo a meta', 'riesgo'] },
    { n: 64, show: 11, name: 'densa · 64 · ReLU' },
    { n: 64, show: 11, name: 'densa · 64 · ReLU' },
    { n: 32, show: 9, name: 'densa · 32 · ReLU' },
    { n: 4, show: 4, name: 'salida · 4 · softmax', labels: ['avanzar', 'girar izq.', 'girar der.', 'frenar'], probs: [0.71, 0.08, 0.17, 0.04] },
  ];
  Motor.fx('nnet', {
    render(api) {
      const host = api.q('[data-role="net"]');
      const W = 1664, H = 640, d3 = window.d3;
      host.querySelectorAll('svg').forEach((s) => s.remove());
      const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      const xs = [300, 580, 840, 1090, 1370], top = 30, bot = H - 90;
      const R = api.rng(3);
      const pos = LAYERS.map((L, li) => Array.from({ length: L.show }, (_, i) => [xs[li], top + ((i + 0.5) / L.show) * (bot - top)]));
      const neg = api.tok('div-1'), posC = api.tok('div-7');
      const gW = svg.append('g');
      api.wires = [];
      for (let li = 0; li < LAYERS.length - 1; li++) {
        pos[li].forEach((a) => pos[li + 1].forEach((b) => {
          const wv = R.normal() * 0.6, line = gW.append('line').attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1]).attr('stroke', wv > 0 ? posC : neg).attr('stroke-width', 0.6 + Math.min(2.2, Math.abs(wv) * 1.6)).attr('opacity', Math.min(0.55, 0.08 + Math.abs(wv) * 0.32));
          api.wires.push({ li, a, b, line });
        }));
      }
      const gN = svg.append('g');
      LAYERS.forEach((L, li) => {
        pos[li].forEach(([x, y], i) => {
          const gap = L.show < L.n && i === Math.floor(L.show / 2);
          if (gap) { gN.append('text').attr('x', x).attr('y', y).attr('dy', '0.35em').attr('text-anchor', 'middle').attr('fill', api.tok('fg-2')).style('font', api.font('mono', 26, 700)).text('⋮'); return; }
          gN.append('circle').attr('class', 'nd').attr('cx', x).attr('cy', y).attr('r', li === 0 || li === 4 ? 15 : 12).attr('fill', api.tok('bg-3')).attr('stroke', li === 4 ? api.tok('accent') : api.tok('fg-2')).attr('stroke-width', 2.5);
          if (L.labels && li === 0) gN.append('text').attr('x', x - 30).attr('y', y).attr('dy', '0.35em').attr('text-anchor', 'end').attr('fill', api.tok('fg')).style('font', api.font('mono', 21, 500)).text(L.labels[i]);
          if (L.labels && li === 4) {
            const p = L.probs[i];
            gN.append('rect').attr('class', 'pbar').attr('x', x + 32).attr('y', y - 13).attr('width', 160 * p).attr('height', 26).attr('rx', 4).attr('fill', i === 0 ? api.tok('accent') : api.tok('line-2'));
            gN.append('text').attr('x', x + 32 + 160 * p + 12).attr('y', y).attr('dy', '0.35em').attr('fill', api.tok('fg')).style('font', api.font('mono', 21, i === 0 ? 700 : 500)).text(`${L.labels[i]} ${Math.round(p * 100)} %`);
          }
        });
        gN.append('text').attr('x', xs[li]).attr('y', H - 34).attr('text-anchor', 'middle').attr('fill', api.tok('fg-2')).style('font', api.font('mono', 18, 600)).text(L.name);
      });
      const lg = svg.append('g').attr('transform', `translate(${W - 230},${16})`).style('font', api.font('mono', 19, 500));
      lg.append('line').attr('x1', 0).attr('x2', 30).attr('stroke', posC).attr('stroke-width', 3); lg.append('text').attr('x', 38).attr('dy', '0.35em').attr('fill', api.tok('fg-2')).text('peso +');
      lg.append('line').attr('x1', 120).attr('x2', 150).attr('stroke', neg).attr('stroke-width', 3); lg.append('text').attr('x', 158).attr('dy', '0.35em').attr('fill', api.tok('fg-2')).text('peso −');
      api.pulses = svg.append('g');
    },
    play(api) {
      const d3 = window.d3; let last = -1;
      const byLayer = [0, 1, 2, 3].map((li) => api.wires.filter((w) => w.li === li));
      api.raf((t) => {
        const cycle = Math.floor(t / 700);
        if (cycle !== last) {
          last = cycle; const li = cycle % 4, ws = byLayer[li], R = api.rng(cycle + 1);
          for (let k = 0; k < 14; k++) {
            const w = ws[Math.floor(R() * ws.length)];
            const c = api.pulses.append('circle').attr('r', 5).attr('fill', api.tok('accent-3')).attr('cx', w.a[0]).attr('cy', w.a[1]);
            c.transition().duration(650).ease(d3.easeCubicInOut).attr('cx', w.b[0]).attr('cy', w.b[1]).remove();
          }
        }
      });
      if (window.gsap) gsap.fromTo(api.qa('.pbar'), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: api.dur / 900, stagger: 0.08, delay: 0.3, ease: 'power3.out' });
    },
    stop(api) { if (api.pulses) { api.pulses.selectAll('*').interrupt().remove(); } },
  });
})();
