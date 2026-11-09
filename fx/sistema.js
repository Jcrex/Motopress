/* Efectos del sistema: fondos generativos por estilo, direcciones de arte,
   teoría del color, círculo OKLCH, tipografía, paletas, referencias y comparativa. */
(() => {
  const { color, util } = Motor;
  const TAU = Math.PI * 2;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* =================================================================
     FONDOS GENERATIVOS (portada, separadores y cierre)
     ================================================================= */
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

  /* Rice en portadas y separadores: grafo de nodos conectados que deriva despacio, con mensajes que recorren
     las aristas. Ocupa la esquina superior derecha y se aparta del texto midiendo .divider-body. */
  function riceGraph(s, api) {
    const R = api.rng(s.seed * 7 + 1), slide = api.el, sr = slide.getBoundingClientRect(), k = sr.width / 1920 || 1;
    // rectángulos reales de cada línea de texto (no el ancho máximo del bloque)
    const obst = [];
    slide.querySelectorAll('.divider-body > *, .cover-body > *, .cover-body .chip').forEach((e) => {
      const rg = document.createRange(); rg.selectNodeContents(e);
      [...rg.getClientRects()].forEach((r) => { if (r.width) obst.push({ l: (r.left - sr.left) / k, t: (r.top - sr.top) / k, r: (r.right - sr.left) / k, b: (r.bottom - sr.top) / k }); });
    });
    const PAD = 64, DRIFT = 18;
    const box = { x0: s.w * 0.5, x1: s.w - 150, y0: 150, y1: s.h - 190 };
    const free = (x, y, rad) => obst.every((o) => x + rad + PAD < o.l || x - rad - PAD > o.r || y + rad + PAD < o.t || y - rad - PAD > o.b);
    const nodes = [];
    for (let tries = 0; nodes.length < 16 && tries < 3000; tries++) {
      const x = R.range(box.x0, box.x1), y = R.range(box.y0, box.y1), r = 9 + R() * 9;
      if (free(x, y, r + DRIFT) && nodes.every((n) => Math.hypot(n.x - x, n.y - y) > 120)) nodes.push({ x, y, r, p: R() * 6.28, q: R() * 6.28, c: nodes.length % 3 });
    }
    // aristas: árbol de vecino más cercano (conexo) y algunas más; se descartan las que cruzan texto
    const crosses = (A, B) => obst.some((o) => { for (let i = 0; i <= 20; i++) { const x = A.x + (B.x - A.x) * i / 20, y = A.y + (B.y - A.y) * i / 20; if (x > o.l - 24 && x < o.r + 24 && y > o.t - 24 && y < o.b + 24) return true; } return false; });
    const edges = [], has = new Set(), add = (a, b) => { const key = a < b ? a + ':' + b : b + ':' + a; if (a !== b && !has.has(key) && !crosses(nodes[a], nodes[b])) { has.add(key); edges.push([a, b]); return true; } return false; };
    nodes.forEach((n, i) => { if (!i) return; const near = nodes.slice(0, i).map((m, j) => [Math.hypot(n.x - m.x, n.y - m.y), j]).sort((x, y) => x[0] - y[0]); near.some(([, j]) => add(i, j)); });
    nodes.forEach((n, i) => { const near = nodes.map((m, j) => [Math.hypot(n.x - m.x, n.y - m.y), j]).sort((x, y) => x[0] - y[0]); if (R() < 0.6 && near[2]) add(i, near[2][1]); });
    // fuera los nodos que se quedan sin aristas (todas cruzaban texto)
    const deg = nodes.map(() => 0); edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
    const keep = [], idx = nodes.map((n, i) => (deg[i] ? keep.push(n) - 1 : -1));
    return { box: { x0: 0, x1: s.w, y0: 0, y1: s.h }, nodes: keep, edges: edges.map(([a, b]) => ({ a: idx[a], b: idx[b], sp: 0.16 + R() * 0.24, ph: R(), c: R.int(0, 2) })) };
  }
  function drawRiceGraph(s, api, t, cols) {
    const { ctx } = s, g = s.graph, B = g.box;
    const P = g.nodes.map((n) => ({ x: Math.max(B.x0, Math.min(B.x1, n.x + Math.sin(t * 0.35 + n.p) * 16)), y: Math.max(B.y0, Math.min(B.y1, n.y + Math.cos(t * 0.29 + n.q) * 12)) }));
    ctx.lineWidth = 2; ctx.strokeStyle = color.alpha(api.tok('fg-3'), api.dark ? 0.45 : 0.4);
    g.edges.forEach((e) => { ctx.beginPath(); ctx.moveTo(P[e.a].x, P[e.a].y); ctx.lineTo(P[e.b].x, P[e.b].y); ctx.stroke(); });
    g.edges.forEach((e) => {
      const u = (t * e.sp + e.ph) % 1, A = P[e.a], Bp = P[e.b];
      ctx.fillStyle = cols[e.c]; ctx.beginPath(); ctx.arc(A.x + (Bp.x - A.x) * u, A.y + (Bp.y - A.y) * u, 5, 0, TAU); ctx.fill();
    });
    g.nodes.forEach((n, i) => {
      ctx.beginPath(); ctx.arc(P[i].x, P[i].y, n.r, 0, TAU);
      ctx.fillStyle = color.alpha(api.tok('bg-3'), 0.92); ctx.fill();
      ctx.lineWidth = 3.5; ctx.strokeStyle = cols[n.c]; ctx.stroke();
    });
  }

  const painters = (Motor.painters = {
    rice: {
      init(s, api) {
        const R = api.rng(s.seed); s.lines = Array.from({ length: 3 }, () => Array.from({ length: 9 }, () => 0.25 + R() * 0.7));
        s.graph = (api.el.classList.contains('divider') || api.el.classList.contains('cover')) ? riceGraph(s, api) : null;
      },
      frame(s, api, t) {
        const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
        const cols = [api.tok('accent'), api.tok('accent-2'), api.tok('accent-3')];
        const a = api.dark ? 0.26 : 0.2;
        [[0.82, 0.18, 640], [0.56, 0.72, 560], [0.95, 0.78, 520]].forEach(([x, y, r], i) => {
          const px = x * w + Math.sin(t * 0.13 + i * 2) * 70, py = y * h + Math.cos(t * 0.11 + i) * 50;
          const g = ctx.createRadialGradient(px, py, 0, px, py, r);
          g.addColorStop(0, color.alpha(cols[i], a)); g.addColorStop(1, color.alpha(cols[i], 0));
          ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        });
        if (s.quiet) return;
        if (s.graph) return drawRiceGraph(s, api, t, cols);
        // mosaico dwindle: maestra a la izquierda, dos apiladas a la derecha
        const gap = 18, X0 = 1060, Y0 = 118, X1 = 1840, Y1 = 560, mid = 1450, my = (Y0 + Y1) / 2;
        const wins = [[X0, Y0, mid - gap / 2 - X0, Y1 - Y0], [mid + gap / 2, Y0, X1 - mid - gap / 2, my - gap / 2 - Y0], [mid + gap / 2, my + gap / 2, X1 - mid - gap / 2, Y1 - my - gap / 2]];
        wins.forEach(([x, y, ww, hh], i) => {
          roundRect(ctx, x, y, ww, hh, 20);
          ctx.fillStyle = color.alpha(api.tok('bg-3'), api.dark ? 0.62 : 0.72); ctx.fill();
          if (i === 0 && ctx.createConicGradient) {
            const cg = ctx.createConicGradient(t * 0.9, x + ww / 2, y + hh / 2);
            cg.addColorStop(0, cols[0]); cg.addColorStop(0.33, cols[1]); cg.addColorStop(0.66, cols[2]); cg.addColorStop(1, cols[0]);
            ctx.strokeStyle = cg; ctx.lineWidth = 4;
          } else { ctx.strokeStyle = api.tok('line-2'); ctx.lineWidth = 2; }
          ctx.stroke();
          ctx.fillStyle = color.alpha(api.tok('fg-3'), 0.55);
          s.lines[i].forEach((len, k) => { const ly = y + 34 + k * 26; if (ly < y + hh - 18) { roundRect(ctx, x + 26 + (k % 3 === 1 ? 28 : 0), ly, (ww - 70) * len, 9, 4); ctx.fill(); } });
          ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(x + ww - 30, y + 24, 6, 0, TAU); ctx.fill();
        });
      },
    },
    noche: {
      init(s, api) {
        const R = api.rng(s.seed); s.stars = Array.from({ length: 160 }, () => [R(), R() * 0.55, R() * TAU, 0.6 + R() * 1.8]);
        const n = api.noise2(s.seed); s.ridge = Array.from({ length: 97 }, (_, i) => 0.5 + n(i * 0.09, 3.1) * 0.9 + n(i * 0.33, 7.7) * 0.25);
      },
      frame(s, api, t) {
        const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
        const acc = api.tok('accent'), acc2 = api.tok('accent-2'), fg = api.tok('fg');
        const hz = h * 0.56, vx = w * 0.7;
        s.stars.forEach(([x, y, p, r]) => { ctx.fillStyle = color.alpha(fg, 0.15 + 0.55 * Math.abs(Math.sin(t * 0.8 + p))); ctx.fillRect(x * w, y * h, r, r); });
        const g = ctx.createLinearGradient(0, hz - 140, 0, hz + 30);
        g.addColorStop(0, color.alpha(acc2, 0)); g.addColorStop(1, color.alpha(acc2, api.dark ? 0.32 : 0.22));
        ctx.fillStyle = g; ctx.fillRect(0, hz - 140, w, 170);
        ctx.beginPath(); ctx.moveTo(0, hz);
        s.ridge.forEach((v, i) => ctx.lineTo((i / 96) * w, hz - v * 90 - (Math.abs(i / 96 - 0.7) < 0.2 ? 30 : 0)));
        ctx.lineTo(w, hz); ctx.closePath();
        ctx.fillStyle = api.tok('bg-2'); ctx.fill(); ctx.strokeStyle = color.alpha(acc2, 0.7); ctx.lineWidth = 1.5; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.rect(0, hz, w, h - hz); ctx.clip();
        ctx.lineWidth = 1.4;
        for (let k = -26; k <= 26; k++) {
          ctx.strokeStyle = color.alpha(acc, 0.55 - Math.min(0.45, Math.abs(k) * 0.02));
          ctx.beginPath(); ctx.moveTo(vx + k * 36, hz); ctx.lineTo(vx + k * 330, h); ctx.stroke();
        }
        const ph = (t * 0.45) % 1;
        for (let i = 0; i < 16; i++) {
          const d = (i + ph) / 16, y = hz + (h - hz) * d ** 2.3;
          ctx.strokeStyle = color.alpha(acc, 0.12 + d * 0.6); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        ctx.restore();
        ctx.shadowColor = acc; ctx.shadowBlur = 18; ctx.strokeStyle = color.alpha(acc, 0.9); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, hz); ctx.lineTo(w, hz); ctx.stroke(); ctx.shadowBlur = 0;
      },
    },
    suizo: {
      init() {},
      frame(s, api, t) {
        const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
        const acc = api.tok('accent'), fg = api.tok('fg');
        ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(w * 0.85, h * 0.26, 220, 0, TAU); ctx.fill();
        const cx = w * 0.76, cy = h * 0.5;
        ctx.strokeStyle = fg; ctx.lineCap = 'butt';
        [[170, 14, 0.12, 1.3], [222, 14, -0.08, 1.05], [274, 14, 0.05, 0.8], [326, 5, -0.03, 1.55]].forEach(([r, lw, sp, len], i) => {
          const a0 = -Math.PI * 0.5 + i * 0.7 + t * sp; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + Math.PI * len); ctx.stroke();
        });
        for (let i = 0; i < 9; i++) { ctx.fillStyle = i === 5 ? acc : fg; const x = w * 0.6 + i * 64; ctx.fillRect(x, h * 0.86, 40, i === 5 ? 40 : 12 + (i % 4) * 7); }
      },
    },
    aurora: {
      init(s, api) {
        s.n = api.noise2(s.seed); s.R = api.rng(s.seed + 1);
        s.cols = api.cats(3); s.styles = null;
        s.ctx.clearRect(0, 0, s.w, s.h);
        // El precalentado (170 pasos) cuesta 100–200 ms: se guarda por semilla, tamaño y colores y se
        // reutiliza al volver a la diapositiva o a este estilo (el bucle de partículas sigue desde ahí).
        const key = [s.seed, s.w, s.h, s.ratio, api.dark, s.cols.join()].join('|'), hit = auroraCache.get(key);
        if (hit) {
          s.parts = hit.parts.map((p) => ({ ...p }));
          s.ctx.save(); s.ctx.setTransform(1, 0, 0, 1, 0, 0); s.ctx.drawImage(hit.cv, 0, 0); s.ctx.restore();
          return;
        }
        s.parts = Array.from({ length: 820 }, () => spawn(s));
        for (let k = 0; k < 170; k++) step(s, api, 0, true);
        const cv = document.createElement('canvas'); cv.width = s.cv.width; cv.height = s.cv.height;
        cv.getContext('2d').drawImage(s.cv, 0, 0);
        auroraCache.set(key, { cv, parts: s.parts.map((p) => ({ ...p })) });
        if (auroraCache.size > 3) auroraCache.delete(auroraCache.keys().next().value);
      },
      frame(s, api, t) {
        const { ctx, w, h } = s;
        ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,0.018)'; // color-literal: máscara (solo alfa) ctx.fillRect(0, 0, w, h); ctx.restore();
        step(s, api, t, false);
      },
    },
  });
  const auroraCache = new Map();
  function spawn(s) { const R = s.R; return { x: R() * s.w, y: R() * s.h, life: 60 + R() * 220, c: Math.floor(R() * 3), lw: 0.7 + R() * 1.8 }; }
  // Los trazos se agrupan por color y grosor (medio píxel): unas 30 llamadas a stroke por paso
  // en lugar de 820. El precalentado de init (170 pasos) bajó así de ~240 ms a unas decenas.
  function step(s, api, t, pre) {
    const { ctx, w, h, n } = s;
    const a0 = api.dark ? 0.32 : 0.42;
    if (!s.styles || s.stylesA !== a0) { s.styles = s.cols.map((c) => [color.alpha(c, a0 * 0.35), color.alpha(c, a0)]); s.stylesA = a0; }
    const groups = new Map();
    s.parts.forEach((p, i) => {
      const ang = n(p.x * 0.0017, p.y * 0.0017 + t * 0.00005) * TAU * 1.4 + t * 0.03;
      const nx = p.x + Math.cos(ang) * 1.7, ny = p.y + Math.sin(ang) * 1.7;
      const side = p.x < w * 0.45 ? 0 : 1, lw = Math.max(0.5, Math.round(p.lw * 2) / 2), key = p.c * 100 + side * 10 + lw * 2;
      let g = groups.get(key);
      if (!g) { g = { path: new Path2D(), style: s.styles[p.c][side], lw }; groups.set(key, g); }
      g.path.moveTo(p.x, p.y); g.path.lineTo(nx, ny);
      p.x = nx; p.y = ny; p.life -= 1;
      if (p.life <= 0 || nx < 0 || ny < 0 || nx > w || ny > h) s.parts[i] = spawn(s);
    });
    groups.forEach((g) => { ctx.strokeStyle = g.style; ctx.lineWidth = g.lw; ctx.stroke(g.path); });
  }

  // Pintor vacío: deja el fondo liso (data-painter="none").
  painters.none = { init() {}, frame(s) { s.ctx.clearRect(0, 0, s.w, s.h); } };

  /* Pintor de una diapositiva. data-painter en la sección (o en <html> para todo el deck) admite
     un nombre para todos los estilos («hilos») o una lista por estilo («noche:escaner aurora:hilos»);
     los estilos que no aparecen usan su pintor propio. */
  function painterOf(api) {
    const pick = (attr) => {
      if (!attr) return null;
      for (const tok of attr.trim().split(/[\s,]+/)) {
        const [a, b] = tok.split(':');
        const name = b === undefined ? a : a === api.style ? b : null;
        if (name && Object.hasOwn(painters, name)) return painters[name]; // «constructor» o «toString» no son pintores
        if (name) console.warn('[motor] pintor desconocido: ' + name);
      }
      return null;
    };
    return pick(api.el.dataset.painter) || pick(document.documentElement.dataset.painter) || (Object.hasOwn(painters, api.style) ? painters[api.style] : painters.rice);
  }
  Motor.painterOf = painterOf;

  Motor.fx('backdrop', {
    render(api) {
      const host = api.q('.fx-bg');
      if (!host) { api.s = null; console.warn('[motor] data-fx="backdrop" necesita un <div class="fx-bg"> en la diapositiva', api.el.id); return; }
      host.querySelectorAll(':scope > canvas.gl').forEach((g) => { g.style.display = 'none'; });
      const c = api.canvas(host);
      const s = (api.s = { ...c, host, seed: +(api.el.dataset.seed || 1), style: api.style, quiet: api.el.classList.contains('closing') });
      host.style.opacity = s.quiet && api.style !== 'rice' ? 0.45 : '';
      const p = (s.painter = painterOf(api));
      p.init(s, api);
      p.frame(s, api, 4, true);
    },
    play(api) {
      const s = api.s; if (!s) return;
      api.raf((t) => { s.painter.frame(s, api, 4 + t / 1000); });
    },
  });

  /* =================================================================
     ENTRADA DE TÍTULOS
     Preset por estilo y opt-in por diapositiva con data-title-fx="auto|none|<preset>"
     (o en <html> para todo el deck). Sin atributo, solo se anima en diapositivas con
     data-fx="backdrop" (portada, separadores y cierre).
     ================================================================= */
  // Curva por estilo; null: el estilo no parte el título (lo anima en CSS con background-clip:text).
  const titleEase = (Motor.titleEase = { rice: 'back.out(1.7)', noche: 'steps(4)', suizo: 'power3.out', aurora: 'expo.out' });
  // Preset por estilo (por defecto «rise»). Los estilos con titleEase null nunca se animan.
  Motor.titleStyle = Motor.titleStyle || {};
  const titlePresets = (Motor.titlePresets = {});
  // Registra un preset: fn(title, ctx) con ctx = { api, ease, style, dur }. Devuelve algo con revert() o nada.
  Motor.titleFx = (name, fn) => { titlePresets[name] = fn; };
  Motor.titleFx('rise', (title, { api, ease }) => {
    const split = SplitText.create(title, { type: 'words,chars' });
    gsap.fromTo(split.chars, { yPercent: 38, opacity: 0.12 }, { yPercent: 0, opacity: 1, duration: Math.max(0.5, api.dur / 900), stagger: api.style === 'aurora' ? 0.04 : 0.022, ease });
    return { revert() { gsap.killTweensOf(split.chars); split.revert(); } };
  });
  // Líneas que suben desde detrás de una máscara (suizo: editorial, sin opacidades intermedias).
  Motor.titleFx('mask-lines', (title, { api }) => {
    const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, { yPercent: 105, duration: Math.max(0.5, api.dur / 1000 * 1.3), stagger: 0.1, ease: 'power3.out' });
    return { revert() { gsap.killTweensOf(split.lines); split.revert(); } };
  });
  // Palabras que llegan desenfocadas (aurora: lento y orgánico).
  Motor.titleFx('blur', (title, { api }) => {
    const split = SplitText.create(title, { type: 'words' });
    gsap.fromTo(split.words, { filter: 'blur(12px)', opacity: 0, y: 20 }, { filter: 'blur(0px)', opacity: 1, y: 0, duration: Math.max(0.8, api.dur / 1000 * 1.2), stagger: 0.08, ease: 'expo.out' });
    return { revert() { gsap.killTweensOf(split.words); split.revert(); } };
  });
  // Letras que se levantan girando sobre su base (arcilla: plastilina con rebote).
  Motor.titleFx('pliega', (title, { api, ease }) => {
    const split = SplitText.create(title, { type: 'words,chars' });
    gsap.fromTo(split.chars, { rotationX: -90, opacity: 0, transformOrigin: '50% 100%', transformPerspective: 600 }, { rotationX: 0, opacity: 1, duration: Math.max(0.5, api.dur / 900), stagger: 0.03, ease });
    return { revert() { gsap.killTweensOf(split.chars); split.revert(); } };
  });
  // La línea entera pasa de desenfocada a nítida, sin partir (celula: enfocar el microscopio).
  Motor.titleFx('enfoca', (title, { api }) => {
    gsap.fromTo(title, { filter: 'blur(8px)', opacity: 0.3 }, { filter: 'blur(0px)', opacity: 1, duration: api.dur / 1000 * 1.4, ease: 'sine.out', clearProps: 'filter,opacity' });
    return { revert() { gsap.killTweensOf(title); gsap.set(title, { clearProps: 'filter,opacity' }); } };
  });
  // Cada letra muestra glifos al azar hasta fijarse, de izquierda a derecha (noche y matriz).
  const GLYPHS = { noche: '▚▞░▒<>/\\_', matriz: '·•●' };
  /* Revelado por glifos: cada letra muestra glifos al azar (deterministas) hasta fijarse.
     order: start (izquierda a derecha), center o random. Devuelve { revert }. */
  Motor.scramble = (el, api, { order = 'start', span } = {}) => {
    const split = SplitText.create(el, { type: 'words,chars' });
    const chars = split.chars, real = chars.map((c) => c.textContent), n = chars.length;
    const k = api.el.getBoundingClientRect().width / 1920 || 1, R = api.rng(n * 31 + 7);
    const set = GLYPHS[api.style] || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // ancho fijo por letra para que el texto no baile mientras cambia
    chars.forEach((c) => { const w = c.getBoundingClientRect().width / k; c.style.display = 'inline-block'; c.style.width = w + 'px'; c.style.textAlign = 'center'; });
    el.setAttribute('aria-label', real.join(''));
    const total = span || Math.max(500, api.dur * 1.4), mid = (n - 1) / 2;
    const rank = (i) => (order === 'center' ? Math.abs(i - mid) / Math.max(1, mid) : order === 'random' ? R() : i / Math.max(1, n - 1));
    const at = chars.map((_, i) => 120 + rank(i) * total);
    let dead = false, tick = -1;
    api.raf((t) => {
      if (dead) return false;
      const fresh = Math.floor(t / 55) !== tick; tick = Math.floor(t / 55);
      let left = 0;
      chars.forEach((c, i) => {
        if (t >= at[i]) { if (c.classList.contains('scr')) { c.textContent = real[i]; c.classList.remove('scr'); } return; }
        left++;
        if (fresh && real[i].trim()) { c.textContent = set[Math.floor(R() * set.length)]; c.classList.add('scr'); }
      });
      return left > 0;
    });
    return { revert() { dead = true; chars.forEach((c, i) => { c.textContent = real[i]; }); split.revert(); el.removeAttribute('aria-label'); } };
  };
  Motor.titleFx('descifra', (title, { api }) => Motor.scramble(title, api));
  Object.assign(Motor.titleStyle, { rice: 'rise', noche: 'descifra', suizo: 'mask-lines', aurora: 'blur', arcilla: 'pliega', nube: 'rise', celula: 'enfoca', matriz: 'descifra' });

  function titlePreset(slide, style) {
    const own = slide.dataset.titleFx || document.documentElement.dataset.titleFx || (slide.dataset.fx === 'backdrop' ? 'auto' : 'none');
    if (own === 'none' || titleEase[style] === null) return null;
    const name = own === 'auto' ? Motor.titleStyle[style] || 'rise' : own;
    if (!Object.hasOwn(titlePresets, name)) { console.warn('[motor] preset de título desconocido: ' + name); return null; }
    return titlePresets[name];
  }
  function titleOut(slide) { if (slide._title) { try { slide._title.revert(); } catch (e) { /* ya revertido */ } slide._title = null; } }
  document.addEventListener('motor:enter', (e) => {
    const { slide, api, animate } = e.detail;
    titleOut(slide);
    if (!animate || !window.gsap || !window.SplitText) return;
    const title = slide.querySelector('.s-title'), fn = title && titlePreset(slide, api.style);
    if (!fn) return;
    const run = () => {
      if (!slide.classList.contains('is-active')) return;
      titleOut(slide);
      try { slide._title = fn(title, { api, style: api.style, dur: api.dur, ease: titleEase[api.style] || 'power3.out' }) || null; } catch (err) { console.error('[motor] título', slide.id, err); }
    };
    if (!document.fonts || document.fonts.status === 'loaded') run(); else document.fonts.ready.then(run);
  });
  document.addEventListener('motor:leave', (e) => titleOut(e.detail.slide));

  /* =================================================================
     REVELADOS POR ESTILO
     data-reveal en un [data-step] (o en <html> para todo el deck): «auto» usa el gesto del
     estilo y un nombre lo fija: fade, wipe, wipe-x, focus, develop, mist, pixel, tilt.
     El CSS (engine.css) anima según data-rv, que se resuelve al entrar en la diapositiva.
     ================================================================= */
  Motor.revealStyle = Object.assign({ rice: 'tilt', noche: 'wipe-x', suizo: 'fade', aurora: 'mist', cromo: 'wipe', arcilla: 'tilt', nube: 'wipe', termica: 'develop', celula: 'focus', matriz: 'pixel' }, Motor.revealStyle);
  const REVEALS = ['fade', 'wipe', 'wipe-x', 'focus', 'develop', 'mist', 'pixel', 'tilt'];
  function resolveReveals(slide, style) {
    const deck = document.documentElement.dataset.reveal;
    slide.querySelectorAll('[data-step]').forEach((el) => {
      if (el.matches('.etapas > *, .checklist > *, .bento > *, .mazo > *')) return; // piezas con su propio estado
      const own = el.dataset.reveal || deck;
      const kind = own === 'auto' ? Motor.revealStyle[style] || 'fade' : own;
      if (kind && REVEALS.includes(kind)) el.dataset.rv = kind; else delete el.dataset.rv;
      if (kind && !REVEALS.includes(kind) && kind !== 'none') console.warn('[motor] revelado desconocido: ' + kind);
    });
  }
  document.addEventListener('motor:enter', (e) => resolveReveals(e.detail.slide, e.detail.api.style));

  /* =================================================================
     SEIS DIRECCIONES DE ARTE
     ================================================================= */
  Motor.fx('estilos', {
    render(api) {
      const grid = api.q('[data-role="grid"]');
      const mode = api.dark ? 'dark' : 'light';
      grid.innerHTML = Motor.styles.map((s, i) => `
        <article class="style-card" data-style="${s.id}" data-theme="${mode}" aria-current="${s.id === api.style}" tabindex="0" role="button" aria-label="Usar el estilo ${esc(s.full)}">
          <span class="key">${Motor.keyOf(i)}</span>
          <h3>${esc(s.name)}</h3>
          <p class="mood">${esc(s.mood)}</p>
          <div class="strip">${['bg', 'bg-3', 'fg', 'accent', 'accent-2', 'accent-3'].map((k) => `<i class="${k === 'bg' ? 'w2' : ''}" style="background:var(--${k})"></i>`).join('')}</div>
          <div class="meta"><span>${esc(s.fontNames.display)}${s.fontNames.text !== s.fontNames.display ? ' + ' + esc(s.fontNames.text) : ''}</span><span>${esc(s.full.split('·')[1].trim())}</span></div>
        </article>`).join('');
      const pick = (e) => { const c = e.target.closest('.style-card'); if (c) Motor.setStyle(c.dataset.style); };
      grid.onclick = pick;
      grid.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(e); } };
    },
    play(api) {
      if (!window.gsap) return;
      gsap.fromTo(api.qa('.style-card'), { y: 26, opacity: 0.2 }, { y: 0, opacity: 1, duration: api.dur / 1000, stagger: 0.06, ease: 'power3.out' });
    },
  });

  /* =================================================================
     TEORÍA DEL COLOR
     ================================================================= */
  const ROLES = [['bg', 'Fondo'], ['bg-3', 'Superficie'], ['fg', 'Texto'], ['fg-2', 'Texto 2'], ['line', 'Filete'], ['accent', 'Acento'], ['accent-2', 'Acento 2'], ['accent-3', 'Acento 3'], ['ok', 'Correcto'], ['err', 'Error']];
  Motor.fx('teoria', {
    render(api) {
      const meta = api.meta, M = meta.modes[api.dark ? 'dark' : 'light'], bg = api.tok('bg');
      api.q('[data-role="main"]').innerHTML = `
        <div class="ratio" aria-label="Proporción 60, 30, 10">
          <div style="flex:60;background:var(--bg);color:var(--fg-2)">60 % ${esc(M.names.bg)}</div>
          <div style="flex:30;background:var(--bg-3);color:var(--fg-2);border-left:1px solid var(--line-2)">30 % ${esc(M.names['bg-3'])}</div>
          <div style="flex:10;background:var(--accent);color:var(--on-accent)">10 %</div>
        </div>
        <div class="swatches">${ROLES.map(([k, label]) => {
          const hex = api.tok(k), [L, C, H] = color.oklch(hex), cr = color.contrast(hex, bg);
          return `<div class="sw"><i class="chipc" style="background:${hex}"></i><span class="nm">${label}<small>${esc(M.names[k] || '')}</small></span><span class="ok">${k === 'bg' ? 'base' : cr.toFixed(1) + ':1 ' + (k.startsWith('fg') ? color.wcag(cr) : '')}</span><span class="code">${hex} · oklch(${L.toFixed(2)} ${C.toFixed(3)} ${Math.round(H)})</span></div>`;
        }).join('')}</div>`;
      api.q('[data-role="side"]').innerHTML = `
        <p class="label">Armonía</p>
        <h3>${esc(meta.full)}</h3>
        <p>${esc(meta.harmony)}</p>
        <p class="label">Contrastes de Itten que usa</p>
        <div class="row">${meta.itten.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>
        <p class="label">Movimiento</p>
        <p>${esc(meta.motion.easeNote)}</p>`;
    },
    play(api) {
      if (!window.gsap) return;
      gsap.fromTo(api.qa('.sw'), { x: -18, opacity: 0.15 }, { x: 0, opacity: 1, duration: api.dur / 1000, stagger: 0.04, ease: 'power2.out' });
      gsap.fromTo(api.qa('.ratio > div'), { scaleX: 0.2, transformOrigin: '0 50%' }, { scaleX: 1, duration: api.dur / 800, stagger: 0.12, ease: 'power3.out' });
    },
  });

  /* =================================================================
     CÍRCULO OKLCH
     ================================================================= */
  const angDiff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
  const relation = (d) => (d < 45 ? 'análoga' : d < 100 ? 'vecina' : d < 145 ? 'triádica' : d < 165 ? 'complementaria dividida' : 'complementaria');
  Motor.fx('rueda', {
    render(api) {
      const host = api.q('[data-role="wheel"]');
      const { ctx, w, h } = api.canvas(host);
      const M = api.meta.modes[api.dark ? 'dark' : 'light'];
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2 - 46, inner = R - 40;
      const rC = (c) => Math.min(inner - 18, (c / 0.2) * (inner - 18));
      const Lr = api.dark ? 0.74 : 0.66;
      for (let a = 0; a < 360; a += 1) {
        ctx.fillStyle = color.fromOklch(Lr, 0.14, a);
        const a0 = (-a * Math.PI) / 180, a1 = (-(a + 1.4) * Math.PI) / 180;
        ctx.beginPath(); ctx.arc(cx, cy, R, a1, a0); ctx.arc(cx, cy, inner, a0, a1, true); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = api.tok('line-2'); ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]);
      ctx.fillStyle = api.tok('fg-2'); ctx.font = api.font('mono', 19, 500); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      [0.05, 0.1, 0.15].forEach((c) => { ctx.beginPath(); ctx.arc(cx, cy, rC(c), 0, TAU); ctx.stroke(); });
      ctx.setLineDash([]); ctx.textAlign = 'center';
      for (let a = 0; a < 360; a += 60) { const r = (-a * Math.PI) / 180; ctx.fillText(a + '°', cx + Math.cos(r) * (R + 26), cy + Math.sin(r) * (R + 26)); }
      const pos = (hex) => { const [, C, H] = color.oklch(hex), r = (-H * Math.PI) / 180, d = rC(C); return [cx + Math.cos(r) * d, cy + Math.sin(r) * d]; };
      const bg = api.tok('bg');
      M.raw.forEach((hex) => { const [x, y] = pos(hex); ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fillStyle = hex; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = bg; ctx.stroke(); });
      const acc = ['accent', 'accent-2', 'accent-3'].map((k) => api.tok(k));
      const P = acc.map(pos);
      ctx.strokeStyle = api.tok('fg'); ctx.lineWidth = 2.5; ctx.setLineDash([10, 7]);
      ctx.beginPath(); P.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = api.font('mono', 22, 600);
      P.forEach(([x, y], i) => {
        ctx.beginPath(); ctx.arc(x, y, 17, 0, TAU); ctx.fillStyle = acc[i]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = api.tok('fg'); ctx.stroke();
        const name = M.names[['accent', 'accent-2', 'accent-3'][i]];
        const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1;
        ctx.fillStyle = api.tok('fg'); ctx.textAlign = dx >= 0 ? 'left' : 'right';
        ctx.fillText(name, x + (dx / l) * 30 + (dx >= 0 ? 6 : -6), y + (dy / l) * 30);
      });
      ['bg', 'bg-3', 'fg'].forEach((k) => { const [x, y] = pos(api.tok(k)); ctx.fillStyle = api.tok(k); ctx.fillRect(x - 7, y - 7, 14, 14); ctx.strokeStyle = api.tok('fg-2'); ctx.lineWidth = 1.5; ctx.strokeRect(x - 7, y - 7, 14, 14); });

      const hs = acc.map((c) => color.oklch(c)[2]);
      const neutr = ['bg', 'bg-3', 'line', 'line-2', 'fg-3', 'fg-2', 'fg'].map((k) => [k, api.tok(k), color.oklch(api.tok(k))]);
      const tinted = neutr.filter(([, , o]) => o[1] > 0.004);
      const nh = tinted.length ? Math.round(Math.atan2(tinted.reduce((s, [, , o]) => s + Math.sin((o[2] * Math.PI) / 180), 0), tinted.reduce((s, [, , o]) => s + Math.cos((o[2] * Math.PI) / 180), 0)) * 180 / Math.PI + 360) % 360 : null;
      const maxC = Math.max(...neutr.map(([, , o]) => o[1]));
      api.q('[data-role="side"]').innerHTML = `
        <div class="harm">
          <p class="label">Acentos</p>
          <p class="angles">${esc(M.names.accent)} ${Math.round(hs[0])}° · ${esc(M.names['accent-2'])} ${Math.round(hs[1])}° · ${esc(M.names['accent-3'])} ${Math.round(hs[2])}°</p>
          <p>Acento y acento 2 están a ${Math.round(angDiff(hs[0], hs[1]))}° (${relation(angDiff(hs[0], hs[1]))}); el acento 3 queda a ${Math.round(angDiff(hs[0], hs[2]))}° del primero (${relation(angDiff(hs[0], hs[2]))}).</p>
          <p>${nh === null ? 'Los neutros son grises puros, sin tono.' : `Los neutros no son grises puros: tiran hacia ${nh}° con croma máxima ${maxC.toFixed(3)}.`}</p>
        </div>
        <p class="note">Ángulo: tono H. Radio: croma C (anillos 0,05 · 0,10 · 0,15). Triángulo: los tres acentos.</p>
        <p class="label">Escalera de neutros (luminosidad L)</p>
        <div class="ladder">${neutr.map(([k, hex, o]) => `<div style="background:${hex};color:${color.contrast(hex, api.tok('fg')) > color.contrast(hex, api.tok('bg')) ? 'var(--fg)' : 'var(--bg)'}"><span>${esc(M.names[k] || k)}</span><span>L ${o[0].toFixed(2)}</span></div>`).join('')}</div>`;
    },
  });

  /* =================================================================
     TIPOGRAFÍA
     ================================================================= */
  Motor.fx('tipo', {
    render(api) {
      const fn = api.meta.fontNames, ts = parseFloat(api.tok('title-size')) || 92;
      const steps = [
        [ts, 'display', api.tok('title-weight'), 'Navegación', true],
        [56, 'display', 600, 'Mapa de ocupación', true],
        [40, 'text', 500, 'Planificador global con A*'],
        [30, 'text', 400, 'El robot replanifica si cambia el costmap.'],
        [24, 'mono', 400, 'ros2 topic hz /scan  ->  10.0 Hz'],
      ];
      const k = (s) => `<span style="color:var(--accent-ink)">${s}</span>`, f = (s) => `<span style="color:var(--accent-2-ink)">${s}</span>`, n = (s) => `<span style="color:var(--accent-3-ink)">${s}</span>`, c = (s) => `<span style="color:var(--fg-3)">${s}</span>`;
      const code = [
        `${k('def')} ${f('plan')}(grid, start, goal):`,
        `    open_set = [(${n('0.0')}, start)]`,
        `    ${k('while')} open_set:`,
        `        f, node = heapq.${f('heappop')}(open_set)`,
        `        ${k('if')} node == goal: ${c('# == != -> >=')}`,
      ].join('\n');
      api.q('[data-role="body"]').innerHTML = `
        <div class="specimen">
          <div class="ag" aria-hidden="true">A<span>g</span></div>
          <div class="fams">
            <span><b>${esc(fn.display)}</b> · títulos</span>
            ${fn.text !== fn.display ? `<span><b>${esc(fn.text)}</b> · texto</span>` : '<span>misma familia para texto</span>'}
            <span><b>${esc(fn.mono)}</b> · código y datos</span>
            ${fn.serif ? `<span><b>${esc(fn.serif)}</b> · notas en cursiva</span>` : ''}
          </div>
        </div>
        <div class="stack">
          <div class="scale">${steps.map(([size, role, wt, txt, up]) => `<div class="step"><span class="px">${Math.round(size)} px</span><span class="tx" style="font:${wt} ${size}px var(--font-${role});${up ? 'text-transform:var(--title-case);letter-spacing:var(--title-tracking)' : ''}">${esc(txt)}</span></div>`).join('')}</div>
          <pre class="codebox">${code}</pre>
        </div>`;
    },
    play(api) {
      if (!window.gsap) return;
      gsap.fromTo(api.qa('.scale .step'), { opacity: 0.1, x: 30 }, { opacity: 1, x: 0, duration: api.dur / 1000, stagger: 0.08, ease: 'power3.out' });
    },
  });

  /* =================================================================
     PALETAS PARA DATOS
     ================================================================= */
  Motor.fx('paletas', {
    render(api) {
      const M = api.meta.modes[api.dark ? 'dark' : 'light'];
      const cats = api.cats(6);
      let minCvd = 99; for (let i = 0; i < 5; i++) minCvd = Math.min(minCvd, color.cvd(cats[i], cats[i + 1]));
      const seq = Array.from({ length: 7 }, (_, i) => api.tok('seq-' + (i + 1)));
      const div = Array.from({ length: 7 }, (_, i) => api.tok('div-' + (i + 1)));
      const body = api.q('[data-role="body"]');
      body.innerHTML = `
        <div>
          <div class="prow"><div class="lbl"><span>Tonos de la paleta original</span><span>${esc(api.meta.full.split('·')[1].trim())}</span></div><div class="chips src">${M.sourceCats.map((c) => `<i style="background:${c}"></i>`).join('')}</div></div>
          <div class="prow"><div class="lbl"><span>Series de gráfico: mismo tono, luminosidad igualada</span><span>ΔE mín. con daltonismo ${minCvd.toFixed(1)}</span></div><div class="chips">${cats.map((c) => `<i style="background:${c}"></i>`).join('')}</div></div>
          <div class="prow"><div class="lbl"><span>Secuencial · magnitud</span><span>menos → más</span></div><div class="ramp">${seq.map((c) => `<i style="background:${c}"></i>`).join('')}</div></div>
          <div class="prow"><div class="lbl"><span>Divergente · por debajo y por encima de 0</span><span>− 0 +</span></div><div class="ramp">${div.map((c) => `<i style="background:${c}"></i>`).join('')}</div></div>
          <p class="note" style="margin-top:30px">Validado con simulación Machado (2009): series vecinas con ΔE OKLab ≥ 8 para protanopía y deuteranopía.</p>
        </div>
        <div class="pdemo"><p class="label">Muestra: cuatro sensores, una escala</p><div class="fx" data-role="demo" style="height:300px"></div><p class="label">Muestra: matriz con la rampa secuencial</p><div class="fx" data-role="heat" style="height:200px"></div></div>`;
      // líneas
      const d3 = window.d3; if (!d3) return;
      const host = api.q('[data-role="demo"]'), W = host.clientWidth, H = host.clientHeight;
      const R = api.rng(5), names = ['lidar', 'imu', 'odom', 'gps'];
      const series = names.map((nm, i) => ({ nm, v: Array.from({ length: 24 }, (_, x) => 30 + i * 14 + Math.sin(x / 3 + i) * 8 + R() * 5) }));
      const x = d3.scaleLinear([0, 23], [8, W - 90]), y = d3.scaleLinear([20, 95], [H - 10, 10]);
      const svg = d3.select(host).append('svg').attr('viewBox', `0 0 ${W} ${H}`);
      svg.append('g').selectAll('line').data([40, 60, 80]).join('line').attr('x1', 8).attr('x2', W - 90).attr('y1', y).attr('y2', y).attr('stroke', api.tok('line')).attr('stroke-dasharray', api.tok('grid-dash'));
      const line = d3.line().x((_, i) => x(i)).y((v) => y(v)).curve(d3.curveMonotoneX);
      series.forEach((s, i) => {
        svg.append('path').attr('d', line(s.v)).attr('fill', 'none').attr('stroke', cats[i]).attr('stroke-width', +api.tok('mark-w') || 2.5).attr('class', 'ln');
        svg.append('text').attr('x', W - 82).attr('y', y(s.v[23])).attr('dy', '0.35em').attr('fill', api.tok('fg-2')).style('font', api.font('mono', 20, 500)).text(s.nm);
        svg.append('circle').attr('cx', x(23)).attr('cy', y(s.v[23])).attr('r', 5).attr('fill', cats[i]);
      });
      const hh = api.q('[data-role="heat"]'), HW = hh.clientWidth, HH = hh.clientHeight, cols = 14, rows = 5, cw = HW / cols, ch = HH / rows;
      const hs = d3.select(hh).append('svg').attr('viewBox', `0 0 ${HW} ${HH}`);
      for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
        const v = 0.5 + 0.5 * Math.sin(cc / 2.2 + r * 0.8) * Math.cos(r / 2);
        hs.append('rect').attr('x', cc * cw + 1).attr('y', r * ch + 1).attr('width', cw - 2).attr('height', ch - 2).attr('rx', Math.min(4, parseFloat(api.tok('radius')) / 3)).attr('fill', api.seq(v)).attr('class', 'hc');
      }
    },
    play(api) {
      if (!window.gsap) return;
      api.qa('.ln').forEach((p, i) => { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: api.dur / 600, delay: i * 0.12, ease: 'power2.out' }); });
      gsap.fromTo(api.qa('.hc'), { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: { each: 0.008, from: 'start' } });
    },
  });

  /* =================================================================
     REFERENCIAS
     ================================================================= */
  const REFS = [
    ['Estilo Tipográfico Internacional', 'Müller-Brockmann, Grid Systems (1981): retícula y asimetría.', 'Suizo', 'swiss'],
    ['Edward Tufte', 'Relación datos-tinta, sparklines y múltiplos pequeños.', 'Suizo · indicadores', 'spark'],
    ['CP 1919 · Unknown Pleasures', 'Púlsar de Craft (1970); portada de Saville (1979).', 'Ridgeline', 'ridge'],
    ['Territory Studio', 'Pantallas de ficción para cine, como The Martian (2015).', 'Noche · telemetría', 'hud'],
    ['Ryoji Ikeda', 'datamatics: datos puros en rejillas blancas y negras.', 'Noche · Suizo', 'bars'],
    ['Tyler Hobbs', 'Campos de flujo: trazos que siguen un campo de ángulos.', 'Aurora', 'flow'],
    ['Hyprland y HyDE', 'Mosaico, bordes en degradado y temas de la comunidad.', 'Rice · escritorio', 'tiles'],
    ['Hajime Sorayama', 'Robots cromados: el metal como espejo del estudio.', 'Cromo', 'chrome'],
    ['Inigo Quilez', 'Raymarching y SDF: sombras suaves y oclusión.', 'Cromo · Arcilla', 'sdf'],
    ['Turbo (Google, 2019)', 'Arcoíris mejorado para mapas de profundidad.', 'Nube', 'turbo'],
    ['Paletas térmicas de FLIR', 'Ironbow, White Hot e isotermas para leer calor.', 'Térmica', 'flir'],
    ['Nikon Small World', 'Fotomicrografía: fluorescencia y tinciones como arte.', 'Célula', 'nikon'],
    ['Nothing y Doto', 'Matriz de puntos y luces Glyph como lenguaje.', 'Matriz', 'dots'],
    ['Johannes Itten', 'Los siete contrastes del color (1961).', 'Teoría del color', 'itten'],
    ['OKLab y OKLCH', 'Björn Ottosson (2020): luminosidad perceptual.', 'Todo el sistema', 'oklch'],
    ['Okabe–Ito y viridis', 'Paletas para daltonismo (2008) y uniformes (2015).', 'Gráficos', 'viri'],
  ];
  function motif(ctx, kind, api, S) {
    const fg = api.tok('fg'), fg2 = api.tok('fg-2'), acc = api.tok('accent'), a2 = api.tok('accent-2'), a3 = api.tok('accent-3'), cats = api.cats(6), R = api.rng(kind.length * 7);
    ctx.lineCap = 'round';
    switch (kind) {
      case 'swiss': ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(80, 44, 30, 0, TAU); ctx.fill(); ctx.fillStyle = fg; [18, 34, 50].forEach((y, i) => ctx.fillRect(16, 70 + i * 14, 88 - i * 22, 7)); break;
      case 'spark': { ctx.strokeStyle = fg2; ctx.lineWidth = 2; ctx.beginPath(); let mn = [0, 99], mx = [0, -1]; for (let i = 0; i < 24; i++) { const v = 60 + Math.sin(i / 2.5) * 18 + R() * 14; if (v < mn[1]) mn = [i, v]; if (v > mx[1]) mx = [i, v]; const x = 12 + i * 4.2; i ? ctx.lineTo(x, v) : ctx.moveTo(x, v); } ctx.stroke(); ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(12 + mn[0] * 4.2, mn[1], 4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(12 + mx[0] * 4.2, mx[1], 4, 0, TAU); ctx.fill(); break; }
      // color-literal: las muestras siguientes reproducen escalas y materiales reales (cromo, turbo, FLIR, viridis)
      case 'chrome': { const g = ctx.createLinearGradient(0, 22, 0, 98); [[0, '#ffffff'], [0.42, '#c9ced6'], [0.5, '#3a3f47'], [0.58, '#1b1e23'], [0.75, '#9aa1ab'], [1, '#f1f3f6']].forEach(([o, c]) => g.addColorStop(o, c)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(60, 60, 38, 0, TAU); ctx.fill(); ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(92, 30, 12, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(48, 42, 10, 5, -0.5, 0, TAU); ctx.fill(); break; } // color-literal
      case 'sdf': { ctx.fillStyle = color.alpha(fg, api.dark ? 0.35 : 0.18); ctx.beginPath(); ctx.ellipse(66, 98, 34, 8, 0, 0, TAU); ctx.fill(); const g = ctx.createRadialGradient(48, 44, 4, 58, 58, 36); g.addColorStop(0, color.mix(acc, api.tok(api.dark ? 'fg' : 'bg'), 0.45)); g.addColorStop(1, color.mix(acc, api.tok(api.dark ? 'bg' : 'fg'), 0.3)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(58, 58, 34, 0, TAU); ctx.fill(); ctx.strokeStyle = color.alpha(fg2, 0.6); ctx.setLineDash([3, 4]); [44, 52].forEach((r) => { ctx.beginPath(); ctx.arc(58, 58, r, -1.2, 0.3); ctx.stroke(); }); ctx.setLineDash([]); break; }
      case 'turbo': { const tb = ['#30123b', '#4662d7', '#36aaf9', '#1ae4b6', '#72fe5e', '#c7ef34', '#fabb38', '#f66b19', '#ca2a04', '#7a0403']; tb.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(12 + i * 9.6, 92, 9.6, 14); }); for (let k = 0; k < 260; k++) { const a = R() * TAU, r = 10 + R() * 34, z = 0.5 + 0.5 * Math.sin(a * 2); ctx.fillStyle = tb[Math.min(9, Math.floor(z * 10))]; ctx.fillRect(60 + Math.cos(a) * r, 46 + Math.sin(a) * r * 0.55 - z * 14, 1.6, 1.6); } break; } // color-literal
      case 'flir': { const st = ['#1c0a4a', '#53108a', '#9a1a8c', '#d9334f', '#f2682a', '#fbaa23', '#fde26a', '#fffbe6']; for (let y = 0; y < 76; y += 2) for (let x = 0; x < 96; x += 2) { const v = Math.min(1, 0.12 + 0.9 * Math.exp(-((x - 58) ** 2 + (y - 36) ** 2) / 300) + 0.5 * Math.exp(-((x - 28) ** 2 + (y - 58) ** 2) / 120)); ctx.fillStyle = st[Math.min(7, Math.floor(v * 8))]; ctx.fillRect(12 + x, 12 + y, 2.1, 2.1); } st.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(12 + i * 12, 96, 12, 10); }); break; } // color-literal
      case 'nikon': { ctx.fillStyle = api.dark ? api.tok('bg-2') : '#0b0d12'; ctx.beginPath(); ctx.arc(60, 58, 46, 0, TAU); ctx.fill(); ctx.save(); ctx.beginPath(); ctx.arc(60, 58, 46, 0, TAU); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 9; k++) { const x = 26 + (k % 3) * 34 + R() * 8, y = 24 + Math.floor(k / 3) * 34 + R() * 8; ctx.strokeStyle = 'rgba(255,63,164,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 15, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(79,134,255,.9)'; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(54,226,122,.9)'; ctx.fillRect(x + 8, y - 4, 2, 2); } ctx.restore(); break; } // color-literal
      case 'dots': { const N = ['10001', '11001', '10101', '10011', '10001', '10001', '10001']; for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) { const on = N[r][c] === '1'; ctx.fillStyle = on ? fg : color.alpha(fg, 0.12); ctx.beginPath(); ctx.arc(30 + c * 12, 22 + r * 12, 4.2, 0, TAU); ctx.fill(); } ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(98, 100, 6, 0, TAU); ctx.fill(); ctx.fillStyle = fg; ctx.fillRect(98, 20, 4, 60); break; }
      case 'ridge': for (let r = 0; r < 9; r++) { const y0 = 28 + r * 9.5; ctx.beginPath(); ctx.moveTo(10, y0); for (let x = 10; x <= 110; x += 2) { const d = Math.abs(x - 60); ctx.lineTo(x, y0 - Math.max(0, 18 - d * 0.5) * (0.5 + R()) ); } ctx.lineTo(110, y0); ctx.fillStyle = api.tok('bg-2'); ctx.fill(); ctx.strokeStyle = fg; ctx.lineWidth = 1.4; ctx.stroke(); } break;
      case 'hud': ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(60, 60, 38, -0.4, 4.4); ctx.stroke(); ctx.strokeStyle = a2; ctx.beginPath(); ctx.arc(60, 60, 26, 1, 5.5); ctx.stroke(); ctx.fillStyle = acc; ctx.fillRect(56, 56, 8, 8); [[10, 10, 1, 1], [110, 10, -1, 1], [10, 110, 1, -1], [110, 110, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x + sx * 16, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * 16); ctx.stroke(); }); break;
      case 'bars': ctx.fillStyle = api.tok('bg-2'); ctx.fillRect(0, 0, S, S); for (let x = 8; x < 112; x += 3 + Math.floor(R() * 4)) { ctx.fillStyle = fg; ctx.fillRect(x, 14, 1 + Math.floor(R() * 3), 62); } for (let i = 0; i < 40; i++) { ctx.fillStyle = R() > 0.5 ? fg : fg2; ctx.fillRect(8 + (i % 10) * 10.5, 84 + Math.floor(i / 10) * 7, 8, 4); } break;
      case 'flow': { const n = api.noise2(9); for (let k = 0; k < 40; k++) { let x = R() * S, y = R() * S; ctx.strokeStyle = [acc, a2, a3][k % 3]; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); for (let j = 0; j < 30; j++) { const a = n(x * 0.03, y * 0.03) * TAU; x += Math.cos(a) * 2.5; y += Math.sin(a) * 2.5; ctx.lineTo(x, y); } ctx.stroke(); } break; }
      case 'itten': for (let i = 0; i < 12; i++) { ctx.fillStyle = color.fromOklch(0.68, 0.15, i * 30); ctx.beginPath(); ctx.moveTo(60, 60); ctx.arc(60, 60, 48, (i / 12) * TAU - 0.02, ((i + 1) / 12) * TAU + 0.02); ctx.closePath(); ctx.fill(); } ctx.fillStyle = api.tok('bg-2'); ctx.beginPath(); ctx.arc(60, 60, 20, 0, TAU); ctx.fill(); break;
      case 'oklch': for (let i = 0; i < 10; i++) { ctx.fillStyle = color.fromOklch(0.3 + i * 0.065, 0.12, 270); ctx.fillRect(12 + i * 9.6, 14, 9.6, 44); ctx.fillStyle = color.fromOklch(0.68, 0.13, i * 36); ctx.fillRect(12 + i * 9.6, 64, 9.6, 44); } break;
      case 'viri': { const vir = ['#440154', '#46327e', '#365c8d', '#277f8e', '#1fa187', '#4ac16d', '#a0da39', '#fde725']; vir.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(12 + i * 12, 14, 12, 44); }); ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(18 + i * 14, 86, 6, 0, TAU); ctx.fill(); }); break; } // color-literal
      case 'tiles': { const g = 6; [[10, 10, 52, 100, acc], [10 + 52 + g, 10, 42, 47, null], [10 + 52 + g, 63, 42, 47, null]].forEach(([x, y, w, h, c]) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h); ctx.fillStyle = api.tok('bg-3'); ctx.fill(); ctx.lineWidth = c ? 3 : 1.5; ctx.strokeStyle = c || api.tok('line-2'); ctx.stroke(); }); break; }
      default: break;
    }
    void cats;
  }
  Motor.fx('refs', {
    render(api) {
      const grid = api.q('[data-role="grid"]');
      grid.innerHTML = REFS.map(([t, d, use]) => `<article class="ref"><canvas width="120" height="120" aria-hidden="true"></canvas><div><h4>${esc(t)}</h4><p>${esc(d)}</p><span class="use">${esc(use)}</span></div></article>`).join('');
      api.qa('.ref canvas').forEach((cv, i) => {
        const ratio = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * 0.9));
        cv.width = 120 * ratio; cv.height = 120 * ratio;
        const ctx = cv.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        motif(ctx, REFS[i][3], api, 120);
      });
    },
    play(api) { if (window.gsap) gsap.fromTo(api.qa('.ref'), { opacity: 0.1, y: 16 }, { opacity: 1, y: 0, duration: api.dur / 1000, stagger: 0.05, ease: 'power2.out' }); },
  });

  /* =================================================================
     COMPARATIVA: 6 estilos × 2 modos
     ================================================================= */
  Motor.fx('compare', {
    render(api) {
      const grid = api.q('[data-role="grid"]');
      const cur = api.style, curMode = api.dark ? 'dark' : 'light';
      const bars = [0.42, 0.78, 0.55, 0.96, 0.66, 0.84];
      grid.innerHTML = Motor.styles.flatMap((s) => ['light', 'dark'].map((m) => `
        <article class="mini" data-style="${s.id}" data-theme="${m}" data-mode="${m}" aria-current="${s.id === cur && m === curMode}" tabindex="0" role="button" aria-label="Usar ${esc(s.full)}, modo ${m === 'dark' ? 'oscuro' : 'claro'}">
          <span class="k">${esc(s.full)}</span>
          <h4>Navegación</h4>
          <div class="bars">${bars.map((v, i) => `<i style="height:${v * 100}%;background:var(--cat-${i + 1})"></i>`).join('')}</div>
          <div class="foot"><span>${m === 'dark' ? 'oscuro' : 'claro'}</span><span>${esc(s.fontNames.display)}</span></div>
        </article>`)).join('');
      const pick = (e) => { const c = e.target.closest('.mini'); if (!c) return; Motor.setMode(c.dataset.mode); Motor.setStyle(c.dataset.style); };
      grid.onclick = pick;
      grid.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(e); } };
    },
    play(api) { if (window.gsap) gsap.fromTo(api.qa('.mini .bars i'), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: api.dur / 1000, stagger: 0.012, ease: 'power3.out' }); },
  });
  /* =================================================================
     NOTAS DEL ORADOR: la tecla N abre una ventana con el <aside class="notes"> de la
     diapositiva activa, la siguiente y un cronómetro. engine.css oculta las notas en el lienzo.
     ================================================================= */
  let win = null;
  function paintNotes() {
    if (!win || win.closed) return;
    const i = Motor.index, s = Motor.slides[i], nx = Motor.slides[i + 1];
    const notes = s.querySelector('aside.notes');
    const d = win.document;
    d.getElementById('n-title').textContent = `${String(i + 1).padStart(2, '0')}/${Motor.slides.length} · ${s.dataset.title || ''}`;
    d.getElementById('n-body').innerHTML = notes ? notes.innerHTML : '<p class="f">Sin notas.</p>';
    d.getElementById('n-next').textContent = nx ? 'Siguiente: ' + (nx.dataset.title || '') : 'Última diapositiva';
  }
  function openNotes() {
    if (win && !win.closed) { win.focus(); return; }
    win = window.open('', 'motor-notas', 'width=760,height=640');
    if (!win) return;
    win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Notas del orador</title>
<style>body{margin:0;padding:24px 28px;font:20px/1.5 system-ui,sans-serif;background:#16181d;color:#e8e8ea}
h1{margin:0 0 4px;font-size:22px}#n-next,#n-clock{color:#9aa0aa;font-size:16px;margin:0 0 14px}
#n-body p{margin:0 0 12px}.f{color:#9aa0aa}code{font-size:.92em}</style></head>
<body><h1 id="n-title"></h1><p id="n-clock"></p><div id="n-body"></div><p id="n-next"></p>
<script>const t0=Date.now();setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);document.getElementById('n-clock').textContent='Tiempo: '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')+' · ← → en la ventana principal';},1000);<\/script></body></html>`);
    win.document.close();
    paintNotes();
  }
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select')) return;
    if (e.key === 'n' || e.key === 'N') openNotes();
  });
  document.addEventListener('motor:enter', paintNotes);
})();
