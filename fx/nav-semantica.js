/* Piezas del deck «Estado del arte · navegación semántica».
   - .hilo[data-on="6,7,8"]: hilo conductor con las nueve etapas de la cadena instrucción → pose → trayectoria;
     enciende las etapas que cubre la familia de la diapositiva y escribe su nombre. data-label sustituye el texto.
     La etapa 5 (pose objetivo) lleva siempre un rombo. Se construye una vez, al cargar (HTML estático después).
   - video[data-auto]: arranca al entrar en su diapositiva y se pausa al salir. Con movimiento reducido no arranca
     solo (queda el póster y se reproduce con un clic). Un clic alterna reproducir y pausar.
   - ns-g1 (data-fx): modelo 3D oficial del Unitree G1 (unitree_ros, BSD-3-Clause) con three.js local.
     render() deja el G1 de pie en una pose estática; play() le da vueltas completas despacio (30 s por vuelta) (nada con api.reduced).
     Materiales con tokens del estilo; fondo transparente. Si no hay THREE, WebGL o la malla no carga
     (p. ej. abierto con file://), se muestra la imagen estática renderizada del mismo modelo.
   Colores: solo tokens, en deck.css o con api.tok(). */
(() => {
  const ETAPAS = ['instrucción', 'anclaje semántico', 'entidades', 'relación espacial', 'pose objetivo',
    'localización y mapeo', 'plan global', 'plan local y social', 'locomoción'];

  function parse(on) {
    const set = new Set();
    String(on || '').split(',').forEach((p) => {
      const [a, b] = p.split('-').map((x) => +x.trim());
      if (!a) return;
      for (let i = a; i <= (b || a); i++) set.add(i);
    });
    return set;
  }
  function buildHilo(el) {
    if (el.dataset.built) return;
    const on = parse(el.dataset.on);
    const txt = el.dataset.label || ETAPAS.filter((_, i) => on.has(i + 1)).join(' · ');
    const lab = document.createElement('span'); lab.className = 'hilo-txt'; lab.textContent = txt;
    const track = document.createElement('span'); track.className = 'hilo-track'; track.setAttribute('aria-hidden', 'true');
    ETAPAS.forEach((n, i) => {
      const seg = document.createElement('i');
      if (on.has(i + 1)) seg.className = 'on';
      if (i === 4) seg.classList.add('pose');
      seg.title = n;
      track.appendChild(seg);
    });
    el.append(lab, track);
    el.setAttribute('aria-label', 'Etapas de la cadena: ' + txt);
    el.dataset.built = '1';
  }
  document.querySelectorAll('.hilo').forEach(buildHilo);

  /* ---------------- vídeos ---------------- */
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('video[data-auto]').forEach((v) => {
    v.muted = true;
    v.addEventListener('click', (e) => { e.stopPropagation(); if (v.paused) v.play().catch(() => {}); else v.pause(); });
  });
  document.addEventListener('motor:enter', (e) => {
    const s = e.detail.slide;
    if (!s || reduced() || e.detail.animate === false) return;
    s.querySelectorAll('video[data-auto]').forEach((v) => { try { v.currentTime = 0; } catch (err) { /* nada */ } v.play().catch(() => {}); });
  });
  document.addEventListener('motor:leave', (e) => {
    const s = e.detail.slide;
    if (s) s.querySelectorAll('video').forEach((v) => { if (!v.paused) v.pause(); });
  });

  /* ---------------- ns-g1: G1 en 3D ---------------- */
  const YAW0 = -0.5;
  const G1_VUELTA_MS = 30000; // una vuelta completa cada 30 s: giro lento para ver el robot entero
  let geoP = null;
  function loadGeo(url) {
    if (!geoP) geoP = new Promise((ok, ko) => {
      try { new THREE.STLLoader().load(url, (g) => { g.rotateX(-Math.PI / 2); g.computeBoundingBox(); const b = g.boundingBox, c = new THREE.Vector3(); b.getCenter(c); g.translate(-c.x, -b.min.y, -c.z); g.computeVertexNormals(); ok(g); }, undefined, ko); } catch (e) { ko(e); }
    });
    return geoP;
  }
  function fallback(api, on) { api.el.classList.toggle('g1-sin-webgl', on); }
  function g1Draw(api) {
    const st = api.el._g1; if (!st || !st.mesh) return;
    st.renderer.render(st.scene, st.camera);
  }
  Motor.fx('ns-g1', {
    render(api) {
      const host = api.q('[data-role="g1"]'); if (!host) return;
      const old = api.el._g1;
      if (old) { old.renderer.dispose(); host.querySelectorAll('canvas').forEach((c) => c.remove()); }
      api.el._g1 = null;
      if (!window.THREE || !THREE.STLLoader) { fallback(api, true); return; }
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); }
      catch (e) { fallback(api, true); return; }
      const w = host.clientWidth || 680, h = host.clientHeight || 900;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(w, h, false);
      renderer.setClearAlpha(0);
      renderer.outputEncoding = THREE.sRGBEncoding;
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(24, w / h, 0.1, 20);
      camera.position.set(0, 0.72, 3.45); camera.lookAt(0, 0.64, 0);
      scene.add(new THREE.HemisphereLight(new THREE.Color(api.tok('bg')), new THREE.Color(api.tok('bg-3')), api.dark ? 0.7 : 0.9));
      const key = new THREE.DirectionalLight(new THREE.Color(api.tok(api.dark ? 'fg' : 'bg-3')), api.dark ? 0.45 : 0.55); key.position.set(1.6, 2.4, 2.2); scene.add(key);
      const rim = new THREE.DirectionalLight(new THREE.Color(api.tok('accent')), api.dark ? 0.7 : 0.5); rim.position.set(-2.2, 1.4, -1.8); scene.add(rim);
      const st = { renderer, scene, camera, mesh: null };
      api.el._g1 = st;
      fallback(api, false);
      loadGeo(host.dataset.src).then((g) => {
        if (api.el._g1 !== st) return;
        const tint = new THREE.Color(api.tok('fg-3')).lerp(new THREE.Color(api.tok('bg')), api.dark ? 0.62 : 0.5); // poco contraste: es fondo
        const mat = new THREE.MeshStandardMaterial({ color: tint, metalness: 0.15, roughness: 0.6 });
        const mesh = new THREE.Mesh(g, mat); mesh.rotation.y = YAW0; scene.add(mesh); st.mesh = mesh;
        const sh = new THREE.Mesh(new THREE.CircleGeometry(0.34, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(api.tok('fg')), transparent: true, opacity: 0.06 }));
        sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; scene.add(sh);
        g1Draw(api);
        host.dataset.ready = '1';
      }).catch(() => fallback(api, true));
    },
    play(api) {
      if (api.reduced) return;
      api.raf((t) => { const st = api.el._g1; if (!st || !st.mesh) return; st.mesh.rotation.y = YAW0 + (t / G1_VUELTA_MS) * Math.PI * 2; g1Draw(api); });
    },
    stop(api) { const st = api.el._g1; if (st && st.mesh) { st.mesh.rotation.y = YAW0; g1Draw(api); } },
  });
})();

/* Efectos copiados de fx/arq-opus.js (deck «Navegar el G1 con lenguaje») y actualizados para la parte 2:
   la decisión la toma el conjunto conformal tipo KnowNo [44]; Laya queda como rama exploratoria.
   ns-ritmo (sin Laya) · ns-donde (DGX Spark, sin Laya a bordo) · ns-rai (8 tools: decide, check_arrival, verify_room_sign)
   · ns-e1 (carril Conformal) · ns-montaje (n fases). */
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

  /* =================================================================== op-ritmo */
  const LANES2 = [
    ['LLM y RAI', 'tarea · por orden', 0.1, 1, 'model', 2.6, '0,1–1 Hz'],
    ['Anclaje y decisión', 'grafo, geometría, conformal', 1, 1, 'code', 1.5, '≈ 1 Hz'],
    ['SLAM', 'localización', 10, 10, 'map', 0.8, '10 Hz'],
    ['Nav2', 'plan local', 10, 20, 'code', 0.6, '10–20 Hz'],
    ['Locomoción', 'política RL de Unitree', 50, 500, 'code', 0.32, '50–500 Hz'],
    ['Servo', 'PD de cada articulación', 500, 1000, 'code', 0.16, '0,5–1 kHz'],
  ];
  Motor.fx('ns-ritmo', {
    render(api) {
      cancel(api);
      const { s, w, h } = svgIn(api.q('[data-role="ritmo"]'));
      const L = 340, R = w - 20, top = 60, bot = h - 44, rowH = (bot - top) / LANES2.length;
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
      LANES2.forEach(([nm, sub, f1, f2, k, per, lab], i) => {
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
  Motor.fx('ns-donde', {
    render(api) {
      cancel(api);
      const host = api.q('[data-role="donde"]');
      host.innerHTML = `
        <div class="dw">
          <div class="dbox g1" data-seq="1">
            <h4>G1 EDU · Jetson · a bordo</h4>
            <p class="label">código determinista: no depende de la red</p>
            <div class="chips"><span class="tag code">capa 3 · consulta al grafo</span><span class="tag code">capas 4 y 5 · geometría y conformal</span><span class="tag code">capas 6 a 8 · Nav2, escudo, Move</span><span class="tag map">lateral · localización (en revisión)</span></div>
            <p class="label">agente RAI: orquestador (decidido); a bordo, recomendado</p>
            <div class="chips"><span class="tag model" data-role="c-rai">capa 2 · agente RAI</span></div>
          </div>
          <div class="link" data-seq="2"></div>
          <div class="dbox srv" data-seq="3">
            <h4>DGX Spark 128 GB · fuera</h4>
            <p class="label">lo pesado</p>
            <div class="chips"><span class="tag model" data-role="c-llm">capa 2 · LLM local y puntuación</span><span class="tag model">capa 3 · construcción del grafo</span><span class="tag code">capa 5 · cuantil, fuera de línea</span><span class="tag model">líneas base</span></div>
          </div>
        </div>`;
      const { s, w, h } = svgIn(host.querySelector('.link'));
      const ah = markers(api, s);
      const y1 = h * 0.28, y2 = h * 0.5, y3 = h * 0.78;
      S('text', { x: w / 2, y: y1 - 22, 'text-anchor': 'middle', class: 'b', text: 'red' }, s);
      S('line', { x1: 10, x2: w - 14, y1, y2: y1, class: 'ln', 'marker-end': ah('n') }, s);
      S('text', { x: w / 2, y: y1 + 34, 'text-anchor': 'middle', class: 't3 mono', text: 'llamada al LLM' }, s);
      S('line', { x1: w - 10, x2: 14, y1: y2, y2, class: 'ln', 'marker-end': ah('n') }, s);
      S('text', { x: w / 2, y: y2 + 34, 'text-anchor': 'middle', class: 't3 mono', text: 'puntuaciones' }, s);
      const ecg = `M0 ${y3} ` + Array.from({ length: Math.ceil(w / 60) }, (_, i) => { const x = i * 60; return `L${x + 22} ${y3} L${x + 30} ${y3 - 26} L${x + 38} ${y3 + 18} L${x + 44} ${y3} L${x + 60} ${y3}`; }).join(' ');
      api.D = {
        ecg: S('path', { d: ecg, style: 'fill:none;stroke:var(--ok);stroke-width:3;stroke-dasharray:120 240' }, s),
        p1: S('circle', { cx: 0, cy: y1, r: 9, class: 'pkt', style: 'visibility:hidden' }, s), p2: S('circle', { cx: 0, cy: y2, r: 9, class: 'pkt', style: 'visibility:hidden' }, s),
        w, y1, y2,
      };
      S('text', { x: w / 2, y: y3 + 50, 'text-anchor': 'middle', class: 't3 mono', text: 'vigilante (incluido)' }, s);
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

  /* =================================================================== op-rai */
  const TOOLS2 = [
    ['find_room', 'código · consulta al grafo', 'code', 'L'], ['list_objects', 'código · anclas', 'code', 'L'], ['candidate_poses', 'código · K poses', 'code', 'L'], ['decide', 'código sobre puntuaciones', 'mix', 'L'],
    ['navigate_to_pose', 'código · WorkspaceBounds', 'code', 'R'], ['check_arrival', 'código · llegada', 'code', 'R'], ['ask_user', 'modelo propone, código envía', 'mix', 'R'], ['verify_room_sign', 'modelo compacto · verifica', 'model', 'R'],
  ];
  const E1ORDER2 = [0, 1, 7, 2, 3, 4, 5, 6];
  Motor.fx('ns-rai', {
    render(api) {
      cancel(api);
      const { s, w, h } = svgIn(api.q('[data-role="rai"]'));
      const BW = 360, BH = 104, cx = w / 2, cy = 230, R = 118;
      const rowY = (i) => 10 + i * ((h - 20 - BH) / 3);
      api.RA = { tools: [], spokes: [] };
      TOOLS2.forEach(([nm, sub, k, side], i) => {
        const j = i % 4, x = side === 'L' ? 0 : w - BW, y = rowY(j);
        const ax = side === 'L' ? BW : w - BW, ay = y + BH / 2;
        const ang = Math.atan2(ay - cy, ax - cx), ex = cx + Math.cos(ang) * (R + 6), ey = cy + Math.sin(ang) * (R + 6);
        const sp = S('line', { x1: ax, y1: ay, x2: ex, y2: ey, class: `ln ${k === 'mix' ? 'code' : k}`, 'data-seq': 2, 'data-a': 'draw', style: 'stroke-width:3;opacity:.7' }, s);
        const g = S('g', { 'data-seq': 1 + (j % 4) * 0.5 }, s);
        const box = S('rect', { x, y, width: BW, height: BH, rx: 16, class: `box ${k}` }, g);
        S('text', { x: x + 24, y: y + 44, class: 'mono b', style: 'font-size:27px', text: nm }, g);
        S('circle', { cx: x + 31, cy: y + 74, r: 7, class: `f-${k === 'mix' ? 'model' : k}` }, g);
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
      S('text', { x: cx, y: h - 52, 'text-anchor': 'middle', class: 'b', style: 'font-size:27px', text: '8 tools: por debajo de las 9 que fueron estables en el TFG.' }, gn);
      S('text', { x: cx, y: h - 14, 'text-anchor': 'middle', class: 't2', style: 'font-size:26px', text: 'Ninguna lleva velocidades; decide el conjunto conformal.' }, gn);
      api.RA.pk = S('circle', { cx: 0, cy: 0, r: 10, class: 'pkt', style: 'visibility:hidden' }, s);
    },
    play(api) {
      const end = seqIn(api, 300), RA = api.RA, STEP = 1600;
      api.raf((t) => {
        RA.ring.setAttribute('transform', `rotate(${(t / 40) % 360} ${RA.ring.getAttribute('cx')} ${RA.ring.getAttribute('cy')})`);
        if (t < end) return;
        const tt = (t - end) % (STEP * (E1ORDER2.length + 1)), k = Math.floor(tt / STEP), u = (tt % STEP) / STEP;
        RA.tools.forEach((tl) => tl.box.style.strokeWidth = '');
        RA.words.forEach((wd) => { wd.style.fill = ''; });
        if (k >= E1ORDER2.length) { put(RA.pk, null); return; }
        const tl = RA.tools[E1ORDER2[k]]; tl.box.style.strokeWidth = '5';
        const go = u < 0.5, v = go ? smooth(u / 0.5) : smooth((u - 0.5) / 0.5);
        const x = go ? lerp(tl.ex, tl.ax, v) : lerp(tl.ax, tl.ex, v), y = go ? lerp(tl.ey, tl.ay, v) : lerp(tl.ay, tl.ey, v);
        put(RA.pk, x, y);
        RA.words[u < 0.15 ? 0 : u < 0.5 ? 1 : 2].style.fill = 'var(--accent-ink)';
      });
    },
    stop(api) { cancel(api); },
  });

  /* =================================================================== op-e1 */
  const LANE2 = [['Persona', ''], ['Agente RAI', 'model'], ['LLM (Spark)', 'model'], ['Grafo y geometría', 'code'], ['Conformal', 'code'], ['Nav2 + escudo', 'code'], ['G1', 'code']];
  const MSG2 = [ // [desde, hasta, texto, clase, de vuelta]
    [0, 1, '1 · orden «Ve a la 203…»', 'n'],
    [1, 2, '2 · LLM → {203, cama, derecha_de, marco: —}', 'm', true],
    [1, 3, '3 · find_room · list_objects', 'c', true],
    [3, 3, '4 · verify_room_sign · placa (bajo demanda)', 'm'],
    [1, 3, '5 · candidate_poses → K poses', 'c', true],
    [1, 4, '6 · decide → conjunto conformal', 'c', true],
    [4, 4, '¿unitario?', 'gate'],
    [1, 5, 'sí: navigate_to_pose', 'c'],
    [5, 6, '7 · escudo → Move', 'c'],
    [5, 1, '8 · check_arrival → «He llegado»', 'c'],
  ];
  Motor.fx('ns-e1', {
    render(api) {
      cancel(api);
      const { s, w, h } = svgIn(api.q('[data-role="e1"]'));
      const ah = markers(api, s);
      const HW = 210, xs = LANE2.map((_, i) => HW / 2 + i * ((w - HW) / (LANE2.length - 1)));
      const top = 0, HH = 58, y0 = top + HH + 44, dy = (h - y0 - 10) / (MSG2.length - 0.4);
      LANE2.forEach(([nm, k], i) => {
        const g = S('g', { 'data-seq': 0 }, s);
        S('line', { x1: xs[i], x2: xs[i], y1: top + HH, y2: h, class: 'ln dash', style: 'stroke:var(--line-2);stroke-width:2' }, g);
        S('rect', { x: xs[i] - HW / 2, y: top, width: HW, height: HH, rx: 14, class: `box ${k}` }, g);
        S('text', { x: xs[i], y: top + 38, 'text-anchor': 'middle', class: 'b', style: 'font-size:22px', text: nm }, g);
      });
      api.E = { rows: [] };
      MSG2.forEach(([a, b, tx, k, back], i) => {
        const y = y0 + i * dy, g = S('g', { 'data-seq': i + 1 }, s), col = k === 'm' ? 'model' : k === 'c' ? 'code' : 'f';
        let pts;
        if (k === 'gate') {
          const d = 22; S('polygon', { points: `${xs[a]},${y - d} ${xs[a] + d},${y} ${xs[a]},${y + d} ${xs[a] - d},${y}`, class: 'f-warn', style: 'stroke:var(--bg);stroke-width:2' }, g);
          S('text', { x: xs[a] + 34, y: y + 8, class: 'b', text: tx }, g);
          S('line', { x1: xs[a] - d, x2: xs[0] + 8, y1: y, y2: y, class: 'ln warn dash', 'marker-end': ah('w') }, g);
          S('text', { x: (xs[0] + xs[1]) / 2, y: y - 12, 'text-anchor': 'middle', class: 't2', text: 'no: ask_user «¿qué cama?»' }, g);
          pts = [[xs[a], y], [xs[a], y]];
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
  Motor.fx('ns-montaje', {
    render(api) { cancel(api); api.q('[data-role="track"]').style.setProperty('--p', '100%'); api.qa('.fase').forEach((f) => { f.style.transform = ''; }); },
    play(api) {
      const end = seqIn(api, 300), tr = api.q('[data-role="track"]'), cards = api.qa('.fase');
      api.raf((t) => {
        const cyc = t % 9000, p = clamp((cyc - 300) / 6000, 0, 1);
        tr.style.setProperty('--p', `${(t < end ? Math.min(1, t / end) : p) * 100}%`);
        const n = cards.length, k = t < end ? -1 : Math.min(n - 1, Math.floor(p * n - 0.0001));
        cards.forEach((c, i) => { c.style.transform = i === k && p < 1 ? 'translateY(-12px)' : ''; });
      });
    },
    stop(api) { cancel(api); api.qa('.fase').forEach((f) => { f.style.transform = ''; }); },
  });
})();
