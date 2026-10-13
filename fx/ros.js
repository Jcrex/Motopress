/* Efectos de robótica con ROS 2: grafo de nodos, LiDAR, mapa de ocupación con A*,
   árbol TF, plano técnico de la base y telemetría tipo osciloscopio. */
(() => {
  const { color } = Motor;
  const TAU = Math.PI * 2;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const svgIn = (host, w, h) => { host.querySelectorAll(':scope > svg').forEach((s) => s.remove()); return el('svg', { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet' }, host); };
  const fontAttr = (api, role, size, weight = 400) => `font-family:${api.tok('font-' + role)};font-size:${size}px;font-weight:${weight}`;

  /* =================================================================
     GRAFO DE NODOS Y TÓPICOS (estilo rqt_graph)
     ================================================================= */
  const RG = {
    W: 1120, H: 640,
    nodes: { camera_driver: [120, 92], yolo_detector: [585, 92], tracker: [1010, 92], lidar_driver: [120, 262], slam_toolbox: [585, 262], planner_server: [1000, 262], controller_server: [740, 440], base_driver: [210, 440] },
    topics: { '/image_raw': [350, 92, 30, 0], '/detections': [815, 92, 30, 0], '/tracks': [1010, 177, 15, 0], '/scan': [350, 262, 10, 1], '/map': [815, 262, 1, 1], '/plan': [1010, 440, 1, 2], '/cmd_vel': [480, 440, 20, 2], '/odom': [480, 572, 50, 2] },
    pubs: { '/image_raw': 'camera_driver', '/detections': 'yolo_detector', '/tracks': 'tracker', '/scan': 'lidar_driver', '/map': 'slam_toolbox', '/plan': 'planner_server', '/cmd_vel': 'controller_server', '/odom': 'base_driver' },
    subs: { '/image_raw': ['yolo_detector'], '/detections': ['tracker'], '/tracks': ['planner_server'], '/scan': ['slam_toolbox'], '/map': ['planner_server'], '/plan': ['controller_server'], '/cmd_vel': ['base_driver'], '/odom': ['controller_server'] },
  };
  function boxOf(name, isTopic, api) {
    const [x, y] = isTopic ? RG.topics[name] : RG.nodes[name];
    const cw = 12.4, w = name.length * cw + (isTopic ? 30 : 46);
    return { x, y, hw: w / 2, hh: isTopic ? 23 : 31, isTopic };
  }
  function edgePath(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const sx = a.x + Math.sign(dx) * a.hw, tx = b.x - Math.sign(dx) * b.hw, mx = (sx + tx) / 2;
      return `M${sx},${a.y} C${mx},${a.y} ${mx},${b.y} ${tx},${b.y}`;
    }
    const sy = a.y + Math.sign(dy) * a.hh, ty = b.y - Math.sign(dy) * b.hh, my = (sy + ty) / 2;
    return `M${a.x},${sy} C${a.x},${my} ${b.x},${my} ${b.x},${ty}`;
  }
  Motor.fx('rosgraph', {
    render(api) {
      const host = api.q('[data-role="graph"]');
      const svg = svgIn(host, RG.W, RG.H);
      const cats = api.cats(3), line = api.tok('line-2'), fg = api.tok('fg'), fg2 = api.tok('fg-2');
      const defs = el('defs', {}, svg);
      const mk = el('marker', { id: 'rg-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0,0 L10,5 L0,10 z', fill: line }, mk);
      const gE = el('g', {}, svg), gN = el('g', {}, svg), gD = el('g', {}, svg);
      api.edges = [];
      Object.keys(RG.topics).forEach((t) => {
        const T = boxOf(t, true), P = boxOf(RG.pubs[t], false);
        const chain = RG.topics[t][3];
        const pe = el('path', { d: edgePath(P, T), fill: 'none', stroke: line, 'stroke-width': 2.2, 'marker-end': 'url(#rg-arrow)' }, gE);
        const subs = RG.subs[t].map((s) => el('path', { d: edgePath(T, boxOf(s, false)), fill: 'none', stroke: line, 'stroke-width': 2.2, 'marker-end': 'url(#rg-arrow)' }, gE));
        api.edges.push({ t, hz: RG.topics[t][2], pub: pe, subs, col: cats[chain] });
      });
      Object.keys(RG.nodes).forEach((n) => {
        const b = boxOf(n, false);
        el('ellipse', { cx: b.x, cy: b.y, rx: b.hw, ry: b.hh, fill: api.tok('bg-3'), stroke: api.tok('accent'), 'stroke-width': 2.5 }, gN);
        const tx = el('text', { x: b.x, y: b.y, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: fg, style: fontAttr(api, 'mono', 20, 500) }, gN); tx.textContent = n;
      });
      Object.keys(RG.topics).forEach((t) => {
        const b = boxOf(t, true), hz = RG.topics[t][2];
        el('rect', { x: b.x - b.hw, y: b.y - b.hh, width: b.hw * 2, height: b.hh * 2, rx: Math.min(6, parseFloat(api.tok('radius')) / 2), fill: api.tok('bg-2'), stroke: fg2, 'stroke-width': 2 }, gN);
        const tx = el('text', { x: b.x, y: b.y, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: fg, style: fontAttr(api, 'mono', 20, 500) }, gN); tx.textContent = t;
        const hzT = el('text', { x: b.x + b.hw + 8, y: b.y - b.hh + 2, fill: api.tok('fg-3'), style: fontAttr(api, 'mono', 17, 500), 'dominant-baseline': 'hanging' }, gN); hzT.textContent = hz + ' Hz';
      });
      // mensajes en reposo: uno en mitad de cada publicación
      api.dots = gD;
      api.edges.forEach((e) => { const L = e.pub.getTotalLength(), p = e.pub.getPointAtLength(L * 0.5); el('circle', { cx: p.x, cy: p.y, r: 6.5, fill: e.col, class: 'rest' }, gD); });
    },
    play(api) {
      api.dots.querySelectorAll('.rest').forEach((c) => c.remove());
      const live = [];
      const spawn = (path, col, then) => { live.push({ path, L: path.getTotalLength(), t: 0, col, c: el('circle', { r: 6.5, fill: col }, api.dots), then }); };
      const next = api.edges.map((e) => 0);
      api.raf((t, dt) => {
        api.edges.forEach((e, i) => {
          if (t >= next[i]) { next[i] = t + Math.max(260, (1000 / e.hz) * 9); spawn(e.pub, e.col, () => e.subs.forEach((s) => spawn(s, e.col))); }
        });
        for (let i = live.length - 1; i >= 0; i--) {
          const d = live[i]; d.t += dt / 900;
          if (d.t >= 1) { d.c.remove(); live.splice(i, 1); d.then && d.then(); continue; }
          const p = d.path.getPointAtLength(d.L * d.t); d.c.setAttribute('cx', p.x); d.c.setAttribute('cy', p.y);
        }
      });
    },
    stop(api) { api.dots && api.dots.replaceChildren(); },
  });

  /* =================================================================
     LiDAR 2D: lanzamiento de rayos contra una habitación simulada
     ================================================================= */
  const ROOM = {
    walls: [[-5, -3], [6, -3], [6, 1.5], [2.5, 1.5], [2.5, 3.6], [-5, 3.6]],
    circles: [[3.2, -1.2, 0.5], [-3.6, -1.8, 0.35], [1.35, 2.6, 0.12], [1.7, 2.68, 0.12], [-1.2, -2.2, 0.28]],
    boxes: [[-2.6, 1.1, -1.6, 2.1], [4.2, -2.4, 5.2, -1.9]],
  };
  function segs() {
    const s = [], w = ROOM.walls;
    w.forEach((p, i) => s.push([p, w[(i + 1) % w.length]]));
    ROOM.boxes.forEach(([x0, y0, x1, y1]) => { const c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; c.forEach((p, i) => s.push([p, c[(i + 1) % 4]])); });
    return s;
  }
  function castScan(n = 720, rmax = 12, seed = 4) {
    const S = segs(), R = Motor.util.rng(seed), out = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI + (i / n) * TAU, dx = Math.cos(a), dy = Math.sin(a);
      let best = rmax;
      S.forEach(([[x1, y1], [x2, y2]]) => {
        const ex = x2 - x1, ey = y2 - y1, den = dx * ey - dy * ex; if (Math.abs(den) < 1e-9) return;
        const t = (x1 * ey - y1 * ex) / den, u = (x1 * dy - y1 * dx) / den;
        if (t > 0.05 && u >= 0 && u <= 1 && t < best) best = t;
      });
      ROOM.circles.forEach(([cx, cy, r]) => {
        const b = dx * cx + dy * cy, c = cx * cx + cy * cy - r * r, disc = b * b - c;
        if (disc >= 0) { const t = b - Math.sqrt(disc); if (t > 0.05 && t < best) best = t; }
      });
      out.push({ a, r: best >= rmax ? Infinity : best + (R() - 0.5) * 0.03 });
    }
    return out;
  }
  Motor.fx('lidar', {
    render(api) {
      const host = api.q('[data-role="scan"]');
      const c = api.canvas(host);
      const scan = castScan();
      const valid = scan.filter((p) => isFinite(p.r));
      const mean = valid.reduce((s, p) => s + p.r, 0) / valid.length;
      api.L = { ...c, scan, k: Math.min(c.w / 11.6, c.h / 7.2), ox: c.w * 0.45, oy: c.h * 0.52 };
      drawLidar(api, null, 0);
      api.q('[data-role="readout"]').innerHTML = [
        ['angle_min', '−3.1416 rad'], ['angle_max', '3.1416 rad'], ['angle_increment', '0.0087 rad'], ['range_min', '0.12 m'], ['range_max', '12.0 m'],
        ['lecturas válidas', `${valid.length} / ${scan.length}`], ['distancia media', mean.toFixed(2) + ' m'], ['más cercana', Math.min(...valid.map((p) => p.r)).toFixed(2) + ' m'],
      ].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
      api.q('[data-role="ramp"]').innerHTML = `<p class="label">Color por distancia</p><div class="bar" style="background:linear-gradient(90deg,${Array.from({ length: 7 }, (_, i) => `var(--seq-${i + 1})`).join(',')})"></div><div class="ticks"><span>0 m</span><span>2</span><span>4</span><span>6</span><span>8 m</span></div>`;
    },
    play(api) {
      const per = 2600;
      api.raf((t) => { drawLidar(api, ((t % per) / per) * TAU - Math.PI, t); });
    },
  });
  function drawLidar(api, sweep, t) {
    const { ctx, w, h, k, ox, oy, scan } = api.L;
    ctx.clearRect(0, 0, w, h);
    const X = (x) => ox + x * k, Y = (y) => oy - y * k;
    const line = api.tok('line'), fg3 = api.tok('fg-3'), fg2 = api.tok('fg-2'), fg = api.tok('fg');
    ctx.lineWidth = 1; ctx.strokeStyle = line; ctx.font = api.font('mono', 17, 500); ctx.fillStyle = fg3; ctx.textAlign = 'left';
    for (let r = 1; r <= 7; r++) { ctx.beginPath(); ctx.arc(ox, oy, r * k, 0, TAU); ctx.stroke(); if (r % 2 === 0) ctx.fillText(r + ' m', ox + r * k * 0.707 + 4, oy - r * k * 0.707 - 4); }
    ctx.setLineDash(api.tok('grid-dash').split(' ').map(Number).filter((v) => v > 0));
    for (let a = 0; a < 8; a++) { const ang = (a * Math.PI) / 4; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(ang) * 7.4 * k, oy - Math.sin(ang) * 7.4 * k); ctx.stroke(); }
    ctx.setLineDash([6, 8]); ctx.strokeStyle = color.alpha(fg2, 0.45); ctx.lineWidth = 1.5;
    ctx.beginPath(); ROOM.walls.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
    if (sweep !== null) {
      const sa = -sweep;
      if (ctx.createConicGradient) {
        const g = ctx.createConicGradient(sa - 0.9, ox, oy);
        g.addColorStop(0, color.alpha(api.tok('accent'), 0)); g.addColorStop(0.143, color.alpha(api.tok('accent'), api.dark ? 0.3 : 0.22)); g.addColorStop(0.1431, color.alpha(api.tok('accent'), 0)); g.addColorStop(1, color.alpha(api.tok('accent'), 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, 7.4 * k, sa - 0.9, sa); ctx.closePath(); ctx.fill();
      }
    }
    scan.forEach((p) => {
      if (!isFinite(p.r)) return;
      let alpha = 1;
      if (sweep !== null) { let age = (sweep - p.a) % TAU; if (age < 0) age += TAU; alpha = 0.25 + 0.75 * Math.exp(-age * 0.9); }
      ctx.fillStyle = color.alpha(api.seq(Math.min(1, p.r / 8) * 0.8 + 0.2), alpha);
      ctx.beginPath(); ctx.arc(X(Math.cos(p.a) * p.r), Y(Math.sin(p.a) * p.r), 3.6, 0, TAU); ctx.fill();
    });
    ctx.fillStyle = api.tok('bg-3'); ctx.strokeStyle = fg; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(ox, oy, 0.26 * k, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = api.tok('x'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + 0.5 * k, oy); ctx.stroke();
    ctx.strokeStyle = api.tok('y'); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - 0.5 * k); ctx.stroke();
    ctx.fillStyle = fg2; ctx.font = api.font('mono', 18, 500); ctx.fillText('base_laser', ox + 0.32 * k, oy + 0.42 * k);
    void t;
  }

  /* =================================================================
     MAPA DE OCUPACIÓN + A*
     ================================================================= */
  function buildMap(cols, rows, seed) {
    const R = Motor.util.rng(seed), m = new Int8Array(cols * rows).fill(0);
    const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < cols && y < rows) m[y * cols + x] = v; };
    for (let x = 0; x < cols; x++) { set(x, 0, 100); set(x, rows - 1, 100); }
    for (let y = 0; y < rows; y++) { set(0, y, 100); set(cols - 1, y, 100); }
    for (let y = 0; y < rows; y++) if (y < 9 || y > 13) set(24, y, 100);
    for (let y = 0; y < rows; y++) if (y < 25 || y > 29) set(48, y, 100);
    for (let x = 0; x < 24; x++) if (x < 8 || x > 12) set(x, 20, 100);
    for (let x = 48; x < cols; x++) if (x < 57 || x > 61) set(x, 14, 100);
    const boxes = [[5, 4, 6, 3], [14, 26, 5, 4], [31, 4, 4, 6], [36, 20, 6, 3], [30, 31, 3, 3], [55, 22, 6, 4], [63, 30, 4, 5], [40, 10, 2, 2]];
    boxes.forEach(([x, y, w, h]) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, 100); });
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const d = Math.hypot((x - 76) * 1.1, y + 6); if (d < 13 + R() * 2.5) set(x, y, -1); }
    for (let y = rows - 7; y < rows; y++) for (let x = 0; x < 7; x++) if (Math.hypot(x, rows - y) < 6 + R()) set(x, y, -1);
    const inf = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (m[y * cols + x] === 100) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = x + i, Y = y + j; if (X >= 0 && Y >= 0 && X < cols && Y < rows && m[Y * cols + X] === 0) inf[Y * cols + X] = 1; }
    return { m, inf };
  }
  function astar(map, cols, rows, s, g) {
    const N = cols * rows, gs = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N), order = [];
    const h = (i) => { const dx = Math.abs((i % cols) - g[0]), dy = Math.abs(Math.floor(i / cols) - g[1]); return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy); };
    const start = s[1] * cols + s[0], goal = g[1] * cols + g[0];
    const open = [[h(start), start]]; gs[start] = 0;
    const ok = (i) => map.m[i] === 0 && !map.inf[i];
    while (open.length) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
      const [, cur] = open.splice(bi, 1)[0];
      if (closed[cur]) continue; closed[cur] = 1; order.push(cur);
      if (cur === goal) break;
      const cx = cur % cols, cy = Math.floor(cur / cols);
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        if (!i && !j) continue; const x = cx + i, y = cy + j; if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        const n = y * cols + x; if (!ok(n) || closed[n]) continue;
        if (i && j && (!ok(cy * cols + x) || !ok(y * cols + cx))) continue;
        const ng = gs[cur] + (i && j ? Math.SQRT2 : 1);
        if (ng < gs[n]) { gs[n] = ng; came[n] = cur; open.push([ng + h(n), n]); }
      }
    }
    const path = []; for (let c = goal; c !== -1; c = came[c]) path.unshift(c);
    return { order, path: path[0] === start ? path : [], gs };
  }
  Motor.fx('astar', {
    render(api) {
      const host = api.q('[data-role="map"]');
      const c = api.canvas(host);
      const cols = 72, rows = 40, cell = Math.floor(Math.min(c.w / cols, c.h / rows));
      const map = buildMap(cols, rows, 21);
      const S = [6, 30], G = [60, 5];
      const res = astar(map, cols, rows, S, G);
      api.A = { ...c, cols, rows, cell, map, S, G, res, ox: Math.round((c.w - cols * cell) / 2), oy: Math.round((c.h - rows * cell) / 2) };
      drawMap(api, res.order.length, 1, 1);
      const len = res.path.reduce((s, cur, i, a) => { if (!i) return 0; const dx = (cur % cols) - (a[i - 1] % cols), dy = Math.floor(cur / cols) - Math.floor(a[i - 1] / cols); return s + Math.hypot(dx, dy); }, 0);
      api.q('[data-role="stats"]').innerHTML = [['resolución', '0.10 m/celda'], ['tamaño', `${cols} × ${rows} celdas`], ['celdas expandidas', res.order.length.toLocaleString('es-ES')], ['longitud de la ruta', (len * 0.1).toFixed(2) + ' m'], ['puntos de la ruta', res.path.length]].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
      api.q('[data-role="legend"]').innerHTML = [
        ['var(--bg)', 'Libre · 0', true], ['var(--fg-2)', 'Ocupado · 100'], ['var(--bg-3)', 'Desconocido · −1', true], [color.alpha(api.tok('accent-3'), 0.45), 'Inflado (costmap)'], [api.seq(0.55), 'Explorado por A*'], ['var(--accent)', 'Ruta'],
      ].map(([c2, t, border]) => `<li><i style="--c:${c2};${border ? 'outline:1.5px solid var(--line-2)' : ''}"></i>${t}</li>`).join('');
    },
    play(api) {
      const n = api.A.res.order.length, T1 = 2400, T2 = 1100, T3 = 2600;
      api.raf((t) => {
        const p1 = Math.min(1, t / T1), p2 = Math.min(1, Math.max(0, (t - T1) / T2)), p3 = Math.max(0, (t - T1 - T2) / T3);
        drawMap(api, Math.floor(n * p1), p2, p3 > 0 ? (p3 % 1.4) / 1 : -1);
      });
    },
  });
  function drawMap(api, shown, pathP, robotP) {
    const { ctx, w, h, cols, rows, cell, map, res, ox, oy, S, G } = api.A;
    ctx.clearRect(0, 0, w, h);
    const free = api.tok('bg'), occ = api.tok('fg-2'), unk = api.tok('bg-3'), inf = color.alpha(api.tok('accent-3'), 0.45);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const i = y * cols + x, v = map.m[i];
      ctx.fillStyle = v === 100 ? occ : v === -1 ? unk : map.inf[i] ? inf : free;
      ctx.fillRect(ox + x * cell, oy + y * cell, cell, cell);
    }
    const maxg = res.gs[res.path[res.path.length - 1]] || 1;
    for (let k = 0; k < shown; k++) { const i = res.order[k]; ctx.fillStyle = color.alpha(api.seq(0.25 + 0.75 * Math.min(1, res.gs[i] / maxg)), 0.75); ctx.fillRect(ox + (i % cols) * cell + 1, oy + Math.floor(i / cols) * cell + 1, cell - 2, cell - 2); }
    ctx.strokeStyle = color.alpha(api.tok('line'), 0.5); ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x += 8) { ctx.beginPath(); ctx.moveTo(ox + x * cell, oy); ctx.lineTo(ox + x * cell, oy + rows * cell); ctx.stroke(); }
    for (let y = 0; y <= rows; y += 8) { ctx.beginPath(); ctx.moveTo(ox, oy + y * cell); ctx.lineTo(ox + cols * cell, oy + y * cell); ctx.stroke(); }
    const P = (i) => [ox + (i % cols) * cell + cell / 2, oy + Math.floor(i / cols) * cell + cell / 2];
    if (pathP > 0 && res.path.length) {
      const upto = Math.max(1, Math.floor(res.path.length * pathP));
      ctx.strokeStyle = api.tok('accent'); ctx.lineWidth = Math.max(4, cell * 0.42); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); res.path.slice(0, upto).forEach((i, k) => { const [x, y] = P(i); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    }
    const mark = (pt, col, label) => { const [x, y] = [ox + pt[0] * cell + cell / 2, oy + pt[1] * cell + cell / 2]; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, cell * 0.9, 0, TAU); ctx.fill(); ctx.strokeStyle = api.tok('bg'); ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = api.tok('fg'); ctx.font = api.font('mono', 20, 600); ctx.textAlign = 'left'; ctx.fillText(label, x + cell * 1.3, y + 6); };
    mark(S, api.tok('ok'), 'inicio'); mark(G, api.tok('err'), 'meta');
    if (robotP >= 0 && robotP <= 1 && res.path.length) {
      const f = robotP * (res.path.length - 1), i0 = Math.floor(f), i1 = Math.min(res.path.length - 1, i0 + 1), [x0, y0] = P(res.path[i0]), [x1, y1] = P(res.path[i1]), u = f - i0;
      const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, a = Math.atan2(y1 - y0, x1 - x0);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = api.tok('bg-3'); ctx.strokeStyle = api.tok('fg'); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, cell * 1.1, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = api.tok('x'); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cell * 1.6, 0); ctx.stroke(); ctx.restore();
    }
  }

  /* =================================================================
     ÁRBOL TF
     ================================================================= */
  const TFN = [
    ['map', 210, 52], ['odom', 210, 158], ['base_footprint', 210, 264], ['base_link', 210, 370],
    ['laser_link', 640, 170], ['imu_link', 640, 270], ['camera_link', 640, 370], ['wheel_left_link', 640, 470], ['wheel_right_link', 640, 570], ['camera_optical_frame', 960, 370],
  ];
  const TFE = [['map', 'odom', 'SLAM · dinámica', 1], ['odom', 'base_footprint', 'odometría · dinámica', 1], ['base_footprint', 'base_link', 'estática'], ['base_link', 'laser_link'], ['base_link', 'imu_link'], ['base_link', 'camera_link'], ['base_link', 'wheel_left_link', null, 1], ['base_link', 'wheel_right_link', null, 1], ['camera_link', 'camera_optical_frame']];
  Motor.fx('tftree', {
    render(api) {
      const host = api.q('[data-role="tree"]');
      const W = 1110, H = 630, svg = svgIn(host, W, H);
      const pos = Object.fromEntries(TFN.map(([n, x, y]) => [n, { x, y, w: n.length * 12 + 64 }]));
      const gE = el('g', {}, svg), gN = el('g', {}, svg);
      api.links = [];
      TFE.forEach(([a, b, lab, dyn]) => {
        const A = pos[a], B = pos[b]; let d;
        if (Math.abs(A.x - B.x) < 5) d = `M${A.x},${A.y + 24} L${B.x},${B.y - 24}`;
        else { const sx = A.x + A.w / 2, tx = B.x - B.w / 2, mx = (sx + tx) / 2; d = `M${sx},${A.y} C${mx},${A.y} ${mx},${B.y} ${tx},${B.y}`; }
        const p = el('path', { d, fill: 'none', stroke: dyn ? api.tok('accent') : api.tok('line-2'), 'stroke-width': dyn ? 3 : 2, 'stroke-dasharray': dyn ? '10 8' : 'none' }, gE);
        api.links.push({ p, dyn });
        if (lab) { const t = el('text', { x: A.x + 22, y: (A.y + B.y) / 2, fill: api.tok('fg-2'), style: fontAttr(api, 'mono', 19, 500), 'dominant-baseline': 'central' }, gE); t.textContent = lab; }
      });
      TFN.forEach(([name], i) => {
        const P = pos[name], w = P.w;
        const g = el('g', { transform: `translate(${P.x},${P.y})`, class: 'tfn' }, gN);
        const root = i === 0;
        el('rect', { x: -w / 2, y: -24, width: w, height: 48, rx: Math.min(24, parseFloat(api.tok('radius')) + 4), fill: root ? api.tok('accent') : api.tok('bg-3'), stroke: root ? 'none' : api.tok('line-2'), 'stroke-width': 2 }, g);
        const ax = -w / 2 + 22, ay = 9;
        el('line', { x1: ax, y1: ay, x2: ax + 16, y2: ay, stroke: api.tok('x'), 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
        el('line', { x1: ax, y1: ay, x2: ax, y2: ay - 16, stroke: api.tok('y'), 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
        el('circle', { cx: ax, cy: ay, r: 4, fill: api.tok('z') }, g);
        const t = el('text', { x: -w / 2 + 44, y: 1, fill: root ? api.tok('on-accent') : api.tok('fg'), style: fontAttr(api, 'mono', 20, 500), 'dominant-baseline': 'central' }, g); t.textContent = name;
      });
    },
    play(api) {
      api.raf((t) => { api.links.forEach((l) => { if (l.dyn) l.p.setAttribute('stroke-dashoffset', String(-t / 40)); }); });
      if (window.gsap) gsap.fromTo(api.qa('.tfn'), { opacity: 0.1 }, { opacity: 1, duration: api.dur / 1000, stagger: 0.07, ease: 'power2.out' });
    },
  });

  /* =================================================================
     PLANO TÉCNICO DE LA BASE MÓVIL
     ================================================================= */
  Motor.fx('blueprint', {
    render(api) {
      const host = api.q('[data-role="drawing"]');
      const W = 1664, H = 640, svg = svgIn(host, W, H);
      const fg = api.tok('fg'), fg2 = api.tok('fg-2'), fg3 = api.tok('fg-3'), acc = api.tok('accent'), red = api.tok('accent-3');
      const s = 1.05; // px por mm
      const defs = el('defs', {}, svg);
      const mk = (id, col) => { const m = el('marker', { id, viewBox: '0 0 12 12', refX: 11, refY: 6, markerWidth: 12, markerHeight: 12, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' }, defs); el('path', { d: 'M0,2 L12,6 L0,10 z', fill: col }, m); };
      mk('bp-a', acc);
      const draw = el('g', { class: 'bp-draw' }, svg), dims = el('g', { class: 'bp-dims' }, svg);
      const P = (d, st = {}) => el('path', { d, fill: 'none', stroke: fg, 'stroke-width': 2.2, 'stroke-linejoin': 'round', ...st }, draw);
      const T = (x, y, txt, st = {}, parent = dims) => { const t = el('text', { x, y, fill: acc, style: fontAttr(api, 'mono', 21, 500), 'text-anchor': 'middle', ...st }, parent); t.textContent = txt; return t; };
      const dimH = (x1, x2, y, label, yref) => { el('line', { x1, y1: yref, x2: x1, y2: y - 10, stroke: fg3, 'stroke-width': 1.2 }, dims); el('line', { x1: x2, y1: yref, x2, y2: y - 10, stroke: fg3, 'stroke-width': 1.2 }, dims); el('line', { x1: x1 + 1, y1: y, x2: x2 - 1, y2: y, stroke: acc, 'stroke-width': 1.6, 'marker-start': 'url(#bp-a)', 'marker-end': 'url(#bp-a)' }, dims); T((x1 + x2) / 2, y - 10, label); };
      const dimV = (y1, y2, x, label, xref) => { el('line', { x1: xref, y1, x2: x + 10, y2: y1, stroke: fg3, 'stroke-width': 1.2 }, dims); el('line', { x1: xref, y1: y2, x2: x + 10, y2, stroke: fg3, 'stroke-width': 1.2 }, dims); el('line', { x1: x, y1: y1 + 1, x2: x, y2: y2 - 1, stroke: acc, 'stroke-width': 1.6, 'marker-start': 'url(#bp-a)', 'marker-end': 'url(#bp-a)' }, dims); const t = T(x - 12, (y1 + y2) / 2, label); t.setAttribute('transform', `rotate(-90 ${x - 12} ${(y1 + y2) / 2})`); };

      // ---- vista superior (planta) ----
      const cx = 530, cy = 330, L = 420 * s, Wd = 360 * s;
      const x0 = cx - L / 2, y0 = cy - Wd / 2;
      P(`M${x0 + 38},${y0} H${x0 + L - 38} Q${x0 + L},${y0} ${x0 + L},${y0 + 38} V${y0 + Wd - 38} Q${x0 + L},${y0 + Wd} ${x0 + L - 38},${y0 + Wd} H${x0 + 38} Q${x0},${y0 + Wd} ${x0},${y0 + Wd - 38} V${y0 + 38} Q${x0},${y0} ${x0 + 38},${y0} Z`);
      const ww = 140 * s, wt = 40 * s;
      [[y0 - wt + 6], [y0 + Wd - 6]].forEach(([wy]) => P(`M${cx - ww / 2},${wy} h${ww} v${wt} h${-ww} Z`, { 'stroke-width': 2.4 }));
      P(`M${x0 + 20},${y0 + 60} h${150 * s} v${Wd - 120} h${-150 * s} Z`, { stroke: fg3, 'stroke-dasharray': '10 7', 'stroke-width': 1.6 });
      T(x0 + 20 + (150 * s) / 2, cy + 7, 'batería', { fill: fg3 }, draw);
      P(`M${cx},${y0 - 70} V${y0 + Wd + 70}`, { stroke: fg3, 'stroke-dasharray': '26 6 4 6', 'stroke-width': 1.3 });
      P(`M${x0 - 40},${cy} H${x0 + L + 70}`, { stroke: fg3, 'stroke-dasharray': '26 6 4 6', 'stroke-width': 1.3 });
      el('circle', { cx: x0 + L - 70 * s, cy, r: 35 * s, fill: 'none', stroke: fg, 'stroke-width': 2.4 }, draw);
      el('circle', { cx: x0 + L - 70 * s, cy, r: 9, fill: 'none', stroke: fg, 'stroke-width': 2 }, draw);
      el('circle', { cx: x0 + 40 * s, cy, r: 25 * s, fill: 'none', stroke: fg, 'stroke-width': 2.2 }, draw);
      P(`M${x0 + L - 14},${cy - 34} h14 v68 h-14 Z`);
      const ax = cx + 40, ay = cy + 120;
      el('line', { x1: ax, y1: ay, x2: ax + 70, y2: ay, stroke: api.tok('x'), 'stroke-width': 4, 'marker-end': 'url(#bp-a)' }, draw);
      el('line', { x1: ax, y1: ay, x2: ax, y2: ay - 70, stroke: api.tok('y'), 'stroke-width': 4 }, draw);
      T(ax + 84, ay + 7, 'x', { fill: api.tok('x'), 'text-anchor': 'start' }, draw); T(ax + 10, ay - 76, 'y', { fill: api.tok('y'), 'text-anchor': 'start' }, draw);
      dimH(x0, x0 + L, y0 - 74, '420', y0 - 40);
      dimV(y0, y0 + Wd, x0 - 60, '360', x0 - 6);
      dimH(cx - ww / 2, cx + ww / 2, y0 + Wd + 70, 'Ø 140', y0 + Wd + 36);
      const lx = x0 + L - 70 * s, ld = el('path', { d: `M${lx + 24},${cy - 24} L${lx + 80},${cy - 110} H${lx + 170}`, fill: 'none', stroke: acc, 'stroke-width': 1.6 }, dims); void ld;
      T(lx + 128, cy - 120, 'LiDAR Ø 70');
      T(cx, y0 + Wd + 112, 'PLANTA', { fill: fg2, style: fontAttr(api, 'mono', 20, 600) }, dims);

      // ---- alzado lateral ----
      const ex = 1250, gy = 520, eL = 420 * s, eH = 120 * s, wr = 70 * s;
      P(`M${ex - 300},${gy} H${ex + 300}`, { stroke: fg2, 'stroke-width': 2 });
      for (let i = 0; i < 24; i++) P(`M${ex - 290 + i * 25},${gy} l-14,16`, { stroke: fg3, 'stroke-width': 1.2 });
      const by = gy - wr - 20;
      P(`M${ex - eL / 2},${by - eH / 2} h${eL} v${eH} h${-eL} Z`);
      el('circle', { cx: ex, cy: gy - wr, r: wr, fill: 'none', stroke: fg, 'stroke-width': 2.4 }, draw);
      el('circle', { cx: ex, cy: gy - wr, r: 8, fill: 'none', stroke: fg, 'stroke-width': 2 }, draw);
      el('circle', { cx: ex - eL / 2 + 40 * s, cy: gy - 25 * s, r: 25 * s, fill: 'none', stroke: fg, 'stroke-width': 2.2 }, draw);
      const lidx = ex + eL / 2 - 70 * s;
      P(`M${lidx - 35 * s},${by - eH / 2} v${-50 * s} h${70 * s} v${50 * s}`);
      P(`M${lidx - 35 * s},${by - eH / 2 - 20 * s} h${70 * s}`, { stroke: fg3, 'stroke-dasharray': '6 5', 'stroke-width': 1.4 });
      P(`M${ex + eL / 2},${by - 22} h14 v44 h-14`);
      dimH(ex - eL / 2, ex + eL / 2, by - eH / 2 - 108, '420', by - eH / 2 - 8);
      dimV(by - eH / 2 - 50 * s, gy, ex + eL / 2 + 80, '262', ex + eL / 2 + 22);
      T(ex, gy + 70, 'ALZADO LATERAL', { fill: fg2, style: fontAttr(api, 'mono', 20, 600) }, dims);

      // ---- nube de revisión ----
      const rx = x0 - 150, ry = cy + 96; let d = '';
      for (let i = 0; i < 12; i++) { const a0 = (i / 12) * TAU, a1 = ((i + 1) / 12) * TAU, p0 = [rx + Math.cos(a0) * 86, ry + Math.sin(a0) * 40], p1 = [rx + Math.cos(a1) * 86, ry + Math.sin(a1) * 40]; d += (i ? '' : `M${p0[0]},${p0[1]} `) + `A16,16 0 0 1 ${p1[0]},${p1[1]} `; }
      el('path', { d, fill: 'none', stroke: red, 'stroke-width': 2.4, class: 'bp-red' }, svg);
      ['revisar', 'holgura'].forEach((w2, i) => { const t = el('text', { x: rx, y: ry - 6 + i * 26, fill: red, style: fontAttr(api, 'mono', 21, 600), 'text-anchor': 'middle', class: 'bp-red' }, svg); t.textContent = w2; });
      el('line', { x1: rx + 70, y1: ry - 28, x2: x0 + 40 * s - 24, y2: cy + 8, stroke: red, 'stroke-width': 1.6, class: 'bp-red' }, svg);
      const nt = el('text', { x: W - 8, y: H - 8, fill: fg3, style: fontAttr(api, 'mono', 19, 400), 'text-anchor': 'end' }, svg); nt.textContent = 'Medidas de ejemplo en milímetros';
    },
    play(api) {
      if (!window.gsap) return;
      const paths = api.qa('.bp-draw path, .bp-draw circle');
      paths.forEach((p) => { const L = p.getTotalLength ? p.getTotalLength() : 400; p.style.strokeDasharray = p.getAttribute('stroke-dasharray') && p.getAttribute('stroke-dasharray') !== 'none' ? '' : L; });
      const solid = paths.filter((p) => !p.getAttribute('stroke-dasharray'));
      solid.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      const k = api.dur / 900;
      gsap.to(solid, { strokeDashoffset: 0, duration: 0.9 * k, stagger: 0.07 * k, ease: 'none', onComplete: () => solid.forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }) });
      gsap.fromTo(api.qa('.bp-dims > *'), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.02, delay: 1.4 * k });
      gsap.fromTo(api.qa('.bp-red'), { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 2.4 * k });
    },
    stop(api) { if (window.gsap) gsap.killTweensOf(api.qa('.bp-draw path, .bp-draw circle, .bp-dims > *, .bp-red')); },
  });

  /* =================================================================
     TELEMETRÍA: osciloscopio de 3 canales (IMU)
     ================================================================= */
  function imu(t, n) {
    const burst = Math.max(0, Math.sin(t * 0.55)) ** 6 * 2.6 - Math.max(0, Math.sin(t * 0.55 + 2.4)) ** 8 * 2.2;
    return [
      0.35 * Math.sin(t * 2.2) + burst + n(t * 9, 1.3) * 0.35,
      0.6 * Math.sin(t * 1.3 + 1) * Math.sin(t * 0.21) + n(t * 11, 7.1) * 0.3,
      9.81 + 0.28 * Math.sin(t * 44) * (0.6 + 0.4 * Math.sin(t * 0.7)) + n(t * 13, 3.7) * 0.18,
    ];
  }
  Motor.fx('scope', {
    render(api) {
      const host = api.q('[data-role="scope"]');
      const c = api.canvas(host);
      api.O = { ...c, n: api.noise2(17), t0: 30 };
      api.q('[data-role="side"]').innerHTML = `
        <div class="panel stack" data-role="ro"></div>
        <dl class="readout"><dt>base de tiempos</dt><dd>1 s/div</dd><dt>vertical</dt><dd>2 m/s²/div</dd><dt>ventana</dt><dd>10 s</dd></dl>
        <p class="note">Señales sintéticas de un IMU: aceleración en x, y, z. Las lecturas se calculan sobre la ventana visible.</p>`;
      drawScope(api, api.O.t0);
    },
    play(api) {
      let acc = 0;
      api.raf((t, dt) => { acc += dt; const now = api.O.t0 + t / 1000; drawScope(api, now, acc > 250); if (acc > 250) acc = 0; });
    },
  });
  function drawScope(api, tNow, updateRO = true) {
    const { ctx, w, h, n } = api.O;
    ctx.clearRect(0, 0, w, h);
    const gx = 10, gy = 8, cw = w / gx, ch = h / gy;
    ctx.fillStyle = color.alpha(api.tok('bg-2'), api.dark ? 0.85 : 0.6); ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = api.tok('line'); ctx.lineWidth = 1;
    for (let i = 0; i <= gx; i++) { ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, h); ctx.stroke(); }
    for (let j = 0; j <= gy; j++) { ctx.beginPath(); ctx.moveTo(0, j * ch); ctx.lineTo(w, j * ch); ctx.stroke(); }
    ctx.strokeStyle = api.tok('line-2');
    for (let i = 0; i < gx * 5; i++) { ctx.beginPath(); ctx.moveTo((i * cw) / 5, h / 2 - 6); ctx.lineTo((i * cw) / 5, h / 2 + 6); ctx.stroke(); }
    for (let j = 0; j < gy * 5; j++) { ctx.beginPath(); ctx.moveTo(w / 2 - 6, (j * ch) / 5); ctx.lineTo(w / 2 + 6, (j * ch) / 5); ctx.stroke(); }
    const offs = [2, 0, -2], cols = [api.tok('x'), api.tok('y'), api.tok('z')], names = ['ax', 'ay', 'az'];
    const N = 600, buf = [[], [], []];
    for (let k = 0; k <= N; k++) { const t = tNow - 10 + (k / N) * 10, v = imu(t, n); buf[0].push(v[0]); buf[1].push(v[1]); buf[2].push(v[2]); }
    ctx.lineWidth = +api.tok('mark-w') || 2.5;
    buf.forEach((b, c) => {
      ctx.strokeStyle = cols[c]; if (api.dark) { ctx.shadowColor = cols[c]; ctx.shadowBlur = 10; }
      ctx.beginPath();
      b.forEach((v, k) => { const val = c === 2 ? v - 9.81 : v; const x = (k / N) * w, y = h / 2 - ((val / 2) + offs[c]) * ch; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = cols[c]; ctx.font = api.font('mono', 20, 700); ctx.textAlign = 'left';
      ctx.fillText(`CH${c + 1} ${names[c]}`, 12, h / 2 - offs[c] * ch - 12);
    });
    if (!updateRO) return;
    const ro = api.q('[data-role="ro"]'); if (!ro) return;
    ro.innerHTML = buf.map((b, c) => {
      const cur = b[b.length - 1], mean = b.reduce((s, v) => s + v, 0) / b.length, rms = Math.sqrt(b.reduce((s, v) => s + (v - mean) ** 2, 0) / b.length), pp = Math.max(...b) - Math.min(...b);
      return `<div style="display:grid;grid-template-columns:auto 1fr;gap:4px 16px;align-items:baseline"><span class="label" style="color:${cols[c]};font-weight:700">CH${c + 1} ${names[c]}</span><span class="value" style="font-size:40px;text-align:right">${cur.toFixed(2)}<small style="font:400 20px var(--font-mono);color:var(--fg-2)"> m/s²</small></span><span class="note">pico a pico ${pp.toFixed(2)}</span><span class="note" style="text-align:right">desv. ${rms.toFixed(2)}</span></div>`;
    }).join('');
  }
})();
