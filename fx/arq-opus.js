/* Efectos del deck «Navegar el G1 con lenguaje» (versión B).
   Cada efecto: render() deja la diapositiva completa y en reposo; play() solo anima (bucles con api.raf/api.after,
   que el motor cancela al salir). Colores solo con tokens. Datos de mapas y costes: sintéticos, con semilla fija.
   - op-pila      la orden baja por la pila y a la derecha aparece lo que sale de cada capa
   - op-ritmo     frecuencias de control en escala logarítmica, cada fila late a su ritmo
   - op-donde     qué corre a bordo y qué fuera; paquetes por Wi-Fi y watchdog
   - op-slam      raycasting de un LiDAR que construye el mapa (fase 1) y localización con incertidumbre (fase 2)
   - op-grafo     mapa métrico → grafo semántico → capa de personas, y la consulta de la orden E1
   - op-costmap   capas de coste que se suman y A* que se recalcula cuando se mueven las personas
   - op-parseo    la frase se convierte en JSON
   - op-rai       agente ReAct y sus 8 tools; el pulso las recorre en el orden de E1
   - op-cifras    cifras del TFG que cuentan hasta su valor
   - op-laya      demos de choice, noul y score
   - op-puerta    barras de confianza, umbral τ y una puerta que se abre o pregunta
   - op-e1        diagrama de secuencia de la orden E1 con un paquete que lo recorre
   - op-montaje   seis fases con barra de progreso */
(() => {
  const TAU = Math.PI * 2;
  const NS = 'http://www.w3.org/2000/svg';
  const EASE = 'cubic-bezier(.2,.7,.2,1)';

  function S(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  function svgIn(host) {
    host.innerHTML = '';
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    const s = S('svg', { class: 'dia', viewBox: `0 0 ${w} ${h}` });
    host.appendChild(s);
    return { s, w, h };
  }
  function markers(api, s) {
    const d = S('defs', {}, s), id = (k) => `ah-${api.el.id}-${k}`;
    [['n', 'var(--fg-3)'], ['m', 'var(--model)'], ['c', 'var(--code)'], ['w', 'var(--warn)'], ['a', 'var(--accent)'], ['f', 'var(--fg-2)']].forEach(([k, col]) => {
      const m = S('marker', { id: id(k), viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, d);
      S('path', { d: 'M0 0L10 5L0 10z', style: `fill:${col}` }, m);
    });
    return (k) => `url(#${id(k)})`;
  }
  function cancel(api) { (api.anims || []).forEach((a) => { try { a.cancel(); } catch (e) { /* nada */ } }); api.anims = []; }
  function anim(api, el, frames, opt) {
    api.anims = api.anims || [];
    try { const a = el.animate(frames, { easing: EASE, fill: 'backwards', ...opt }); api.anims.push(a); return a; } catch (e) { return null; }
  }
  /* Entrada en orden de los [data-seq] (mismo n, a la vez). Devuelve cuándo termina. */
  function seqIn(api, step) {
    step = +(api.el.dataset.stepMs || step || 380);
    let last = 0;
    api.qa('[data-seq]').forEach((e) => {
      const n = +e.dataset.seq, kind = e.dataset.a || 'fade'; last = Math.max(last, n);
      let fr;
      if (kind === 'draw' && e.getTotalLength) { const L = e.getTotalLength(); fr = [{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }]; }
      else if (kind === 'pop') fr = [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' }];
      else if (kind === 'grow') fr = [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }];
      else fr = [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }];
      anim(api, e, fr, { duration: 560, delay: 150 + n * step });
    });
    return 150 + last * step + 560;
  }
  const rgb = (api, c) => api.color.parse(c).map((v) => Math.round(v * 255));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const put = (c, x, y) => { if (x === null) { c.style.visibility = 'hidden'; return; } c.style.visibility = ''; c.setAttribute('cx', x); if (y !== undefined) c.setAttribute('cy', y); };
  function pointAt(pts, u) { // recorrido por una polilínea, u ∈ [0,1]
    const seg = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
    let d = clamp(u, 0, 1) * tot;
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) {
        const t = seg[i] ? clamp(d / seg[i], 0, 1) : 0, a = pts[i], b = pts[i + 1];
        return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), Math.atan2(b[1] - a[1], b[0] - a[0])];
      }
      d -= seg[i];
    }
    return [pts[0][0], pts[0][1], 0];
  }

  /* =================================================================== op-pila */
  function setOut(api, row) {
    const now = api.q('[data-role="now"]'), pre = api.q('[data-role="pre"]');
    if (!row) { now.textContent = 'La orden baja por la pila'; pre.textContent = 'Cada capa transforma la orden en algo más concreto.'; return; }
    const [a, b] = row.dataset.out.split('|'); now.textContent = a; pre.textContent = b;
  }
  Motor.fx('op-pila', {
    render(api) { cancel(api); api.qa('.rowx').forEach((r) => r.classList.remove('hot')); setOut(api, null); },
    play(api) {
      const end = seqIn(api, 240), rows = api.qa('.rowx');
      let i = -1;
      const tick = () => {
        i = (i + 1) % (rows.length + 1);
        rows.forEach((r) => r.classList.remove('hot'));
        if (i < rows.length) { rows[i].classList.add('hot'); setOut(api, rows[i]); api.after(i === rows.length - 1 ? 2400 : 1700, tick); }
        else { setOut(api, null); api.after(1800, tick); }
      };
      api.after(end, tick);
    },
    stop(api) { cancel(api); api.qa('.rowx').forEach((r) => r.classList.remove('hot')); setOut(api, null); },
  });

  /* =================================================================== op-ritmo */
  const LANES = [
    ['LLM y RAI', 'tarea · por orden', 0.1, 1, 'model', 2.6, '0,1–1 Hz'],
    ['Laya', 'anclaje y modo social', 1, 5, 'model', 1.5, '1–5 Hz'],
    ['SLAM', 'localización', 10, 10, 'map', 0.8, '10 Hz'],
    ['Nav2', 'plan local', 10, 20, 'code', 0.6, '10–20 Hz'],
    ['Locomoción', 'política RL de Unitree', 50, 500, 'code', 0.32, '50–500 Hz'],
    ['Servo', 'PD de cada articulación', 500, 1000, 'code', 0.16, '0,5–1 kHz'],
  ];
  Motor.fx('op-ritmo', {
    render(api) {
      cancel(api);
      const { s, w, h } = svgIn(api.q('[data-role="ritmo"]'));
      const L = 340, R = w - 20, top = 60, bot = h - 44, rowH = (bot - top) / LANES.length;
      const X = (f) => L + ((Math.log10(f) + 1) / 4) * (R - L);
      [0.1, 1, 10, 100, 1000].forEach((f) => {
        S('line', { x1: X(f), x2: X(f), y1: top - 8, y2: bot, class: 'grid' }, s);
        S('text', { x: X(f), y: h - 8, 'text-anchor': f === 1000 ? 'end' : 'middle', class: 't3 mono', text: f < 1 ? '0,1 Hz' : f >= 1000 ? '1 kHz' : `${f} Hz` }, s);
      });
      S('text', { x: 0, y: h - 8, class: 't3 mono', text: 'escala logarítmica' }, s);
      const xd = X(7.2);
      S('rect', { x: L, y: top - 8, width: xd - L, height: bot - top + 8, style: 'fill:var(--model-soft);opacity:.55' }, s);
      S('rect', { x: xd, y: top - 8, width: R - xd, height: bot - top + 8, style: 'fill:var(--code-soft);opacity:.55' }, s);
      S('line', { x1: xd, x2: xd, y1: 14, y2: bot, class: 'ln dash', style: 'stroke:var(--fg-2)' }, s);
      S('text', { x: xd - 16, y: 36, 'text-anchor': 'end', class: 'b', text: '← modelos' }, s);
      S('text', { x: xd + 16, y: 36, class: 'b', text: 'código determinista →' }, s);
      api.P = [];
      LANES.forEach(([nm, sub, f1, f2, k, per, lab], i) => {
        const y = top + rowH * (i + 0.5), g = S('g', { 'data-seq': i + 1 }, s), col = `var(--${k})`;
        S('text', { x: 0, y: y - 4, class: 'b', style: 'font-size:28px', text: nm }, g);
        S('text', { x: 0, y: y + 24, class: 't3', text: sub }, g);
        const x1 = X(f1), x2 = Math.max(X(f2), x1 + 20);
        S('rect', { x: x1 - 10, y: y - 17, width: x2 - x1 + 20, height: 34, rx: 17, style: `fill:color-mix(in oklab, ${col} 32%, var(--bg));stroke:${col};stroke-width:2.5` }, g);
        const cx = (x1 + x2) / 2;
        const ring = S('circle', { cx, cy: y, r: 24, style: `fill:none;stroke:${col};stroke-width:3`, opacity: 0.35 }, g);
        const dot = S('circle', { cx, cy: y, r: 8, style: `fill:${col};stroke:var(--bg);stroke-width:2` }, g);
        const right = x2 + 26 + 150 < R && !(x2 < xd && x2 + 150 > xd);
        S('text', { x: right ? x2 + 26 : x1 - 26, y: y + 8, 'text-anchor': right ? 'start' : 'end', class: 'mono', text: lab }, g);
        api.P.push({ ring, dot, per });
      });
    },
    play(api) {
      seqIn(api, 220);
      api.raf((t) => {
        api.P.forEach(({ ring, dot, per }) => {
          const ph = ((t / 1000) / per) % 1;
          ring.setAttribute('r', (8 + 30 * ph).toFixed(1)); ring.setAttribute('opacity', ((1 - ph) * 0.85).toFixed(2));
          dot.setAttribute('r', (7 + 4 * Math.max(0, 1 - ph * 4)).toFixed(1));
        });
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-donde */
  Motor.fx('op-donde', {
    render(api) {
      cancel(api);
      const host = api.q('[data-role="donde"]');
      host.innerHTML = `
        <div class="dw">
          <div class="dbox g1" data-seq="1">
            <h4>G1 EDU + Jetson · a bordo</h4>
            <p class="label">no puede depender de la red</p>
            <div class="chips"><span class="tag map">SLAM y localización</span><span class="tag code">Nav2</span><span class="tag code">seguridad</span><span class="tag code">locomoción</span></div>
            <p class="label">ligero, también a bordo</p>
            <div class="chips"><span class="tag model" data-role="c-rai">agente RAI</span><span class="tag model">Laya</span><span class="tag model">detector ligero</span><span class="tag code">consulta al grafo</span><span class="tag code">módulo geométrico</span></div>
          </div>
          <div class="link" data-seq="2"></div>
          <div class="dbox srv" data-seq="3">
            <h4>Servidor GPU · fuera</h4>
            <p class="label">lo pesado</p>
            <div class="chips"><span class="tag model" data-role="c-llm">LLM de parseo (2–9B)</span><span class="tag code">construcción del grafo</span></div>
          </div>
        </div>`;
      const { s, w, h } = svgIn(host.querySelector('.link'));
      const ah = markers(api, s);
      const y1 = h * 0.28, y2 = h * 0.5, y3 = h * 0.78;
      S('text', { x: w / 2, y: y1 - 22, 'text-anchor': 'middle', class: 'b', text: 'Wi-Fi' }, s);
      S('line', { x1: 10, x2: w - 14, y1, y2: y1, class: 'ln', 'marker-end': ah('n') }, s);
      S('text', { x: w / 2, y: y1 + 34, 'text-anchor': 'middle', class: 't3 mono', text: 'orden' }, s);
      S('line', { x1: w - 10, x2: 14, y1: y2, y2, class: 'ln', 'marker-end': ah('n') }, s);
      S('text', { x: w / 2, y: y2 + 34, 'text-anchor': 'middle', class: 't3 mono', text: 'JSON' }, s);
      const ecg = `M0 ${y3} ` + Array.from({ length: Math.ceil(w / 60) }, (_, i) => { const x = i * 60; return `L${x + 22} ${y3} L${x + 30} ${y3 - 26} L${x + 38} ${y3 + 18} L${x + 44} ${y3} L${x + 60} ${y3}`; }).join(' ');
      api.D = {
        ecg: S('path', { d: ecg, style: 'fill:none;stroke:var(--ok);stroke-width:3;stroke-dasharray:120 240' }, s),
        p1: S('circle', { cx: 0, cy: y1, r: 9, class: 'pkt', style: 'visibility:hidden' }, s), p2: S('circle', { cx: 0, cy: y2, r: 9, class: 'pkt', style: 'visibility:hidden' }, s),
        w, y1, y2,
      };
      S('text', { x: w / 2, y: y3 + 50, 'text-anchor': 'middle', class: 't3 mono', text: 'watchdog' }, s);
    },
    play(api) {
      seqIn(api, 300);
      const { p1, p2, ecg, w } = api.D, rai = api.q('[data-role="c-rai"]'), llm = api.q('[data-role="c-llm"]');
      api.raf((t) => {
        const ph = (t / 3600) % 1;
        put(p1, ph < 0.45 ? lerp(8, w - 16, smooth(ph / 0.45)) : null);
        put(p2, ph >= 0.5 && ph < 0.95 ? lerp(w - 8, 16, smooth((ph - 0.5) / 0.45)) : null);
        llm.classList.toggle('glow', ph >= 0.42 && ph < 0.56);
        rai.classList.toggle('glow', ph >= 0.92 || ph < 0.06);
        ecg.style.strokeDashoffset = String(-(t / 6) % 360);
      });
    },
    stop(api) { cancel(api); api.qa('.glow').forEach((e) => e.classList.remove('glow')); },
  });

  /* =================================================================== op-slam */
  const CW = 111, CH = 62;
  const ROOMS = [[1, 22], [22, 43], [43, 64], [64, 85], [85, 109]];
  function slamWorld() {
    const occ = new Uint8Array(CW * CH);
    const set = (x, y, v = 1) => { if (x >= 0 && y >= 0 && x < CW && y < CH) occ[y * CW + x] = v; };
    const rect = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y); };
    rect(1, 1, 109, 1); rect(1, 60, 109, 60); rect(1, 1, 1, 60); rect(109, 1, 109, 60);
    rect(1, 25, 109, 25); rect(1, 37, 109, 37);
    ROOMS.forEach(([a, b]) => {
      rect(b, 1, b, 25); rect(b, 37, b, 60);
      const dc = Math.round((a + b) / 2);
      for (let x = dc - 3; x <= dc + 2; x++) { set(x, 25, 0); set(x, 37, 0); }
      rect(a + 4, 3, a + 9, 12); rect(a + 4, 49, a + 9, 58); // camas, cabecero contra la pared
      rect(b - 6, 17, b - 4, 19); rect(b - 6, 42, b - 4, 44); // sillas
    });
    rect(72, 28, 79, 29); // camilla en el pasillo
    return occ;
  }
  const PATH1 = [[6, 31], [53, 31], [53, 16], [53, 31], [104, 31]];
  const PATH2 = [[104, 31], [60, 33], [53, 31], [53, 20], [50, 15]];
  function castInto(known, occ, px, py, hits, n = 180, range = 40) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU, ca = Math.cos(a), sa = Math.sin(a);
      for (let d = 0.5; d < range; d += 0.5) {
        const x = Math.floor(px + ca * d), y = Math.floor(py + sa * d);
        if (x < 0 || y < 0 || x >= CW || y >= CH) break;
        const i = y * CW + x;
        if (occ[i]) { known[i] = 2; if (hits) hits.push([x + 0.5, y + 0.5]); break; }
        if (!known[i]) known[i] = 1;
      }
    }
  }
  function slamDraw(api, st, robot, hits, ell) {
    const { ctx, w, h } = st.c, k = st.k, ox = st.ox, oy = st.oy;
    const img = st.img, data = img.data, kn = st.known;
    for (let i = 0; i < kn.length; i++) {
      const c = kn[i] === 0 ? st.cU : kn[i] === 1 ? st.cF : st.cO, j = i * 4;
      data[j] = c[0]; data[j + 1] = c[1]; data[j + 2] = c[2]; data[j + 3] = 255;
    }
    st.octx.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(st.off, ox, oy, CW * k, CH * k);
    const X = (x) => ox + x * k, Y = (y) => oy + y * k;
    ctx.font = api.font('mono', 22, 600); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ROOMS.forEach(([a, b], i) => {
      [[2, 21, 201 + i], [43, 40, 206 + i]].forEach(([, yy, num]) => {
        const cx = Math.round((a + b) / 2) + 2, cell = kn[Math.floor(yy) * CW + cx];
        if (!cell) return;
        ctx.fillStyle = num === 203 ? st.acc : st.fg3;
        ctx.fillText(String(num), X(cx + 2), Y(yy));
      });
    });
    if (hits && hits.length) {
      ctx.strokeStyle = api.color.alpha(st.map, 0.16); ctx.lineWidth = 1;
      ctx.beginPath(); hits.forEach(([hx, hy]) => { ctx.moveTo(X(robot[0]), Y(robot[1])); ctx.lineTo(X(hx), Y(hy)); }); ctx.stroke();
      ctx.fillStyle = st.map; hits.forEach(([hx, hy]) => { ctx.beginPath(); ctx.arc(X(hx), Y(hy), Math.max(2, k * 0.28), 0, TAU); ctx.fill(); });
    }
    if (ell) {
      ctx.save(); ctx.translate(X(robot[0]), Y(robot[1])); ctx.rotate(0.4);
      ctx.fillStyle = api.color.alpha(st.acc, 0.16); ctx.strokeStyle = st.acc; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.ellipse(0, 0, ell * k * 1.4, ell * k, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); ctx.setLineDash([]);
      const L = 3.2 * k; // TF base_link
      ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.strokeStyle = st.x; ctx.beginPath(); ctx.moveTo(X(robot[0]), Y(robot[1])); ctx.lineTo(X(robot[0]) + Math.cos(robot[2]) * L, Y(robot[1]) + Math.sin(robot[2]) * L); ctx.stroke();
      ctx.strokeStyle = st.y; ctx.beginPath(); ctx.moveTo(X(robot[0]), Y(robot[1])); ctx.lineTo(X(robot[0]) - Math.sin(robot[2]) * L, Y(robot[1]) + Math.cos(robot[2]) * L); ctx.stroke();
      ctx.font = api.font('mono', 22, 500); ctx.fillStyle = st.fg2; ctx.textAlign = 'left';
      ctx.fillText('base_link', X(robot[0]) + 1.6 * k, Y(robot[1]) + 2.6 * k);
    }
    ctx.fillStyle = st.acc; ctx.strokeStyle = st.bg; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(X(robot[0]), Y(robot[1]), Math.max(8, k * 1.2), 0, TAU); ctx.fill(); ctx.stroke();
  }
  function slamPhase(api, n) {
    const tag = api.q('[data-role="phase"]');
    tag.textContent = n === 1 ? 'fase 1 · mapeo' : n === 2 ? 'fase 2 · operación' : 'mapa previo + localización';
    api.q('[data-role="p1"]').classList.toggle('on', n !== 2);
    api.q('[data-role="p2"]').classList.toggle('on', n !== 1);
  }
  Motor.fx('op-slam', {
    render(api) {
      cancel(api);
      const host = api.q('[data-role="map"]'), c = api.canvas(host);
      const k = Math.min(c.w / CW, c.h / CH);
      const off = document.createElement('canvas'); off.width = CW; off.height = CH;
      const octx = off.getContext('2d');
      const st = api.SL = {
        c, k, ox: (c.w - CW * k) / 2, oy: (c.h - CH * k) / 2, off, octx, img: octx.createImageData(CW, CH),
        occ: slamWorld(), known: new Uint8Array(CW * CH),
        cU: rgb(api, api.tok('bg-3')), cF: rgb(api, api.tok('bg')), cO: rgb(api, api.tok('fg')),
        map: api.tok('cat-3'), acc: api.tok('accent'), bg: api.tok('bg'), fg3: api.tok('fg-3'), fg2: api.tok('fg-2'), x: api.tok('x'), y: api.tok('y'),
      };
      for (let u = 0; u <= 1.0001; u += 0.004) { const p = pointAt(PATH1, u); castInto(st.known, st.occ, p[0], p[1], null, 120); }
      const end = pointAt(PATH2, 1);
      slamDraw(api, st, end, null, 1.2);
      slamPhase(api, 0);
    },
    play(api) {
      seqIn(api);
      const st = api.SL, T1 = 11000, H1 = 1400, T2 = 7500, H2 = 2200;
      api.raf((t) => {
        const cyc = t % (T1 + H1 + T2 + H2);
        if (cyc < T1 + H1) {
          if (cyc < 40 || st.phase !== 1) { st.known.fill(0); st.phase = 1; slamPhase(api, 1); }
          const p = pointAt(PATH1, smooth(Math.min(1, cyc / T1)) * 0.98 + Math.min(1, cyc / T1) * 0.02), hits = [];
          castInto(st.known, st.occ, p[0], p[1], hits, 150);
          slamDraw(api, st, p, cyc < T1 ? hits : null, 0);
        } else {
          if (st.phase !== 2) { st.phase = 2; slamPhase(api, 2); }
          const u = Math.min(1, (cyc - T1 - H1) / T2), p = pointAt(PATH2, smooth(u));
          const ell = lerp(7, 1.2, smooth(Math.min(1, u * 2.2))) + 0.25 * Math.sin(t / 180);
          slamDraw(api, st, p, null, ell);
        }
      });
    },
    stop(api) { cancel(api); if (api.SL) api.SL.phase = 0; },
  });

  /* =================================================================== op-grafo */
  Motor.fx('op-grafo', {
    render(api) {
      cancel(api);
      const { s, w, h } = svgIn(api.q('[data-role="grafo"]'));
      const ah = markers(api, s);
      const PW = Math.min(760, w - 940), SK = 150, X0 = 10;
      const planes = [
        { y: 8, hh: 120, cls: 'model', t: '3 · capa de personas', sub: 'cambia mientras el robot se mueve' },
        { y: 178, hh: 200, cls: 'code', t: '2 · topológico-semántico', sub: 'planta → habitaciones → objetos' },
        { y: 430, hh: 150, cls: 'map', t: '1 · métrico', sub: 'rejilla de ocupación del mapa previo' },
      ];
      const P = (pl, u, v) => [X0 + u * PW + (1 - v) * SK, pl.y + v * pl.hh];
      const poly = (pl) => [P(pl, 0, 0), P(pl, 1, 0), P(pl, 1, 1), P(pl, 0, 1)].map((p) => p.join(',')).join(' ');
      const gPl = [];
      planes.slice().reverse().forEach((pl, ri) => {
        const g = S('g', { 'data-seq': ri + 1 }, s); gPl.push(g);
        S('polygon', { points: poly(pl), class: `box ${pl.cls}`, style: 'fill-opacity:.85' }, g);
        const [lx, ly] = P(pl, 1, 0.5);
        S('text', { x: lx + 26, y: ly - 6, class: 'b', style: 'font-size:26px', text: pl.t }, g);
        S('text', { x: lx + 26, y: ly + 24, class: 't3', text: pl.sub }, g);
      });
      const [pPer, pSem, pMet] = planes;
      // capa métrica: rejilla y habitaciones
      const gm = gPl[0];
      for (let i = 1; i < 12; i++) { const a = P(pMet, i / 12, 0), b = P(pMet, i / 12, 1); S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'grid' }, gm); }
      for (let j = 1; j < 5; j++) { const a = P(pMet, 0, j / 5), b = P(pMet, 1, j / 5); S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'grid' }, gm); }
      const wall = (u0, v0, u1, v1) => { const a = P(pMet, u0, v0), b = P(pMet, u1, v1); S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], style: 'stroke:var(--fg);stroke-width:4;stroke-linecap:round' }, gm); };
      wall(0.18, 0.45, 1, 0.45); [0.18, 0.34, 0.5, 0.66, 0.82, 1].forEach((u) => wall(u, 0, u, 0.45));
      // capa semántica
      const gs = gPl[1];
      const rooms = [201, 202, 203, 204, 205].map((n, i) => ({ n, u: 0.26 + i * 0.16, v: 0.28 }));
      const planta = { u: 0.06, v: 0.62 };
      const objs = [['cama_A', 0.33], ['silla', 0.47], ['lavabo', 0.61], ['puerta', 0.75]].map(([n, u]) => ({ n, u, v: 0.86 }));
      const r203 = rooms[2], pp = P(pSem, planta.u, planta.v), p203 = P(pSem, r203.u, r203.v);
      api.G = { edges: [], nodes: {} };
      rooms.forEach((r) => {
        const a = P(pSem, r.u, r.v);
        const e = S('line', { x1: pp[0], y1: pp[1], x2: a[0], y2: a[1], class: 'ln', 'data-seq': 3, 'data-a': 'draw' }, gs);
        if (r.n === 203) api.G.e1 = e;
      });
      objs.forEach((o) => {
        const a = P(pSem, o.u, o.v);
        const e = S('line', { x1: p203[0], y1: p203[1], x2: a[0], y2: a[1], class: 'ln', 'data-seq': 4, 'data-a': 'draw' }, gs);
        if (o.n === 'cama_A') api.G.e2 = e;
      });
      const node = (pt, label, cls, below, key) => {
        const g = S('g', { 'data-seq': 4, 'data-a': 'pop' }, gs);
        const c = S('circle', { cx: pt[0], cy: pt[1], r: 13, class: cls, style: 'stroke:var(--bg);stroke-width:3' }, g);
        S('text', { x: pt[0], y: below ? pt[1] + 40 : pt[1] - 22, 'text-anchor': 'middle', class: 'mono', style: 'font-size:22px', text: label }, g);
        if (key) api.G.nodes[key] = c;
      };
      node(pp, 'planta 2', 'f-fg', true, 'planta');
      rooms.forEach((r) => node(P(pSem, r.u, r.v), String(r.n), r.n === 203 ? 'f-acc' : 'f-code', false, r.n === 203 ? 'r203' : null));
      objs.forEach((o) => node(P(pSem, o.u, o.v), o.n, 'f-code', true, o.n === 'cama_A' ? 'cama' : null));
      // proyección al mapa métrico
      const pm = P(pMet, 0.42, 0.22), pc = P(pSem, objs[0].u, objs[0].v);
      S('line', { x1: pc[0], y1: pc[1] + 14, x2: pm[0], y2: pm[1], class: 'ln dash', 'data-seq': 5, 'data-a': 'draw', 'marker-end': ah('n') }, s);
      // capa de personas
      const gp = gPl[2];
      api.G.people = [['paciente', 0.26, 0.5], ['sanitario', 0.5, 0.3], ['visitante', 0.7, 0.72]].map(([n, u, v], i) => {
        const g = S('g', { 'data-seq': 5, 'data-a': 'pop' }, gp), [x, y] = P(pPer, u, v);
        const c = S('circle', { cx: x, cy: y, r: 12, class: 'f-model', style: 'stroke:var(--bg);stroke-width:3' }, g);
        const t = S('text', { x: x + 20, y: y + 8, class: 'mono', style: 'font-size:22px', text: n }, g);
        return { c, t, u, v, i };
      });
      api.G.pPer = pPer; api.G.P = P;
      // consulta
      const qx = w - 470, qy = 20, qw = 460;
      const gq = S('g', { 'data-seq': 6 }, s);
      S('rect', { x: qx, y: qy, width: qw, height: 330, rx: 18, style: 'fill:var(--bg-2);stroke:var(--line-2);stroke-width:1.5' }, gq);
      const lines = [['# consulta de la orden E1', 't3'], ['find_room("203")', ''], ['  → habitación 203', 'res'], ['list_objects("203")', ''], ['  → cama_A', 'res'], ['    (cabecero → pies)', 't3'], ['  → silla · lavabo · puerta', 't3']];
      api.G.q = lines.map(([tx, cl], i) => S('text', { x: qx + 26, y: qy + 50 + i * 42, class: `mono ${cl === 't3' ? 't3' : ''}`, style: `font-size:23px;${cl === 'res' ? 'font-weight:600' : ''}`, text: tx }, gq));
      const gt = S('g', { 'data-seq': 7 }, s);
      S('text', { x: qx, y: qy + 380, class: 'b', text: 'construcción: fuera del robot' }, gt);
      S('text', { x: qx, y: qy + 416, class: 'b', text: 'consulta: a bordo' }, gt);
      S('text', { x: qx, y: qy + 452, class: 't3', text: 'nombres de tools propuestos' }, gt);
      api.G.pk = S('circle', { cx: 0, cy: 0, r: 9, class: 'pkt', style: 'visibility:hidden' }, s);
      api.G.pts = [pp, p203, pc];
    },
    play(api) {
      const end = seqIn(api, 330), G = api.G;
      const hl = (i) => G.q.forEach((t, j) => { t.style.fill = j === i || j === i + 1 ? 'var(--accent-ink)' : ''; });
      api.raf((t) => {
        G.people.forEach((p) => {
          const u = p.u + 0.04 * Math.sin(t / 1600 + p.i * 2), v = p.v + 0.14 * Math.sin(t / 1100 + p.i);
          const [x, y] = G.P(G.pPer, u, v); p.c.setAttribute('cx', x); p.c.setAttribute('cy', y); p.t.setAttribute('x', x + 20); p.t.setAttribute('y', y + 8);
        });
        if (t < end) return;
        const ph = ((t - end) % 6000) / 6000;
        if (ph < 0.4) { const q = pointAt(G.pts.slice(0, 2), ph / 0.4); put(G.pk, q[0], q[1]); hl(1); }
        else if (ph < 0.8) { const q = pointAt(G.pts.slice(1), (ph - 0.4) / 0.4); put(G.pk, q[0], q[1]); hl(3); }
        else { put(G.pk, G.pts[2][0], G.pts[2][1]); hl(3); }
        const on = ph >= 0.36;
        G.nodes.r203.setAttribute('r', ph >= 0.36 && ph < 0.46 ? 18 : 13);
        G.nodes.cama.setAttribute('r', ph >= 0.78 ? 18 : 13);
        G.e1.style.stroke = on || ph > 0.02 ? 'var(--accent)' : ''; G.e1.style.strokeWidth = '4';
        G.e2.style.stroke = ph >= 0.4 ? 'var(--accent)' : ''; G.e2.style.strokeWidth = ph >= 0.4 ? '4' : '';
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-costmap */
  const GW = 72, GH = 26;
  function cmStatic() {
    const occ = new Uint8Array(GW * GH), set = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) occ[y * GW + x] = 1; };
    set(0, 0, GW - 1, 1); set(0, GH - 2, GW - 1, GH - 1);
    set(18, 2, 20, 6); set(40, 19, 42, 23); set(58, 2, 60, 5);
    const cost = new Float32Array(GW * GH), pts = [];
    occ.forEach((v, i) => { if (v) pts.push([i % GW, Math.floor(i / GW)]); });
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const i = y * GW + x; if (occ[i]) { cost[i] = 1; continue; }
      let d = 99; for (const [px, py] of pts) { const dd = Math.hypot(px - x, py - y); if (dd < d) d = dd; }
      cost[i] = d < 5 ? 0.85 * Math.exp(-(d - 1) / 1.3) : 0;
    }
    return cost;
  }
  function cmLayers(st, t) {
    const { stv, soc, sem } = st;
    stv.fill(0); soc.fill(0);
    for (let k = 0; k < 3; k++) { // STVL: obstáculos que aparecen y caducan
      const per = 6, age = (t + k * 2) % per, a = Math.max(0, 1 - age / 4.2), cx = [30, 50, 12][k], cy = [16, 8, 18][k];
      for (let y = cy - 2; y <= cy + 2; y++) for (let x = cx - 3; x <= cx + 3; x++) { if (x < 0 || y < 0 || x >= GW || y >= GH) continue; const e = (Math.abs(x - cx) <= 2 && Math.abs(y - cy) <= 1) ? 0.95 : 0.45; stv[y * GW + x] = Math.max(stv[y * GW + x], e * a); }
    }
    st.people = [0, 1, 2].map((i) => [22 + 40 * (0.5 + 0.5 * Math.sin(t * 0.22 + i * 2.1)), 7 + i * 6 + 2.2 * Math.sin(t * 0.5 + i)]);
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      let v = 0; for (const [px, py] of st.people) { const d2 = (px - x) ** 2 + (py - y) ** 2; v = Math.max(v, 0.9 * Math.exp(-d2 / (2 * 2.4 * 2.4))); }
      soc[y * GW + x] = v;
    }
    if (!st.semDone) { for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) sem[y * GW + x] = 0.65 * Math.exp(-(((x - 46) / 5) ** 2 + ((y - 12) / 3.2) ** 2) / 2); st.semDone = true; }
    for (let i = 0; i < GW * GH; i++) st.sum[i] = st.sta[i] >= 1 ? 1 : Math.min(0.97, st.sta[i] + stv[i] + soc[i] + sem[i]);
  }
  function astar(cost, s, g) {
    const N = GW * GH, gS = new Float32Array(N).fill(Infinity), from = new Int32Array(N).fill(-1), open = [s], inO = new Uint8Array(N), closed = new Uint8Array(N);
    const hfn = (i) => Math.hypot((i % GW) - (g % GW), Math.floor(i / GW) - Math.floor(g / GW));
    const f = new Float32Array(N).fill(Infinity); gS[s] = 0; f[s] = hfn(s); inO[s] = 1;
    while (open.length) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (f[open[i]] < f[open[bi]]) bi = i;
      const cur = open[bi]; open.splice(bi, 1); inO[cur] = 0;
      if (cur === g) break; closed[cur] = 1;
      const cx = cur % GW, cy = Math.floor(cur / GW);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
        const ni = ny * GW + nx; if (closed[ni] || cost[ni] >= 0.99) continue;
        const ng = gS[cur] + Math.hypot(dx, dy) * (1 + 14 * cost[ni]);
        if (ng < gS[ni]) { gS[ni] = ng; from[ni] = cur; f[ni] = ng + hfn(ni); if (!inO[ni]) { open.push(ni); inO[ni] = 1; } }
      }
    }
    const path = []; let c = g; while (c !== -1) { path.push([c % GW + 0.5, Math.floor(c / GW) + 0.5]); if (c === s) break; c = from[c]; }
    return path.reverse();
  }
  function cmPaint(st, arr, oc) {
    const d = oc.img.data;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i], j = i * 4, c = v >= 0.99 ? st.cFg : v < 0.02 ? st.cBg : st.lut[Math.min(255, Math.round(v * 255))];
      d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255;
    }
    oc.ctx.putImageData(oc.img, 0, 0);
  }
  function cmDraw(api, st) {
    const { ctx, w, h } = st.c; ctx.clearRect(0, 0, w, h);
    const L = st.L;
    [st.sta, st.stv, st.soc, st.sem].forEach((arr, i) => {
      const r = L.small[i]; cmPaint(st, arr, st.oc[i]);
      ctx.imageSmoothingEnabled = true; ctx.drawImage(st.oc[i].cv, r.x, r.y, r.w, r.h);
      ctx.strokeStyle = i === 3 ? st.model : st.code; ctx.lineWidth = 3; ctx.strokeRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = st.fg; ctx.font = api.font('display', 25, 700); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(L.names[i][0], r.x, r.y + r.h + 32);
      ctx.fillStyle = st.fg3; ctx.font = api.font('text', 22, 400); ctx.fillText(L.names[i][1], r.x, r.y + r.h + 60);
      if (i < 3) { ctx.fillStyle = st.fg3; ctx.font = api.font('display', 34, 700); ctx.textAlign = 'center'; ctx.fillText('+', r.x + r.w + L.gap / 2, r.y + r.h / 2 + 12); }
    });
    const B = L.big; cmPaint(st, st.sum, st.oc[4]);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(st.oc[4].cv, B.x, B.y, B.w, B.h);
    ctx.strokeStyle = st.line2; ctx.lineWidth = 2; ctx.strokeRect(B.x, B.y, B.w, B.h);
    const k = B.w / GW, X = (x) => B.x + x * k, Y = (y) => B.y + y * k;
    if (st.path && st.path.length > 1) {
      ctx.strokeStyle = st.bg; ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); st.path.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke();
      ctx.strokeStyle = st.acc; ctx.lineWidth = 5; ctx.stroke();
    }
    st.people.forEach(([x, y]) => { ctx.fillStyle = st.bg; ctx.strokeStyle = st.fg; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(x), Y(y), k * 0.7, 0, TAU); ctx.fill(); ctx.stroke(); });
    ctx.fillStyle = st.acc; ctx.strokeStyle = st.bg; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X(3.5), Y(13.5), k * 0.9, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = st.acc; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(X(68.5), Y(13.5), k * 0.9, 0, TAU); ctx.stroke();
    // rótulo y escala
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const lab = 'costmap final = suma de capas', lw = ctx.measureText(lab).width;
    ctx.font = api.font('display', 25, 700);
    const tw = ctx.measureText(lab).width + 28; void lw;
    ctx.fillStyle = api.color.alpha(st.bg, 0.88); ctx.fillRect(B.x + 12, B.y + 12, tw, 42);
    ctx.fillStyle = st.fg; ctx.fillText(lab, B.x + 26, B.y + 42);
    const lx = B.x + B.w - 330, ly = B.y + B.h - 46;
    ctx.fillStyle = api.color.alpha(st.bg, 0.88); ctx.fillRect(lx - 14, ly - 30, 330, 64);
    const g = ctx.createLinearGradient(lx + 70, 0, lx + 230, 0); for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, api.tok('seq-' + (i + 1)));
    ctx.fillStyle = g; ctx.fillRect(lx + 72, ly - 6, 158, 16);
    ctx.font = api.font('mono', 22, 500); ctx.fillStyle = st.fg2; ctx.fillText('coste', lx, ly + 8); ctx.fillText('alto', lx + 240, ly + 8);
  }
  Motor.fx('op-costmap', {
    render(api) {
      cancel(api);
      const c = api.canvas(api.q('[data-role="cm"]'));
      const gap = 40, pw = (c.w - 3 * gap) / 4, ph = pw * GH / GW;
      const by = ph + 90, bk = Math.min(c.w / GW, (c.h - by) / GH);
      const mk = () => { const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH; const ctx = cv.getContext('2d'); return { cv, ctx, img: ctx.createImageData(GW, GH) }; };
      const lut = Array.from({ length: 256 }, (_, i) => rgb(api, api.seq(0.08 + 0.92 * i / 255)));
      const st = api.CM = {
        c, lut, oc: [mk(), mk(), mk(), mk(), mk()],
        sta: cmStatic(), stv: new Float32Array(GW * GH), soc: new Float32Array(GW * GH), sem: new Float32Array(GW * GH), sum: new Float32Array(GW * GH),
        cBg: rgb(api, api.tok('bg-2')), cFg: rgb(api, api.tok('fg')),
        fg: api.tok('fg'), fg2: api.tok('fg-2'), fg3: api.tok('fg-3'), bg: api.tok('bg'), acc: api.tok('accent'), line2: api.tok('line-2'), model: api.tok('cat-1'), code: api.tok('cat-2'),
        L: {
          gap, small: [0, 1, 2, 3].map((i) => ({ x: i * (pw + gap), y: 0, w: pw, h: ph })),
          big: { x: (c.w - GW * bk) / 2, y: by, w: GW * bk, h: GH * bk },
          names: [['estática', 'mapa previo'], ['STVL', 'obstáculos 3D'], ['social', 'espacio personal'], ['semántica', 'zonas de un VLM']],
        },
      };
      cmLayers(st, 3.2); st.path = astar(st.sum, 13 * GW + 3, 13 * GW + 68);
      cmDraw(api, st);
    },
    play(api) {
      seqIn(api);
      const st = api.CM; let lastA = -1e9;
      api.raf((t) => {
        const s = 3.2 + t / 1000; cmLayers(st, s);
        if (t - lastA > 280) { st.path = astar(st.sum, 13 * GW + 3, 13 * GW + 68); lastA = t; }
        cmDraw(api, st);
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-parseo */
  const JSEG = [
    ['{\n  ', ''], ['"room"', 'k'], [': ', ''], ['"203"', 'v', 'cat-4', 'room'], [',\n  ', ''],
    ['"anchor"', 'k'], [': ', ''], ['"cama"', 'v', 'cat-6', 'anchor'], [',\n  ', ''],
    ['"relation"', 'k'], [': ', ''], ['"derecha_de"', 'v', 'cat-5', 'relation'], [',\n  ', ''],
    ['"frame"', 'k'], [': ', ''], ['null', 'nul'], ['\n}', ''],
  ];
  const JTOT = JSEG.reduce((a, s) => a + s[0].length, 0);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function jsonUpTo(n, cursor) {
    let out = '', left = n; const lit = new Set();
    for (const [tx, cl, c, key] of JSEG) {
      if (left <= 0) break;
      const part = tx.slice(0, left); left -= tx.length;
      if (key && part.length) lit.add(key);
      out += cl === 'v' ? `<span class="v" style="--c:var(--${c})">${esc(part)}</span>` : cl ? `<span class="${cl}">${esc(part)}</span>` : esc(part);
    }
    return { html: out + (cursor ? '<span class="cur"></span>' : ''), lit };
  }
  Motor.fx('op-parseo', {
    render(api) {
      cancel(api);
      api.q('[data-role="json"]').innerHTML = jsonUpTo(JTOT, false).html;
      api.qa('.w').forEach((w) => w.classList.remove('lit'));
      api.q('[data-role="pk"]').setAttribute('cx', -20);
    },
    play(api) {
      const pre = api.q('[data-role="json"]'), pk = api.q('[data-role="pk"]'), words = api.qa('.w');
      [['.frase', 0], ['.llm', 1], ['.json', 2], ['.parse-foot', 5]].forEach(([sel, n]) => anim(api, api.q(sel), [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 150 + n * 380 }));
      pre.innerHTML = '<span class="cur"></span>';
      const T0 = 1500, TF = 900, TT = 3600, HOLD = 3200;
      api.raf((t) => {
        const cyc = t % (T0 + TF + TT + HOLD);
        const u = clamp((cyc - T0) / TF, 0, 1); pk.setAttribute('cx', cyc < T0 || u >= 1 ? -20 : 180 * smooth(u));
        const n = Math.floor(clamp((cyc - T0 - TF) / TT, 0, 1) * JTOT);
        const { html, lit } = jsonUpTo(n, n < JTOT);
        if (pre._n !== n) { pre.innerHTML = html; pre._n = n; }
        words.forEach((w) => w.classList.toggle('lit', lit.has(w.dataset.k) && n < JTOT));
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-rai */
  const TOOLS = [
    ['find_room', 'código dispone', 'code', 'L'], ['list_objects', 'código dispone', 'code', 'L'], ['candidate_poses', 'código dispone', 'code', 'L'], ['choose', 'modelo · Laya (hipótesis)', 'model', 'L'],
    ['navigate_to_pose', 'código, con límites', 'code', 'R'], ['get_current_pose', 'código dispone', 'code', 'R'], ['describe_scene', 'modelo propone', 'model', 'R'], ['ask_user', 'modelo propone', 'model', 'R'],
  ];
  const E1ORDER = [0, 1, 2, 3, 4, 5];
  Motor.fx('op-rai', {
    render(api) {
      cancel(api);
      const { s, w, h } = svgIn(api.q('[data-role="rai"]'));
      const BW = 360, BH = 104, cx = w / 2, cy = 230, R = 118;
      const rowY = (i) => 10 + i * ((h - 20 - BH) / 3);
      api.RA = { tools: [], spokes: [] };
      TOOLS.forEach(([nm, sub, k, side], i) => {
        const j = i % 4, x = side === 'L' ? 0 : w - BW, y = rowY(j);
        const ax = side === 'L' ? BW : w - BW, ay = y + BH / 2;
        const ang = Math.atan2(ay - cy, ax - cx), ex = cx + Math.cos(ang) * (R + 6), ey = cy + Math.sin(ang) * (R + 6);
        const sp = S('line', { x1: ax, y1: ay, x2: ex, y2: ey, class: `ln ${k}`, 'data-seq': 2, 'data-a': 'draw', style: 'stroke-width:3;opacity:.7' }, s);
        const g = S('g', { 'data-seq': 1 + (j % 4) * 0.5 }, s);
        const box = S('rect', { x, y, width: BW, height: BH, rx: 16, class: `box ${k}` }, g);
        S('text', { x: x + 24, y: y + 44, class: 'mono b', style: 'font-size:27px', text: nm }, g);
        S('circle', { cx: x + 31, cy: y + 74, r: 7, class: `f-${k}` }, g);
        S('text', { x: x + 46, y: y + 82, class: 't2', style: 'font-size:22px', text: sub }, g);
        api.RA.tools.push({ box, ax, ay, ex, ey }); api.RA.spokes.push(sp);
      });
      const gc = S('g', { 'data-seq': 3, 'data-a': 'pop' }, s);
      S('circle', { cx, cy, r: R, class: 'box solid' }, gc);
      api.RA.ring = S('circle', { cx, cy, r: R - 14, style: 'fill:none;stroke:var(--bg);stroke-width:4;stroke-dasharray:60 30;opacity:.5' }, gc);
      S('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', class: 'inv h', style: 'font-size:34px', text: 'Agente RAI' }, gc);
      S('text', { x: cx, y: cy + 32, 'text-anchor': 'middle', class: 'inv mono', text: 'ciclo ReAct' }, gc);
      const gr = S('g', { 'data-seq': 4 }, s);
      S('rect', { x: cx - 290, y: cy + R + 24, width: 580, height: 56, rx: 28, style: 'fill:var(--bg);stroke:var(--line-2);stroke-width:1.5' }, gr);
      api.RA.words = ['pensar', 'actuar', 'observar'].map((wd, i) => S('text', { x: cx + (i - 1) * 170, y: cy + R + 62, 'text-anchor': 'middle', class: 'b', style: 'font-size:28px', text: wd }, gr));
      [0, 1].forEach((i) => S('text', { x: cx + (i - 0.5) * 170, y: cy + R + 60, 'text-anchor': 'middle', class: 't3', text: '→' }, gr));
      const gn = S('g', { 'data-seq': 5 }, s);
      S('rect', { x: cx - 390, y: h - 92, width: 780, height: 92, rx: 16, style: 'fill:var(--bg)' }, gn);
      S('text', { x: cx, y: h - 52, 'text-anchor': 'middle', class: 'b', style: 'font-size:27px', text: '8 tools: por debajo del techo de 9 estable en el TFG.' }, gn);
      S('text', { x: cx, y: h - 14, 'text-anchor': 'middle', class: 't2', style: 'font-size:26px', text: 'Ninguna lleva velocidades en su esquema.' }, gn);
      api.RA.pk = S('circle', { cx: 0, cy: 0, r: 10, class: 'pkt', style: 'visibility:hidden' }, s);
    },
    play(api) {
      const end = seqIn(api, 300), RA = api.RA, STEP = 1600;
      api.raf((t) => {
        RA.ring.setAttribute('transform', `rotate(${(t / 40) % 360} ${RA.ring.getAttribute('cx')} ${RA.ring.getAttribute('cy')})`);
        if (t < end) return;
        const tt = (t - end) % (STEP * (E1ORDER.length + 1)), k = Math.floor(tt / STEP), u = (tt % STEP) / STEP;
        RA.tools.forEach((tl) => tl.box.style.strokeWidth = '');
        RA.words.forEach((wd) => { wd.style.fill = ''; });
        if (k >= E1ORDER.length) { put(RA.pk, null); return; }
        const tl = RA.tools[E1ORDER[k]]; tl.box.style.strokeWidth = '5';
        const go = u < 0.5, v = go ? smooth(u / 0.5) : smooth((u - 0.5) / 0.5);
        const x = go ? lerp(tl.ex, tl.ax, v) : lerp(tl.ax, tl.ex, v), y = go ? lerp(tl.ey, tl.ay, v) : lerp(tl.ay, tl.ey, v);
        put(RA.pk, x, y);
        RA.words[u < 0.15 ? 0 : u < 0.5 ? 1 : 2].style.fill = 'var(--accent-ink)';
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-cifras */
  Motor.fx('op-cifras', {
    render(api) { cancel(api); api.qa('[data-count]').forEach((e) => { e.textContent = e.dataset.count; }); const g = api.q('[data-role="glitch"]'); g.style.transform = ''; g.style.opacity = ''; },
    play(api) {
      const end = seqIn(api, 420);
      api.qa('[data-count]').forEach((e) => { const n = +e.dataset.count, d = 150 + 380 * (+e.closest('[data-seq]').dataset.seq); e.textContent = '0'; api.tween(1300, (p) => { e.textContent = String(Math.round(n * p)); }, { delay: d, ease: (x) => 1 - (1 - x) ** 3 }); });
      api.qa('.bar i').forEach((b) => anim(api, b, [{ transform: 'scaleX(0)', transformOrigin: 'left' }, { transform: 'scaleX(1)', transformOrigin: 'left' }], { duration: 1200, delay: 500 + 380 * (+b.closest('[data-seq]').dataset.seq) }));
      const g = api.q('[data-role="glitch"]'), R = api.rng(7);
      api.raf((t) => {
        if (t < end) return;
        const ph = (t % 2600) / 2600;
        if (ph > 0.86) { g.style.transform = `translateX(${(R() - 0.5) * 12}px) skewX(${(R() - 0.5) * 14}deg)`; g.style.opacity = R() > 0.5 ? '0.35' : '1'; }
        else { g.style.transform = ''; g.style.opacity = ''; }
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-laya */
  const CH3 = [['cama_A', 0.81], ['cama_B', 0.14], ['ambigua', 0.05]];
  Motor.fx('op-laya', {
    render(api) {
      cancel(api);
      api.LY = {};
      { // choice
        const { s, w, h } = svgIn(api.q('[data-role="d-choice"]')), x0 = 116, x1 = w - 70, rh = h / 3;
        api.LY.bars = CH3.map(([nm, v], i) => {
          const y = rh * (i + 0.5);
          S('text', { x: 0, y: y + 8, class: 'mono', text: nm }, s);
          S('rect', { x: x0, y: y - 10, width: x1 - x0, height: 20, rx: 6, class: 'f-bg3' }, s);
          const b = S('rect', { x: x0, y: y - 10, width: (x1 - x0) * v, height: 20, rx: 6, class: 'f-model' }, s);
          const t = S('text', { x: w, y: y + 8, 'text-anchor': 'end', class: 'mono t2', text: v.toFixed(2).replace('.', ',') }, s);
          return { b, t, v, x0, x1 };
        });
      }
      { // noul
        const { s, w, h } = svgIn(api.q('[data-role="d-noul"]')), y = h * 0.42, x0 = 30, x1 = w - 30;
        S('rect', { x: x0, y: y - 8, width: x1 - x0, height: 16, rx: 8, class: 'f-bg3' }, s);
        S('text', { x: x0, y: y + 46, 'text-anchor': 'middle', class: 't3 mono', text: '0' }, s);
        S('text', { x: x1, y: y + 46, 'text-anchor': 'middle', class: 't3 mono', text: '1' }, s);
        const m = S('circle', { cx: lerp(x0, x1, 0.12), cy: y, r: 14, class: 'f-model', style: 'stroke:var(--bg);stroke-width:3' }, s);
        const t = S('text', { x: w / 2, y: y + 46, 'text-anchor': 'middle', class: 'mono b', text: 'p = 0,12' }, s);
        api.LY.noul = { m, t, x0, x1 };
      }
      { // score
        const { s, w, h } = svgIn(api.q('[data-role="d-score"]')), n = 5, bw = (w - 20) / n, y = h * 0.3;
        api.LY.cells = Array.from({ length: n }, (_, i) => {
          const r = S('rect', { x: i * bw + 4, y, width: bw - 8, height: 46, rx: 10, class: i === 1 ? 'f-model' : 'f-bg3' }, s);
          S('text', { x: i * bw + bw / 2, y: y + 32, 'text-anchor': 'middle', class: 'mono b', text: String(i + 1) }, s);
          return r;
        });
        S('text', { x: 4, y: y + 86, class: 't3 mono', text: 'escala 1–5 · resultado: 2' }, s);
      }
    },
    play(api) {
      seqIn(api, 380);
      const L = api.LY, R = api.rng(3);
      api.raf((t) => {
        const cyc = (t % 6000) / 6000, conv = smooth(clamp(cyc / 0.35, 0, 1));
        L.bars.forEach((b, i) => {
          const v = lerp(1 / 3, b.v, conv) + (cyc < 0.35 ? (R() - 0.5) * 0.04 : 0);
          b.b.setAttribute('width', Math.max(0, (b.x1 - b.x0) * v)); b.t.textContent = clamp(v, 0, 1).toFixed(2).replace('.', ','); void i;
        });
        const p = lerp(0.5, 0.12, conv); L.noul.m.setAttribute('cx', lerp(L.noul.x0, L.noul.x1, p)); L.noul.t.textContent = 'p = ' + p.toFixed(2).replace('.', ',');
        const sweep = cyc < 0.35 ? Math.floor((cyc / 0.35) * 9) % 5 : 1;
        L.cells.forEach((c, i) => c.setAttribute('class', i === sweep ? 'f-model' : 'f-bg3'));
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-puerta */
  const CASES = [
    { t: 'Habitación con dos camas', bars: [['junto a la ventana', 0.52], ['junto a la puerta', 0.48]], pass: false, out: ['ninguna supera τ → ', 'ask_user', ': «¿cuál de las dos?»'], tag: 'abstención: pregunta' },
    { t: 'Habitación con una cama', bars: [['la cama', 0.97]], pass: true, out: ['supera τ → ', 'candidate_poses', ' → Nav2'], tag: 'actúa' },
  ];
  Motor.fx('op-puerta', {
    render(api) {
      cancel(api);
      api.PU = CASES.map((C, ci) => {
        const { s, w, h } = svgIn(api.q(`[data-role="g${ci + 1}"]`));
        S('rect', { x: 1, y: 1, width: w - 2, height: h - 2, rx: 24, style: `fill:var(--bg-3);stroke:${C.pass ? 'var(--ok)' : 'var(--warn)'};stroke-width:2.5` }, s);
        S('text', { x: 32, y: 54, class: 'h', text: C.t }, s);
        S('text', { x: 32, y: 88, class: 't3 mono', text: 'Laya · choice · valores ilustrativos' }, s);
        const x0 = 32, x1 = w - 40, X = (v) => lerp(x0, x1, v), yb = 120;
        const bars = C.bars.map(([nm, v], i) => {
          const y = yb + i * 74;
          S('text', { x: x0, y: y + 22, class: 't2', text: nm }, s);
          S('rect', { x: x0, y: y + 34, width: x1 - x0, height: 22, rx: 6, style: 'fill:var(--bg)' }, s);
          const b = S('rect', { x: x0, y: y + 34, width: X(v) - x0, height: 22, rx: 6, class: 'f-model' }, s);
          const tv = S('text', { x: X(v) + 10, y: y + 54, class: 'mono b', text: v.toFixed(2).replace('.', ',') }, s);
          return { b, tv, v };
        });
        const ty0 = yb - 8, ty1 = yb + 74 * 2 - 6;
        const th = S('line', { x1: X(0.8), x2: X(0.8), y1: ty0, y2: ty1, style: 'stroke:var(--fg);stroke-width:3;stroke-dasharray:8 6' }, s);
        S('text', { x: X(0.8), y: ty0 - 8, 'text-anchor': 'middle', class: 'mono b', text: 'τ = 0,8' }, s);
        // puerta
        const gx = w / 2, gy = ty1 + 40, gw = 200, gh = Math.min(170, h - gy - 120);
        S('rect', { x: gx - gw / 2 - 10, y: gy - 10, width: gw + 20, height: gh + 10, rx: 8, style: 'fill:var(--bg);stroke:var(--fg-2);stroke-width:4' }, s);
        const cid = `clip-${api.el.id}-${ci}`, cp = S('clipPath', { id: cid }, S('defs', {}, s)); S('rect', { x: gx - gw / 2, y: gy, width: gw, height: gh }, cp);
        const gd = S('g', { 'clip-path': `url(#${cid})` }, s);
        const lw = gw / 2, lf = S('rect', { x: gx - lw, y: gy, width: lw, height: gh, class: C.pass ? 'f-ok' : 'f-warn', style: 'opacity:.85' }, gd);
        const rf = S('rect', { x: gx, y: gy, width: lw, height: gh, class: C.pass ? 'f-ok' : 'f-warn', style: 'opacity:.85' }, gd);
        const icon = S('text', { x: gx, y: gy + gh / 2 + 18, 'text-anchor': 'middle', class: 'h', style: 'font-size:52px', text: C.pass ? '→' : '?' }, s);
        const oy = gy + gh + 52;
        const ot = S('text', { x: 32, y: oy, class: 't2', text: '' }, s);
        S('tspan', { text: C.out[0] }, ot); S('tspan', { class: 'mono b', style: 'fill:var(--fg)', text: C.out[1] }, ot); S('tspan', { text: C.out[2] }, ot);
        const tg = S('g', {}, s);
        const tgw = C.tag.length * 13.5 + 46;
        S('rect', { x: 32, y: oy + 22, width: tgw, height: 38, rx: 19, style: `fill:${C.pass ? 'var(--bg)' : 'var(--warn-soft)'};stroke:${C.pass ? 'var(--ok)' : 'var(--warn)'};stroke-width:1.5` }, tg);
        S('circle', { cx: 52, cy: oy + 41, r: 6, class: C.pass ? 'f-ok' : 'f-warn' }, tg);
        S('text', { x: 66, y: oy + 49, class: 'mono', text: C.tag }, tg);
        const open = (o) => { const d = lw * 0.92 * o; lf.setAttribute('x', gx - lw - d); rf.setAttribute('x', gx + d); lf.setAttribute('width', lw); };
        if (C.pass) open(1); else open(0);
        return { C, bars, X, x0, open, icon, th, ot, tg };
      });
    },
    play(api) {
      api.PU.forEach((P, ci) => {
        anim(api, P.ot, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 2600 + ci * 300 });
        anim(api, P.tg, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 2800 + ci * 300 });
      });
      api.raf((t) => {
        const cyc = t % 7000;
        api.PU.forEach((P) => {
          const g = smooth(clamp((cyc - 300) / 1600, 0, 1));
          P.bars.forEach((b) => { const v = b.v * g; b.b.setAttribute('width', Math.max(0, P.X(v) - P.x0)); b.tv.setAttribute('x', P.X(v) + 10); b.tv.textContent = v.toFixed(2).replace('.', ','); });
          const dec = clamp((cyc - 2000) / 700, 0, 1);
          P.open(P.C.pass ? smooth(dec) : 0.06 * Math.sin(cyc / 60) * (dec > 0 && dec < 1 ? 1 : 0));
          P.icon.style.opacity = String(dec);
          P.th.style.strokeWidth = cyc > 1900 && cyc < 2300 ? '6' : '3';
        });
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-e1 */
  const LANE = [['Usuario', ''], ['RAI + LLM', 'model'], ['Grafo y geometría', 'code'], ['Laya', 'model'], ['Nav2', 'code'], ['G1', 'code']];
  const MSG = [ // [desde, hasta, texto, clase, de vuelta]
    [0, 1, '1 · orden «Ve a la 203…»', 'n'],
    [1, 1, '2 · LLM → JSON', 'm'],
    [1, 2, '3 · find_room · list_objects', 'c'],
    [1, 2, '4 · candidate_poses → K poses', 'c', true],
    [1, 3, '5 · choose → pose + confianza p', 'm', true],
    [1, 1, '6 · ¿p ≥ τ?', 'gate'],
    [1, 4, 'sí: navigate_to_pose', 'c'],
    [4, 5, '7 · cmd_vel', 'c'],
    [1, 0, '8 · «He llegado»', 'n'],
  ];
  Motor.fx('op-e1', {
    render(api) {
      cancel(api);
      const { s, w, h } = svgIn(api.q('[data-role="e1"]'));
      const ah = markers(api, s);
      const HW = 236, xs = LANE.map((_, i) => HW / 2 + i * ((w - HW) / (LANE.length - 1)));
      const top = 0, HH = 58, y0 = top + HH + 44, dy = (h - y0 - 10) / (MSG.length - 0.4);
      LANE.forEach(([nm, k], i) => {
        const g = S('g', { 'data-seq': 0 }, s);
        S('line', { x1: xs[i], x2: xs[i], y1: top + HH, y2: h, class: 'ln dash', style: 'stroke:var(--line-2);stroke-width:2' }, g);
        S('rect', { x: xs[i] - HW / 2, y: top, width: HW, height: HH, rx: 14, class: `box ${k}` }, g);
        S('text', { x: xs[i], y: top + 38, 'text-anchor': 'middle', class: 'b', style: 'font-size:25px', text: nm }, g);
      });
      api.E = { rows: [] };
      MSG.forEach(([a, b, tx, k, back], i) => {
        const y = y0 + i * dy, g = S('g', { 'data-seq': i + 1 }, s), col = k === 'm' ? 'model' : k === 'c' ? 'code' : 'f';
        let pts;
        if (k === 'gate') {
          const d = 22; S('polygon', { points: `${xs[1]},${y - d} ${xs[1] + d},${y} ${xs[1]},${y + d} ${xs[1] - d},${y}`, class: 'f-warn', style: 'stroke:var(--bg);stroke-width:2' }, g);
          S('text', { x: xs[1] + 34, y: y + 8, class: 'b', text: tx }, g);
          S('line', { x1: xs[1] - d, x2: xs[0] + 8, y1: y, y2: y, class: 'ln warn dash', 'marker-end': ah('w') }, g);
          S('text', { x: (xs[0] + xs[1]) / 2, y: y - 12, 'text-anchor': 'middle', class: 't2', text: 'no: ask_user' }, g);
          pts = [[xs[1], y], [xs[1], y]];
        } else if (a === b) {
          const p = `M${xs[a]} ${y - 12} h70 v24 h-66`;
          S('path', { d: p, class: `ln ${col === 'f' ? '' : col}`, 'marker-end': ah(k) }, g);
          S('text', { x: xs[a] + 86, y: y + 8, class: 't2', text: tx }, g);
          pts = [[xs[a], y - 12], [xs[a] + 70, y - 12], [xs[a] + 70, y + 12], [xs[a] + 4, y + 12]];
        } else {
          const dir = Math.sign(xs[b] - xs[a]);
          S('line', { x1: xs[a], x2: xs[b] - dir * 6, y1: y, y2: y, class: `ln ${col === 'f' ? '' : col} ${a > b ? 'dash' : ''}`, 'marker-end': ah(k), 'marker-start': back ? ah(k) : '' }, g);
          S('text', { x: (xs[a] + xs[b]) / 2, y: y - 12, 'text-anchor': 'middle', class: 't2', text: tx }, g);
          pts = back ? [[xs[a], y], [xs[b], y], [xs[a], y]] : [[xs[a], y], [xs[b], y]];
        }
        const hl = S('rect', { x: 2, y: y - dy / 2, width: w - 4, height: dy, rx: 10, style: 'fill:var(--accent);opacity:0' }, s);
        s.insertBefore(hl, s.firstChild);
        api.E.rows.push({ pts, hl });
      });
      api.E.pk = S('circle', { cx: 0, cy: 0, r: 10, class: 'pkt', style: 'visibility:hidden' }, s);
    },
    play(api) {
      const end = seqIn(api, 200), E = api.E, STEP = 1300;
      api.raf((t) => {
        if (t < end) return;
        const tt = (t - end) % (STEP * (E.rows.length + 2)), k = Math.floor(tt / STEP), u = (tt % STEP) / STEP;
        E.rows.forEach((r, i) => r.hl.style.opacity = i === k ? '0.10' : '0');
        if (k >= E.rows.length) { put(E.pk, null); return; }
        const p = pointAt(E.rows[k].pts, smooth(Math.min(1, u * 1.3)));
        put(E.pk, p[0], p[1]);
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-montaje */
  Motor.fx('op-montaje', {
    render(api) { cancel(api); api.q('[data-role="track"]').style.setProperty('--p', '100%'); api.qa('.f6').forEach((f) => { f.style.transform = ''; }); },
    play(api) {
      const end = seqIn(api, 300), tr = api.q('[data-role="track"]'), cards = api.qa('.f6');
      api.raf((t) => {
        const cyc = t % 9000, p = clamp((cyc - 300) / 6000, 0, 1);
        tr.style.setProperty('--p', `${(t < end ? Math.min(1, t / end) : p) * 100}%`);
        const k = t < end ? -1 : Math.min(5, Math.floor(p * 6 - 0.0001));
        cards.forEach((c, i) => { c.style.transform = i === k && p < 1 ? 'translateY(-12px)' : ''; });
      });
    },
    stop(api) { cancel(api); api.qa('.f6').forEach((f) => { f.style.transform = ''; }); },
  });
})();
